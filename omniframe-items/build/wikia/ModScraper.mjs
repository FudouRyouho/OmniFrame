// ModScraper (lean) — recupera de Module:Mods/data SOLO los campos que Project
// consume y que pristino-master dejó de cosechar: upgradeTypes, maxRank,
// incompatibilityTags. Keyed por uniqueName (InternalName). Ver OQ-DATA-16.
//
// "Lean" = a propósito no trae thumbnails/blueprints/modClass/etc (no consumidos).
// Merge quirúrgico: sólo agrega estos campos, no pisa lo que pristino ya provee.
import { getLuaData, convertLuaDataToJson } from './luaData.mjs'

const URL = 'https://wiki.warframe.com/w/Module:Mods/data?action=edit'

export default class ModScraper {
  async scrape() {
    const parsed = await convertLuaDataToJson(await getLuaData(URL), 'Mod')
    const table = parsed?.Mods ?? parsed ?? {}
    const out = {}
    for (const raw of Object.values(table)) {
      if (!raw || typeof raw !== 'object' || !raw.InternalName) continue
      const fields = {}
      if (raw.UpgradeTypes?.length) fields.upgradeTypes = raw.UpgradeTypes
      if (raw.MaxRank != null) fields.maxRank = raw.MaxRank
      if (raw.IncompatibilityTags?.length) fields.incompatibilityTags = raw.IncompatibilityTags
      if (Object.keys(fields).length) out[raw.InternalName] = fields
    }
    return out
  }
}
