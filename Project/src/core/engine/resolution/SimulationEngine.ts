import type {
  SimulationEntity,
  Modifier,
  EntityId,
  AttributeId,
  SimulationContext,
  ProjectionSnapshot,
  AuditResponse,
  AuditStep
} from "../contracts";
import { isWeaponDamageToken } from "../contracts/damage-logic";
import { applyAdditiveBonus } from "../formulas/common/scaling-base";

export class SimulationEngine {
  private entities: Map<EntityId, SimulationEntity> = new Map();
  private modifiers: Modifier[] = [];
  private audit_session: Map<string, AuditStep[]> = new Map();
  private sorted_nodes: string[] = []; // Topological order
  private cycle_detected: boolean = false;

  public addEntity(entity: SimulationEntity): void {
    this.entities.set(entity.id, entity);
  }

  public addModifier(modifier: Modifier): void {
    this.modifiers.push(modifier);
  }

  public getAuditSession(): Map<string, AuditStep[]> {
    return this.audit_session;
  }

  /**
   * Executes a full resolution of the attribute graph.
   * Uses Topological Sort + Fixed-Point fallback for reactive scaling.
   */
  public resolve(context: SimulationContext): void {
    this.audit_session.clear();
    this.rebuildGraph();

    // 1. Initialize final values
    this.entities.forEach(entity => {
      Object.values(entity.attributes).forEach(node => {
        node.final = node.base;
      });
    });

    // 2. Resolve in Topological Order
    this.resetAccumulators();
    this.sorted_nodes.forEach(nodeKey => {
      const [entityId, attributeId] = nodeKey.split(':');
      this.resolveNode(entityId, attributeId, context, 1);
    });

    // 3. Fallback for Cycles (Fixed-Point)
    if (this.cycle_detected) {
      for (let pass = 2; pass <= 3; pass++) {
        this.resetAccumulators();
        this.entities.forEach(entity => {
           Object.keys(entity.attributes).forEach(attrId => {
              this.resolveNode(entity.id, attrId, context, pass);
           });
        });
      }
    }
  }

  private resetAccumulators(): void {
    this.entities.forEach(entity => {
      Object.values(entity.attributes).forEach(node => {
        node.base_flat = 0;
        node.base_add_pct = 0;
        node.mods_add_pct = 0;
        node.total_flat = 0;
        node.multiplicative = 1.0;
      });
    });
  }

  private rebuildGraph(): void {
    const adj: Map<string, string[]> = new Map();
    const in_degree: Map<string, number> = new Map();
    const all_nodes: string[] = [];

    // Initialize nodes
    this.entities.forEach(entity => {
      Object.keys(entity.attributes).forEach(attrId => {
        const key = `${entity.id}:${attrId}`;
        all_nodes.push(key);
        in_degree.set(key, 0);
        adj.set(key, []);
      });
    });

    // Build edges from modifiers
    this.modifiers.forEach(mod => {
      const targetKey = `${mod.target_entity}:${mod.target_attribute}`;
      
      // Explicit source dependency
      if (mod.source_attribute) {
        const sourceKey = `${mod.target_entity}:${mod.source_attribute}`;
        if (in_degree.has(sourceKey)) {
          adj.get(sourceKey)!.push(targetKey);
          in_degree.set(targetKey, (in_degree.get(targetKey) || 0) + 1);
        }
      }

      // Implicit global dependency: damage scales with WEAPON_DAMAGE
      if (isWeaponDamageToken(mod.target_attribute)) {
        const sourceKey = `${mod.target_entity}:WEAPON_DAMAGE`;
        if (in_degree.has(sourceKey)) {
          adj.get(sourceKey)!.push(targetKey);
          in_degree.set(targetKey, (in_degree.get(targetKey) || 0) + 1);
        }
      }
    });

    // Kahn's Algorithm
    const queue: string[] = [];
    in_degree.forEach((degree, key) => {
      if (degree === 0) queue.push(key);
    });

    this.sorted_nodes = [];
    while (queue.length > 0) {
      const u = queue.shift()!;
      this.sorted_nodes.push(u);
      adj.get(u)?.forEach(v => {
        in_degree.set(v, in_degree.get(v)! - 1);
        if (in_degree.get(v) === 0) queue.push(v);
      });
    }

    this.cycle_detected = this.sorted_nodes.length < all_nodes.length;
  }

