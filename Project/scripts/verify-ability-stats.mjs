/**
 * verify-ability-stats.mjs
 * Verifica que ability-stats.json siga la estructura de objeto correcta.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const statsPath = path.resolve(__dirname, '../public/data/ability-stats.json')

async function verify() {
  try {
    const data = JSON.parse(await fs.readFile(statsPath, 'utf8'))
    const keys = Object.keys(data)
    
    let ok = 0
    let errors = 0
    let oldFormat = 0
    
    for (const key of keys) {
      const entry = data[key]
      
      if (Array.isArray(entry)) {
        console.error(`❌ [OLD FORMAT] ${key} is an Array.`)
        oldFormat++
        errors++
        continue
      }
      
      if (typeof entry !== 'object' || entry === null) {
        console.error(`❌ [INVALID] ${key} is not an object.`)
        errors++
        continue
      }
      
      const hasMetadata = 'name' in entry && 'description' in entry && 'icon' in entry
      const hasStats = 'stats' in entry && Array.isArray(entry.stats)
      
      if (!hasMetadata || !hasStats) {
        console.error(`❌ [POOR STRUCTURE] ${key} missing metadata or stats array.`)
        errors++
        continue
      }
      
      ok++
    }
    
    console.log('\n--- Resumen de Verificación ---')
    console.log(`Total entradas: ${keys.length}`)
    console.log(`Estructura correcta: ${ok}`)
    console.log(`Estructura antigua (Array): ${oldFormat}`)
    console.log(`Errores totales: ${errors}`)
    
    if (errors === 0) {
      console.log('\n✅ ¡Estructura perfecta! El archivo está listo.')
    } else {
      console.log('\n⚠️ Hay problemas corregir. Corre node scripts/generate-data.mjs para intentar migrar automáticamente.')
    }
    
  } catch (e) {
    console.error('Error leyendo el archivo:', e)
  }
}

verify()
