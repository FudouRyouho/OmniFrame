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
  // Accumulators (Per Pass)
  base_flat: number;
  base_add_pct: number;
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
  target_channel?: string; // Overrides target_entity resolution — engine busca la entidad con este channel
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
 * dato (token D-6), no se conoce en compile-time → este factory centraliza el mapeo op→variante
 * de la union. Los productores dinámicos SOLO generan acumulador o CONDITION_OVERLOAD; las ops de
 * combo (incluida `COMBO_SCALED_ADD`/`STACK_DECAY_BUFF` — Blood Rush/Galvanized SÍ son dinámicos,
 * pero sus variantes traen factores que este factory no conoce) se sintetizan a mano (StaticHydrator
 * para las intrínsecas, `ModRepository` para `COMBO_SCALED_ADD`/`STACK_DECAY_BUFF`) — variante
 * directa, sin pasar por acá.
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

export interface GameLaws {
  corrosive_max_stacks: number;
  corrosive_initial_strip: number;
  corrosive_stack_strip: number;
  status_max_stacks: number;
  status_initial_bonus: number;
  status_stack_bonus: number;
}

export const BASELINE_GAME_LAWS: GameLaws = {
  corrosive_max_stacks: 10,
  corrosive_initial_strip: 26,
  corrosive_stack_strip: 6,
  status_max_stacks: 10,
  status_initial_bonus: 100, // +100% Viral/Mag (2.0x)
  status_stack_bonus: 25     // +25% por stack extra
};
