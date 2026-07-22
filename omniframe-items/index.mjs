// omniframe-items — capa de cosecha de OmniFrame sobre warframe-items (@wfcd/items).
//
// Cadena:  warframe-items (upstream) -> omniframe-items -> Project.
// Migración OQ-DATA-16.
//
// Runtime: extiende el `Items` de la base (@wfcd/items) y aplica el enriquecimiento
// cosechado por el mini-build propio (build/build.mjs -> data/*.json) vía enrichItems.
// Re-cosecha del wiki lo que el upstream nuevo dejó de traer (weaponClass, upgradeTypes,
// playstyle, habilidades, etc.), keyed por uniqueName, como post-proceso sobre el output.
//
// Si las caches no existen (clon fresco sin correr el build), enrichItems degrada a
// no-op (passthrough). Refrescar la cosecha = `npm run build` acá.
//
// `fields: true`: la base es upstream pristino (WFCD master), que dejó de cosechar del
// wiki weaponClass/upgradeTypes/playstyle/… — omniframe-items los re-cosecha (merge
// quirúrgico fill-if-missing por uniqueName). Ver OQ-DATA-16 (promoción 2026-07-22).
import Items from '@wfcd/items'
import { enrichItems } from './enrich.mjs'

export default class extends Items {
  constructor(...args) {
    super(...args)
    enrichItems(this, { fields: true })
  }
}
