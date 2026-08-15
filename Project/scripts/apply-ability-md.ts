#!/usr/bin/env tsx
/**
 * apply-ability-md.ts
 * Parsea uno o más .md de references/game-ui/ y aplica el resultado
 * a ability-stats.override.json, preservando name/description/image_name.
 *
 * Uso:
 *   tsx scripts/apply-ability-md.ts references/game-ui/Chroma.md
 *   tsx scripts/apply-ability-md.ts references/game-ui/Chroma.md references/game-ui/Ember.md
 *   tsx scripts/apply-ability-md.ts references/game-ui/*.md
 */

import fs   from 'node:fs'
import path from 'node:path'

// ── Types (inline — sin depender de src/) ─────────────────────────────────────

interface AbilityStatEntry {
  label: string
  base_value: number | [number, number]
  upgrade_by?: string
  /** Uno o varios nodos destino — un renglón de la UI puede cubrir N stats. */
  upgrade_type?: string | string[]
}

interface AbilityGroup {
  id?: string
  label?: string
  stats: AbilityStatEntry[]
}

type ParsedOutput = Record<string, { groups: AbilityGroup[] }>

type OverrideEntry = {
  name?: string
  description?: string
  image_name?: string
  groups?: AbilityGroup[]
}

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

function parseEuNumber(s: string): number {
  return parseFloat(s.replace(/\./g, '').replace(',', '.'))
}

function toKebab(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// ── Stat line parser ──────────────────────────────────────────────────────────

function parseStat(line: string): AbilityStatEntry | null {
  const importantMatch = line.match(/\/\/!\s*(.*)$/)
  if (importantMatch) {
    console.warn(`  [!] ${importantMatch[1].trim()}`)
  }

  const clean = line.replace(/\s*\/\/.*$/, '').trim()
  const colonIdx = clean.indexOf(':')
  if (colonIdx === -1) return null

  const labelPrefix = clean.slice(0, colonIdx).trim()
  let rest = clean.slice(colonIdx + 1).trim()
  if (!rest) return null

  // N tokens por línea — ver el comentario extenso en `parse-ability-md.ts` (misma lógica,
  // duplicada inline en ambos scripts por diseño: no dependen de `src/`).
  let upgradeType: string | string[] | undefined
  const utMatches = [...rest.matchAll(/\$\$(\S+)/g)]
  if (utMatches.length > 0) {
    upgradeType = utMatches.length === 1 ? utMatches[0][1] : utMatches.map(m => m[1])
    utMatches.forEach(m => { rest = rest.replace(m[0], '') })
    rest = rest.trim()
  }

  let upgradeBy: string | undefined
  const allUb = [...rest.matchAll(/\$([A-Z_]+)/g)]
  if (allUb.length > 1) {
    console.warn(`  [!] double scaling en "${labelPrefix}": ${allUb.map(m => m[0]).join(' ')} — solo se toma el primero`)
  }
  if (allUb.length >= 1) {
    upgradeBy = resolveUpgradeBy(allUb[0][1])
    rest = rest.replace(/\s*\$[A-Z_]+/g, '').trim()
  }

  const iconMatch = rest.match(/^(<[^>]+>\s*)+/)
  const iconStr   = iconMatch ? iconMatch[0].trimEnd() + ' ' : ''
  const numStr    = iconMatch ? rest.slice(iconMatch[0].length).trim() : rest.trim()

  const extras = {
    ...(upgradeBy   ? { upgrade_by:   upgradeBy   } : {}),
    ...(upgradeType ? { upgrade_type: upgradeType } : {}),
  }

  const minMax = numStr.match(/^(\d[\d.,]*)\s*-\s*(\d[\d.,]*)([a-zA-Z%°]*)$/)
  if (minMax) {
    return {
      label:      `${labelPrefix}: ${iconStr}|val1| - |val2|${minMax[3]}`.trimEnd(),
      base_value: [parseEuNumber(minMax[1]), parseEuNumber(minMax[2])],
      ...extras,
    }
  }

  const simple = numStr.match(/^(\d[\d.,]*)([a-zA-Z%°]*)$/)
  if (!simple) return null

  return {
    label:      `${labelPrefix}: ${iconStr}|val1|${simple[2]}`.trimEnd(),
    base_value: parseEuNumber(simple[1]),
    ...extras,
  }
}

// ── State machine ─────────────────────────────────────────────────────────────

function parseMd(content: string): ParsedOutput {
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
    abilityKey = null; groups = []; skip = false
  }

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trimEnd()
    if (!line.trim()) continue

    if (/^\s*\/\/!/.test(line)) {
      console.warn(`  [!] ${line.replace(/^\s*\/\/!\s*/, '')}`)
      continue
    }
    if (/^\s*\/\//.test(line)) continue
    if (line.startsWith('# ')) continue
    if (line.startsWith('##!')) { skip = true; continue }
    if (line.startsWith('##P')) { flushAbility(); skip = true; continue }

    if (/^## /.test(line)) {
      flushAbility()
      abilityKey = line.slice(3).trim()
      group = { stats: [] }
      skip = false
      continue
    }

    if (skip || !abilityKey) continue

    if (/^### /.test(line)) {
      flushGroup()
      const lbl = line.slice(4).trim()
      group = { id: toKebab(lbl), label: lbl, stats: [] }
      continue
    }

    if (/^#### /.test(line)) {
      flushGroup()
      const lbl = line.slice(5).trim()
      group = { id: toKebab(lbl), label: lbl, stats: [] }
      continue
    }

    if (!group) continue
    const stat = parseStat(line)
    if (stat) group.stats.push(stat)
  }

  flushAbility()
  return output
}

// ── Merge ─────────────────────────────────────────────────────────────────────

const OVERRIDE_PATH = path.resolve('public/data/ability-stats.override.json')

function loadOverride(): Record<string, OverrideEntry> {
  return JSON.parse(fs.readFileSync(OVERRIDE_PATH, 'utf-8'))
}

function saveOverride(data: Record<string, OverrideEntry>) {
  fs.writeFileSync(OVERRIDE_PATH, JSON.stringify(data, null, 2) + '\n')
}

// ── CLI ───────────────────────────────────────────────────────────────────────

const inputs = process.argv.slice(2)
if (inputs.length === 0) {
  console.error('Uso: tsx scripts/apply-ability-md.ts <Warframe.md> [...]')
  process.exit(1)
}

const override = loadOverride()
let totalNew = 0, totalUpdated = 0, totalStats = 0

for (const inputPath of inputs) {
  const resolved = path.resolve(inputPath)
  const src      = path.basename(resolved)
  console.log(`\n── ${src}`)

  const content = fs.readFileSync(resolved, 'utf-8')
  const parsed  = parseMd(content)

  for (const [key, { groups }] of Object.entries(parsed)) {
    const tail     = key.split('/').pop()!
    const isNew    = !override[key]
    const statCount = groups.reduce((n, g) => n + g.stats.length, 0)

    if (isNew) {
      override[key] = { groups }
      totalNew++
    } else {
      override[key] = { ...override[key], groups }
      totalUpdated++
    }

    totalStats += statCount
    console.log(`  ${isNew ? 'NEW' : 'UPD'} ${tail} — ${statCount} stats`)
  }
}

saveOverride(override)
console.log(`\n✓ ${totalNew} nuevas, ${totalUpdated} actualizadas, ${totalStats} stats totales`)
