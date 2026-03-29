// ── Ability Schema (nuevo — groups[]) ────────────────────────────────────────
// Ver Docs-legacy/analysis/ability-schema-examples.md para la especificación completa.

/**
 * Variable del engine que escala el valor base de un stat de habilidad.
 * Usa los identificadores canónicos del engine (mismos que upgradeTypes[] en mods).
 */
export type AbilityUpgradeBy =
  | 'AVATAR_ABILITY_STRENGTH'    // escala con Ability Strength
  | 'AVATAR_ABILITY_RANGE'       // escala con Ability Range
  | 'AVATAR_ABILITY_DURATION'    // escala con Ability Duration
  | 'AVATAR_ABILITY_EFFICIENCY'  // escala con Ability Efficiency (raro — usar ENERGY_COST)
  | 'ENERGY_COST'                // coste de activación (Drain en UI): (2-EFF)*base
  | 'ENERGY_DRAIN'               // drain por segundo (Energy/s en UI): (2-EFF)*base/DUR
  | 'NONE';                      // valor fijo, no escala
  // Nota: patrones con TARGET (Oberon Renewal) y COMBO (Atlas Landslide) usan
  // ENERGY_DRAIN como upgradeBy — el multiplicador dinámico es responsabilidad del motor.

/**
 * Opciones canónicas de AbilityUpgradeBy para el editor.
 * Cada entrada incluye label legible y descripción para dropdowns.
 */
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
  baseValue: number;
  upgradeBy: AbilityUpgradeBy;
  /** Solo para buff abilities: qué stat externo modifica (WEAPON_DAMAGE_AMOUNT, ARMOR_BONUS, etc.) */
  upgradeType?: string;
  /** Cap máximo tras escalar — (STR * 80), 95 en el módulo */
  cap?: number;
  capMin?: number;
  helminthBase?: number;
  helminthCap?: number;
  inverse?: boolean;
}

export interface AbilityStatEntry {
  label: string;
  values: AbilityStatValue[];
}

/**
 * Grupo de stats de una habilidad.
 * Sin `id` = grupo base, siempre activo, sin header.
 * Con `id` = sección con toggle (elemento, forma, mote, etc.)
 */
export interface AbilityGroup {
  id?: string;
  label?: string;
  defaultActive?: boolean;
  /** true = radio (solo uno activo a la vez) | false = checkbox (varios simultáneos) */
  exclusive?: boolean;
  stats: AbilityStatEntry[];
}

export interface AbilityStatsData {
  name: string;
  description: string;
  imageName: string;
  groups: AbilityGroup[];
}

export interface Ability {
  uniqueName: string;
  name: string;
  description: string;
  imageName: string;
  key?: number;
  cost?: number;
  costType?: 'energy' | 'shield' | 'time';
  powersuit?: string;
  introduced?: string;
  subsumable?: boolean;
  augments?: string[];
  weapon?: string;
  cardImage?: string;
  preview?: string;
  previewFallback?: string;
  /** Numeric gameplay stats from Module:Ability/data/stats */
  stats?: AbilityStatsData;
}
