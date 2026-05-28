/**
 * verify-ability-stats.mjs
 *
 * Verifica que ability-stats.override.json siga el schema actual:
 *
 *   Record<uniqueName, {
 *     name: string
 *     description: string
 *     image_name: string
 *     groups: Array<{
 *       id?: string
 *       label?: string
 *       default_active?: boolean
 *       exclusive?: boolean
 *       stats: Array<{
 *         label: string
 *         base_value: number | [number, number]
 *         upgrade_by?: string | string[]
 *         upgrade_type?: string | string[]
 *         cap?: number | [number, number]
 *         floor?: number | [number, number]
 *         helminth_base?: number
 *         helminth_cap?: number
 *         inverse?: boolean
 *       }>
 *     }>
 *   }>
 *
 * upgrade_by válidos: AVATAR_ABILITY_STRENGTH | AVATAR_ABILITY_RANGE |
 *   AVATAR_ABILITY_DURATION | AVATAR_ABILITY_EFFICIENCY |
 *   ENERGY_COST | ENERGY_DRAIN
 *
 * Fuente de verdad: docs/data/schemas/abilities/schema.md
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
])

// ── Validadores ───────────────────────────────────────────────────────────────

function validateStat(stat, context) {
  const issues = []
  if (typeof stat.label !== 'string') {
    issues.push(`${context}: label no es string`)
  }

  // base_value es obligatorio y puede ser number o [number, number]
  if (typeof stat.base_value === 'undefined') {
    issues.push(`${context}: base_value es obligatorio`)
  } else {
    if (typeof stat.base_value !== 'number' && !Array.isArray(stat.base_value)) {
      issues.push(`${context}: base_value debe ser número o un rango [min, max]`)
    } else if (Array.isArray(stat.base_value)) {
      if (stat.base_value.length !== 2 || typeof stat.base_value[0] !== 'number' || typeof stat.base_value[1] !== 'number') {
        issues.push(`${context}: base_value rango debe ser [number, number]`)
      }
    }
  }

  // upgrade_by?: AbilityUpgradeBy | AbilityUpgradeBy[]
  if ('upgrade_by' in stat && stat.upgrade_by !== undefined) {
    const ub = stat.upgrade_by
    if (Array.isArray(ub)) {
      ub.forEach((item, idx) => {
        if (typeof item !== 'string' || !VALID_UPGRADE_BY.has(item)) {
          issues.push(`${context}: upgrade_by[${idx}] desconocido o legacy "${item}"`)
        }
      })
    } else if (typeof ub !== 'string' || !VALID_UPGRADE_BY.has(ub)) {
      issues.push(`${context}: upgrade_by desconocido o legacy "${ub}"`)
    }
  }

  // upgrade_type?: string | string[]
  if ('upgrade_type' in stat && stat.upgrade_type !== undefined) {
    const ut = stat.upgrade_type
    if (Array.isArray(ut)) {
      ut.forEach((item, idx) => {
        if (typeof item !== 'string') {
          issues.push(`${context}: upgrade_type[${idx}] debe ser string`)
        }
      })
    } else if (typeof ut !== 'string') {
      issues.push(`${context}: upgrade_type debe ser string`)
    }
  }

  // cap?: number | [number, number]
  if ('cap' in stat && stat.cap !== undefined) {
    if (typeof stat.cap !== 'number' && !Array.isArray(stat.cap)) {
      issues.push(`${context}: cap debe ser número o un rango [min, max]`)
    } else if (Array.isArray(stat.cap)) {
      if (stat.cap.length !== 2 || typeof stat.cap[0] !== 'number' || typeof stat.cap[1] !== 'number') {
        issues.push(`${context}: cap rango debe ser [number, number]`)
      }
    }
  }

  // floor?: number | [number, number]
  if ('floor' in stat && stat.floor !== undefined) {
    if (typeof stat.floor !== 'number' && !Array.isArray(stat.floor)) {
      issues.push(`${context}: floor debe ser número o un rango [min, max]`)
    } else if (Array.isArray(stat.floor)) {
      if (stat.floor.length !== 2 || typeof stat.floor[0] !== 'number' || typeof stat.floor[1] !== 'number') {
        issues.push(`${context}: floor rango debe ser [number, number]`)
      }
    }
  }

  // helminth_base?: number
  if ('helminth_base' in stat && stat.helminth_base !== undefined && typeof stat.helminth_base !== 'number') {
    issues.push(`${context}: helminth_base no es number`)
  }

  // helminth_cap?: number
  if ('helminth_cap' in stat && stat.helminth_cap !== undefined && typeof stat.helminth_cap !== 'number') {
    issues.push(`${context}: helminth_cap no es number`)
  }

  // inverse?: boolean
  if ('inverse' in stat && stat.inverse !== undefined && typeof stat.inverse !== 'boolean') {
    issues.push(`${context}: inverse no es boolean`)
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
  if ('default_active' in group && group.default_active !== undefined && typeof group.default_active !== 'boolean') {
    issues.push(`${context}: default_active no es boolean`)
  }
  if ('exclusive' in group && group.exclusive !== undefined && typeof group.exclusive !== 'boolean') {
    issues.push(`${context}: exclusive no es boolean`)
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

  if (Array.isArray(entry)) {
    return [`${ctx}: entrada en formato legacy (Array). Requiere migración.`]
  }

  if (typeof entry !== 'object' || entry === null) {
    return [`${ctx}: entrada no es un objeto`]
  }

  // Detectar schema legacy con stats[] a nivel raíz
  if ('stats' in entry && !('groups' in entry)) {
    return [`${ctx}: schema legacy detectado (stats[] sin groups[]).`]
  }

  if (typeof entry.name !== 'string' || entry.name === '') {
    issues.push(`${ctx}: name ausente o vacío`)
  }
  if (typeof entry.description !== 'string') {
    issues.push(`${ctx}: description ausente`)
  }
  if (typeof entry.image_name !== 'string') {
    issues.push(`${ctx}: image_name ausente`)
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

  const keys = Object.keys(data).filter((k) => k !== '$schema')
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
    console.log(`Schema legacy:     ${legacyCount}`)
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
