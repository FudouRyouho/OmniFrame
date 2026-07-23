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
  createEnemyBuildState,
  type EnemyBuildState,
  type GeneratedEnemy,
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
const enemyBuildState = createEnemyBuildState()

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

  await writeJson('enemies.json', artifacts.enemies)
  console.log(`✓ enemies.json — ${artifacts.enemies.length} enemigos`)
  reportEnemyBuildState(artifacts.enemies, enemyBuildState)
}

/**
 * Resumen del eje enemigo: reparto de facciones + censo de descartes de la cosecha wiki.
 *
 * El **reparto de facciones no es adorno**: es el instrumento que destapó `OQ-DATA-15` (un `Rifle: 14`
 * en esta línea = el matcher por substring de upstream volvió a contaminar `type`). La cascada lo
 * absorbe hoy, pero si aparece una facción que no debería existir, se ve acá y no seis meses después.
 */
function reportEnemyBuildState(enemies: GeneratedEnemy[], state: EnemyBuildState): void {
  const byFaction: Record<string, number> = {}
  for (const enemy of enemies) byFaction[enemy.faction] = (byFaction[enemy.faction] ?? 0) + 1
  const cosechados = enemies.filter((e) => e.base_level > 1 || e.eximus_health || e.weakpoints).length

  console.log(`  · facciones: ${JSON.stringify(byFaction)}`)
  console.log(`  · con cosecha wiki: ${cosechados} · weakpoints: ${enemies.filter((e) => e.weakpoints).length}`)
  if (!state.droppedMultis.length) return
  console.log(`  · multis no parseables (descartados): ${state.droppedMultis.length}`)
  for (const entry of state.droppedMultis) console.log(`    · ${entry}`)
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
    // El enemigo es plano (sin los cuatro pilares) y no lleva `kind`/`category` en el JSON emitido:
    // se los agrega **sólo** para el índice del audit, sin tocar el artefacto que se escribe a disco.
    ...buildAuditEntries(
      params.artifacts.enemies.map((enemy) => ({
        ...enemy,
        name: enemy.name ?? enemy.unique_name,
        kind: 'enemy' as const,
        category: 'Enemy',
      })),
    ),
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

/**
 * Tripwire del vínculo dato↔imagen.
 *
 * El dataset referencia sus imágenes **por nombre de archivo exacto** (`image_name` →
 * `/images/<image_name>` en `resolveLocalImageUrl`), y ese nombre lo decide upstream — más
 * `dedupImageNames`, que lo muta para resolver colisiones entre categorías. Nada garantiza que el
 * archivo exista: si el esquema cambia, el JSON apunta al vacío, la UI muestra un hueco y **ningún
 * proceso avisa**.
 *
 * Ya pasó: el swap del fork a upstream pristino cambió los nombres de `ash-f2c6f3ab3f.png` (esquema
 * del CDN warframestat.us) a `AckAndBrunt.png` (nombre de DE), y quedó sin detectar un mes porque
 * `get-img.mjs` sólo corre con `npm run generate:data`, no con `generate:data:base`.
 *
 * Distingue los dos fallos porque tienen arreglos distintos:
 *   · sin asset en ORIGEN  → upstream no lo trae. Gap de fuente, `get:img` no lo arregla.
 *   · sin asset en DESTINO → falta correr `npm run get:img`.
 *
 * Reporta y no rompe: es señal, no un gate.
 */
async function reportImageAssetCoverage(artifacts: RuntimeDataArtifacts): Promise<void> {
  const origen = path.resolve(projectRoot, '../warframe-items/data/img')
  const destino = path.resolve(projectRoot, 'public/images')

  const nombres = new Set<string>()
  for (const grupo of [
    artifacts.warframes, artifacts.weapons, artifacts.mods, artifacts.arcanes,
    artifacts.companions, artifacts.archwingWeapons, artifacts.vehicles,
  ]) {
    for (const item of grupo as Array<{ image_name?: string }>) {
      if (item.image_name) nombres.add(item.image_name)
    }
  }

  const leer = async (dir: string): Promise<Set<string> | null> => {
    try {
      return new Set(await fs.readdir(dir))
    } catch {
      return null // el clon o el directorio no existen en este entorno
    }
  }

  const [enOrigen, enDestino] = await Promise.all([leer(origen), leer(destino)])

  if (enOrigen) {
    const faltan = [...nombres].filter((n) => !enOrigen.has(n))
    if (faltan.length) {
      console.log(`⚠️  ${faltan.length}/${nombres.size} imágenes SIN asset en upstream (gap de fuente)`)
      console.log(`    ej.: ${faltan.slice(0, 5).join(', ')}`)
    }
  }

  if (enDestino) {
    const faltan = [...nombres].filter((n) => !enDestino.has(n))
    if (faltan.length) {
      const todas = faltan.length === nombres.size
      console.log(`⚠️  ${faltan.length}/${nombres.size} imágenes sin copiar a public/images`)
      console.log(
        todas
          ? '    NINGUNA resuelve — el esquema de nombres cambió o nunca se corrió. Correr: npm run get:img'
          : `    Correr: npm run get:img — ej.: ${faltan.slice(0, 5).join(', ')}`,
      )
    } else {
      console.log(`✓ imágenes — ${nombres.size} referencias resueltas en public/images`)
    }
  }
}

async function main(): Promise<void> {
  const artifacts = buildRuntimeDataArtifacts({
    sourceItems,
    arcaneNormalizationState,
    weaponNormalizationState,
    polarityNormalizationState,
    enemyBuildState,
  })

  await persistRuntimeDataArtifacts(artifacts)
  await persistSourceChangeAuditReport({ sourceItems, artifacts })
  await reportImageAssetCoverage(artifacts)

  console.log('Done.')
}

await main()
