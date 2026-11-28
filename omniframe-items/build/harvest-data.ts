import fs from 'node:fs/promises'

/**
 * Crea `harvest/data/` con lo mínimo que el código absorbido lee al importarse:
 *  · `cache/.export.json` — los hashes del build anterior (`previousCache`, el nuestro; `{}` si no hay: build completo).
 *  · `json/All.json` — el `previousBuild` del parser; sirve para reutilizar patchlogs. Vacío = se recalculan.
 * No pisa lo que ya existe.
 */
export async function bootstrapHarvestData(harvestData: URL, previousCache: URL): Promise<void> {
  await fs.mkdir(new URL('cache/', harvestData), { recursive: true })
  await fs.mkdir(new URL('json/', harvestData), { recursive: true })
  const exportCache = new URL('cache/.export.json', harvestData)
  try {
    await fs.access(exportCache)
  } catch {
    const previous = await fs.readFile(previousCache, 'utf8').catch(() => '{}')
    await fs.writeFile(exportCache, previous)
  }
  const previousBuild = new URL('json/All.json', harvestData)
  try {
    await fs.access(previousBuild)
  } catch {
    await fs.writeFile(previousBuild, '[]')
  }
}
