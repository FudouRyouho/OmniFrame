/**
 * @domain Presentation / Metadata / Attributes
 * @status en-desarrollo
 *
 * [D-7 Fase 4] SSoT de presentación ESTRUCTURAL (category + unit) de los nodos del
 * engine, keyed por el token D-6 (`Upgrade`) — el mismo vocabulario que C emite. Es
 * `Partial`: solo los tokens que renderizan como NODO (los ADD-variants + daño). Los
 * FLAT/BASE/sub-familia convergen a su nodo ADD y nunca renderizan, así que no van.
 *
 * La LABEL no vive aquí: es i18n (`lib/i18n/stat-labels.ts`), se compone en el borde.
 * `project()` (shared/view-model) consume esto por lookup — el engine NO lo importa
 * (matar el leak β era el objetivo de la fase). Key-typed a `Upgrade` ⇒ un typo en una
 * clave es error de compilador, aunque el dict sea parcial.
 */

import type { Upgrade } from "@shared/types/modifier";

export interface PresentationMeta {
  category: 'primary' | 'offensive' | 'utility' | 'elemental';
  unit: '%' | 'x' | 's' | '';
}

const FALLBACK: PresentationMeta = { category: 'utility', unit: '' };

export const ATTRIBUTE_REGISTRY: Partial<Record<Upgrade, PresentationMeta>> = {
  // ── WEAPON — primary (la hoja del arsenal) ──────────────────────────────────
  WEAPON_ADD_DAMAGE:        { category: 'primary', unit: '%' },
  WEAPON_ADD_CRIT_CHANCE:   { category: 'primary', unit: '%' },
  WEAPON_ADD_CRIT_MULT:     { category: 'primary', unit: 'x' },
  WEAPON_ADD_STATUS_CHANCE: { category: 'primary', unit: '%' },

  // ── WEAPON — offensive ──────────────────────────────────────────────────────
  WEAPON_ADD_FIRE_RATE:       { category: 'offensive', unit: '' },
  WEAPON_ADD_MULTISHOT:       { category: 'offensive', unit: '' },
  WEAPON_ADD_MAGAZINE_MAX:    { category: 'offensive', unit: '' },
  WEAPON_ADD_AMMO_MAX:        { category: 'offensive', unit: '' },
  WEAPON_ADD_AMMO_EFFICIENCY: { category: 'offensive', unit: '%' },
  WEAPON_ADD_RELOAD_SPEED:    { category: 'offensive', unit: '%' },
  WEAPON_ADD_STATUS_DAMAGE:   { category: 'offensive', unit: '%' },
  WEAPON_ADD_STATUS_DURATION: { category: 'offensive', unit: '%' },
  WEAPON_ADD_FINISHER_DAMAGE: { category: 'offensive', unit: '%' },
  WEAPON_ADD_HEADSHOT_MULT:   { category: 'offensive', unit: '%' },

  // ── WEAPON — utility ────────────────────────────────────────────────────────
  WEAPON_ADD_ACCURACY:         { category: 'utility', unit: '' },
  WEAPON_ADD_RECOIL:           { category: 'utility', unit: '' },
  WEAPON_ADD_PROJECTILE_SPEED: { category: 'utility', unit: '' },
  WEAPON_ADD_ZOOM:             { category: 'utility', unit: '' },
  WEAPON_FLAT_PUNCH_THROUGH:   { category: 'utility', unit: '' },
  WEAPON_ADD_RANGE:            { category: 'utility', unit: '' },
  WEAPON_ADD_BEAM_RANGE:       { category: 'utility', unit: '' },
  WEAPON_ADD_SLAM_RADIUS:      { category: 'utility', unit: '' },
  WEAPON_ADD_SLAM_DAMAGE:      { category: 'offensive', unit: '%' },
  WEAPON_ADD_HEAVY_CHARGE_SPEED: { category: 'utility', unit: '%' },
  WEAPON_ADD_COMBO_DURATION:     { category: 'utility', unit: 's' },
  WEAPON_ADD_COMBO_COUNT_CHANCE: { category: 'utility', unit: '%' },

  // ── WEAPON — daño físico y elemental (nodos de DamageCombiner) ──────────────
  WEAPON_ADD_IMPACT_DAMAGE:      { category: 'elemental', unit: '' },
  WEAPON_ADD_PUNCTURE_DAMAGE:    { category: 'elemental', unit: '' },
  WEAPON_ADD_SLASH_DAMAGE:       { category: 'elemental', unit: '' },
  WEAPON_ADD_HEAT_DAMAGE:        { category: 'elemental', unit: '' },
  WEAPON_ADD_COLD_DAMAGE:        { category: 'elemental', unit: '' },
  WEAPON_ADD_ELECTRICITY_DAMAGE: { category: 'elemental', unit: '' },
  WEAPON_ADD_TOXIN_DAMAGE:       { category: 'elemental', unit: '' },
  WEAPON_ADD_VIRAL_DAMAGE:       { category: 'elemental', unit: '' },
  WEAPON_ADD_CORROSIVE_DAMAGE:   { category: 'elemental', unit: '' },
  WEAPON_ADD_GAS_DAMAGE:         { category: 'elemental', unit: '' },
  WEAPON_ADD_MAGNETIC_DAMAGE:    { category: 'elemental', unit: '' },
  WEAPON_ADD_RADIATION_DAMAGE:   { category: 'elemental', unit: '' },
  WEAPON_ADD_BLAST_DAMAGE:       { category: 'elemental', unit: '' },
  WEAPON_ADD_VOID_DAMAGE:        { category: 'elemental', unit: '' },
  WEAPON_ADD_TAU_DAMAGE:         { category: 'elemental', unit: '' },
  WEAPON_ADD_TRUE_DAMAGE:        { category: 'elemental', unit: '' },
  WEAPON_ADD_NONE_DAMAGE:        { category: 'elemental', unit: '' },

  // ── AVATAR — stats base del warframe ────────────────────────────────────────
  AVATAR_ADD_HEALTH_MAX: { category: 'primary', unit: '' },
  AVATAR_ADD_SHIELD_MAX: { category: 'primary', unit: '' },
  AVATAR_ADD_ENERGY_MAX: { category: 'primary', unit: '' },
  AVATAR_ADD_ARMOUR:     { category: 'primary', unit: '' },

  // ── AVATAR — habilidades ────────────────────────────────────────────────────
  AVATAR_ADD_ABILITY_STRENGTH:   { category: 'offensive', unit: '%' },
  AVATAR_ADD_ABILITY_RANGE:      { category: 'offensive', unit: '%' },
  AVATAR_ADD_ABILITY_DURATION:   { category: 'offensive', unit: '%' },
  AVATAR_ADD_ABILITY_EFFICIENCY: { category: 'offensive', unit: '%' },
  AVATAR_ADD_ABILITY_DAMAGE:     { category: 'offensive', unit: '%' },

  // ── AVATAR — utility ────────────────────────────────────────────────────────
  AVATAR_ADD_MOVEMENT_SPEED:       { category: 'utility', unit: '%' },
  AVATAR_ADD_SPRINT_SPEED:         { category: 'utility', unit: '%' },
  AVATAR_ADD_CASTING_SPEED:        { category: 'utility', unit: '%' },
  AVATAR_ADD_SHIELD_RECHARGE_RATE: { category: 'utility', unit: '%' },
  AVATAR_ADD_HEALTH_REGEN:         { category: 'utility', unit: '%' },

  // ── GAMEPLAY ────────────────────────────────────────────────────────────────
  GAMEPLAY_MULT_FACTION_DAMAGE: { category: 'offensive', unit: '%' },
};

/**
 * Mapeo de Uids de slots para la UI (chrome path — independiente del engine).
 */
export const SLOT_LABELS: Record<string, string> = {
  "aura": "Aura",
  "stance": "Stance",
  "exilus": "Exilus",
  "normal": "Mod",
  "arcanes": "Arcane"
};

/** Lookup de presentación por token de nodo. Fallback seguro para no-mapeados. */
export function getPresentationMeta(id: string): PresentationMeta {
  return ATTRIBUTE_REGISTRY[id as Upgrade] ?? FALLBACK;
}
