/**
 * Taxonomia canonica de polarity types.
 *
 * Unifica AP_ANY y AP_UNIVERSAL del fork bajo el nombre canonico 'omni'.
 */
export type PolarityType =
  | 'madurai'
  | 'vazarin'
  | 'naramon'
  | 'zenurik'
  | 'unairu'
  | 'penjaga'
  | 'umbra'
  | 'omni'

export type PolarityFamily = 'focus' | 'companion' | 'special' | 'universal'

export interface PolarityTypeDefinition {
  family: PolarityFamily
  icon_asset: string | null
  aliases?: readonly string[]
  raw_tokens?: readonly string[]
  label: string
  description: string
}

export const POLARITY_TYPES: PolarityType[] = [
  'madurai',
  'vazarin',
  'naramon',
  'zenurik',
  'unairu',
  'penjaga',
  'umbra',
  'omni',
]

export const POLARITY_TYPE_DEFINITIONS: Record<PolarityType, PolarityTypeDefinition> = {
  madurai: {
    family: 'focus',
    icon_asset: 'madurai',
    raw_tokens: ['AP_ATTACK'],
    label: 'Madurai',
    description: 'Focus school — offensive',
  },
  vazarin: {
    family: 'focus',
    icon_asset: 'vazarin',
    raw_tokens: ['AP_DEFENSE'],
    label: 'Vazarin',
    description: 'Focus school — defensive',
  },
  naramon: {
    family: 'focus',
    icon_asset: 'naramon',
    raw_tokens: ['AP_TACTIC'],
    label: 'Naramon',
    description: 'Focus school — tactical',
  },
  zenurik: {
    family: 'focus',
    icon_asset: 'zenurik',
    raw_tokens: ['AP_POWER'],
    label: 'Zenurik',
    description: 'Focus school — energy',
  },
  unairu: {
    family: 'focus',
    icon_asset: 'unairu',
    raw_tokens: ['AP_WARD'],
    label: 'Unairu',
    description: 'Focus school — resistance',
  },
  penjaga: {
    family: 'companion',
    icon_asset: 'penjaga',
    raw_tokens: ['AP_PRECEPT'],
    label: 'Penjaga',
    description: 'Companion polarity',
  },
  umbra: {
    family: 'special',
    icon_asset: 'umbra',
    raw_tokens: ['AP_UMBRA'],
    label: 'Umbra',
    description: 'Umbra polarity — for Umbra mods',
  },
  omni: {
    family: 'universal',
    icon_asset: 'omni',
    aliases: ['universal', 'aura'],
    raw_tokens: ['AP_ANY', 'AP_UNIVERSAL'],
    label: 'Omni',
    description: 'Universal polarity — accepts any mod except Umbra',
  },
}

const POLARITY_TYPE_SET = new Set<PolarityType>(POLARITY_TYPES)

const POLARITY_TYPE_ALIAS_MAP = POLARITY_TYPES.reduce((map, type) => {
  map[type] = type

  for (const alias of POLARITY_TYPE_DEFINITIONS[type].aliases ?? []) {
    map[alias] = type
  }

  return map
}, {} as Record<string, PolarityType>)

export function isPolarityType(value: string): value is PolarityType {
  return POLARITY_TYPE_SET.has(value as PolarityType)
}

export function normalizePolarityType(value: string | PolarityType): PolarityType | null {
  const normalized = String(value).trim().toLowerCase()
  return POLARITY_TYPE_ALIAS_MAP[normalized] ?? null
}

export function getPolarityTypeDefinition(value: string | PolarityType) {
  const key = normalizePolarityType(value)

  if (!key) {
    return null
  }

  return {
    key,
    ...POLARITY_TYPE_DEFINITIONS[key],
  }
}

export function getPolarityTypeIconPath(value: string | PolarityType): string | null {
  const definition = getPolarityTypeDefinition(value)

  if (!definition?.icon_asset) {
    return null
  }

  return `/assets/polarity/${definition.icon_asset}.png`
}
