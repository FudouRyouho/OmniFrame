/**
 * @domain Shared / Types / Modifier
 * @SSoT docs/data/schemas/mods/upgrade-taxonomy.md
 *
 * Vocabulario del sistema de modificadores. Aplica a cualquier fuente que
 * modifique atributos del engine: mods, pasivas, habilidades, arcanos, etc.
 *
 * El override JSON es responsable del eje semántico:
 *   upgrade_type  → "a qué atributo del engine modifica esta fuente"
 *   upgrade_by    → "con qué stat del Warframe escala este valor"
 * Ambos comparten el mismo vocabulario Upgrade.
 */

// ─── ModifierOperation ───────────────────────────────────────────────────────
// Fuente de verdad consumida por contracts/index.ts (Modifier.operation).
// Convención D-6 OPERATION token → engine op → formula bucket:
//   ADD  → ADD          → mods_add_pct   (% aditivo estándar)
//   BASE → BASE_FLAT    → base_flat      (plano pre-escala, amplificado por ADD)
//   FLAT → ADD_FLAT     → total_flat     (plano post-escala, no amplificado)
//   MULT → MULTIPLICATIVE → multiplicative (% multiplicativo, stack separado)

export type ModifierOperation =
  | 'ADD'
  | 'SET'
  | 'ADD_FLAT'
  | 'BASE_FLAT'
  | 'BASE_ADD_PCT'
  | 'CONTEXT_SCALE'
  | 'MULTIPLICATIVE'

// ─── Upgrade ─────────────────────────────────────────────────────────────────
// Convención D-6: {FAMILY}_{OPERATION}_{PREFIX}_{SUFFIX}
// Fuente de verdad: el array UPGRADES — el tipo se deriva de él (no al revés).

export type UpgradeFamily = 'WEAPON' | 'AVATAR' | 'VEHICLE' | 'GAMEPLAY'

