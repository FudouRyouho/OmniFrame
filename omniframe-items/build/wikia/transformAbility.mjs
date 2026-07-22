// Transformer de Module:Ability/data (+ /stats) de la wiki. Copia fiel del fork
// (relocalizada a omniframe-items — OQ-DATA-16). Autocontenido, sin cambios de lógica.

// Maps the raw Lua modifier string to a short canonical key
const MODIFIER_MAP = {
  AVATAR_ABILITY_STRENGTH: 'STRENGTH',
  AVATAR_ABILITY_RANGE: 'RANGE',
  AVATAR_ABILITY_DURATION: 'DURATION',
  AVATAR_ABILITY_EFFICIENCY: 'EFFICIENCY',
  ENERGY_DRAIN: 'ENERGY_DRAIN',
  NONE: 'NONE',
}

/**
 * Lua arrays parsed via JSON.lua come out as { Val1: x, Val2: y, ... } or plain arrays.
 * This normalizes both forms to a flat number[].
 */
const normalizeValues = (raw) => {
  if (!raw) return []
  if (Array.isArray(raw)) {
    // Could be [{ Val1: x }, ...] or [x, ...]
    return raw.map((v) => (typeof v === 'object' && v !== null ? Object.values(v)[0] : v))
  }
  if (typeof raw === 'object') {
    // { Val1: x, Val2: y, ... }
    return Object.values(raw)
  }
  return [raw]
}

/**
 * Transforms a raw stat entry from Module:Ability/data/stats into a clean object.
 */
const transformAbilityStat = (rawStat) => {
  if (!rawStat || typeof rawStat !== 'object') return undefined

  const stat = {
    label: rawStat.Label || undefined,
    modifier: MODIFIER_MAP[rawStat.Modifier] ?? rawStat.Modifier ?? 'NONE',
    values: normalizeValues(rawStat.Values),
    max: rawStat.Max ?? undefined,
    helminthValues: Array.isArray(rawStat.HelminthValues) ? rawStat.HelminthValues : undefined,
    roundTo: rawStat.RoundTo ?? undefined,
  }

  // Remove undefined fields
  Object.keys(stat).forEach((k) => stat[k] === undefined && delete stat[k])
  return stat
}

/**
 * Transformer for Module:Ability/data entries from the Warframe Wiki.
 * If raw._stats is present (from Module:Ability/data/stats), it is transformed
 * and included as the `stats` array.
 */
const transformAbility = async (rawAbility, imageUrls) => {
  if (!rawAbility) return undefined

  // Transform stats if attached by the scraper
  let stats
  if (Array.isArray(rawAbility._stats)) {
    const transformed = rawAbility._stats.map(transformAbilityStat).filter(Boolean)
    if (transformed.length) stats = transformed
  }

  const result = {
    uniqueName: rawAbility.InternalName || undefined,
    name: rawAbility.Name || undefined,
    description: rawAbility.Description || undefined,
    key: rawAbility.Key || undefined,
    cost: rawAbility.Cost || undefined,
    costType: rawAbility.CostType || 'energy',
    powersuit: rawAbility.Powersuit || undefined,
    introduced: rawAbility.Introduced ? String(rawAbility.Introduced) : undefined,
    subsumable: rawAbility.Subsumable === true,
    augments: Array.isArray(rawAbility.Augments) ? rawAbility.Augments : undefined,
    weapon: rawAbility.Weapon || undefined,
    wikiLink: rawAbility.Link || undefined,
    cardImage: rawAbility.CardImage ? (imageUrls[rawAbility.CardImage] || rawAbility.CardImage) : undefined,
    icon: rawAbility.Icon ? (imageUrls[rawAbility.Icon] || rawAbility.Icon) : undefined,
    preview: rawAbility.Preview || undefined,
    previewFallback: rawAbility.PreviewFallback || undefined,
    stats,
  }

  Object.keys(result).forEach((k) => result[k] === undefined && delete result[k])
  return result
}

export default transformAbility
