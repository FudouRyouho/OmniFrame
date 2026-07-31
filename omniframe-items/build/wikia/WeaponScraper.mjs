// WeaponScraper — recupera de Module:Weapons/data lo que Project consume y la cadena
// Public Export → warframe-items no entrega. Keyed por InternalName (= uniqueName).
//
// Dos campos, por dos razones distintas:
//   - `weaponClass` (= raw.Class): pristino dejó de cosecharlo. Resuelve la Restricción 3
//     (weaponClass → tags). Ver OQ-DATA-16.
//   - `attackSpread`: el export NUNCA lo tuvo. Publica `Accuracy` (un escalar derivado)
//     pero no el par min/max del que sale — y el par es lo que el engine necesita para
//     modelar precisión, porque `Accuracy = 100 / ((Min+Max)/2)` pierde la dispersión.
//     Este módulo es la única fuente conocida que lo publica descompuesto.
//     Ver `docs/domains/source/wiki-modules.md` y OQ-ENGINE-7.
//
// El módulo se parte en submódulos por slot. Sigue siendo lean: no pisamos attacks/tags/
// polarities, que pristino sí provee de su core — `attackSpread` viaja aparte, como mapa
// AttackName→{min,max}, y el join contra `attacks[]` lo hace el pipeline de Project.
// El mapa se keyea por nombre porque es el único identificador que ambos lados comparten
// (verificado: 0 AttackName duplicados dentro de un arma).
import { getLuaData, convertLuaDataToJson } from './luaData.mjs'

const BASE = 'https://wiki.warframe.com/w/Module:Weapons/data'
const SUFFIX = '?action=edit'
const SUBMODULES = ['archwing', 'companion', 'melee', 'misc', 'modular', 'primary', 'secondary', 'railjack']

// Un ataque sin ninguno de los dos no aporta: el AoE no lo usa ("areas of effect are not
// affected by accuracy modifiers"), y ausente ≠ 0 — 0 sería puntería perfecta.
function extractSpread(attacks) {
  if (!Array.isArray(attacks)) return null

  const out = {}
  for (const attack of attacks) {
    if (!attack || typeof attack !== 'object') continue
    const { AttackName, MinSpread, MaxSpread } = attack
    if (typeof AttackName !== 'string') continue
    if (typeof MinSpread !== 'number' && typeof MaxSpread !== 'number') continue
    out[AttackName] = {
      min: typeof MinSpread === 'number' ? MinSpread : null,
      max: typeof MaxSpread === 'number' ? MaxSpread : null,
    }
  }

  return Object.keys(out).length > 0 ? out : null
}

export default class WeaponScraper {
  async scrape() {
    const out = {}
    for (const sub of SUBMODULES) {
      const parsed = await convertLuaDataToJson(await getLuaData(`${BASE}/${sub}${SUFFIX}`), 'Weapon')
      const table = parsed?.Weapons ?? parsed ?? {}
      for (const raw of Object.values(table)) {
        if (!raw || typeof raw !== 'object' || !raw.InternalName) continue

        const fields = {}
        const weaponClass = raw.Class || raw.Type
        if (weaponClass) fields.weaponClass = weaponClass
        const attackSpread = extractSpread(raw.Attacks)
        if (attackSpread) fields.attackSpread = attackSpread

        if (Object.keys(fields).length > 0) out[raw.InternalName] = fields
      }
    }
    return out
  }
}
