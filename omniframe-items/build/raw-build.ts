// raw-build.ts — build propio del raw de omniframe-items (OQ-DATA-16 fase-3).
//
// Emite `omniframe-items/data/json/*` en vez de consumir el de upstream. La capa-1 (ingest + parseo)
// NO se reimplementa: `scraper`/`parser`/`hashManager`/`stringify` se **importan** de
// `warframe-items/build/` por ruta relativa — están fuera de sus `exports`, es el acoplamiento a
// internos que la fase asume a conciencia (ver OQ-DATA-16 fase-3). Lo que sí se copia es el
// **pegamento** de su `Build`: `applyCustomCategories`, `dedupImageNames` y `saveJson` son métodos de
// una clase que `build.ts` **no exporta** (al final hace `new Build(); void build.init()`, así que
// importarlo dispararía el build entero de upstream, imágenes incluidas).
//
// Qué NO hace, a diferencia del build de upstream:
//   · `saveImages` — lo caro (imagemin/sharp, descarga por ítem). Las imágenes siguen viniendo del
//     `data/img` del clon de upstream vía `get-img.mjs`; por eso `dedupImageNames` SÍ se aplica: muta
//     `imageName` y sin él las rutas dejarían de matchear.
//   · `updateReadme` — es de su repo.
//   · `hashManager.saveExportCache()` — escribiría en el directorio de UPSTREAM (está anclado por
//     `import.meta.url`). El cache se escribe acá, en nuestro layout, con el mismo formato.
//
// Requisito: el clon de upstream necesita sus deps instaladas (`npm install` allí) — el build importa
// su código, y Node resuelve por la ubicación del importador.
import fs from 'node:fs/promises'
import { createHash } from 'node:crypto'

import scraper from '../../warframe-items/build/scraper.ts'
import parser from '../../warframe-items/build/parser.ts'
import hashManager from '../../warframe-items/build/hashManager.ts'
import stringify from '../../warframe-items/build/stringify.ts'
import readJson from '../../warframe-items/build/readJson.ts'
import type {
  ApiCategory,
  CategoryData,
  ImageManifest,
  Item,
  PatchlogWrap,
  RawItemData,
  Warnings,
} from '../../warframe-items/build/types/shared.ts'

const dataDir = new URL('../data/', import.meta.url)
const jsonDir = new URL('../data/json/', import.meta.url)
const cacheDir = new URL('../data/cache/', import.meta.url)

// Copiado de `build.ts`: categorías que además se emiten como archivo propio.
const allowedCustomCategories = ['SentinelWeapons']

/** Copia de `Build.applyCustomCategories` — agrupa por `item.category` (la del parser, no la de DE). */
function applyCustomCategories(data: CategoryData[]): Record<string, Item[]> {
  const result: Record<string, Item[]> = {}
  for (const chunk of data) {
    if (chunk.category === 'Recipes') continue // Skip blueprints

    for (const item of chunk.data) {
      if (!item) continue

      if (item.productCategory && allowedCustomCategories.includes(item.productCategory)) {
        if (result[item.productCategory]) result[item.productCategory]?.push(item)
        else result[item.productCategory] = [item]
        continue
      }

      if (result[item.category]) result[item.category]?.push(item)
      else result[item.category] = [item]
    }
  }
  return result
}

/**
 * Copia de `Build.dedupImageNames` — resuelve colisiones de `imageName` entre categorías por
 * prioridad. Muta `data` in-place. Se conserva porque `get-img` depende de que estos nombres
 * matcheen el `data/img` de upstream.
 */
