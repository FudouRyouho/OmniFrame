// omniframe-items — la fuente de datos de OmniFrame.
//
// Cadena:  Public Export (DE) → warframe-items (WFCD) → omniframe-items → Project.
// Ver `docs/domains/source/` y OQ-DATA-16.
//
// Este loader lee **nuestro** `data/json/` (el que produce `build/raw-build.ts`), no el del clon de
// upstream. Es el corte que cierra la fase 1: a partir de acá Project consume dato nuestro, y el
// árbitro pasa a ser `git diff public/data` — si el build propio se desvía, se ve en el dataset.
//
// Replica la forma de la clase `Items` de upstream (extiende Array, se consume con `Array.from`)
// porque Project no tiene por qué enterarse del cambio. En particular replica su regla de
// composición, que **no es obvia**: el default NO es leer `All.json`, es **listar el directorio** y
// cargar cada categoría por separado — por eso entran los 638 de `Enemy.json`, que `All.json` no
// contiene. Leer el agregado daría 16.889 ítems en vez de 17.527, sin enemigos y sin aviso.
//
// El enriquecimiento de la cosecha wiki se aplica **en runtime** (`enrichItems`), no materializado en
// el raw, a propósito: materializarlo haría que nuestro `data/json` dejara de ser comparable con el de
// upstream y perderíamos `build/diff-raw.mjs` como árbitro. Se materializa cuando el árbitro pase a
// ser el dataset (misma razón por la que G-1 espera).
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { enrichItems } from './enrich.mjs'

const JSON_DIR = fileURLToPath(new URL('./data/json/', import.meta.url))
const CACHE_FILE = fileURLToPath(new URL('./data/cache/.export.json', import.meta.url))

// `All` es el agregado (duplicaría todo) e `i18n` no es una categoría de ítems.
const NOT_A_CATEGORY = new Set(['All', 'i18n'])

const readJson = (path, fallback) => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return fallback
  }
}

function listCategories() {
  if (!existsSync(JSON_DIR)) {
    // Ruidoso a propósito. Un dataset ausente que degrada en silencio es el modo de falla que nos
    // costó meses detectar con el fósil de Enemy.json: se lee dato viejo creyendo que es fresco.
    throw new Error(
      `omniframe-items: no existe ${JSON_DIR}.\n` +
        `El raw propio no se generó todavía. Correr:  npm run build:raw  (en omniframe-items/)`,
    )
  }
  return readdirSync(JSON_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.slice(0, -'.json'.length))
    .filter((f) => !NOT_A_CATEGORY.has(f))
    .sort() // El orden de `readdirSync` depende del filesystem. Sin esto el orden de los ítems en
    // `public/data` baila entre máquinas y `git diff` deja de servir como árbitro: 40.000 líneas de
    // reordenamiento tapan el cambio real de un stat.
}

export default class Items extends Array {
  constructor(options, ...existingItems) {
    super(...existingItems)

    const categories = listCategories()
    this.options = { category: categories, ignoreEnemies: false, ...options }

    // 'All' en la lista pedida significa "todas", igual que en upstream.
    const wanted = this.options.category.includes('All')
      ? categories
      : this.options.category.filter((c) => categories.includes(c))

    for (const category of wanted) {
      if (this.options.ignoreEnemies && category === 'Enemy') continue
      for (const item of readJson(`${JSON_DIR}${category}.json`, [])) this.push(item)
    }

    if (this.length === 0) {
      throw new Error(
        `omniframe-items: ${JSON_DIR} existe pero no produjo ítems (${categories.length} categorías).\n` +
          `Build incompleto o interrumpido. Correr:  npm run build:raw  (en omniframe-items/)`,
      )
    }

    // Sello de versión de la fuente: el hash del manifest de DE con el que se construyó este raw.
    this.versions = readJson(CACHE_FILE, {})

    enrichItems(this, { fields: true })
  }
}
