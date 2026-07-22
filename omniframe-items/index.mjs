// omniframe-items — capa de cosecha de OmniFrame sobre warframe-items (@wfcd/items).
//
// Cadena:  warframe-items (upstream) -> omniframe-items -> Project.
// Migración OQ-DATA-16.
//
// Runtime: extiende el `Items` de @wfcd/items y aplica el enriquecimiento cosechado
// por el mini-build propio (`build/build.mjs` -> `data/abilities.json`). El merge de
// habilidades por uniqueName replica el hook que el fork tenía en `parser.mjs`, pero
// como post-proceso sobre el output — sin editar upstream.
//
// Si la cache no existe (clon fresco sin correr el build), degrada a passthrough:
// no enriquece. Es seguro porque hoy NINGÚN artefacto de public/data consume el
// enriquecimiento (generate-data toma sólo `ability.uniqueName`); la cosecha se
// conserva como capacidad para consumidores futuros (ver OQ-DATA-16).
import Items from '@wfcd/items'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

let wikiAbilities
function loadWikiAbilities() {
  if (wikiAbilities !== undefined) return wikiAbilities
  try {
    const p = fileURLToPath(new URL('./data/abilities.json', import.meta.url))
    wikiAbilities = JSON.parse(readFileSync(p, 'utf8'))
  } catch {
    wikiAbilities = [] // cache ausente → sin enriquecer (passthrough)
  }
  return wikiAbilities
}

export default class extends Items {
  constructor(...args) {
    super(...args)
    const abilities = loadWikiAbilities()
    if (!abilities.length) return
    for (const item of this) {
      if (!Array.isArray(item?.abilities) || !item.abilities.length) continue
      item.abilities = item.abilities.map((ability) => {
        const w = abilities.find(
          (a) => a.uniqueName === ability.uniqueName || a.name === ability.name,
        )
        if (!w) return ability
        // Descarta los campos que ya trae la ability base; mergea el resto (idéntico al hook del fork).
        const { name, uniqueName, description, imageName, ...wikiaFields } = w
        return { ...ability, ...wikiaFields }
      })
    }
  }
}
