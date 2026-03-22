// ── Legacy types — @deprecated ────────────────────────────────────────────────
// Mantenidos solo para compatibilidad durante la migración.
// No usar en código nuevo.

/** @deprecated Usar AbilityUpgradeBy. */
export type AbilityScaling =
  | 'STRENGTH' | 'RANGE' | 'DURATION' | 'EFFICIENCY' | 'ENERGY_DRAIN' | 'NONE';

/** @deprecated */
export type AbilityModifier = AbilityScaling;

/**
 * @deprecated ModModifier fue diseñado antes de tener upgradeTypes[] en el JSON.
 * El builder consume upgradeTypes[] directamente desde el JSON de mods.
 */
export type ModModifier =
  | 'DAMAGE_BASE' | 'DAMAGE_COLD' | 'DAMAGE_HEAT' | 'DAMAGE_ELECTRICITY' | 'DAMAGE_TOXIN'
  | 'DAMAGE_IMPACT' | 'DAMAGE_PUNCTURE' | 'DAMAGE_SLASH'
  | 'DAMAGE_BLAST' | 'DAMAGE_CORROSIVE' | 'DAMAGE_GAS' | 'DAMAGE_MAGNETIC' | 'DAMAGE_RADIATION' | 'DAMAGE_VIRAL' | 'DAMAGE_VOID'
  | 'DAMAGE_FACTION_CORPUS' | 'DAMAGE_FACTION_GRINEER' | 'DAMAGE_FACTION_INFESTED' | 'DAMAGE_FACTION_MURMUR' | 'DAMAGE_FACTION_OROKIN'
  | 'CRIT_CHANCE' | 'CRIT_DAMAGE' | 'STATUS_CHANCE' | 'STATUS_DURATION'
  | 'MULTISHOT' | 'FIRE_RATE' | 'RELOAD_SPEED' | 'MAGAZINE_CAPACITY' | 'AMMO_MAX'
  | 'PUNCH_THROUGH' | 'PROJECTILE_SPEED' | 'ACCURACY' | 'ZOOM' | 'RECOIL'
  | 'ABILITY_STRENGTH' | 'ABILITY_DURATION' | 'ABILITY_EFFICIENCY' | 'ABILITY_RANGE'
  | 'HEALTH' | 'SHIELD' | 'ARMOR' | 'ENERGY_MAX' | 'SPRINT_SPEED'
  | 'CONDITIONAL' | 'UNIQUE' | '';

/** @deprecated Usar AbilityStatValue */
export interface Stat {
  value: number;
  modifier: AbilityScaling;
  maxCap?: number;
  minCap?: number;
  helminthValues?: number[];
  type?: string;
}

/** @deprecated */
export interface Misc extends Omit<Stat, 'maxCap' | 'minCap' | 'helminthValues' | 'modifier'> {
  label: string;
  modifier?: string;
}

/** @deprecated Usar AbilityGroup */
export interface AbilityStat {
  label?: string;
  mode?: string;
  stats: Stat[];
  misc: Misc[];
  helminthValues?: number[];
}
