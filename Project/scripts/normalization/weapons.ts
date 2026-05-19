import type { WeaponShotType } from '../../src/shared/types/index.ts'

export interface WeaponNormalizationState {
  shotTypes: Set<string>
}

export function createWeaponNormalizationState(): WeaponNormalizationState {
  return {
    shotTypes: new Set<string>(),
  }
}

/**
 * Normaliza el shot_type. 
 * Si no viene en el raw, lo marcamos como null para auditoria.
 */
export function normalizeWeaponShotType(
  raw: string | null | undefined,
  state: WeaponNormalizationState
): WeaponShotType | null {
  if (!raw) return null
  state.shotTypes.add(raw)
  return raw as WeaponShotType
}

export function reportWeaponNormalizationState(state: WeaponNormalizationState): void {
  const shotTypes = Array.from(state.shotTypes).sort()
  console.log(`[generate-data][weapons] shot_type encontrados: ${shotTypes.join(', ')}`)
}
