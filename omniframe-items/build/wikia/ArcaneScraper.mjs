// ArcaneScraper (lean) — recupera de Module:Arcane/data el campo que Project consume
// y pristino dejó de cosechar: upgradeTypes. Keyed por uniqueName. Ver OQ-DATA-16.
// (pristino SÍ agregó wikiaThumbnail/url/introduced para arcanos → no los tocamos.)
import { getLuaData, convertLuaDataToJson } from './luaData.mjs'

const URL = 'https://wiki.warframe.com/w/Module:Arcane/data?action=edit'

export default class ArcaneScraper {
  async scrape() {
    const parsed = await convertLuaDataToJson(await getLuaData(URL), 'Arcane')
    const table = parsed?.Arcanes ?? parsed?.Arcane ?? parsed ?? {}
    const out = {}
    for (const raw of Object.values(table)) {
      if (!raw || typeof raw !== 'object' || !raw.InternalName) continue
      if (raw.UpgradeTypes?.length) out[raw.InternalName] = { upgradeTypes: raw.UpgradeTypes }
    }
    return out
  }
}
