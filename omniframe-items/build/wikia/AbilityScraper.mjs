// AbilityScraper — cosecha Module:Ability/data + Module:Ability/data/stats de la wiki.
// Relocalizado del fork a omniframe-items (OQ-DATA-16). Imports ajustados a la
// maquinaria Lua propia; lógica de scrape intacta.
import { getLuaData, convertLuaDataToJson } from './luaData.mjs'
import transformAbility from './transformAbility.mjs'

const abilityUrl = 'https://wiki.warframe.com/w/Module:Ability/data?action=edit'
const abilityStatsUrl = 'https://wiki.warframe.com/w/Module:Ability/data/stats?action=edit'

/**
 * Scrapes Module:Ability/data and Module:Ability/data/stats from the Warframe Wiki.
 * The stats module is indexed by ability uniqueName and contains numeric gameplay stats
 * (damage, range, duration, etc.) with their scaling modifiers.
 */
export default class AbilityScraper {
  async scrape() {
    // Fetch both modules in parallel
    const [luaData, statsLuaData] = await Promise.all([
      getLuaData(abilityUrl),
      getLuaData(abilityStatsUrl),
    ])

    if (!luaData) {
      console.error('AbilityScraper: failed to fetch Lua data')
      return []
    }

    const parsed = await convertLuaDataToJson(luaData, 'Ability')
    if (!parsed) {
      console.error('AbilityScraper: Lua conversion failed')
      return []
    }

    const abilityTable = parsed.Ability ?? parsed
    if (!abilityTable || typeof abilityTable !== 'object') {
      console.error('AbilityScraper: could not find Ability table in parsed data')
      return []
    }

    // Parse stats module — indexed by uniqueName.
    let statsMap = {}
    if (statsLuaData) {
      const parsedStats = await convertLuaDataToJson(statsLuaData, 'AbilityStats')
      if (parsedStats && typeof parsedStats === 'object') {
        statsMap = parsedStats
      } else {
        console.warn('AbilityScraper: failed to parse ability stats, continuing without them')
      }
    } else {
      console.warn('AbilityScraper: failed to fetch ability stats, continuing without them')
    }

    const abilities = []
    await Promise.all(
      Object.entries(abilityTable).map(async ([name, raw]) => {
        if (!raw || typeof raw !== 'object') return
        if (!raw.Name) raw.Name = name

        // Attach raw stats array if we have a uniqueName to look up
        const uniqueName = raw.InternalName
        if (uniqueName && statsMap[uniqueName]) {
          raw._stats = statsMap[uniqueName]
        }

        const transformed = await transformAbility(raw, {})
        if (transformed) abilities.push(transformed)
      })
    )

    abilities.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    return abilities
  }
}
