/**
 * generate-mod-overrides.mjs
 *
 * Genera mod-stats.override.json a partir de levelStats usando un parser
 * conservador. Output sigue el schema v2 acordado (C12-C28).
 *
 * Schema de salida por entrada:
 *   { name, stats: [{ label, values: [{ baseValue, upgradeType }], condition }] }
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Items from '@wfcd/items'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const publicDataDir = path.join(projectRoot, 'public/data')
const overrideDir = path.join(projectRoot, 'data/overrides/mods')
const overridePath = path.join(overrideDir, 'mod-stats.override.json')
const reportPath = path.join(overrideDir, 'mod-stats.report.json')
const publicOverridePath = path.join(publicDataDir, 'mod-stats.override.json')

const instance = new Items()

const stripMarkup = (value) => String(value)
  .replace(/<[^>]+>/g, '')
  .replace(/,/g, '')
  .replace(/<LINE_SEPARATOR>/g, '\n')
  .replace(/\\n/g, '\n')
  .replace(/\s+/g, ' ')
  .trim()

const splitStatFragments = (value) => String(value)
  .replace(/<LINE_SEPARATOR>/g, '\n')
  .replace(/\\n/g, '\n')
  .split('\n')
  .map((part) => stripMarkup(part))
  .filter(Boolean)

const sanitizeNumericContext = (value) => stripMarkup(value)
  .replace(/\(x\d*\.?\d+[^)]*\)/gi, '')
  .replace(/\bfor\s+[+-]?\d*\.?\d+s\b/gi, '')
  .replace(/\bover\s+[+-]?\d*\.?\d+s\b/gi, '')
  .replace(/\bcooldown:\s*[+-]?\d*\.?\d+s\b/gi, '')
  .replace(/\bstacks?\s+up\s+to\s+\d+x\b/gi, '')

const extractNumbers = (value) => sanitizeNumericContext(value).match(/[+-]?\d*\.?\d+/g) ?? []

const normalizeNumber = (value) => Number.parseFloat(value)

function parseRankStats(mod) {
  if (!Array.isArray(mod.upgradeTypes) || mod.upgradeTypes.length === 0) {
    return { ok: false, reason: 'missing-upgrade-types' }
  }

  if (!Array.isArray(mod.levelStats) || mod.levelStats.length === 0) {
    return { ok: false, reason: 'missing-level-stats' }
  }

  const statCount = mod.upgradeTypes.length
  const valuesByStat = mod.upgradeTypes.map(() => [])
  let sourceLabels = []

  for (const [rankIndex, rankStats] of mod.levelStats.entries()) {
    if (!Array.isArray(rankStats?.stats) || rankStats.stats.length === 0) {
      return { ok: false, reason: 'stat-count-mismatch' }
    }

    const fragments = rankStats.stats.flatMap((statText) => splitStatFragments(statText))
    const numericFragments = fragments.filter((fragment) => extractNumbers(fragment).length > 0)

    if (numericFragments.length !== statCount) {
      return { ok: false, reason: 'stat-count-mismatch' }
    }

    if (rankIndex === 0) {
      sourceLabels = numericFragments
    }

    for (const [index, statText] of numericFragments.entries()) {
      const numbers = extractNumbers(statText)

      if (numbers.length === 0) {
        return { ok: false, reason: 'no-number-in-stat' }
      }

      if (numbers.length > 1) {
        return { ok: false, reason: 'multiple-numbers-in-stat' }
      }

      const value = normalizeNumber(numbers[0])
      if (!Number.isFinite(value)) {
        return { ok: false, reason: 'invalid-number' }
      }

      valuesByStat[index].push(value)
    }
  }

  return {
    ok: true,
    stats: mod.upgradeTypes.map((upgradeType, index) => {
      const rawLabel = sourceLabels[index] ?? ''
      // Reemplazar el primer número con placeholder posicional
      const label = rawLabel.replace(/\d*\.?\d+/, '|val1|')
      return {
        label,
        values: [{ baseValue: valuesByStat[index], upgradeType }],
        condition: null,
      }
    }),
  }
}

const mods = instance
  .filter((item) => item.category === 'Mods')
  .map((item) => ({
    uniqueName: item.uniqueName ?? item.name,
    name: item.name ?? '',
    category: item.type ?? 'unknown',
    compatName: item.compatName ?? null,
    rank: item.maxRank ?? item.fusionLimit ?? null,
    isFlawed: item.isFlawed ?? false,
    levelStats: item.levelStats ?? null,
    upgradeTypes: item.upgradeTypes ?? [],
  }))

const keptMods = mods.filter((mod) => !mod.isFlawed)
const candidateMods = keptMods.filter((mod) => mod.upgradeTypes.length > 0 && Array.isArray(mod.levelStats) && mod.levelStats.length > 0)

const override = {}
const rejected = []
const reasonCounts = {}

for (const mod of candidateMods) {
  const parsed = parseRankStats(mod)

  if (!parsed.ok) {
    reasonCounts[parsed.reason] = (reasonCounts[parsed.reason] ?? 0) + 1
    rejected.push({
      uniqueName: mod.uniqueName,
      name: mod.name,
      reason: parsed.reason,
      upgradeTypes: mod.upgradeTypes,
      sampleStats: mod.levelStats?.[0]?.stats ?? [],
    })
    continue
  }

  override[mod.uniqueName] = {
    name: mod.name,
    stats: parsed.stats,
  }
}

const acceptedCount = Object.keys(override).length
const acceptanceRate = candidateMods.length === 0
  ? 0
  : Number(((acceptedCount / candidateMods.length) * 100).toFixed(2))

const report = {
  totalMods: mods.length,
  filteredFlawed: mods.length - keptMods.length,
  candidateMods: candidateMods.length,
  acceptedMods: acceptedCount,
  rejectedMods: rejected.length,
  acceptanceRate,
  rejectionReasons: reasonCounts,
  rejectedSamples: rejected.slice(0, 100),
}

await fs.mkdir(overrideDir, { recursive: true })
await fs.mkdir(publicDataDir, { recursive: true })

await fs.writeFile(overridePath, JSON.stringify(override, null, 2) + '\n', 'utf8')
await fs.writeFile(publicOverridePath, JSON.stringify(override, null, 2) + '\n', 'utf8')
await fs.writeFile(reportPath, JSON.stringify(report, null, 2) + '\n', 'utf8')

console.log(`✓ mod-stats.override.json — ${acceptedCount} mods aceptados (${acceptanceRate}% de ${candidateMods.length} candidatos)`)
console.log(`✓ mod-stats.report.json — ${rejected.length} mods rechazados`) 