export const UPGRADES = [
  // ── WEAPON — daño global ────────────────────────────────────────────────
  'WEAPON_ADD_DAMAGE',
  // ── WEAPON — derivados elementales y físicos ────────────────────────────
  'WEAPON_ADD_IMPACT_DAMAGE',
  'WEAPON_ADD_PUNCTURE_DAMAGE',
  'WEAPON_ADD_SLASH_DAMAGE',
  'WEAPON_ADD_HEAT_DAMAGE',
  'WEAPON_ADD_COLD_DAMAGE',
  'WEAPON_ADD_ELECTRICITY_DAMAGE',
  'WEAPON_ADD_TOXIN_DAMAGE',
  'WEAPON_ADD_BLAST_DAMAGE',
  'WEAPON_ADD_CORROSIVE_DAMAGE',
  'WEAPON_ADD_GAS_DAMAGE',
  'WEAPON_ADD_MAGNETIC_DAMAGE',
  'WEAPON_ADD_RADIATION_DAMAGE',
  'WEAPON_ADD_VIRAL_DAMAGE',
  'WEAPON_ADD_VOID_DAMAGE',
  'WEAPON_ADD_TAU_DAMAGE',
  'WEAPON_ADD_TRUE_DAMAGE',
  'WEAPON_ADD_NONE_DAMAGE',
  // ── WEAPON — stats de disparo y crítico ─────────────────────────────────
  'WEAPON_ADD_FIRE_RATE',
  'WEAPON_ADD_MULTISHOT',
  // Alias del pipeline @wfcd/items → mapea al mismo atributo que WEAPON_ADD_MULTISHOT.
  // Los mods del override JSON usan este token (Hell's Chamber, Galvanized Hell, etc.).
  // Resolución: OQ-ENGINE-6.
  'WEAPON_FIRE_ITERATIONS',
  'WEAPON_ADD_CRIT_CHANCE',
  'WEAPON_ADD_CRIT_MULT',
  'WEAPON_ADD_STATUS_CHANCE',
  'WEAPON_ADD_MAGAZINE_MAX',
  'WEAPON_ADD_RELOAD_SPEED',
  'WEAPON_ADD_STATUS_DAMAGE',
  'WEAPON_ADD_PROJECTILE_SPEED',
  'WEAPON_ADD_ACCURACY',
  'WEAPON_ADD_RECOIL',
  'WEAPON_ADD_STATUS_DURATION',
  'WEAPON_ADD_ZOOM',
  'WEAPON_ADD_FINISHER_DAMAGE',
  // ── WEAPON — perks base incarnon (BASE_FLAT — se amplifican con mods ADD) ─
  'WEAPON_BASE_CRIT_CHANCE',
  'WEAPON_BASE_STATUS_CHANCE',
  'WEAPON_BASE_DAMAGE',
  'WEAPON_BASE_MAGAZINE_MAX',
  'WEAPON_BASE_CRIT_MULT',
  // ── WEAPON — melee ────────────────────────────────────────────────────────
  'WEAPON_ADD_HEAVY_CHARGE_SPEED',
  'WEAPON_BASE_HEAVY_EFFICIENCY',
  'WEAPON_ADD_SLAM_RADIUS',
  'WEAPON_ADD_RANGE',
  'WEAPON_BASE_COMBO_DURATION',
  'WEAPON_ADD_COMBO_DURATION',
  'WEAPON_BASE_COMBO_INITIAL',
  // ── WEAPON — sub-familia clase (D-6 extensión, activa 2026-05-26) ────────
  // Patrón: {FAMILY}_{SUB_FAMILY}_{OPERATION}_{PREFIX}_{SUFFIX}
  // Sin entrada en UPGRADE_MAP — pipeline deuda D-7. Engine los consumirá directamente.
  'WEAPON_PRIMARY_ADD_STATUS_CHANCE',
  'WEAPON_SECONDARY_ADD_CRIT_CHANCE',
  'WEAPON_MELEE_ADD_CRIT_MULT',
  // ── AVATAR — habilidades ─────────────────────────────────────────────────
  'AVATAR_ADD_ABILITY_STRENGTH',
  'AVATAR_ADD_ABILITY_RANGE',
  'AVATAR_ADD_ABILITY_DURATION',
  'AVATAR_ADD_ABILITY_EFFICIENCY',
  // ── AVATAR — stats base ──────────────────────────────────────────────────
  'AVATAR_ADD_HEALTH_MAX',
  'AVATAR_ADD_SHIELD_MAX',
  'AVATAR_ADD_ARMOUR',
  'AVATAR_ADD_ENERGY_MAX',
  'AVATAR_ADD_MOVEMENT_SPEED',
  'AVATAR_ADD_SPRINT_SPEED',
  'AVATAR_ADD_CASTING_SPEED',
  'AVATAR_ADD_SHIELD_RECHARGE_RATE',
  'AVATAR_ADD_PARKOUR_VELOCITY',
  'AVATAR_ADD_HEALTH_ORB_EFFICIENCY',
  'AVATAR_ADD_ENERGY_ORB_EFFICIENCY',
  // ── AVATAR — planos post-escala (ADD_FLAT) ───────────────────────────────
  // Fórmula: Base × (1 + Mods%) + FLAT. Fuentes: Archon Shards Azure, Stone Skin, Arcanos de armor.
  // No se amplifican por mods — se suman después del pool multiplicativo.
  'AVATAR_FLAT_HEALTH_MAX',
  'AVATAR_FLAT_SHIELD_MAX',
  'AVATAR_FLAT_ENERGY_MAX',
  'AVATAR_FLAT_ARMOUR',
  'AVATAR_FLAT_HEALTH_REGEN',
  // ── GAMEPLAY ─────────────────────────────────────────────────────────────
  'GAMEPLAY_MULT_FACTION_DAMAGE',
] as const

export type Upgrade = (typeof UPGRADES)[number]

const UPGRADE_SET = new Set<Upgrade>(UPGRADES)

export function isUpgrade(value: string): value is Upgrade {
  return UPGRADE_SET.has(value as Upgrade)
}

export function getUpgradeFamily(upgrade: Upgrade): UpgradeFamily {
  if (upgrade.startsWith('WEAPON_')) return 'WEAPON'
  if (upgrade.startsWith('AVATAR_')) return 'AVATAR'
  if (upgrade.startsWith('VEHICLE_')) return 'VEHICLE'
  return 'GAMEPLAY'
}

// ─── UPGRADE_MAP ─────────────────────────────────────────────────────────────
// [BRIDGE — D-7] Resuelve Upgrade → attr ID del engine + operación.
// Existe porque los attr IDs del engine preexisten a D-6 y usan naming distinto.
// Desaparecerá cuando D-7 estandarice los attr IDs (ver .working/engine-semantic-foundation.md).
//
// Tokens sin entrada = pipeline deuda conocida — no es un error de runtime.

