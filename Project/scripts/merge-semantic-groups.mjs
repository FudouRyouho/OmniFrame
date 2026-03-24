/**
 * merge-semantic-groups.mjs
 *
 * Toma la salida del parser semántico y aplica solo el campo `groups` sobre
 * `Project/data/overrides/ability-stats.override.json`, preservando name,
 * description, icon y valores de upgradeBy ya existentes en el override
 * (el reemplazo es a nivel de `groups` completo; luego conviene revisar
 * upgradeBy porque el parser deja NONE).
 *
 * Entrada parser por defecto: references/Semantic/parsed-output.json (raíz del repo)
 * Override por defecto: Project/data/overrides/ability-stats.override.json
 *
 * Uso:
 *   node scripts/merge-semantic-groups.mjs
 *   node scripts/merge-semantic-groups.mjs --dry-run
 *   node scripts/merge-semantic-groups.mjs --parsed path/to.json --override path/to.override.json
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(__dirname, '../..')

const DEFAULT_OVERRIDE = path.join(projectRoot, 'data/overrides/ability-stats.override.json')
const DEFAULT_PARSED = path.join(repoRoot, 'references/Semantic/parsed-output.json')

function argValue(name) {
  const i = process.argv.indexOf(name)
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null
}

const dryRun = process.argv.includes('--dry-run')
const parsedPath = argValue('--parsed') ?? DEFAULT_PARSED
const overridePath = argValue('--override') ?? DEFAULT_OVERRIDE

async function main() {
  const rawParsed = await fs.readFile(parsedPath, 'utf8')
  const rawOverride = await fs.readFile(overridePath, 'utf8')
  const parsed = JSON.parse(rawParsed)
  const override = JSON.parse(rawOverride)

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    console.error('merge-semantic-groups: parsed JSON debe ser un objeto { uniqueName: { groups } }')
    process.exit(1)
  }
  if (override === null || typeof override !== 'object' || Array.isArray(override)) {
    console.error('merge-semantic-groups: override JSON debe ser un objeto')
    process.exit(1)
  }

  const applied = []
  const skipped = []

  for (const uniqueName of Object.keys(parsed)) {
    const chunk = parsed[uniqueName]
    if (!chunk || typeof chunk.groups === 'undefined') {
      skipped.push({ uniqueName, reason: 'sin groups en parsed' })
      continue
    }
    if (!override[uniqueName]) {
      skipped.push({ uniqueName, reason: 'no existe en override (añadir primero vía generate-data o entrada manual)' })
      continue
    }
    const prev = override[uniqueName]
    override[uniqueName] = {
      ...prev,
      groups: chunk.groups,
    }
    applied.push(uniqueName)
  }

  console.log(`--- merge-semantic-groups ---`)
  console.log(`Parsed:    ${parsedPath}`)
  console.log(`Override:  ${overridePath}`)
  console.log(`Aplicados: ${applied.length}`)
  if (applied.length) applied.forEach((u) => console.log(`  + ${u}`))
  if (skipped.length) {
    console.log(`Omitidos: ${skipped.length}`)
    skipped.forEach(({ uniqueName, reason }) => console.log(`  - ${uniqueName}: ${reason}`))
  }

  if (dryRun) {
    console.log('\n(dry-run: no se escribió el override)')
    return
  }

  await fs.writeFile(overridePath, JSON.stringify(override, null, 2) + '\n', 'utf8')
  console.log('\nOverride actualizado. Siguiente paso típico: npm run generate:data && node scripts/verify-ability-stats.mjs')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
