/**
 * verify-ability-stats.mjs
 *
 * Verifica que ability-stats.override.json siga el schema actual:
 *
 *   Record<uniqueName, {
 *     name: string
 *     description: string
 *     icon: string
 *     groups: Array<{
 *       id?: string
 *       label?: string
 *       defaultActive?: boolean
 *       exclusive?: boolean
 *       stats: Array<{
 *         label: string
 *         values: Array<{
 *           baseValue: number
 *           upgradeBy: string
 *           upgradeType?: string
 *           cap?: number
 *           capMin?: number
 *           helminthBase?: number
 *           helminthCap?: number
 *           inverse?: boolean
 *         }>
 *       }>
 *     }>
 *   }>
 *
 * upgradeBy válidos: AVATAR_ABILITY_STRENGTH | AVATAR_ABILITY_RANGE |
 *   AVATAR_ABILITY_DURATION | AVATAR_ABILITY_EFFICIENCY |
 *   ENERGY_COST | ENERGY_DRAIN | NONE
 *
 * Fuente de verdad: Docs/domains/data/abilities/schema.md
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const statsPath = path.resolve(__dirname, '../public/data/ability-stats.override.json')

const VALID_UPGRADE_BY = new Set([
  'AVATAR_ABILITY_STRENGTH',
  'AVATAR_ABILITY_RANGE',
  'AVATAR_ABILITY_DURATION',
  'AVATAR_ABILITY_EFFICIENCY',
  'ENERGY_COST',
  'ENERGY_DRAIN',
  'NONE',
])

// ── Validadores ───────────────────────────────────────────────────────────────

function validateValue(val, context) {
  const issues = []
  if (typeof val.baseValue !== 'number') {
    issues.push(`${context}: baseValue no es number (${JSON.stringify(val.baseValue)})`)
  }
  if (typeof val.upgradeBy !== 'string') {
    issues.push(`${context}: upgradeBy no es string`)
  } else if (!VALID_UPGRADE_BY.has(val.upgradeBy)) {
    issues.push(`${context}: upgradeBy desconocido "${val.upgradeBy}"`)
  }
  if ('cap' in val && typeof val.cap !== 'number') {
    issues.push(`${context}: cap no es number`)
  }
  if ('capMin' in val && typeof val.capMin !== 'number') {
    issues.push(`${context}: capMin no es number`)
  }
  if ('helminthBase' in val && typeof val.helminthBase !== 'number') {
    issues.push(`${context}: helminthBase no es number`)
  }
  if ('helminthCap' in val && typeof val.helminthCap !== 'number') {
    issues.push(`${context}: helminthCap no es number`)
  }
  if ('inverse' in val && typeof val.inverse !== 'boolean') {
    issues.push(`${context}: inverse no es boolean`)
  }
  return issues
}

function validateStat(stat, context) {
  const issues = []
  if (typeof stat.label !== 'string') {
    issues.push(`${context}: label no es string`)
  }
  if (!Array.isArray(stat.values)) {
    issues.push(`${context}: values no es array`)
  } else if (stat.values.length === 0) {
    issues.push(`${context}: values está vacío`)
  } else {
    stat.values.forEach((val, vi) => {
      issues.push(...validateValue(val, `${context}.values[${vi}]`))
    })
  }
  return issues
}

function validateGroup(group, context) {
  const issues = []
  if ('id' in group && typeof group.id !== 'string') {
    issues.push(`${context}: id no es string`)
  }
  if ('label' in group && typeof group.label !== 'string') {
    issues.push(`${context}: label no es string`)
  }
  if (!Array.isArray(group.stats)) {
    issues.push(`${context}: stats no es array`)
  } else {
    group.stats.forEach((stat, si) => {
      issues.push(...validateStat(stat, `${context}.stats[${si}]`))
    })
  }
  return issues
}

function validateEntry(entry, uniqueName) {
  const issues = []
  const ctx = uniqueName

  // Detectar schema legacy — la entrada es un Array directamente (pre-migración)
  if (Array.isArray(entry)) {
    return [`${ctx}: entrada en formato legacy (Array). Requiere migración.`]
  }

  if (typeof entry !== 'object' || entry === null) {
    return [`${ctx}: entrada no es un objeto`]
  }

  // Detectar schema legacy — tiene stats[] en lugar de groups[]
  if ('stats' in entry && !('groups' in entry)) {
    return [`${ctx}: schema legacy detectado (stats[] sin groups[]). Requiere migración.`]
  }

  if (typeof entry.name !== 'string' || entry.name === '') {
    issues.push(`${ctx}: name ausente o vacío`)
  }
  if (typeof entry.description !== 'string') {
    issues.push(`${ctx}: description ausente`)
  }
  if (typeof entry.icon !== 'string') {
    issues.push(`${ctx}: icon ausente`)
  }
  if (!Array.isArray(entry.groups)) {
    issues.push(`${ctx}: groups no es array`)
    return issues // sin groups no podemos seguir
  }
  if (entry.groups.length === 0) {
    issues.push(`${ctx}: groups está vacío`)
  } else {
    entry.groups.forEach((group, gi) => {
      issues.push(...validateGroup(group, `${ctx}.groups[${gi}]`))
    })
  }

  return issues
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function verify() {
  let data
  try {
    data = JSON.parse(await fs.readFile(statsPath, 'utf8'))
  } catch (e) {
    console.error('Error leyendo el archivo:', e.message)
    process.exit(1)
  }

  const keys = Object.keys(data)
  let ok = 0
  let withWarnings = 0
  let withErrors = 0
  let legacyCount = 0

  const errorLog = []

  for (const uniqueName of keys) {
    const issues = validateEntry(data[uniqueName], uniqueName)
    const isLegacy = issues.some(i => i.includes('legacy'))

    if (issues.length === 0) {
      ok++
    } else {
      if (isLegacy) legacyCount++
      // Distinguir warnings (upgradeBy desconocido = podría ser nuevo tipo)
      // de errores estructurales reales
      const isStructural = issues.some(i =>
        i.includes('no es') || i.includes('ausente') || i.includes('vacío') || i.includes('legacy')
      )
      if (isStructural) {
        withErrors++
      } else {
        withWarnings++
      }
      errorLog.push({ uniqueName, issues })
    }
  }

  // Mostrar errores
  if (errorLog.length > 0) {
    console.log('\n--- Detalle de problemas ---')
    for (const { uniqueName, issues } of errorLog) {
      console.log(`\n❌ ${uniqueName}`)
      issues.forEach(i => console.log(`   • ${i}`))
    }
  }

  // Resumen
  console.log('\n--- Resumen de Verificación ---')
  console.log(`Archivo:           ${statsPath}`)
  console.log(`Total entradas:    ${keys.length}`)
  console.log(`Correctas:         ${ok}`)
  console.log(`Con warnings:      ${withWarnings}`)
  console.log(`Con errores:       ${withErrors}`)
  if (legacyCount > 0) {
    console.log(`Schema legacy:     ${legacyCount}  ← ejecutar migrate-ability-stats (ver backups/)`)
  }

  if (withErrors === 0 && withWarnings === 0) {
    console.log('\n✅ Todas las entradas cumplen el schema groups[].')
  } else if (withErrors === 0) {
    console.log('\n⚠️  Hay warnings pero ningún error estructural.')
  } else {
    console.log('\n❌ Hay errores estructurales. Revisar entradas indicadas.')
    process.exit(1)
  }
}

verify()
