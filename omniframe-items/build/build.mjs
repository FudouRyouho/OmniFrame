// build.mjs — orquestador de cosecha de omniframe-items.
//
// Corre los scrapers de módulos Lua de la wiki que el upstream nuevo (pristino) no
// aprovecha, y deja el resultado cacheado en data/*.json. El runtime (enrich.mjs)
// lo mergea sobre el output de la base por uniqueName. Refrescar = `npm run build`.
//
// Habilidades: array de abilities (merge por ability.uniqueName).
// Weapon/Mod/Warframe/Arcane: mapas uniqueName→{campos perdidos} (merge quirúrgico).
// Mañana: enemigos (fase 2, OQ-DATA-16).
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import AbilityScraper from './wikia/AbilityScraper.mjs'
import WeaponScraper from './wikia/WeaponScraper.mjs'
import ModScraper from './wikia/ModScraper.mjs'
import WarframeScraper from './wikia/WarframeScraper.mjs'
import ArcaneScraper from './wikia/ArcaneScraper.mjs'
import EnemyScraper from './wikia/EnemyScraper.mjs'

const dataDir = fileURLToPath(new URL('../data/', import.meta.url))
await mkdir(dataDir, { recursive: true })

async function harvest(label, file, scraper) {
  const result = await scraper.scrape()
  const count = Array.isArray(result) ? result.length : Object.keys(result).length
  await writeFile(
    fileURLToPath(new URL(`../data/${file}.json`, import.meta.url)),
    `${JSON.stringify(result, null, 2)}\n`,
  )
  console.log(`✓ ${file}.json — ${count} ${label}`)
}

await harvest('habilidades', 'abilities', new AbilityScraper())
await harvest('armas (weaponClass)', 'weapons', new WeaponScraper())
await harvest('mods (upgradeTypes…)', 'mods', new ModScraper())
await harvest('warframes (playstyle…)', 'warframes', new WarframeScraper())
await harvest('arcanos (upgradeTypes)', 'arcanes', new ArcaneScraper())
await harvest('enemigos (baseLevel/multis…)', 'enemies', new EnemyScraper())
