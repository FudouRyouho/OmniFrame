// WeaponScraper (lean) — recupera de Module:Weapons/data el campo que Project consume
// y pristino dejó de cosechar: weaponClass (= raw.Class). Keyed por uniqueName.
// Es el que resuelve la Restricción 3 (weaponClass → tags). Ver OQ-DATA-16.
//
// El módulo se parte en submódulos por slot. Lean: sólo weaponClass (attacks/tags/
// polarities los provee pristino de su core — no los pisamos).
import { getLuaData, convertLuaDataToJson } from './luaData.mjs'

const BASE = 'https://wiki.warframe.com/w/Module:Weapons/data'
const SUFFIX = '?action=edit'
const SUBMODULES = ['archwing', 'companion', 'melee', 'misc', 'modular', 'primary', 'secondary', 'railjack']

export default class WeaponScraper {
  async scrape() {
    const out = {}
    for (const sub of SUBMODULES) {
      const parsed = await convertLuaDataToJson(await getLuaData(`${BASE}/${sub}${SUFFIX}`), 'Weapon')
      const table = parsed?.Weapons ?? parsed ?? {}
      for (const raw of Object.values(table)) {
        if (!raw || typeof raw !== 'object' || !raw.InternalName) continue
        const weaponClass = raw.Class || raw.Type
        if (weaponClass) out[raw.InternalName] = { weaponClass }
      }
    }
    return out
  }
}
