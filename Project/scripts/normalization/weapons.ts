import type { WeaponShotType } from '../../src/shared/types/index.ts'

export interface WeaponNormalizationState {
  shotTypes: Set<string>
  /** Ataques que recibieron min/max spread de la cosecha wiki. */
  spreadApplied: number
  /**
   * Claves `AttackName` que la wiki trae con spread y que no casaron con ningún ataque
   * nuestro. Es el modo de falla que importa: un spread que no aterriza no rompe nada
   * visible, simplemente no está — y un número ausente se confunde con "el arma no
   * dispersa". Se reporta ruidoso.
   */
  spreadUnmatched: string[]
}

export function createWeaponNormalizationState(): WeaponNormalizationState {
  return {
    shotTypes: new Set<string>(),
    spreadApplied: 0,
    spreadUnmatched: [],
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
  // Cero es señal de rotura, no de dataset vacío: el spread no viene del export sino de la
  // cosecha wiki (`omniframe-items`), y esa cosecha degrada a `{}` sin excepción si el fetch
  // falla. Sin este aviso, un regenerado ciego vacía 556 valores en un commit — el fósil de
  // `Enemy.json` otra vez. Ruidoso a propósito.
  if (state.spreadApplied === 0) {
    console.warn(
      `[generate-data][weapons] ⚠️ NINGÚN ataque recibió spread.\n` +
        `  El dato viene de Module:Weapons/data vía omniframe-items, no del export.\n` +
        `  Correr:  npm run build  (en omniframe-items/)  y regenerar.\n` +
        `  Si se commitea así, se pierden ~556 valores en silencio.`,
    )
  } else {
    console.log(`[generate-data][weapons] spread aplicado a ${state.spreadApplied} ataques`)
  }

  if (state.spreadUnmatched.length > 0) {
    console.warn(
      `[generate-data][weapons] ⚠️ ${state.spreadUnmatched.length} spread sin ataque que lo reciba:\n` +
        state.spreadUnmatched.map((entry) => `  · ${entry}`).join('\n'),
    )
  }
}
