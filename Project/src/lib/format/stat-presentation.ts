/**
 * @domain Format / Presentation metadata (React-free)
 * @status en-desarrollo
 *
 * [Stage A — proyector único] SSoT de presentación de los nodos del engine, keyed por
 * el token D-6 (`Upgrade`) — el mismo vocabulario que C emite. Vive en `lib/format/*`
 * (React-free) porque lo consumen D1 (`useViewModel`) y D2 (oráculo CLI, corre en Node):
 * meterlo en `lib/presentation/*` (solo React) rompería D2.
 *
 * Es `Partial`: solo los tokens que renderizan como NODO (los ADD-variants + daño). Los
 * FLAT/BASE/sub-familia convergen a su nodo ADD y nunca renderizan, así que no van.
 *
 * `label` es OPCIONAL: los tokens de DAÑO la omiten a propósito — su nombre vive en su
 * propio SSoT (`DAMAGE_TYPE_DEFINITIONS` en shared/types), y el proyector la deriva de
 * ahí (decisión Stage A: referenciar el SSoT, no duplicar ~17 nombres de daño).
 *
 * El engine NO importa esto — `project()` (shared/view-model) lo consume por lookup en
 * el borde C→D (dirección correcta `@shared → @lib`). Key-typed a `Upgrade` ⇒ un typo en
 * una clave es error de compilador, aunque el dict sea parcial.
 */

import type { Upgrade } from "@shared/types/modifier";

export interface PresentationMeta {
  /** Nombre humano. Opcional: los tokens de daño lo derivan de DAMAGE_TYPE_DEFINITIONS. */
  label?: string;
  category: 'primary' | 'offensive' | 'utility' | 'elemental';
  unit: '%' | 'x' | 's' | '';
}

const FALLBACK: PresentationMeta = { category: 'utility', unit: '' };

