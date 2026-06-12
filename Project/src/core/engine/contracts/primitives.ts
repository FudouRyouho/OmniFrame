/**
 * @domain Engine / Primitives
 *
 * Vocabulario compartido del engine que NO es un corte de frontera:
 * ids, el nodo de atributo, el modifier, las leyes del juego.
 */

import type { ModifierOperation } from '@shared/types/modifier';
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
  // Presentation Metadata
  label?: string;
  category?: 'primary' | 'offensive' | 'utility' | 'elemental';
  unit?: '%' | 'x' | 's' | '';
}

export interface EnemyStatusState {
  damage_corrosive: number;
  damage_viral: number;
  damage_heat: number;
  damage_magnetic: number;
}

export interface Modifier {
  id: string;
  source_id?: string;
  target_entity: EntityId;
  target_channel?: string; // Overrides target_entity resolution — engine busca la entidad con este channel
  target_attribute: AttributeId;
  source_attribute?: AttributeId; // For cross-attribute scaling
  operation: ModifierOperation;
  value: number;
  condition?: ConditionInput;
  context_variable?: string;
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
