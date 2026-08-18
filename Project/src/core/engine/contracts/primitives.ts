/**
 * @domain Engine / Primitives
 *
 * Vocabulario compartido del engine que NO es un corte de frontera:
 * ids, el nodo de atributo, el modifier, las leyes del juego.
 */

import type { ModifierOperation, AccumulatorOperation, CoFactors, MeleeComboFactors, SniperComboFactors, StackDecayFactors } from '@shared/types/modifier';
import type { ConditionInput } from '@shared/types/condition';

export type EntityId = string;
export type AttributeId = string;
export type ItemTag = string;

export interface AttributeNode {
  base: number;
  // Accumulators (Per Pass) — 4 buckets. Hubo un 5º, `base_add_pct` (pool relativo pre-escala):
  // nació en el contrato, nunca en código, y el vocabulario D-6 no tenía segmento que lo alcanzara
  // (`OPERATION_MAP` deriva ADD/FLAT/BASE/MULT — ninguno produce `BASE_ADD_PCT`). Su caso motivador
  // —crit chance relativo, Point Strike— lo resuelve `mods_add_pct`. Reaparece sólo si un mecanismo
  // real necesita un SEGUNDO pool porcentual que componga multiplicativamente con `mods_add_pct`
  // (no aditivamente: ése ya existe). Ver docs/domains/engine/attribute-node-contract.md.
  base_flat: number;
  mods_add_pct: number;
  total_flat: number;
  multiplicative: number;
  // Result
  final: number;
  // [D-7 Fase 4] La metadata de presentación (label/category/unit) NO vive en el
  // nodo — es del borde C→D. project() la adjunta por lookup keyed en el token.
  // Ver shared/view-model + lib/format/stat-presentation.
}

/** Campos comunes a todo Modifier, agnósticos a la clase (acumulador vs familia). */
export interface ModifierBase {
  id: string;
  source_id?: string;
  target_entity: EntityId;
  // El `{cuál}`: canal al que apunta el modifier cuando su token trae sub-familia
  // (`WEAPON_MELEE_ADD_CRIT_MULT` → 'melee'). Pisa `target_entity`, que hasta ese momento es
  // **dónde está montada la fuente**, no dónde aterriza el efecto.
  // ⚠️ Lo resuelve la HIDRATACIÓN (`resolve/hydration/channel-routing.ts`, pasada única al final de
  // `StaticHydrator.hydrate`), NO el motor: `SimulationEngine` filtra por `target_entity` y nunca
  // mira este campo. Un modifier que llegue al motor con `target_channel` sin resolver no se rutea
  // — se pierde en silencio. Por eso la pasada lo deja en `undefined` al consumirlo.
  target_channel?: string;
  target_attribute: AttributeId;
  source_attribute?: AttributeId; // For cross-attribute scaling (misma entidad)
  // Cross-ENTITY scaling: el `source_attribute` se lee de OTRA entidad, no de `target_entity`
  // (buff source→target, ej. Roar: warframe strength → pool de facción del arma; arch-decisions §15).
  // Default = target_entity (deja intacto el escalado intra-entidad histórico).
  source_entity?: EntityId;
  condition?: ConditionInput;
}

// `Modifier` = discriminated union por `operation` (arch-decisions §10, Abstracción A). Dos clases:
//  - ACUMULADOR: `value` ES el efecto (la operación es el bucket).
//  - FAMILIA: el efecto lo COMPUTA una fórmula desde el contexto; cada familia trae SUS factores,
//    NO un `value` genérico. El compilador exige los factores correctos por variante y prohíbe
//    campos muertos (un combo NO puede llevar `value`). Reemplaza el `Modifier` plano que acumulaba
//    3 campos opcionales mutuamente excluyentes + un `value` con 3 significados (efecto/coefBase/muerto).

export type AccumulatorModifier = ModifierBase & {
  operation: AccumulatorOperation;
  value: number;
};

export type CoModifier = ModifierBase & {
  operation: 'CONDITION_OVERLOAD';
  value: number;           // coefBase (bonus % por status). Lo consume `coBonusPct`. Ver §9.
  co_factors: CoFactors;   // dos dimensiones de contexto (activeStacks, N).
};

export type MeleeComboModifier = ModifierBase & {
  operation: 'MELEE_COMBO_MULT';
  melee_combo_factors: MeleeComboFactors; // var de contexto (combo counter melee). Ver §8/§4.1.
};

export type SniperComboModifier = ModifierBase & {
  operation: 'SNIPER_COMBO_MULT';
  sniper_combo_factors: SniperComboFactors; // var de contexto (count) + min_combo por-arma.
};

