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
// `fields` va OFF mientras la base es el fork (ya trae weaponClass/upgradeTypes/…;
// activarlo surfacearía data wiki fresca y alteraría public/data). Se activa al migrar
// a pristino (que perdió esos campos): ahí este `enrichItems(this)` pasa a
// `enrichItems(this, { fields: true })`. Ver OQ-DATA-16.
import Items from '@wfcd/items'
import { enrichItems } from './enrich.mjs'

export default class extends Items {
  constructor(...args) {
    super(...args)
    enrichItems(this)
  }
}
