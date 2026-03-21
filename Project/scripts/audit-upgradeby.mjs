/**
 * audit-upgradeby.mjs
 * Genera un JSON de trabajo que muestra, por cada habilidad cubierta en Semantic,
 * qué stats tienen upgradeBy=NONE (pendientes de asignar).
 *
 * Output: Project/data/upgradeby-audit.json
 * Formato por entrada:
 * {
 *   uniqueName: string,
 *   warframe: string,
 *   abilityName: string,        // del // comment en el MD
 *   pending: [                  // stats con upgradeBy=NONE
 *     { group: string|null, label: string, baseValue: number|number[] }
 *   ],
 *   complete: [                 // stats con upgradeBy real
 *     { group: string|null, label: string, upgradeBy: string, baseValue: number|number[] }
 *   ]
 * }
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

const statsDb = require('../data/ability-stats.json')
const warframes = require('../public/data/warframes.json')

// Build map: uniqueName -> warframe name
const wfByAbility = {}
warframes.forEach(wf => {
  wf.abilities.forEach(a => {
    if (a.uniqueName) wfByAbility[a.uniqueName] = wf.name
  })
})

// Read all Semantic .md files and extract uniqueNames covered
const semanticDir = path.resolve(__dirname, '../../references/Semantic')
const mdFiles = (await fs.readdir(semanticDir)).filter(f => f.endsWith('.md') && f !== 'README.md')

// Parse each MD to get the list of uniqueNames (## /Lotus/ headers, not ##!)
const semanticCoverage = new Set()
const semanticAbilityName = {} // uniqueName -> human name from // comment

for (const f of mdFiles) {
  const content = await fs.readFile(path.join(semanticDir, f), 'utf8')
  const lines = content.split('\n')
  let currentUnique = null
  for (const line of lines) {
    if (line.startsWith('## /Lotus/')) {
      currentUnique = line.slice(3).trim()
      semanticCoverage.add(currentUnique)
    } else if (line.startsWith('//') && currentUnique && !semanticAbilityName[currentUnique]) {
      semanticAbilityName[currentUnique] = line.slice(2).trim()
    }
  }
}

// Build audit
const audit = []

for (const uniqueName of [...semanticCoverage].sort()) {
  const entry = statsDb[uniqueName]
  if (!entry) {
    audit.push({ uniqueName, warframe: wfByAbility[uniqueName] ?? null, status: 'MISSING_IN_JSON' })
    continue
  }

  const pending = []
  const complete = []

  for (const group of (entry.groups ?? [])) {
    const groupLabel = group.label ?? null
    for (const stat of (group.stats ?? [])) {
      const values = stat.values ?? []
      const baseValues = values.map(v => v.baseValue)
      const upgradeByList = values.map(v => v.upgradeBy)
      const allNone = upgradeByList.every(u => u === 'NONE' || !u)
      const hasReal = upgradeByList.some(u => u && u !== 'NONE')

      if (allNone) {
        pending.push({
          group: groupLabel,
          label: stat.label,
          baseValue: baseValues.length === 1 ? baseValues[0] : baseValues,
        })
      } else if (hasReal) {
        complete.push({
          group: groupLabel,
          label: stat.label,
          upgradeBy: upgradeByList.length === 1 ? upgradeByList[0] : upgradeByList,
          baseValue: baseValues.length === 1 ? baseValues[0] : baseValues,
        })
      }
    }
  }

  if (pending.length === 0) {
    // Fully complete — skip from audit (no work needed)
    continue
  }

  audit.push({
    uniqueName,
    warframe: wfByAbility[uniqueName] ?? null,
    abilityName: semanticAbilityName[uniqueName] ?? null,
    pendingCount: pending.length,
    completeCount: complete.length,
    pending,
    complete,
  })
}

const outPath = path.resolve(__dirname, '../data/upgradeby-audit.json')
await fs.writeFile(outPath, JSON.stringify(audit, null, 2))

// Summary
const missing = audit.filter(e => e.status === 'MISSING_IN_JSON').length
const withPending = audit.filter(e => e.pending).length
const totalPending = audit.filter(e => e.pending).reduce((s, e) => s + e.pendingCount, 0)

console.log(`Semantic coverage: ${semanticCoverage.size} abilities`)
console.log(`Missing in JSON: ${missing}`)
console.log(`With pending upgradeBy: ${withPending} abilities, ${totalPending} stats`)
console.log(`Fully complete (skipped): ${semanticCoverage.size - missing - withPending}`)
console.log(`Output: ${outPath}`)