export type ComboScaledAddModifier = ModifierBase & {
  operation: 'COMBO_SCALED_ADD';
  value: number;                          // rank del mod real (Blood Rush/Weeping Wounds), NO intrínseco.
  melee_combo_factors: MeleeComboFactors; // mismo factor de contexto que MELEE_COMBO_MULT.
};

export type StackDecayBuffModifier = ModifierBase & {
  operation: 'STACK_DECAY_BUFF';
  value: number;                      // perStackPct YA derivado (base_value/max_stacks), NO el total.
  stack_decay_factors: StackDecayFactors; // var de contexto (stacks declarados) + cap por-mod/arcano.
};

export type Modifier =
  | AccumulatorModifier
  | CoModifier
  | MeleeComboModifier
  | SniperComboModifier
  | ComboScaledAddModifier
  | StackDecayBuffModifier;

/**
 * Constructor para productores DINÁMICOS (Mod/Incarnon/Arcane/Shard): la `operation` viene del
 * dato, no se conoce en compile-time → este factory centraliza el mapeo op→variante de la union.
 *
 * LA FRONTERA ES EL DISPARADOR, NO LA CLASE DE OP. Una op pasa por acá si el dato la nombra por su
 * **token D-6** (`upgrade_type`); se sintetiza a mano si la dispara cualquier otra cosa:
 *
 *   op                    disparador                                   camino
 *   ─────────────────────────────────────────────────────────────────────────────────────
 *   acumuladores          token (`resolveToken`)                       factory
 *   CONDITION_OVERLOAD    token (`WEAPON_ADD_DAMAGE_PER_STATUS_TYPE`)  factory
 *   MELEE_COMBO_MULT      intrínseco (`kind=melee` + perfil heavy)     StaticHydrator
 *   SNIPER_COMBO_MULT     intrínseco (`family=sniper`)                 StaticHydrator
 *   COMBO_SCALED_ADD      `stat.condition` del dato                    ModRepository
 *   STACK_DECAY_BUFF      `stat.max_stacks` del dato                   ModRepository, ArcaneRepository
 *
 * `CONDITION_OVERLOAD` **no es una excepción a la regla — la cumple**: es la única op de familia con
 * entrada en `UPGRADE_MAP`, así que un token la alcanza igual que a un acumulador. Que sea "familia"
 * es ortogonal.
 *
 * Corolario sobre los parámetros (consecuencia, no causa): un token es un **símbolo del vocabulario y
 * no lleva payload**, así que lo único que puede viajar con él son parámetros que vivan en el
 * vocabulario mismo — los `co_factors` de CO son **nombres fijos de variables de contexto**,
 * declarados en la entrada de `UPGRADE_MAP`. Un parámetro con valor **por-arma** (`min_combo`, del
 * perfil) o **por-mod** (`cap`, de `max_stacks`) no cabe en un símbolo: por eso las variantes que los
 * llevan también son las que se sintetizan. Pero la causa es el disparador — `MELEE_COMBO_MULT` sólo
 * lleva un nombre de contexto y se sintetiza igual, porque **ningún token la emite**.
 *
 * ⇒ Si mañana una op de familia recibe entrada en `UPGRADE_MAP`, su lugar es acá, y el factory tendrá
 * que aceptar sus factores — como ya hace con `co_factors`.
 */
export function makeModifier(
  base: ModifierBase,
  op: ModifierOperation,
  value: number,
  co_factors?: CoFactors,
): Modifier {
  if (op === 'CONDITION_OVERLOAD') {
    if (!co_factors) throw new Error(`makeModifier: CONDITION_OVERLOAD requiere co_factors (${base.id})`);
    return { ...base, operation: 'CONDITION_OVERLOAD', value, co_factors };
  }
  if (op === 'MELEE_COMBO_MULT' || op === 'SNIPER_COMBO_MULT' || op === 'COMBO_SCALED_ADD' || op === 'STACK_DECAY_BUFF') {
    throw new Error(`makeModifier: la op de combo '${op}' se sintetiza a mano, no vía factory (${base.id})`);
  }
  return { ...base, operation: op, value };
}

// `GameLaws` / `BASELINE_GAME_LAWS` — RETIRADOS (`arch-decisions §17`). Eran una tabla plana de seis
// parámetros que el contexto transportaba hasta cada behavior de status. §17 la desarma por estructural,
// no por ubicación: un valor plano **no tiene dónde poner su procedencia**, así que no puede expresar el
// caso que sí está medido (`status-stack-caps.md`) — dos jugadores contra el MISMO enemigo, uno con cap
// 19 por tres Tauforged Emerald y otro con cap 10, y cada proc usando el cap del que lo aplica. Una tabla
// global le daría 19 a los dos.
//
// Los seis parámetros viven ahora con su fórmula, en `formulas/status/stack-debuff.ts`. La cadena de
// desvíos (default → emisor → receptor) es `CV-3` y entra por ahí, no reabriendo la tabla.
