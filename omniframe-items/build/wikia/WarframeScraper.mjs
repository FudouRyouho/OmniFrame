// WarframeScraper (lean) — recupera de Module:Warframes/data los campos que Project
// consume y pristino dejó de cosechar: energy, initialEnergy, maxRank, playstyle,
// progenitor, subsumed, themes, tactical. Keyed por uniqueName. Ver OQ-DATA-16.
//
// El módulo anida por categoría ({ Warframes, Archwings, Necramechs, Operators }).
// Merge QUIRÚRGICO: NO tocamos health/shield/armor (pristino los trae de su core).
// La decisión "wiki vs core para stats base de warframe" se resuelve con el diff real
// (💣 en OQ-DATA-16) — este scraper deja los stats base a pristino a propósito.
import { getLuaData, convertLuaDataToJson } from './luaData.mjs'

const URL = 'https://wiki.warframe.com/w/Module:Warframes/data?action=edit'

export default class WarframeScraper {
  async scrape() {
    const parsed = await convertLuaDataToJson(await getLuaData(URL), 'Warframe')
    const out = {}
    for (const group of Object.values(parsed ?? {})) {
      if (!group || typeof group !== 'object') continue
      for (const raw of Object.values(group)) {
        if (!raw || typeof raw !== 'object' || !raw.InternalName) continue
        const f = {}
        if (raw.Energy != null) f.energy = raw.Energy
        if (raw.InitialEnergy != null) f.initialEnergy = raw.InitialEnergy
        if (raw.MaxRank != null) f.maxRank = raw.MaxRank
        if (raw.Playstyle) f.playstyle = Array.isArray(raw.Playstyle) ? raw.Playstyle : [raw.Playstyle]
        if (raw.Progenitor) f.progenitor = raw.Progenitor
        if (raw.Subsumed) f.subsumed = raw.Subsumed
        if (raw.Themes) f.themes = raw.Themes
        if (raw.Tactical) f.tactical = raw.Tactical
        if (Object.keys(f).length) out[raw.InternalName] = f
      }
    }
    return out
  }
}
