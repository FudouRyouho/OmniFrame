// enrich.mjs — aplica el enriquecimiento cosechado (build/build.mjs → data/*.json)
// sobre una lista de Items, por uniqueName. Agnóstico de dónde salieron esos items:
// lo usa `index.mjs` sobre el raw propio, y el harness de test aislado sobre el de
// upstream pristino. Ver OQ-DATA-16.
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
 * weapons/mods/warframes/arcanes son mapas uniqueName→{campos}; `enemies` es un mapa
 * **NOMBRE**→{campos} (ver ENEMIGOS abajo).
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
  // ENEMIGOS — merge por NOMBRE, no por uniqueName. El wiki indexa por el path del *Agent*
  // (`.../Desert/BladeSawman`), el export por el del *Avatar* (`.../Avatars/BladeSawmanAvatarLeader`):
  // por uniqueName matchea el 2.4%, por nombre el 86.5%. Consecuencia deliberada: los pares
  // Avatar/AvatarLeader (mismo nombre, distinto uniqueName) reciben la MISMA data wiki — es
  // correcto, son la misma unidad con variante de escuadrón. Ver OQ-DATA-16 fase-2.
  const enemies = fields ? loadCache('enemies') : null

  const hasAbilities = abilities.length > 0
  if (!fieldMaps.length && !hasAbilities && !enemies) return items

  for (const item of items) {
    const key = item?.uniqueName
    if (enemies && item?.category === 'Enemy') {
      // fill-if-missing igual que los mapas por uniqueName: el export gana donde tiene dato.
      // Así la cascada de `faction` (export → wiki) sale sola: los 33 enemigos con `faction`
      // propio la conservan, el resto la toma del submódulo wiki.
      const wiki = enemies[item.name]
      if (wiki) {
        for (const [k, v] of Object.entries(wiki)) {
          if (item[k] == null) item[k] = v
        }
      }
    }
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
