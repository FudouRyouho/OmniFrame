/**
 * item-details.ts
 * Capa de Mapeo — dato crudo → StatEntry[] ordenado para presentación.
 *
 * Responsabilidades:
 *   - Decidir qué stats mostrar y en qué orden
 *   - Formatear valores (número → string de presentación)
 *   - Aplicar labels desde i18n
 *
 * No hace:
 *   - Lógica de cálculo (eso es el Builder)
 *   - Decisiones de layout o estilo (eso es la UI)
 */

import type { Weapon, WeaponAttack, Mod } from '../shared/types'
import { getWeaponStatLabels, getModStatLabels } from './i18n/stat-labels'
import { getDamageLabels } from './i18n/damage-labels'

// ── Tipos de salida ───────────────────────────────────────────────────────────

export interface StatEntry {
  key: string
  label: string
  value: string
  /** Separa secciones visualmente (ej. antes del bloque de daño) */
  isSectionHeader?: boolean
}

// ── Formateadores ─────────────────────────────────────────────────────────────

const nf = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 })
const fmt = (v: number) => nf.format(v)
const pct = (v: number) => `${fmt(v * 100)}%`

// ── Weapon attack stats ───────────────────────────────────────────────────────

/**
 * Genera el array de StatEntry para un attack específico + su arma padre.
 * El orden refleja la convención de la wiki: stats de ataque → stats del arma → daño.
 */
export const getAttackStats = (weapon: Weapon, attack: WeaponAttack): StatEntry[] => {
  const isMelee = weapon.kind === 'melee'
  const entries: StatEntry[] = []
  const L = getWeaponStatLabels()
  const DL = getDamageLabels()

  // ── Stats del ataque ──────────────────────────────────────────────────────

  if (attack.crit_chance != null)
    entries.push({ key: 'crit_chance', label: L.crit_chance, value: pct(attack.crit_chance) })

  if (attack.crit_mult != null)
    entries.push({ key: 'crit_mult', label: L.crit_mult, value: `${fmt(attack.crit_mult)}x` })

  if (attack.status_chance != null)
    entries.push({ key: 'status_chance', label: L.status_chance, value: pct(attack.status_chance) })

  // ── Stats del arma (bloque stats) ──────────────────────────────────────────

  const stats = weapon.stats;

  if (!isMelee) {
    if (stats.magazine_size != null)
      entries.push({ key: 'magazine_size', label: L.magazineSize, value: fmt(stats.magazine_size) })

    if (stats.reload_time != null)
      entries.push({ key: 'reload_time', label: L.reloadTime, value: `${fmt(stats.reload_time)}s` })

    if (stats.multishot != null)
      entries.push({ key: 'multishot', label: L.multishot, value: fmt(stats.multishot) })

    if (stats.accuracy != null)
      entries.push({ key: 'accuracy', label: L.accuracy, value: fmt(stats.accuracy) })

    if (stats.noise != null)
      entries.push({ key: 'noise', label: L.noise, value: stats.noise })

    if (stats.trigger != null)
      entries.push({ key: 'trigger', label: L.trigger, value: stats.trigger })
  }

  // ── Daño ──────────────────────────────────────────────────────────────────

  const damageEntries = Object.entries(attack.damage ?? {})
    .filter(([, v]) => typeof v === 'number' && v > 0) as [string, number][]

  if (damageEntries.length > 0) {
    entries.push({ key: 'damage_header', label: L.damage, value: '', isSectionHeader: true })

    for (const [type, value] of damageEntries) {
      const label = DL[type as keyof typeof DL] ?? type
      entries.push({ key: `damage_${type}`, label: label.toUpperCase(), value: fmt(value) })
    }

    if (attack.total_damage != null)
      entries.push({ key: 'total_damage', label: L.totalDamage, value: fmt(attack.total_damage) })
  }

  return entries
}


// ── Mod stats ─────────────────────────────────────────────────────────────────

/**
 * Genera el array de StatEntry para un mod.
 */
export const getModStats = (mod: Mod): StatEntry[] => {
  const entries: StatEntry[] = []
  const L = getModStatLabels()

  const stats = mod.stats;

  if (mod.type)
    entries.push({ key: 'type', label: L.type, value: mod.type })

  if (mod.rarity)
    entries.push({ key: 'rarity', label: L.rarity, value: mod.rarity })

  if (mod.polarity)
    entries.push({ key: 'polarity', label: L.polarity, value: mod.polarity })

  if (stats.base_drain != null)
    entries.push({ key: 'base_drain', label: L.baseDrain, value: String(stats.base_drain) })

  if (stats.rank != null)
    entries.push({ key: 'rank', label: L.rank, value: String(stats.rank) })

  const statsArray = stats.level_stats ?? []
  const maxRankStats = statsArray[statsArray.length - 1]?.stats ?? []
  if (maxRankStats.length > 0) {
    entries.push({ key: 'effects_header', label: L.effects, value: '', isSectionHeader: true })
    for (const [i, stat] of maxRankStats.entries()) {
      entries.push({ key: `effect_${i}`, label: stat, value: '' })
    }
  }

  return entries
}