  private resolveNode(entityId: string, attributeId: string, context: SimulationContext, pass: number): void {
    const entity = this.entities.get(entityId);
    if (!entity) return;
    const node = entity.attributes[attributeId];
    if (!node) return;

    // Apply all modifiers targeting this node
    const relevantMods = this.modifiers.filter(m => m.target_entity === entityId && m.target_attribute === attributeId);
    
    relevantMods.forEach(mod => {
      const conditionMet = !mod.condition || !!context.flags[mod.condition];
      let modValue = 0;
      let context_value: number | undefined;

      if (conditionMet) {
        modValue = mod.value;

        // Scaling from another attribute
        if (mod.source_attribute) {
          const sourceNode = entity.attributes[mod.source_attribute];
          if (sourceNode) {
            const scaleFactor = sourceNode.final / (sourceNode.base || 1);
            modValue = mod.value * scaleFactor;
            context_value = sourceNode.final;
          }
        } 
        else if (mod.operation === 'CONTEXT_SCALE') {
          context_value = context.variables[mod.context_variable || ""] || 0;
          modValue = (context_value * mod.value);
        }

        switch (mod.operation) {
          case 'BASE_FLAT': node.base_flat += modValue; break;
          case 'BASE_ADD_PCT': node.base_add_pct += modValue; break;
          case 'ADD_FLAT': node.total_flat += modValue; break;
          case 'ADD': node.mods_add_pct += modValue; break;
          case 'CONTEXT_SCALE': node.mods_add_pct += modValue; break;
          case 'MULTIPLICATIVE': node.multiplicative *= (1 + modValue / 100); break;
          case 'SET': node.final = modValue; break;
        }
      }

      const intermediateValue = this.calculateCurrentValue(entity, attributeId);

      this.trace(entityId, attributeId, {
        pass,
        source: mod.source_id || 'unknown',
        operation: mod.operation,
        impact: conditionMet ? modValue : 0,
        resulting_value: intermediateValue,
        condition_met: conditionMet,
        context_value
      });
    });

    node.final = this.calculateCurrentValue(entity, attributeId);
  }

  private calculateCurrentValue(entity: SimulationEntity, attributeId: string): number {
    const node = entity.attributes[attributeId];
    if (!node) return 0;

    const weaponDamageNode = entity.attributes["WEAPON_DAMAGE"];
    const globalDmgMult = weaponDamageNode ? (weaponDamageNode.final / 100) : 1.0;

    const scaledBase = applyAdditiveBonus(node.base + node.base_flat, node.base_add_pct);
    const withMods = applyAdditiveBonus(scaledBase, node.mods_add_pct);
    let val = (withMods + node.total_flat) * node.multiplicative;

    if (isWeaponDamageToken(attributeId)) {
      val *= globalDmgMult;
    }

    return val;
  }

  private trace(entityId: EntityId, attributeId: AttributeId, step: AuditStep): void {
    const key = `${entityId}:${attributeId}`;
    if (!this.audit_session.has(key)) {
      this.audit_session.set(key, []);
    }
    this.audit_session.get(key)!.push(step);
  }

  public getAuditResponse(entityId: EntityId, attributeId: AttributeId): AuditResponse {
    return {
      entity_id: entityId,
      attribute_id: attributeId,
      trace: this.audit_session.get(`${entityId}:${attributeId}`) || []
    };
  }

  public getProjectionSnapshot(): ProjectionSnapshot {
    const entities: Record<EntityId, Record<AttributeId, number>> = {};
    
    this.entities.forEach((entity, id) => {
      entities[id] = {};
      Object.entries(entity.attributes).forEach(([attrId, node]) => {
        entities[id][attrId] = node.final;
      });
    });

    return {
      timestamp: Date.now(),
      entities,
      metrics: {
        status_weights: {} // TODO: Implement status weighting logic
      }
    };
  }

  public getEntityStats(entityId: EntityId): Record<AttributeId, number> {
    const entity = this.entities.get(entityId);
    if (!entity) return {};

    const stats: Record<AttributeId, number> = {};
    Object.entries(entity.attributes).forEach(([id, node]) => {
      stats[id] = node.final;
    });
    
    return stats;
  }
}
