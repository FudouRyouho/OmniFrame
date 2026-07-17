import type {
  SimulationEntity,
  Modifier,
  CoModifier,
  MeleeComboModifier,
  SniperComboModifier,
  ComboScaledAddModifier,
  StackDecayBuffModifier,
  AttributeNode,
  EntityId,
  AttributeId,
  SimulationContext,
  TraceResponse,
  TraceStep
} from "../contracts";
import { isWeaponDamageToken } from "../contracts/damage-logic";
import { stackDecayBonusPct } from "../formulas/common/scaling-base";
import { resolveStatValue, globalDamageBucketFactor } from "../formulas/weapon/stat-accumulator";
import { coBonusPct } from "../formulas/weapon/weapon-condition-overload";
import { meleeComboMult } from "../formulas/weapon/melee-combo";
import { sniperComboMult } from "../formulas/weapon/sniper-combo";
import { evalCondition } from "@shared/types/condition";

/**
 * Mecánica CO/GunCO — familia `condition-scaled` **aditiva** (arch-decisions §9/§10).
 * Unidad cohesiva fuera del hot loop de `resolveNode`: computa el bonus (`coBonusPct`
 * sobre los factores nombrados del contexto — declarados en estático, emergentes en
 * dinámico; factor ausente ⇒ 0) y lo **rutea al bucket** que dicta el `co_behavior` del
 * ATAQUE (ya resuelto al perfil en la entity): `adding` → mods_add_pct (junto a Serration);
 * `multiplying` → multiplicativo final aparte; `none`/gap → no aplica. Disparada por
 * `operation === 'CONDITION_OVERLOAD'`, NO por composición genérica: un no-CO no hereda
 * este ruteo (§9, Rediseño A: se vetó `CONTEXT_SCALE` genérico). Muta `node`; devuelve el
 * valor efectivo y el `context_value` (informativo, para el trace).
 * NB: distinta de `applyConditionOverload` (formulas/weapon) — aquella es la fórmula
 * terminal escalar-cerrada reservada para C2 (daño final), no el ruteo de buckets de C1.
 */
function resolveConditionOverload(
  mod: CoModifier,
  entity: SimulationEntity,
  node: AttributeNode,
  context: SimulationContext,
): { value: number; context_value: number } {
  const { stacks_var, status_count_var } = mod.co_factors;
  const stacks = context.variables[stacks_var] ?? 1;
  const n      = context.variables[status_count_var] ?? 0;
  let value = coBonusPct({ perStatusBonusPct: mod.value, activeStacks: stacks }, n);

  const cob = entity.co_behavior;
  if (cob === 'adding')            node.mods_add_pct += value;
  else if (cob === 'multiplying')  node.multiplicative *= (1 + value / 100);
  else                             value = 0; // none | gap (para el trace)

  return { value, context_value: stacks * n };
}

/**
 * Mecánica Melee Combo — heavy attack como consumidor de daño (§4.1). Hermana de
 * `resolveConditionOverload`: unidad cohesiva fuera del hot loop, disparada por
 * `operation === 'MELEE_COMBO_MULT'`. Lee el combo counter del contexto (variable nombrada
 * en `melee_combo_factors`, declarada en estático / emergente en dinámico; ausente ⇒ 0 ⇒ ×1
 * identidad, NO dropea — un heavy a combo 0 pega base), lo pasa por `meleeComboMult` y
 * lo rutea al bucket FIJO `multiplicative` sobre el nodo (WEAPON_ADD_DAMAGE del perfil heavy).
 * A diferencia de CO no hay `co_behavior` que elija bucket — el ruteo del heavy es único.
 * Devuelve el multiplicador crudo (para el trace) y el combo counter consumido.
 * (`_entity` no se usa — firma uniforme de `FamilyResolver`, ver abajo.)
 */
function resolveMeleeComboMult(
  mod: MeleeComboModifier,
  _entity: SimulationEntity,
  node: AttributeNode,
  context: SimulationContext,
): { value: number; context_value: number } {
  const count = context.variables[mod.melee_combo_factors.count_var] ?? 0;
  const mult = meleeComboMult(count);
  node.multiplicative *= mult;
  return { value: mult, context_value: count };
}

/**
 * Mecánica Sniper Combo — Shot Combo Counter (§10, 3ra mecánica de familia). Hermana de las
 * anteriores pero fórmula LOGARÍTMICA y con DOS inputs: el `count` (contexto, nombrado en
 * `sniper_combo_factors.count_var`) + el `min_combo` (por-arma, bakeado en los factores desde el
 * override en hidratación). Ruteo FIJO `multiplicative`, pasivo (todo shot scoped). `_entity` no se
 * usa (firma uniforme de `FamilyResolver`). Bajo `min_combo` hits → ×1 identidad.
 */
