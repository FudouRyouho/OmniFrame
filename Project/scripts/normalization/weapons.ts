import type { WeaponShotType } from '../../src/lib/types/damage.ts'

export interface WeaponNormalizationState {
  missingShotTypeCount: number
  unknownShotTypes: Map<string, number>
}

const RAW_SHOT_TYPE_TO_CANONICAL = {
  aoe: 'AoE',
  projectile: 'Projectile',
  'hit-scan': 'Hit-Scan',
  hitscan: 'Hit-Scan',
  thrown: 'Thrown',
  dot: 'DoT',
} as const satisfies Record<string, Exclude<WeaponShotType, 'unknown'>>

function incrementCount(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1)
}

function formatCountMap(map: Map<string, number>): string {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([value, count]) => `${value} (${count})`)
    .join(', ')
}

export function createWeaponNormalizationState(): WeaponNormalizationState {
  return {
    missingShotTypeCount: 0,
    unknownShotTypes: new Map(),
  }
}

export function normalizeWeaponShotType(
  rawShotType: string | null | undefined,
  state: WeaponNormalizationState,
): WeaponShotType | null {
  if (!rawShotType || rawShotType.trim() === '') {
    state.missingShotTypeCount += 1
    return null
  }

  const normalized = rawShotType.trim().toLowerCase()
  const canonical = RAW_SHOT_TYPE_TO_CANONICAL[normalized as keyof typeof RAW_SHOT_TYPE_TO_CANONICAL]

  if (canonical) {
    return canonical
  }

  incrementCount(state.unknownShotTypes, rawShotType.trim())
  return 'unknown'
}

export function reportWeaponNormalizationState(state: WeaponNormalizationState) {
  if (state.missingShotTypeCount > 0) {
    console.log(
      `[generate-data][weapons] shot_type ausente en ${state.missingShotTypeCount} ataques → valor null`,
    )
  }

  if (state.unknownShotTypes.size > 0) {
    console.warn(
      `[generate-data][weapons] shot_type sin vocabulario canonico: ${formatCountMap(state.unknownShotTypes)}`,
    )
  }
}
