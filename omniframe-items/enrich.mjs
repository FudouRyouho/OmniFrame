// enrich.mjs — aplica el enriquecimiento cosechado (build/build.mjs → data/*.json)
// sobre una lista de Items, por uniqueName. Reutilizable: lo usa index.mjs sobre su
// base, y el harness de test aislado sobre pristino. Ver OQ-DATA-16.
//
// Merge QUIRÚRGICO: Object.assign sólo agrega los campos cosechados (los perdidos),
// no pisa lo que la base ya provee.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

function loadCache(name) {
  try {
    return JSON.parse(readFileSync(fileURLToPath(new URL(`./data/${name}.json`, import.meta.url)), 'utf8'))
  } catch {
    return null
  }
}

/**
 * Enriquece items in-place. `abilities` es un array (merge por ability.uniqueName);
 * weapons/mods/warframes/arcanes son mapas uniqueName→{campos}.
 *
 * @param {Iterable<any>} items
 * @param {{ fields?: boolean }} [opts] — `fields` activa la cosecha de campos
 *   (weaponClass/upgradeTypes/playstyle/…). Default OFF: sobre la base fork esos
 *   campos ya existen y activarlos surfacea data wiki fresca que altera public/data.
 *   Se activa al migrar a pristino (que SÍ los perdió) y en el test aislado.
 * @returns {any} items (misma referencia)
 */
export function enrichItems(items, { fields = false } = {}) {
  const abilities = loadCache('abilities') || []
  const fieldMaps = fields
    ? [loadCache('weapons'), loadCache('mods'), loadCache('warframes'), loadCache('arcanes')].filter(Boolean)
    : []

  const hasAbilities = abilities.length > 0
  if (!fieldMaps.length && !hasAbilities) return items

  for (const item of items) {
    const key = item?.uniqueName
    // Mapas de campos por uniqueName (quirúrgico, fill-if-missing).
    // Sólo rellena campos ausentes: no-op si la base ya los trae (fork), recupera si
    // faltan (pristino). Así es base-agnóstico y no altera public/data sobre el fork.
    if (key) {
      for (const map of fieldMaps) {
        const fields = map[key]
        if (!fields) continue
        for (const [k, v] of Object.entries(fields)) {
          if (item[k] == null) item[k] = v
        }
      }
    }
    // Habilidades (merge por ability.uniqueName/name, réplica del hook del fork)
    if (hasAbilities && Array.isArray(item?.abilities) && item.abilities.length) {
      item.abilities = item.abilities.map((ability) => {
        const w = abilities.find(
          (a) => a.uniqueName === ability.uniqueName || a.name === ability.name,
        )
        if (!w) return ability
        const { name, uniqueName, description, imageName, ...wikiaFields } = w
        return { ...ability, ...wikiaFields }
      })
    }
  }
  return items
}