function resolveSniperComboMult(
  mod: SniperComboModifier,
  _entity: SimulationEntity,
  node: AttributeNode,
  context: SimulationContext,
): { value: number; context_value: number } {
  const { count_var, min_combo } = mod.sniper_combo_factors;
  const count = context.variables[count_var] ?? 0;
  const mult = sniperComboMult(count, min_combo);
  node.multiplicative *= mult;
  return { value: mult, context_value: count };
}

/**
 * Mecánica Combo Scaled Add — Blood Rush / Weeping Wounds (`melee-combo.md §4`). Hermana de
 * `resolveMeleeComboMult` (mismo factor de contexto, misma fórmula `meleeComboMult`) pero DISTINTA
 * en dos ejes: trae `value` propio (rank del mod real, no intrínseco) y rutea FIJO a `ADD`
 * (mods_add_pct), no `multiplicative`. Efecto = `value × meleeComboMult(count)` — el escalar de
 * combo amplifica el valor del mod, no reemplaza el nodo. `_entity` no se usa (firma uniforme).
 */
function resolveComboScaledAdd(
  mod: ComboScaledAddModifier,
  _entity: SimulationEntity,
  node: AttributeNode,
  context: SimulationContext,
): { value: number; context_value: number } {
  const count = context.variables[mod.melee_combo_factors.count_var] ?? 0;
  const mult = meleeComboMult(count);
  const value = mod.value * mult;
  node.mods_add_pct += value;
  return { value, context_value: count };
}

/**
 * Mecánica Stack Decay Buff — Galvanized [Arma] / (arcanos, §11, aún sin vehículo). `mod.value` YA
 * es el perStackPct derivado en hidratación (`base_value/max_stacks`) — acá solo se aplica
 * `clamp(stacks,0,cap)`. Ruteo FIJO `ADD` (mods_add_pct): los 7 casos reales de esta pasada
 * (Chamber/Diffusion/Hell/Crosshairs/Scope/Elementalist/Steel) resuelven ahí; el caso flat
 * (Galvanized Reflex, BASE_FLAT) queda fuera — no fuerza bucket-routing genérico sin un 2do caso
 * real enfrente. `_entity` no se usa (firma uniforme).
 */
function resolveStackDecayBuff(
  mod: StackDecayBuffModifier,
  _entity: SimulationEntity,
  node: AttributeNode,
  context: SimulationContext,
): { value: number; context_value: number } {
  const stacks = context.variables[mod.stack_decay_factors.stacks_var] ?? 0;
  const value = stackDecayBonusPct(mod.value, stacks, mod.stack_decay_factors.cap);
  node.mods_add_pct += value;
  return { value, context_value: stacks };
}

/**
 * Registro de mecánicas de FAMILIA (Abstracción B, arch-decisions §10). Separa las dos
 * clases de modifier que `resolveNode` mezcla: las **ops de acumulador** (value ES el efecto,
 * el `switch` de abajo) vs las **mecánicas de familia** (el efecto lo COMPUTA una fórmula desde
 * el contexto + rutea a bucket(s)). Reemplaza la cascada de `if (op === 'X')` que crecía O(n) por
 * mecánica. NO genericiza el *qué* (cada op mapea a SU resolver; un no-familia no está en la tabla
 * → cae al switch, no hereda ruteo — no resucita el `CONTEXT_SCALE` que §9 mató): generaliza solo
 * el *dispatch*. Umbral §10 (≥2 mecánicas encapsuladas) alcanzado con CO + melee-combo. Destino:
 * subir la distinción al TIPO (`Modifier` discriminated union) cuando la 3ra mecánica (sniper combo)
 * estabilice la forma — esta tabla se reusa tal cual bajo ese cierre.
 */
type FamilyResolver<M extends Modifier = Modifier> = (
  mod: M,
  entity: SimulationEntity,
  node: AttributeNode,
  context: SimulationContext,
) => { value: number; context_value: number };

