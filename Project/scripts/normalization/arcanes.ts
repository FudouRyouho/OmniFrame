import type { ArcaneCategory, ArcaneCompatName } from '../../src/lib/types/arcane.ts'

type KnownArcaneCompatName = Exclude<ArcaneCompatName, 'unknown'>

export interface ArcaneNormalizationState {
  missingTypeCount: number
  unknownCategoryTypes: Map<string, number>
  unknownCompatTypes: Map<string, number>
}

export interface ArcaneNormalizationResult {
  category: ArcaneCategory
  compatName: ArcaneCompatName | null
}

const ARCANE_TYPE_TO_CATEGORY = {
  'Warframe Arcane': 'warframe',
  'Primary Arcane': 'primary',
  'Secondary Arcane': 'secondary',
  'Melee Arcane': 'melee',
  'Shotgun Arcane': 'primary',
  'Bow Arcane': 'primary',
  'Amp Arcane': 'amp',
  'Kitgun Arcane': 'secondary',
  'Zaw Arcane': 'melee',
  'Operator Arcane': 'operator',
  Arcane: 'unknown',
} as const satisfies Record<string, ArcaneCategory>

const ARCANE_TYPE_TO_COMPAT_NAME = {
  'Warframe Arcane': 'warframe',
  'Primary Arcane': 'primary',
  'Secondary Arcane': 'secondary',
  'Melee Arcane': 'melee',
  'Shotgun Arcane': 'shotgun',
  'Bow Arcane': 'bow',
  'Amp Arcane': 'amp',
  'Kitgun Arcane': 'kitgun',
  'Zaw Arcane': 'zaw',
  'Operator Arcane': 'operator',
} as const satisfies Record<string, KnownArcaneCompatName>

function incrementCount(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1)
}

function formatCountMap(map: Map<string, number>): string {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([value, count]) => `${value} (${count})`)
    .join(', ')
}

export function createArcaneNormalizationState(): ArcaneNormalizationState {
  return {
    missingTypeCount: 0,
    unknownCategoryTypes: new Map(),
    unknownCompatTypes: new Map(),
  }
}

export function normalizeArcaneSemantics(
  rawType: string | null | undefined,
  state: ArcaneNormalizationState,
): ArcaneNormalizationResult {
  if (!rawType) {
    state.missingTypeCount += 1
    return {
      category: 'unknown',
      compatName: null,
    }
  }

  const category = ARCANE_TYPE_TO_CATEGORY[rawType as keyof typeof ARCANE_TYPE_TO_CATEGORY] ?? 'unknown'
  const compatName = ARCANE_TYPE_TO_COMPAT_NAME[rawType as keyof typeof ARCANE_TYPE_TO_COMPAT_NAME] ?? 'unknown'

  if (!(rawType in ARCANE_TYPE_TO_CATEGORY)) {
    incrementCount(state.unknownCategoryTypes, rawType)
  }

  if (!(rawType in ARCANE_TYPE_TO_COMPAT_NAME)) {
    incrementCount(state.unknownCompatTypes, rawType)
  }

  return {
    category,
    compatName,
  }
}

export function reportArcaneNormalizationState(state: ArcaneNormalizationState) {
  if (state.missingTypeCount > 0) {
    console.log(
      `[generate-data][arcanes] raw.type ausente en ${state.missingTypeCount} items → category='unknown', compatName=null`,
    )
  }

  if (state.unknownCategoryTypes.size > 0) {
    console.warn(
      `[generate-data][arcanes] raw.type sin mapping de category: ${formatCountMap(state.unknownCategoryTypes)}`,
    )
  }

  if (state.unknownCompatTypes.size > 0) {
    console.warn(
      `[generate-data][arcanes] raw.type sin mapping de compatName: ${formatCountMap(state.unknownCompatTypes)}`,
    )
  }
}
