// EnemyScraper (lean) — cosecha Module:Enemies/data/<facción> del wiki: los stats de
// enemigo que el export del juego NO trae. Keyed por uniqueName (General.InternalName).
// Fase-2 de OQ-DATA-16 — el objetivo de fondo de toda la migración.
//
// El agregador Module:Enemies/data es CÓDIGO (require + mw.*), no se puede pasar por
// convertLuaDataToJson; los submódulos por facción SÍ son tablas Lua puras (`return {...}`).
// `pre-U36` se excluye a propósito: era muerta (modelo de resistencias per-clase pre-U36).
//
// Tanda 1 (gaps confirmados):
//   · BaseLevel    — hoy EnemyRepository lo suple con `override ?? 1`; el export no lo trae.
//   · EximusHealth — variante eximus, ausente del export.
//   · Multis       — multiplicadores por parte ("Head: 3.0x") = condición de weakpoints.
//   · Shield       — cross-check (el export ya trae shield; el merge es fill-if-missing).
// Attacks/DamageDistribution NO se cosechan todavía: su consumidor (modelo de DR/EHP
// para builds tanque) no existe — se suma cuando el engine lo pida.
import { getLuaData, convertLuaDataToJson } from './luaData.mjs'

const BASE = 'https://wiki.warframe.com/w/Module:Enemies/data'
const SUFFIX = '?action=edit'

// COOP_FACTIONS del agregador (Module:Enemies/data).
const FACTIONS = [
  'grineer', 'corpus', 'infestation', 'orokin', 'sentient', 'stalker',
  'narmer', 'themurmur', 'techrot', 'scaldra', 'anarchs', 'unaffiliated',
]

export default class EnemyScraper {
  async scrape() {
    const out = {}
    for (const faction of FACTIONS) {
      const lua = await getLuaData(`${BASE}/${faction}${SUFFIX}`)
      if (!lua) {
        console.warn(`EnemyScraper: sin data para ${faction}`)
        continue
      }
      const parsed = await convertLuaDataToJson(lua, 'Enemy')
      const table = parsed ?? {}
      for (const [key, raw] of Object.entries(table)) {
        if (!raw || typeof raw !== 'object') continue
        // Clave de merge = NOMBRE, no uniqueName: el wiki indexa por el path del *Agent*
        // (`.../Desert/BladeSawman`) y el export del juego por el del *Avatar*
        // (`.../Desert/Avatars/BladeSawmanAvatarLeader`). El sufijo varía
        // (Avatar/AvatarLeader/…) → derivarlo sería frágil. El nombre sí matchea.
        const name = raw.General?.Name ?? key
        if (!name) continue
        const s = raw.Stats ?? {}
        const fields = {}
        if (s.BaseLevel != null) fields.baseLevel = s.BaseLevel
        if (s.Shield != null) fields.shield = s.Shield
        if (s.EximusHealth != null) fields.eximusHealth = s.EximusHealth
        if (Array.isArray(s.Multis) && s.Multis.length) fields.multis = s.Multis
        // Trazabilidad: el uniqueName del wiki (Agent) queda como referencia, NO como clave.
        if (raw.General?.InternalName) fields.wikiInternalName = raw.General.InternalName
        if (Object.keys(fields).length > 1) out[name] = fields
      }
    }
    return out
  }
}