// Cada entrada se chequea contra SU variante de la union (el compilador valida que
// `resolveConditionOverload` recibe `CoModifier`, etc.). En el call-site se accede vía
// `as Record<string, FamilyResolver>`: la clave = `operation` ES la prueba de que el `mod`
// es esa variante (invariante del dispatch), así que ensanchar el parámetro ahí es sound.
const FAMILY_RESOLVERS: {
  CONDITION_OVERLOAD: FamilyResolver<CoModifier>;
  MELEE_COMBO_MULT:   FamilyResolver<MeleeComboModifier>;
  SNIPER_COMBO_MULT:  FamilyResolver<SniperComboModifier>;
  COMBO_SCALED_ADD:   FamilyResolver<ComboScaledAddModifier>;
  STACK_DECAY_BUFF:   FamilyResolver<StackDecayBuffModifier>;
} = {
  CONDITION_OVERLOAD: resolveConditionOverload,
  MELEE_COMBO_MULT:   resolveMeleeComboMult,
  SNIPER_COMBO_MULT:  resolveSniperComboMult,
  COMBO_SCALED_ADD:   resolveComboScaledAdd,
  STACK_DECAY_BUFF:   resolveStackDecayBuff,
};

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
      
      // Explicit source dependency. Con `source_entity` la arista CRUZA a otra entidad (buff
      // cross-entity, ej. Roar: warframe strength → pool de facción del arma; arch §15). Sin él,
      // intra-entidad (default histórico).
      if (mod.source_attribute) {
        const sourceKey = `${mod.source_entity ?? mod.target_entity}:${mod.source_attribute}`;
        if (in_degree.has(sourceKey)) {
          adj.get(sourceKey)!.push(targetKey);
          in_degree.set(targetKey, (in_degree.get(targetKey) || 0) + 1);
        }
      }
    });

    // Dependencia global ESTRUCTURAL (no gateada por modifier): TODO daño-token escala con los pools
    // GLOBALES del arma (Serration + facción, §16) → ambos deben resolver ANTES que el token que los
    // lee en calculateCurrentValue. Antes vivía dentro del loop de modifiers (solo cableaba tokens CON
    // modifier; el resto dependía del orden de inserción — frágil, y se rompía cuando facción entra por
    // una arista cross-entity que la retrasa en la cola de Kahn). Roar (§15) lo destapó.
    this.entities.forEach(entity => {
      Object.keys(entity.attributes).forEach(attrId => {
        if (!isWeaponDamageToken(attrId)) return;
        const targetKey = `${entity.id}:${attrId}`;
        for (const globalNode of ["WEAPON_ADD_DAMAGE", "GAMEPLAY_MULT_FACTION_DAMAGE"]) {
          const sourceKey = `${entity.id}:${globalNode}`;
          if (in_degree.has(sourceKey)) {
            adj.get(sourceKey)!.push(targetKey);
            in_degree.set(targetKey, (in_degree.get(targetKey) || 0) + 1);
          }
        }
      });
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
        // Dos clases de modifier (discriminated union `Modifier`, §10): mecánicas de FAMILIA (el
        // efecto lo computa una fórmula desde el contexto, despachadas por FAMILY_RESOLVERS) vs ops
        // de ACUMULADOR (`value` ES el efecto — el switch). El `'value' in mod` re-narrow a las
        // variantes con value (los combos no lo tienen; ya los atrapó el resolver arriba).
        const familyResolver = (FAMILY_RESOLVERS as Record<string, FamilyResolver>)[mod.operation];
        if (familyResolver) {
          const r = familyResolver(mod, entity, node, context);
          modValue = r.value;
          context_value = r.context_value;
        } else if ('value' in mod) {
          modValue = mod.value;

          // Scaling from another attribute (value ∝ final/base de otro nodo). Con `source_entity`
          // el nodo source vive en OTRA entidad (cross-entity, ej. Roar); sin él, en esta misma.
          if (mod.source_attribute) {
            const sourceEntity = mod.source_entity ? this.entities.get(mod.source_entity) : entity;
            const sourceNode = sourceEntity?.attributes[mod.source_attribute];
            if (sourceNode) {
              const scaleFactor = sourceNode.final / (sourceNode.base || 1);
              modValue = mod.value * scaleFactor;
              context_value = sourceNode.final;
            }
          }

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

    let val = resolveStatValue(node);

    // Los daño-tokens llevan los factores de los pools GLOBALES (suman dentro, multiplican afuera,
    // arch-decisions §16): Serration (aditivo, Step 1) y facción (Roar/Bane, Step 3). Misma primitiva.
    if (isWeaponDamageToken(attributeId)) {
      val *= globalDamageBucketFactor(entity.attributes["WEAPON_ADD_DAMAGE"]);
      val *= globalDamageBucketFactor(entity.attributes["GAMEPLAY_MULT_FACTION_DAMAGE"]);
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
