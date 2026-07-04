import type {
  SimulationEntity,
  Modifier,
  EntityId,
  AttributeId,
  SimulationContext,
  TraceResponse,
  TraceStep
} from "../contracts";
import { isWeaponDamageToken } from "../contracts/damage-logic";
import { applyAdditiveBonus } from "../formulas/common/scaling-base";
import { coBonusPct } from "../formulas/weapon/weapon-condition-overload";
import { evalCondition } from "@shared/types/condition";

export class SimulationEngine {
  private entities: Map<EntityId, SimulationEntity> = new Map();
  private modifiers: Modifier[] = [];
  private trace_log: Map<string, TraceStep[]> = new Map();
  private trace_enabled: boolean = false;
  private sorted_nodes: string[] = []; // Topological order
  private cycle_detected: boolean = false;

  public addEntity(entity: SimulationEntity): void {
    this.entities.set(entity.id, entity);
  }

  public addModifier(modifier: Modifier): void {
    this.modifiers.push(modifier);
  }

  /**
   * Activa la acumulación de trace de procedencia durante `resolve()`. Opt-in
   * (Fase 3): el path UI (`useViewModel` → `consume().snapshot()`) nunca lee
   * `.trace()` — trazar en cada `resolveNode()` para nadie era costo sin beneficio.
   */
  public enableTrace(): void {
    this.trace_enabled = true;
  }

  /**
   * Executes a full resolution of the attribute graph.
   * Uses Topological Sort + Fixed-Point fallback for reactive scaling.
   */
  public resolve(context: SimulationContext): void {
    this.trace_log.clear();
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

      // Implicit global dependency: damage scales with WEAPON_ADD_DAMAGE
      if (isWeaponDamageToken(mod.target_attribute)) {
        const sourceKey = `${mod.target_entity}:WEAPON_ADD_DAMAGE`;
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
      const conditionMet = evalCondition(mod.condition, context.flags);
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
        else if (mod.operation === 'CONDITION_OVERLOAD') {
          // Familia CO/GunCO. El valor lo calcula `coBonusPct` (SSoT en formulas/weapon):
          // coefBase × activeStacks × N. Las dos dimensiones vienen de `co_factors` (nombradas),
          // resueltas del contexto (declaradas en estático, emergentes en dinámico). Factor
          // ausente ⇒ 0 ⇒ bonus nulo. El bucket lo decide `co_behavior` (abajo).
          const f = mod.co_factors;
          const stacks = f ? (context.variables[f.stacks_var] ?? 1) : 1;
          const n      = f ? (context.variables[f.status_count_var] ?? 0) : 0;
          modValue = coBonusPct({ perStatusBonusPct: mod.value, activeStacks: stacks }, n);
          context_value = stacks * n; // informativo para el trace
        }

        if (mod.operation === 'CONDITION_OVERLOAD') {
          // El bucket lo decide el co_behavior del ATAQUE (ya resuelto al perfil en la entity),
          // no la operación: 'adding' compone junto a Serration (mods_add_pct); 'multiplying' es
          // un multiplicador final aparte; 'none' o gap ⇒ no aplica (modValue→0 para el trace).
          // Ver contracts.ts CoBehavior + arch-decisions §9.
          const cob = entity.co_behavior;
          if (cob === 'adding')            node.mods_add_pct += modValue;
          else if (cob === 'multiplying')  node.multiplicative *= (1 + modValue / 100);
          else                             modValue = 0; // none | gap
        } else {
          switch (mod.operation) {
            case 'BASE_FLAT': node.base_flat += modValue; break;
            case 'BASE_ADD_PCT': node.base_add_pct += modValue; break;
            case 'ADD_FLAT': node.total_flat += modValue; break;
            case 'ADD': node.mods_add_pct += modValue; break;
            case 'MULTIPLICATIVE': node.multiplicative *= (1 + modValue / 100); break;
            case 'SET': node.final = modValue; break;
          }
        }
      }

      // calculateCurrentValue() solo alimenta el trace (node.final se recalcula
      // al final de resolveNode de todos modos) — se salta si el trace está apagado.
      if (this.trace_enabled) {
        this.trace(entityId, attributeId, {
          pass,
          source: mod.source_id || 'unknown',
          operation: mod.operation,
          impact: conditionMet ? modValue : 0,
          resulting_value: this.calculateCurrentValue(entity, attributeId),
          condition_met: conditionMet,
          context_value
        });
      }
    });

    node.final = this.calculateCurrentValue(entity, attributeId);
  }

  private calculateCurrentValue(entity: SimulationEntity, attributeId: string): number {
    const node = entity.attributes[attributeId];
    if (!node) return 0;

    const weaponDamageNode = entity.attributes["WEAPON_ADD_DAMAGE"];
    const globalDmgMult = weaponDamageNode
      ? (weaponDamageNode.final / (weaponDamageNode.base || 100))
      : 1.0;

    const scaledBase = applyAdditiveBonus(node.base + node.base_flat, node.base_add_pct);
    const withMods = applyAdditiveBonus(scaledBase, node.mods_add_pct);
    let val = (withMods + node.total_flat) * node.multiplicative;

    if (isWeaponDamageToken(attributeId)) {
      val *= globalDmgMult;
    }

    return val;
  }

  private trace(entityId: EntityId, attributeId: AttributeId, step: TraceStep): void {
    const key = `${entityId}:${attributeId}`;
    if (!this.trace_log.has(key)) {
      this.trace_log.set(key, []);
    }
    this.trace_log.get(key)!.push(step);
  }

  public getTrace(entityId: EntityId, attributeId: AttributeId): TraceResponse {
    return {
      entity_id: entityId,
      attribute_id: attributeId,
      trace: this.trace_log.get(`${entityId}:${attributeId}`) || []
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