export interface UpgradeMapEntry {
  attr: string;
  op: ModifierOperation;
  toPercent?: boolean;
  target_channel?: string;
}

// ─── OPERATION_MAP ────────────────────────────────────────────────────────────
// Deriva ModifierOperation del segmento OPERATION del token D-6.
// 4 entradas — no es un UPGRADE_MAP; es la convención del vocabulario misma.
const OPERATION_MAP: Record<string, ModifierOperation> = {
  ADD:  'ADD',
  FLAT: 'ADD_FLAT',
  BASE: 'BASE_FLAT',
  MULT: 'MULTIPLICATIVE',
}

const SUB_FAMILY_CHANNELS: Record<string, string> = {
  PRIMARY:   'primary',
  SECONDARY: 'secondary',
  MELEE:     'melee',
}

// Resuelve un token D-6 en { attr, op, target_channel? } sin consultar UPGRADE_MAP.
// Para tokens sin sub-familia: attr = token. Para tokens con sub-familia: attr = token sin sub-familia.
// Fallback de ModRepository para tokens no registrados en UPGRADE_MAP (deuda D-7).
export function resolveToken(token: Upgrade): UpgradeMapEntry | undefined {
  const parts = token.split('_')
  if (parts.length < 3) return undefined

  const subFamily = SUB_FAMILY_CHANNELS[parts[1]]
  const opIdx     = subFamily ? 2 : 1
  const op        = OPERATION_MAP[parts[opIdx]]
  if (!op) return undefined

  const attr = subFamily
    ? `${parts[0]}_${parts.slice(2).join('_')}`
    : token

  return { attr, op, ...(subFamily ? { target_channel: subFamily } : {}) }
}