function dedupImageNames(data: Record<string, Item[]>, manifest: ImageManifest, warnings: Warnings): void {
  const priorityMap: Record<string, number> = {
    Warframes: -1, Archwing: 0, Primary: 1, Secondary: 2, Melee: 3,
    'Arch-Gun': 4, 'Arch-Melee': 5, Railjack: 7, Sentinels: 8, SentinelWeapons: 8,
    Pets: 9, Mods: 10, Arcanes: 11, Relics: 12, Quests: 13, Gear: 14,
    Resources: 15, Fish: 16, Skins: 17, Glyphs: 18, Sigils: 19, Node: 20,
    Enemy: 21, Misc: 22,
  }

  const items = Object.values(data).flat()
  const noImage = items.filter((i) => !i.imageName)
  const hasImage = items.filter((i) => i.imageName)

  const itemsByImageName: Record<string, Item[]> = {}
  for (const item of hasImage) {
    if (warnings.failedImage.includes(item.name)) {
      item.imageName = 'missing.png'
      noImage.push(item)
      continue
    }
    ;(itemsByImageName[item.imageName] ??= []).push(item)
  }

  const hashMap = manifest.reduce<Record<string, string>>((acc, entry) => {
    const hash = entry.textureLocation.split('!')[1] ?? createHash('md5').update(entry.textureLocation).digest('hex')
    acc[entry.uniqueName] = hash
    return acc
  }, {})

  const relicRegex = /Relic(?:Lith|Meso|Neo|Axi)[A-D]/
  const processedItems: Item[] = []
  for (const imageName of Object.keys(itemsByImageName)) {
    const group = itemsByImageName[imageName]!
    if (group.length === 1) {
      processedItems.push(...group)
      continue
    }

    // Components, Generic y Relics comparten imagen a propósito; OmegaMod es la base de los rivens.
    if (
      imageName.includes('Component') ||
      imageName.includes('Generic') ||
      relicRegex.test(imageName) ||
      imageName.includes('OmegaMod')
    ) {
      processedItems.push(...group)
      continue
    }

    group.sort((a, b) => {
      if (
        (a.productCategory || b.productCategory) &&
        allowedCustomCategories.includes(a.productCategory ?? b.productCategory ?? '')
      ) {
        return (
          (priorityMap[a.productCategory ?? a.category] ?? Infinity) -
          (priorityMap[b.productCategory ?? b.category] ?? Infinity)
        )
      }
      return (priorityMap[a.category] ?? Infinity) - (priorityMap[b.category] ?? Infinity)
    })

    const mainItem = group[0]!
    processedItems.push(mainItem)

    const seen = new Set<string>([mainItem.uniqueName])
    for (const item of group.slice(1)) {
      // No se renombran duplicados exactos: el dedupe del stringify los elimina al escribir.
      if (!seen.has(item.uniqueName) && hashMap[item.uniqueName] !== hashMap[mainItem.uniqueName]) {
        const imageName = item.imageName
        const index = imageName.indexOf('.')
        item.imageName = imageName.slice(0, index) + item.category + imageName.slice(index)
      }
      processedItems.push(item)
      seen.add(item.uniqueName)
    }
  }

  for (const key of Object.keys(data)) data[key] = []

  for (const item of [...processedItems, ...noImage]) {
    if (item.productCategory && allowedCustomCategories.includes(item.productCategory)) {
      data[item.productCategory]!.push(item)
      continue
    }
    data[item.category]!.push(item)
  }
}

/**
 * Copia de `Build.saveJson`, apuntada a NUESTRO `data/json`. Acá vive el control de acción de la
 * fase 2 (qué categorías se emiten); hoy emite las 23, igual que upstream — dejar de emitir lo que
 * nadie consume es trabajo pendiente, no una omisión.
 */
async function saveJson(
  categories: Record<string, Item[]>,
  i18n: Record<string, Record<string, Partial<Item>>>,
): Promise<void> {
  let all: Item[] = []
  const sort = (a: Item, b: Item): number => {
    const res = a.name.localeCompare(b.name)
    return res === 0 ? a.uniqueName.localeCompare(b.uniqueName) : res
  }

  for (const category of Object.keys(categories)) {
    const categoryData = categories[category]
    if (!categoryData) continue
    const data = categoryData.sort(sort)
    all = all.concat(data)
    await fs.writeFile(new URL(`${category}.json`, jsonDir), JSON.stringify(JSON.parse(stringify(data))))
  }

  all.sort(sort)
  await fs.writeFile(new URL('All.json', jsonDir), stringify(all))
  await fs.writeFile(new URL('i18n.json', jsonDir), JSON.stringify(JSON.parse(stringify(i18n))))
}

/**
 * 🚨 `Enemy.json` NO se puede generar: **`ExportEnemies` ya no existe en el export de DE** (los 15
 * endpoints son Customs/Drones/Flavour/FusionBundles/Gear/Keys/Recipes/Regions/RelicArcane/Resources/
 * Sentinels/SortieRewards/Upgrades/Warframes/Weapons). El `case 'Enemies'` del parser de upstream es
 * código muerto, y su `Enemy.json` es un **fósil sin tocar desde 2019-12-04**: el contenido corta en
 * Orb Vallis (54 de Eidolon, 52 de Vallis, **0** de Deimos/Narmer/Zariman/Duviri/1999).
 *
 * Se copia tal cual para que el árbitro de esta fase sea diff-vacío y el problema del enemigo se
 * ataque con su propio diff explicado. **Es deuda con fecha de vencimiento**: el eje enemigo del
 * engine corre sobre datos de 2019, y la fuente viva es el wiki (`Module:Enemies/data`, ya cosechado:
 * 1000 enemigos con facción, BaseLevel, EximusHealth y Multis). Ver OQ-DATA-16 fase-3.
 */
