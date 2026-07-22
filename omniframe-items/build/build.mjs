// build.mjs — orquestador de cosecha de omniframe-items.
//
// Corre los scrapers de módulos Lua de la wiki que @wfcd/items no aprovecha y
// deja el resultado cacheado en data/*.json. El runtime (index.mjs) lo mergea
// sobre el output de @wfcd/items. Refrescar la cosecha = `npm run build` acá.
//
// Hoy: habilidades. Mañana: enemigos (fase 2, OQ-DATA-16).
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import AbilityScraper from './wikia/AbilityScraper.mjs'

const dataDir = fileURLToPath(new URL('../data/', import.meta.url))
await mkdir(dataDir, { recursive: true })

const abilities = await new AbilityScraper().scrape()
await writeFile(
  fileURLToPath(new URL('../data/abilities.json', import.meta.url)),
  `${JSON.stringify(abilities, null, 2)}\n`,
)
console.log(`✓ abilities.json — ${abilities.length} habilidades cosechadas de la wiki`)