export const UPGRADE_MAP: Partial<Record<Upgrade, UpgradeMapEntry>> = {

  // ── WEAPON — daño global ──────────────────────────────────────────────────
  WEAPON_ADD_DAMAGE:             { attr: 'WEAPON_DAMAGE',         op: 'ADD' },

  // ── WEAPON — derivados elementales y físicos ─────────────────────────────
  // [D-7b Fase 2] Eliminadas — resolveToken() las cubre: attr = token, op = 'ADD'.

  // ── WEAPON — stats de disparo y crítico ──────────────────────────────────
  WEAPON_ADD_FIRE_RATE:             { attr: 'WEAPON_ADD_FIRE_RATE',             op: 'ADD' },
  WEAPON_ADD_MULTISHOT:             { attr: 'WEAPON_ADD_MULTISHOT',             op: 'ADD' },
  WEAPON_FIRE_ITERATIONS:           { attr: 'WEAPON_ADD_MULTISHOT',             op: 'ADD' },
  WEAPON_ADD_CRIT_CHANCE:           { attr: 'WEAPON_ADD_CRIT_CHANCE',           op: 'ADD' },
  WEAPON_ADD_CRIT_MULT:             { attr: 'WEAPON_ADD_CRIT_MULT',             op: 'ADD' },
  WEAPON_ADD_STATUS_CHANCE:         { attr: 'WEAPON_ADD_STATUS_CHANCE',         op: 'ADD' },
  WEAPON_ADD_MAGAZINE_MAX:          { attr: 'WEAPON_ADD_MAGAZINE_MAX',          op: 'ADD' },
  WEAPON_ADD_RELOAD_SPEED:          { attr: 'WEAPON_ADD_RELOAD_SPEED',          op: 'ADD' },
  WEAPON_ADD_STATUS_DAMAGE:         { attr: 'WEAPON_ADD_STATUS_DAMAGE',         op: 'ADD' },

  // ── WEAPON — perks base incarnon (BASE_FLAT — se amplifican con mods ADD) ─
  WEAPON_BASE_CRIT_CHANCE:          { attr: 'WEAPON_ADD_CRIT_CHANCE',           op: 'BASE_FLAT' },
  WEAPON_BASE_STATUS_CHANCE:        { attr: 'WEAPON_ADD_STATUS_CHANCE',         op: 'BASE_FLAT' },
  WEAPON_BASE_DAMAGE:               { attr: 'WEAPON_DAMAGE',                    op: 'BASE_FLAT' },
  WEAPON_BASE_MAGAZINE_MAX:         { attr: 'WEAPON_ADD_MAGAZINE_MAX',          op: 'BASE_FLAT' },
  WEAPON_BASE_CRIT_MULT:            { attr: 'WEAPON_ADD_CRIT_MULT',             op: 'BASE_FLAT' },
  // ── WEAPON — melee BASE_FLAT (los ADD se resuelven vía resolveToken) ──────
  WEAPON_BASE_HEAVY_EFFICIENCY:     { attr: 'WEAPON_ADD_HEAVY_EFFICIENCY',      op: 'BASE_FLAT' },
  WEAPON_BASE_COMBO_DURATION:       { attr: 'WEAPON_ADD_COMBO_DURATION',        op: 'BASE_FLAT' },
  WEAPON_BASE_COMBO_INITIAL:        { attr: 'WEAPON_ADD_COMBO_INITIAL',         op: 'BASE_FLAT' },

  // ── GAMEPLAY — facción ────────────────────────────────────────────────────
  // toPercent: JSON almacena 1.30 = +30% → convierte a 30 para mods_add_pct.
  GAMEPLAY_MULT_FACTION_DAMAGE:     { attr: 'GAMEPLAY_MULT_FACTION_DAMAGE',     op: 'ADD', toPercent: true },

  // ── AVATAR — habilidades ──────────────────────────────────────────────────
  AVATAR_ADD_ABILITY_STRENGTH:      { attr: 'AVATAR_ADD_ABILITY_STRENGTH',      op: 'ADD' },
  AVATAR_ADD_ABILITY_RANGE:         { attr: 'AVATAR_ADD_ABILITY_RANGE',         op: 'ADD' },
  AVATAR_ADD_ABILITY_DURATION:      { attr: 'AVATAR_ADD_ABILITY_DURATION',      op: 'ADD' },
  AVATAR_ADD_ABILITY_EFFICIENCY:    { attr: 'AVATAR_ADD_ABILITY_EFFICIENCY',    op: 'ADD' },

  // ── AVATAR — stats base ───────────────────────────────────────────────────
  AVATAR_ADD_HEALTH_MAX:            { attr: 'AVATAR_ADD_HEALTH_MAX',            op: 'ADD' },
  AVATAR_ADD_SHIELD_MAX:            { attr: 'AVATAR_ADD_SHIELD_MAX',            op: 'ADD' },
  AVATAR_ADD_ARMOUR:                { attr: 'AVATAR_ADD_ARMOUR',                op: 'ADD' },
  AVATAR_ADD_ENERGY_MAX:            { attr: 'AVATAR_ADD_ENERGY_MAX',            op: 'ADD' },
  AVATAR_ADD_MOVEMENT_SPEED:        { attr: 'AVATAR_ADD_MOVEMENT_SPEED',        op: 'ADD' },
  AVATAR_ADD_SPRINT_SPEED:          { attr: 'AVATAR_ADD_SPRINT_SPEED',          op: 'ADD' },
  AVATAR_ADD_CASTING_SPEED:         { attr: 'AVATAR_ADD_CASTING_SPEED',         op: 'ADD' },
  AVATAR_ADD_SHIELD_RECHARGE_RATE:  { attr: 'AVATAR_ADD_SHIELD_RECHARGE_RATE',  op: 'ADD' },
  AVATAR_ADD_PARKOUR_VELOCITY:      { attr: 'AVATAR_ADD_PARKOUR_VELOCITY',      op: 'ADD' },
  AVATAR_ADD_HEALTH_ORB_EFFICIENCY: { attr: 'AVATAR_ADD_HEALTH_ORB_EFFICIENCY', op: 'ADD' },
  AVATAR_ADD_ENERGY_ORB_EFFICIENCY: { attr: 'AVATAR_ADD_ENERGY_ORB_EFFICIENCY', op: 'ADD' },

  // ── AVATAR — planos post-escala ───────────────────────────────────────────
  AVATAR_FLAT_HEALTH_MAX:   { attr: 'AVATAR_FLAT_HEALTH_MAX',   op: 'ADD_FLAT' },
  AVATAR_FLAT_SHIELD_MAX:   { attr: 'AVATAR_FLAT_SHIELD_MAX',   op: 'ADD_FLAT' },
  AVATAR_FLAT_ENERGY_MAX:   { attr: 'AVATAR_FLAT_ENERGY_MAX',   op: 'ADD_FLAT' },
  AVATAR_FLAT_ARMOUR:       { attr: 'AVATAR_FLAT_ARMOUR',       op: 'ADD_FLAT' },
  AVATAR_FLAT_HEALTH_REGEN: { attr: 'AVATAR_FLAT_HEALTH_REGEN', op: 'ADD_FLAT' },
}
