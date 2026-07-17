/**
 * @domain Engine / Formulas / Weapon / DPS del Arsenal
 * @SSoT references/wiki/mechanics/calculating-bonuses.md §DPS Formulas del Arsenal
 *
 * Fórmulas de DPS del Arsenal (Average Shot / Burst / Sustained). Extraídas de `CombatCalculator`
 * (P4, identidad — matemática idéntica, verificada equivalente a la wiki). Puras: reciben valores ya
 * resueltos (crit, multishot, cadencia, mag, reload); no leen entidades ni contexto.
 */

/** Average Shot: daño total × multiplicador de crit promedio × multishot. */
export function averageShot(totalDamage: number, avgCritMult: number, multishot: number): number {
  return totalDamage * avgCritMult * multishot;
}

/** Ley de recarga: `TiempoFinal = Base / (1 + ReloadSpeedBonus/100)` (el bonus llega como % ya sumado). */
export function finalReloadTime(baseReload: number, reloadBonusPct: number): number {
  return baseReload / (reloadBonusPct / 100);
}

export interface DpsInputs {
  /** Average Shot (ya con crit + multishot). */
  damagePerShot: number;
  fireRate: number;
  magSize: number;
  multishot: number;
  reloadTime: number;
}

/**
 * Burst = AverageShot × FireRate. Sustained = TotalMagDamage / (TiempoDeVaciado + Recarga).
 * (Equivalente a la forma `Burst × Shots/(Shots + FR×Reload)` de la wiki.)
 */
export function weaponDps(i: DpsInputs): { burst: number; sustained: number } {
  const burst = i.damagePerShot * i.fireRate;
  const shotsInMag = i.magSize / i.multishot;
  const timeToEmpty = shotsInMag / i.fireRate;
  const sustained = (i.damagePerShot * shotsInMag) / (timeToEmpty + i.reloadTime);
  return { burst, sustained };
}
