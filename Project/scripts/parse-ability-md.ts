#!/usr/bin/env tsx
/**
 * parse-ability-md.ts
 * Convierte references/game-ui/*.md → JSON de groups/stats compatible con ability-stats.override.json
 *
 * Output: { [uniqueName]: { groups: AbilityGroup[] } }
 * name/description/image_name los aporta generate-data.ts desde @wfcd/items.
 *
 * Uso: tsx scripts/parse-ability-md.ts references/game-ui/Chroma.md
 */

import fs from 'node:fs'
import path from 'node:path'

// ── Types ─────────────────────────────────────────────────────────────────────

interface AbilityStatEntry {
  label: string
  base_value: number | [number, number]
  upgrade_by?: string
  /** Uno o varios nodos destino — un renglón de la UI puede cubrir N stats. Ver el parseo de `$$`. */
  upgrade_type?: string | string[]
}

interface AbilityGroup {
  id?: string
  label?: string
  exclusive?: boolean
  stats: AbilityStatEntry[]
}

type ParsedOutput = Record<string, { groups: AbilityGroup[] }>

// ── Token aliases ─────────────────────────────────────────────────────────────

const UPGRADE_BY_ALIASES: Record<string, string> = {
  STRENGTH:   'AVATAR_ABILITY_STRENGTH',
  RANGE:      'AVATAR_ABILITY_RANGE',
  DURATION:   'AVATAR_ABILITY_DURATION',
  EFFICIENCY: 'ENERGY_COST',
  DRAIN:      'ENERGY_DRAIN',
}

