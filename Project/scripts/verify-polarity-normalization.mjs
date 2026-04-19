#!/usr/bin/env node
/**
 * verify-polarity-normalization.mjs
 * 
 * Script de verificación automatizada para la normalización de polaridades.
 * Valida que todos los valores de polarity en los datos generados sean canónicos.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '..', 'public', 'data')

// Valores canónicos de polarity
const VALID_POLARITIES = new Set([
  'madurai',
  'vazarin',
  'naramon',
  'zenurik',
  'unairu',
  'penjaga',
  'umbra',
  'omni',
])

// Valores que NO deberían aparecer (deben estar normalizados)
const FORBIDDEN_VALUES = new Set([
  'universal',
  'aura', // como valor de polarity, no como nombre de campo
  'any',
])

function readJsonFile(filename) {
  const path = join(dataDir, filename)
  const content = readFileSync(path, 'utf-8')
  return JSON.parse(content)
}

function validatePolarityValue(value, context) {
  if (value === null) {
    return { valid: true, reason: 'null is allowed' }
  }

  if (!VALID_POLARITIES.has(value)) {
    return { valid: false, reason: `Invalid polarity value: "${value}"` }
  }

  if (FORBIDDEN_VALUES.has(value)) {
    return { valid: false, reason: `Forbidden value (should be normalized): "${value}"` }
  }

  return { valid: true }
}

function validatePolaritiesArray(polarities, context) {
  const errors = []

  for (let i = 0; i < polarities.length; i++) {
    const result = validatePolarityValue(polarities[i], `${context}[${i}]`)
    if (!result.valid) {
      errors.push(`${context}[${i}]: ${result.reason}`)
    }
  }

  return errors
}

function validateWarframes() {
  console.log('Validating warframes.json...')
  const warframes = readJsonFile('warframes.json')
  const errors = []

  for (const wf of warframes) {
    const context = `Warframe "${wf.name}"`

    // Validar aura
    if (wf.aura !== undefined) {
      const result = validatePolarityValue(wf.aura, `${context}.aura`)
      if (!result.valid) {
        errors.push(`${context}.aura: ${result.reason}`)
      }
    }

    // Validar polarities array
    if (wf.polarities) {
      errors.push(...validatePolaritiesArray(wf.polarities, `${context}.polarities`))
    }
  }

  return { count: warframes.length, errors }
}

function validateWeapons() {
  console.log('Validating weapons.json...')
  const weapons = readJsonFile('weapons.json')
  const errors = []

  for (const weapon of weapons) {
    const context = `Weapon "${weapon.name}"`

    // Validar stancePolarity (solo melee)
    if (weapon.stancePolarity !== undefined) {
      const result = validatePolarityValue(weapon.stancePolarity, `${context}.stancePolarity`)
      if (!result.valid) {
        errors.push(`${context}.stancePolarity: ${result.reason}`)
      }
    }

    // Validar polarities array
    if (weapon.polarities) {
      errors.push(...validatePolaritiesArray(weapon.polarities, `${context}.polarities`))
    }
  }

  return { count: weapons.length, errors }
}

function validateMods() {
  console.log('Validating mods.json...')
  const mods = readJsonFile('mods.json')
  const errors = []

  for (const mod of mods) {
    const context = `Mod "${mod.name}"`

    // Validar polarity
    if (mod.polarity !== undefined) {
      const result = validatePolarityValue(mod.polarity, `${context}.polarity`)
      if (!result.valid) {
        errors.push(`${context}.polarity: ${result.reason}`)
      }
    }

    // Validar polarities array (aunque los mods no suelen tenerlo)
    if (mod.polarities) {
      errors.push(...validatePolaritiesArray(mod.polarities, `${context}.polarities`))
    }
  }

  return { count: mods.length, errors }
}

function validateCompanions() {
  console.log('Validating companions.json...')
  const companions = readJsonFile('companions.json')
  const errors = []

  for (const companion of companions) {
    const context = `Companion "${companion.name}"`

    // Validar polarities array
    if (companion.polarities) {
      errors.push(...validatePolaritiesArray(companion.polarities, `${context}.polarities`))
    }
  }

  return { count: companions.length, errors }
}

function validateArchwingWeapons() {
  console.log('Validating archwing-weapons.json...')
  const weapons = readJsonFile('archwing-weapons.json')
  const errors = []

  for (const weapon of weapons) {
    const context = `Archwing Weapon "${weapon.name}"`

    // Validar polarities array
    if (weapon.polarities) {
      errors.push(...validatePolaritiesArray(weapon.polarities, `${context}.polarities`))
    }
  }

  return { count: weapons.length, errors }
}

function validateVehicles() {
  console.log('Validating vehicles.json...')
  const vehicles = readJsonFile('vehicles.json')
  const errors = []

  for (const vehicle of vehicles) {
    const context = `Vehicle "${vehicle.name}"`

    // Validar polarities array
    if (vehicle.polarities) {
      errors.push(...validatePolaritiesArray(vehicle.polarities, `${context}.polarities`))
    }
  }

  return { count: vehicles.length, errors }
}

function generateStatistics() {
  console.log('\nGenerating statistics...')
  
  const warframes = readJsonFile('warframes.json')
  const weapons = readJsonFile('weapons.json')
  const mods = readJsonFile('mods.json')

  const stats = {
    warframesWithOmniAura: warframes.filter(w => w.aura === 'omni').length,
    meleeWithOmniStance: weapons.filter(w => w.stancePolarity === 'omni').length,
    modsWithOmniPolarity: mods.filter(m => m.polarity === 'omni').length,
    warframesWithNullAura: warframes.filter(w => w.aura === null).length,
    meleeWithNullStance: weapons.filter(w => w.category === 'Melee' && w.stancePolarity === null).length,
    modsWithNullPolarity: mods.filter(m => m.polarity === null).length,
  }

  return stats
}

// Main execution
console.log('=== Polarity Normalization Verification ===\n')

const results = {
  warframes: validateWarframes(),
  weapons: validateWeapons(),
  mods: validateMods(),
  companions: validateCompanions(),
  archwingWeapons: validateArchwingWeapons(),
  vehicles: validateVehicles(),
}

console.log('\n=== Validation Results ===\n')

let totalErrors = 0
for (const [domain, result] of Object.entries(results)) {
  const status = result.errors.length === 0 ? '✅' : '❌'
  console.log(`${status} ${domain}: ${result.count} items, ${result.errors.length} errors`)
  
  if (result.errors.length > 0) {
    for (const error of result.errors.slice(0, 10)) {
      console.log(`   - ${error}`)
    }
    if (result.errors.length > 10) {
      console.log(`   ... and ${result.errors.length - 10} more errors`)
    }
  }
  
  totalErrors += result.errors.length
}

console.log('\n=== Statistics ===\n')
const stats = generateStatistics()
console.log(`Warframes with omni aura: ${stats.warframesWithOmniAura}`)
console.log(`Melee weapons with omni stance: ${stats.meleeWithOmniStance}`)
console.log(`Mods with omni polarity: ${stats.modsWithOmniPolarity}`)
console.log(`Warframes with null aura: ${stats.warframesWithNullAura}`)
console.log(`Melee weapons with null stance: ${stats.meleeWithNullStance}`)
console.log(`Mods with null polarity: ${stats.modsWithNullPolarity}`)

console.log('\n=== Summary ===\n')
if (totalErrors === 0) {
  console.log('✅ All polarity values are valid and normalized!')
  process.exit(0)
} else {
  console.log(`❌ Found ${totalErrors} validation errors`)
  process.exit(1)
}