export const STAT_PRESENTATION: Partial<Record<Upgrade, PresentationMeta>> = {
  // ── WEAPON — primary (la hoja del arsenal) ──────────────────────────────────
  WEAPON_ADD_DAMAGE:        { label: 'DAMAGE',          category: 'primary', unit: '%' },
  WEAPON_ADD_CRIT_CHANCE:   { label: 'CRIT CHANCE',     category: 'primary', unit: '%' },
  WEAPON_ADD_CRIT_MULT:     { label: 'CRIT MULTIPLIER', category: 'primary', unit: 'x' },
  WEAPON_ADD_STATUS_CHANCE: { label: 'STATUS CHANCE',   category: 'primary', unit: '%' },

  // ── WEAPON — offensive ──────────────────────────────────────────────────────
  WEAPON_ADD_FIRE_RATE:       { label: 'FIRE RATE',       category: 'offensive', unit: '' },
  WEAPON_ADD_MULTISHOT:       { label: 'MULTISHOT',       category: 'offensive', unit: '' },
  WEAPON_ADD_MAGAZINE_MAX:    { label: 'MAGAZINE',        category: 'offensive', unit: '' },
  WEAPON_ADD_AMMO_MAX:        { label: 'AMMO MAX',        category: 'offensive', unit: '' },
  WEAPON_ADD_AMMO_EFFICIENCY: { label: 'AMMO EFFICIENCY', category: 'offensive', unit: '%' },
  WEAPON_ADD_RELOAD_SPEED:    { label: 'RELOAD SPEED',    category: 'offensive', unit: '%' },
  WEAPON_ADD_STATUS_DAMAGE:   { label: 'STATUS DAMAGE',   category: 'offensive', unit: '%' },
  WEAPON_ADD_STATUS_DURATION: { label: 'STATUS DURATION', category: 'offensive', unit: '%' },
  WEAPON_ADD_FINISHER_DAMAGE: { label: 'FINISHER DAMAGE', category: 'offensive', unit: '%' },
  WEAPON_ADD_HEADSHOT_MULT:   { label: 'HEADSHOT MULTIPLIER', category: 'offensive', unit: '%' },

  // ── WEAPON — utility ────────────────────────────────────────────────────────
  WEAPON_ADD_ACCURACY:         { label: 'ACCURACY',         category: 'utility', unit: '' },
  WEAPON_ADD_RECOIL:           { label: 'RECOIL',           category: 'utility', unit: '' },
  WEAPON_ADD_PROJECTILE_SPEED: { label: 'PROJECTILE SPEED', category: 'utility', unit: '' },
  WEAPON_ADD_ZOOM:             { label: 'ZOOM',             category: 'utility', unit: '' },
  WEAPON_FLAT_PUNCH_THROUGH:   { label: 'PUNCH THROUGH',    category: 'utility', unit: '' },
  WEAPON_ADD_RANGE:            { label: 'RANGE',            category: 'utility', unit: '' },
  WEAPON_ADD_BEAM_RANGE:       { label: 'BEAM RANGE',       category: 'utility', unit: '' },
  WEAPON_ADD_SLAM_RADIUS:      { label: 'SLAM RADIUS',      category: 'utility', unit: '' },
  WEAPON_ADD_SLAM_DAMAGE:      { label: 'SLAM DAMAGE',      category: 'offensive', unit: '%' },
  WEAPON_ADD_HEAVY_CHARGE_SPEED: { label: 'HEAVY CHARGE SPEED', category: 'utility', unit: '%' },
  WEAPON_ADD_COMBO_DURATION:     { label: 'COMBO DURATION',     category: 'utility', unit: 's' },
  WEAPON_ADD_COMBO_COUNT_CHANCE: { label: 'COMBO COUNT CHANCE', category: 'utility', unit: '%' },

  // ── WEAPON — daño físico y elemental (nodos de DamageCombiner) ──────────────
  // Sin `label`: el nombre lo deriva el proyector de DAMAGE_TYPE_DEFINITIONS (su SSoT).
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
  AVATAR_ADD_HEALTH_MAX: { label: 'HEALTH', category: 'primary', unit: '' },
  AVATAR_ADD_SHIELD_MAX: { label: 'SHIELD', category: 'primary', unit: '' },
  AVATAR_ADD_ENERGY_MAX: { label: 'ENERGY', category: 'primary', unit: '' },
  AVATAR_ADD_ARMOUR:     { label: 'ARMOR',  category: 'primary', unit: '' },

  // ── AVATAR — habilidades ────────────────────────────────────────────────────
  AVATAR_ADD_ABILITY_STRENGTH:   { label: 'ABILITY STRENGTH',   category: 'offensive', unit: '%' },
  AVATAR_ADD_ABILITY_RANGE:      { label: 'ABILITY RANGE',      category: 'offensive', unit: '%' },
  AVATAR_ADD_ABILITY_DURATION:   { label: 'ABILITY DURATION',   category: 'offensive', unit: '%' },
  AVATAR_ADD_ABILITY_EFFICIENCY: { label: 'ABILITY EFFICIENCY', category: 'offensive', unit: '%' },
  AVATAR_ADD_ABILITY_DAMAGE:     { label: 'ABILITY DAMAGE',     category: 'offensive', unit: '%' },

  // ── AVATAR — utility ────────────────────────────────────────────────────────
  AVATAR_ADD_MOVEMENT_SPEED:       { label: 'MOVEMENT SPEED',  category: 'utility', unit: '%' },
  AVATAR_ADD_SPRINT_SPEED:         { label: 'SPRINT SPEED',    category: 'utility', unit: '%' },
  AVATAR_ADD_CASTING_SPEED:        { label: 'CASTING SPEED',   category: 'utility', unit: '%' },
  AVATAR_ADD_SHIELD_RECHARGE_RATE: { label: 'SHIELD RECHARGE', category: 'utility', unit: '%' },
  AVATAR_ADD_HEALTH_REGEN:         { label: 'HEALTH REGEN',    category: 'utility', unit: '%' },

  // ── GAMEPLAY ────────────────────────────────────────────────────────────────
  GAMEPLAY_MULT_FACTION_DAMAGE: { label: 'FACTION DAMAGE', category: 'offensive', unit: '%' },
};

/**
 * Mapeo de Uids de slots para la UI (chrome path — independiente del engine).
 * [Stage A] ⚠️ sin consumidor actual — candidato a purga (anotado en backlog Fuera de corte).
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
  return STAT_PRESENTATION[id as Upgrade] ?? FALLBACK;
}