function resolveUpgradeBy(token: string): string {
  return UPGRADE_BY_ALIASES[token] ?? token
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** "8.000" → 8000, "1,5" → 1.5, "400" → 400 */
function parseEuNumber(s: string): number {
  return parseFloat(s.replace(/\./g, '').replace(',', '.'))
}

function toKebab(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// ── Stat line parser ──────────────────────────────────────────────────────────

function parseStat(line: string, src: string): AbilityStatEntry | null {
  // //! → warn y continuar
  const importantMatch = line.match(/\/\/!\s*(.*)$/)
  if (importantMatch) {
    console.warn(`[WARN] ${src}: ${importantMatch[1].trim()}`)
  }

  // Strip all comments
  const clean = line.replace(/\s*\/\/.*$/, '').trim()

  const colonIdx = clean.indexOf(':')
  if (colonIdx === -1) return null

  const labelPrefix = clean.slice(0, colonIdx).trim()
  let rest = clean.slice(colonIdx + 1).trim()
  if (!rest) return null

  // $$UPGRADE_TYPE (antes de $UPGRADE_BY para evitar match de prefijo).
  // N tokens por línea: la UI del juego colapsa en UN renglón buffs que mecánicamente son
  // stats distintos — Volt Speed muestra "Speed Multiplier: 1,75x" para Movement Speed Y
  // Melee Attack Speed, que la wiki declara separados (`wiki/mechanics/movement-speed.md`:
  // Movement Speed no afecta melee attack speed). Partir el renglón haría que el `.md` deje
  // de reflejar la pantalla, que es su razón de ser; la anotación es la que se pluraliza.
  // Escalar cuando hay uno solo (caso mayoritario), array cuando hay varios — mismo criterio
  // que `base_value` con min-max.
  let upgradeType: string | string[] | undefined
  const utMatches = [...rest.matchAll(/\$\$(\S+)/g)]
  if (utMatches.length > 0) {
    upgradeType = utMatches.length === 1 ? utMatches[0][1] : utMatches.map(m => m[1])
    utMatches.forEach(m => { rest = rest.replace(m[0], '') })
    rest = rest.trim()
  }

  // $UPGRADE_BY — toma el primero, avisa si hay más de uno
  let upgradeBy: string | undefined
  const allUb = [...rest.matchAll(/\$([A-Z_]+)/g)]
  if (allUb.length > 1) {
    console.warn(`[WARN] ${src} — double scaling en "${labelPrefix}": ${allUb.map(m => m[0]).join(' ')} — solo se toma el primero`)
  }
  if (allUb.length >= 1) {
    upgradeBy = resolveUpgradeBy(allUb[0][1])
    rest = rest.replace(/\s*\$[A-Z_]+/g, '').trim()
  }

  // Icon tags al inicio: "<ENERGY>", "<DT_*>", etc.
  const iconMatch = rest.match(/^(<[^>]+>\s*)+/)
  const iconStr   = iconMatch ? iconMatch[0].trimEnd() + ' ' : ''
  const numStr    = iconMatch ? rest.slice(iconMatch[0].length).trim() : rest.trim()

  const extras = {
    ...(upgradeBy   ? { upgrade_by:   upgradeBy   } : {}),
    ...(upgradeType ? { upgrade_type: upgradeType } : {}),
  }

  // Min-max: "40 - 85%" o "150 - 300"
  const minMax = numStr.match(/^(\d[\d.,]*)\s*-\s*(\d[\d.,]*)([a-zA-Z%°]*)$/)
  if (minMax) {
    const v1   = parseEuNumber(minMax[1])
    const v2   = parseEuNumber(minMax[2])
    const unit = minMax[3]
    return {
      label:      `${labelPrefix}: ${iconStr}|val1| - |val2|${unit}`.trimEnd(),
      base_value: [v1, v2],
      ...extras,
    }
  }

  // Valor simple: "50", "10m", "55%", "8.000", "1,5s", "2x", "180°"
  const simple = numStr.match(/^(\d[\d.,]*)([a-zA-Z%°]*)$/)
  if (!simple) return null

  const val  = parseEuNumber(simple[1])
  const unit = simple[2]
  return {
    label:      `${labelPrefix}: ${iconStr}|val1|${unit}`.trimEnd(),
    base_value: val,
    ...extras,
  }
}

// ── State machine ─────────────────────────────────────────────────────────────

function parseMd(content: string, src: string): ParsedOutput {
  const output: ParsedOutput = {}

  let abilityKey: string | null = null
  let groups: AbilityGroup[]    = []
  let group:  AbilityGroup | null = null
  let skip = false

  function flushGroup() {
    if (group && group.stats.length > 0) groups.push(group)
    group = null
  }

  function flushAbility() {
    if (!abilityKey) return
    flushGroup()
    if (groups.length > 0) output[abilityKey] = { groups }
    abilityKey = null
    groups     = []
    skip       = false
  }

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trimEnd()
    if (!line.trim()) continue

    // //! suelto (fuera de stat line) — warn igual
    if (/^\s*\/\/!/.test(line)) {
      const msg = line.replace(/^\s*\/\/!\s*/, '')
      console.warn(`[WARN] ${src}: ${msg}`)
      continue
    }

    // Comentario normal — ignorado
    if (/^\s*\/\//.test(line)) continue

    // Warframe header — ignorado
    if (line.startsWith('# ')) continue

    // ##! — habilidad ya procesada, skip
    if (line.startsWith('##!')) { skip = true; continue }

    // ##P — passive, deferred
    if (line.startsWith('##P')) { flushAbility(); skip = true; continue }

    // ## uniqueName — nueva habilidad
    if (/^## /.test(line)) {
      flushAbility()
      abilityKey = line.slice(3).trim()
      group      = { stats: [] }
      skip       = false
      continue
    }

    if (skip || !abilityKey) continue

    // ### Subgrupo exclusivo (formas, elementos, modos)
    if (/^### /.test(line)) {
      flushGroup()
      const lbl = line.slice(4).trim()
      group = { id: toKebab(lbl), label: lbl, exclusive: true, stats: [] }
      continue
    }

    // #### Augment
    if (/^#### /.test(line)) {
      flushGroup()
      const lbl = line.slice(5).trim()
      group = { id: toKebab(lbl), label: lbl, stats: [] }
      continue
    }

    if (!group) continue

    const stat = parseStat(line, src)
    if (stat) group.stats.push(stat)
  }

  flushAbility()
  return output
}

// ── CLI ───────────────────────────────────────────────────────────────────────

const inputPath = process.argv[2]
if (!inputPath) {
  console.error('Uso: tsx scripts/parse-ability-md.ts <path/to/Warframe.md>')
  process.exit(1)
}

const resolved = path.resolve(inputPath)
const content  = fs.readFileSync(resolved, 'utf-8')
const src      = path.basename(resolved)
const result   = parseMd(content, src)
console.log(JSON.stringify(result, null, 2))