async function passthroughFossilEnemies(): Promise<Item[]> {
  const fossil = await readJson<Item[]>(new URL('../../warframe-items/data/json/Enemy.json', import.meta.url))
  await fs.writeFile(new URL('Enemy.json', jsonDir), JSON.stringify(fossil))
  return fossil
}

/**
 * **G-1 — corrige `puncture` ↔ `slash` invertidos.** Primera divergencia deliberada contra el raw de
 * upstream (ver `docs/domains/source/gaps.md` §G-1).
 *
 * El orden canónico de `damagePerShot` es **Impact, Puncture, Slash**, documentado por DE. El
 * `addDamage` del parser desestructura la posición `[1]` como `slash` y la `[2]` como `puncture`, y
 * después arma el objeto por nombre — así que sale cruzado: **486 de 595 armas invertidas, cero
 * correctas** (las demás no son distinguibles: puncture = slash, o ambos en 0). El propio ítem se
 * contradice: su `attacks[0]`, que viene del wiki, trae los valores bien.
 *
 * Se corrige acá y no en el parser porque el parser se **importa** de upstream, no se copia.
 * Idempotente por construcción: opera sobre `damagePerShot`, que es el dato crudo de DE, no sobre el
 * `damage` ya derivado.
 *
 * ⚠️ A partir de este swap `build/diff-raw.mjs` deja de dar diff vacío por diseño. El árbitro de esta
 * etapa es `git diff public/data` (el loader propio ya lo habilita).
 */
function fixPhysicalDamage(categories: Record<string, Item[]>): number {
  let fixed = 0
  const walk = (item: Record<string, unknown>): void => {
    const shot = item.damagePerShot as number[] | undefined
    const damage = item.damage as Record<string, number> | undefined
    if (Array.isArray(shot) && damage) {
      const [, puncture, slash] = shot
      if (damage.puncture !== puncture || damage.slash !== slash) {
        damage.puncture = puncture!
        damage.slash = slash!
        fixed++
      }
    }
    // Los componentes repiten el shape: un componente de arma trae su propio daño.
    // `attacks[]` NO se toca: viene del wiki y ya está bien — de hecho es la evidencia del bug.
    const components = item.components
    if (Array.isArray(components)) for (const sub of components) if (sub && typeof sub === 'object') walk(sub)
  }
  for (const items of Object.values(categories)) for (const item of items) walk(item as never)
  return fixed
}

async function main(): Promise<void> {
  await fs.mkdir(jsonDir, { recursive: true })
  await fs.mkdir(cacheDir, { recursive: true })

  // `failedImage` es el único warning que el parser no rastrea (lo produce saveImages, que no
  // corremos): se hereda del último build de upstream para que `dedupImageNames` decida igual.
  const warnings = await readJson<Warnings>(new URL('../../warframe-items/data/warnings.json', import.meta.url))

  await scraper.checkOriginServerAvailability()
  await hashManager.updateExportCache()

  console.log('· bajando el export…')
  const resources = await scraper.fetchResources()
  const raw: RawItemData = {
    api: resources.en as ApiCategory[],
    manifest: (await scraper.fetchImageManifest()) as ImageManifest,
    drops: (await scraper.fetchDropRates()) as never,
    patchlogs: (await scraper.fetchPatchLogs()) as unknown as PatchlogWrap,
    wikia: await scraper.fetchWikiaData(),
    relics: ((await scraper.generateRelicData()) ?? []) as never,
    i18n: resources,
  }

  console.log('· parseando…')
  const parsed = parser.parse(raw)
  parsed.warnings.failedImage = [...warnings.failedImage]

  const data = applyCustomCategories(parsed.data)
  const i18n = parser.applyI18n(data, raw.i18n)
  dedupImageNames(data, raw.manifest, parsed.warnings)

  console.log(`· G-1: puncture↔slash corregido en ${fixPhysicalDamage(data)} ítems`)

  // El fósil se copia como categoría suelta y NO entra a `All.json`: upstream tampoco lo incluye
  // (su All.json son 16889 items, sin un solo `category: 'Enemy'`) — la categoría no la produce el parser.
  await passthroughFossilEnemies()
  await saveJson(data, i18n)
  await fs.writeFile(new URL('warnings.json', dataDir), stringify(parsed.warnings))
  // El cache va a NUESTRO layout: `hashManager.saveExportCache()` escribiría en el de upstream.
  await fs.writeFile(new URL('.export.json', cacheDir), JSON.stringify(hashManager.exportCache, undefined, 1))

  const counts = Object.entries(data)
    .map(([category, items]) => `${category}: ${items.length}`)
    .sort()
  console.log(`✓ data/json — ${Object.keys(data).length} categorías`)
  console.log('  ' + counts.join(' · '))
}

await main()
