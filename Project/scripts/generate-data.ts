/**
 * generate-data.ts
 * Orquestador de generación de datasets runtime para OmniFrame.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Items from 'omniframe-items'

import {
  createArcaneNormalizationState,
  reportArcaneNormalizationState,
} from './normalization/arcanes.ts'
import {
  createWeaponNormalizationState,
  reportWeaponNormalizationState,
} from './normalization/weapons.ts'
import {
  createPolarityNormalizationState,
  reportPolarityNormalizationState,
} from './normalization/polarity.ts'
import {
  buildAuditEntries,
  createSourceChangeAuditReport,
  writeSourceChangeAuditReport,
  type GeneratedAuditEntryForAudit,
} from './pipeline/source-change-audit.ts'
import {
  buildRuntimeDataArtifacts,
  type RuntimeDataArtifacts,
  type SourceItem,
} from './pipeline/runtime-data-artifacts.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const outDir = path.resolve(projectRoot, 'public/data')
const auditDir = path.resolve(projectRoot, 'data/audits')
const sourceChangeAuditReportPath = path.join(auditDir, 'source-change-report.json')

await fs.mkdir(outDir, { recursive: true })
await fs.mkdir(auditDir, { recursive: true })

const sourceItems = Array.from(new Items()) as SourceItem[]

const arcaneNormalizationState = createArcaneNormalizationState()
const weaponNormalizationState = createWeaponNormalizationState()
const polarityNormalizationState = createPolarityNormalizationState()

async function writeJson(fileName: string, data: unknown, pretty = true): Promise<void> {
  const output = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data)
  await fs.writeFile(path.join(outDir, fileName), output + '\n')
}

async function persistRuntimeDataArtifacts(artifacts: RuntimeDataArtifacts): Promise<void> {
  await writeJson('warframes.json', artifacts.warframes)
  await writeJson('passives.json', artifacts.passivesDb)

  console.log(`✓ warframes.json — ${artifacts.warframes.length} warframes`)
  reportPolarityNormalizationState(polarityNormalizationState)

  await writeJson('weapons.json', artifacts.weapons)
  console.log(`✓ weapons.json — ${artifacts.weapons.length} weapons`)
  reportWeaponNormalizationState(weaponNormalizationState)

  await writeJson('mods.json', artifacts.mods)
  console.log(`✓ mods.json — ${artifacts.mods.length} mods (Flawed excluidos)`)

  await writeJson('arcanes.json', artifacts.arcanes)
  console.log(`✓ arcanes.json — ${artifacts.arcanes.length} arcanos`)
  reportArcaneNormalizationState(arcaneNormalizationState)

  await writeJson('companions.json', artifacts.companions)
  console.log(`✓ companions.json — ${artifacts.companions.length} companions`)

  await writeJson('archwing-weapons.json', artifacts.archwingWeapons)
  console.log(`✓ archwing-weapons.json — ${artifacts.archwingWeapons.length} archwing weapons`)

  await writeJson('vehicles.json', artifacts.vehicles)
  console.log(
    `✓ vehicles.json — ${artifacts.vehicles.length} vehicles (${artifacts.necramechCount} necramechs, ${artifacts.archwingCount} archwings)`,
  )
}

async function persistSourceChangeAuditReport(params: {
  sourceItems: SourceItem[]
  artifacts: RuntimeDataArtifacts
}): Promise<void> {
  const generatedAuditEntries: Array<GeneratedAuditEntryForAudit<unknown, string>> = [
    ...buildAuditEntries(params.artifacts.warframes),
    ...buildAuditEntries(params.artifacts.weapons),
    ...buildAuditEntries(params.artifacts.mods),
    ...buildAuditEntries(params.artifacts.arcanes),
    ...buildAuditEntries(params.artifacts.companions),
    ...buildAuditEntries(params.artifacts.archwingWeapons),
    ...buildAuditEntries(params.artifacts.vehicles),
  ]

  const sourceChangeAuditReport = await createSourceChangeAuditReport({
    reportFilePath: sourceChangeAuditReportPath,
    sourceItems: params.sourceItems,
    generatedEntries: generatedAuditEntries,
  })

  await writeSourceChangeAuditReport(sourceChangeAuditReportPath, sourceChangeAuditReport, true)
  console.log(`✓ source-change-report.json — ${sourceChangeAuditReport.totalItems} entries`)

  if (sourceChangeAuditReport.delta.mode === 'diff') {
    console.log(`  · delta.possibleChanges = ${sourceChangeAuditReport.delta.possibleChanges}`)
    console.log(`  · delta.changedFingerprint = ${sourceChangeAuditReport.delta.changedFingerprint}`)
    console.log(`  · delta.changedLastSourceUpdate = ${sourceChangeAuditReport.delta.changedLastSourceUpdate}`)
    console.log(`  · delta.newItems = ${sourceChangeAuditReport.delta.newItems}`)
    console.log(`  · delta.removedItems = ${sourceChangeAuditReport.delta.removedItems}`)
  }
}

async function main(): Promise<void> {
  const artifacts = buildRuntimeDataArtifacts({
    sourceItems,
    arcaneNormalizationState,
    weaponNormalizationState,
    polarityNormalizationState,
  })

  await persistRuntimeDataArtifacts(artifacts)
  await persistSourceChangeAuditReport({ sourceItems, artifacts })

  console.log('Done.')
}

await main()
