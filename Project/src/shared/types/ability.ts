/**
 * @domain Shared / Types / Ability
 * @SSoT docs/domains/data/abilities/formula-patterns.md
 */

export type AbilityUpgradeBy =
  | 'AVATAR_ABILITY_STRENGTH'
  | 'AVATAR_ABILITY_RANGE'
  | 'AVATAR_ABILITY_DURATION'
  | 'AVATAR_ABILITY_EFFICIENCY'
  | 'ENERGY_COST'
  | 'ENERGY_DRAIN'
  | 'NONE';

export const UPGRADE_BY_OPTIONS: Array<{
  value: AbilityUpgradeBy;
  label: string;
  description: string;
}> = [
  {
    value: 'AVATAR_ABILITY_STRENGTH',
    label: 'Ability Strength',
    description: 'Escala con el modificador de Ability Strength del Warframe.',
  },
  {
    value: 'AVATAR_ABILITY_RANGE',
    label: 'Ability Range',
    description: 'Escala con el modificador de Ability Range del Warframe.',
  },
  {
    value: 'AVATAR_ABILITY_DURATION',
    label: 'Ability Duration',
    description: 'Escala con el modificador de Ability Duration del Warframe.',
  },
  {
    value: 'AVATAR_ABILITY_EFFICIENCY',
    label: 'Ability Efficiency',
    description: 'Escala con Ability Efficiency. Raro — usar ENERGY_COST para costes de activación.',
  },
  {
    value: 'ENERGY_COST',
    label: 'Energy Cost',
    description: 'Coste de activación. Fórmula: (2 − EFF) × base. Mínimo 25% del base.',
  },
  {
    value: 'ENERGY_DRAIN',
    label: 'Energy Drain',
    description: 'Drain por segundo. Fórmula: (2 − EFF) × base / DUR.',
  },
  {
    value: 'NONE',
    label: 'Fixed',
    description: 'Valor fijo — no escala con ningún modificador.',
  },
];

export interface AbilityStatValue {
  base_value: number;
  upgrade_by: AbilityUpgradeBy;
  upgrade_type?: string;
  cap?: number;
  cap_min?: number;
  helminth_base?: number;
  helminth_cap?: number;
  inverse?: boolean;
}

export interface AbilityStatEntry {
  label: string;
  values: AbilityStatValue[];
}

export interface AbilityGroup {
  id?: string;
  label?: string;
  default_active?: boolean;
  exclusive?: boolean;
  stats: AbilityStatEntry[];
}

export interface AbilityStatsData {
  name: string;
  description: string;
  image_name: string;
  groups: AbilityGroup[];
}

export interface Ability {
  unique_name: string;
  name: string;
  description: string;
  image_name: string;
  key?: number;
  cost?: number;
  cost_type?: 'energy' | 'shield' | 'time';
  powersuit?: string;
  introduced?: string;
  subsumable?: boolean;
  augments?: string[];
  weapon?: string;
  card_image?: string;
  preview?: string;
  preview_fallback?: string;
  stats?: AbilityStatsData;
}
