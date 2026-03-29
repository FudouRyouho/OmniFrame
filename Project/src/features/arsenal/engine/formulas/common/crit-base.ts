/**
 * @module crit-base
 * @description Primitivas canonicas de criticos compartidas por todos los canales del engine.
 *
 * La matematica base de criticos es comun a armas, habilidades con crit habilitado (ej. Gyre)
 * y cualquier fuente futura con soporte documentado. Lo que cambia entre canales NO es esta
 * matematica sino las reglas de aplicacion (quien puede critar, cuando y como).
 *
 * Fuente canonica primaria:
 *   - Docs/reference/wiki/mechanics/critical-hits.md
 *   - https://wiki.warframe.com/w/Critical_Hit
 *   - https://wiki.warframe.com/w/Damage/Calculation
 *
 * Formulas implementadas:
 *   totalCritChance = baseCritChance * (1 + relativeCritBonus) + absoluteCritBonus
 *   totalCritDamage = baseCritDamage * (1 + relativeCritDamageBonus) + absoluteCritDamageBonus
 *   tier = floor(totalDecimal)
 *   chanceToNextTier = frac(totalDecimal)
 *   criticalTierMultiplier = 1 + tier * (totalCritDamage - 1)
 *   averageDamageMultiplier = 1 + totalCritChanceDecimal * (totalCritDamage - 1)
 *
 * Nota: la mayoria de habilidades NO pueden critar. Las excepciones son canon documentado
 * (Gyre via Passive + Cathode Grace, Voruna Ulfrun's Descent, Nokko Sporespring).
 * La decision de si un canal puede usar estas primitivas corresponde al adaptador, no aqui.
 *
 * Fuera de alcance de este modulo:
 *   - quantization exacta del base critical damage
 *   - headcrit completo por tipo de enemigo
 *   - casos raros de buffs que alteran base antes de quantization
 */

/**
 * Calcula el crit chance total en formato decimal (0.0 - N.0+).
 *
 * Formula:
 *   totalCritChance = baseCritChance * (1 + relativeCritBonus) + absoluteCritBonus
 *
 * Donde:
 *   - baseCritChance: valor base del arma/habilidad en decimal (0.25 = 25%)
 *   - relativeCritBonus: suma de mods relativos en decimal (Point Strike +150% -> 1.50)
 *   - absoluteCritBonus: suma de bonuses flat en decimal (Archon Shards, Cathode Grace, etc.)
 *
 * @param baseCritChance     Crit chance base en decimal (no porcentaje).
 * @param relativeCritBonus  Suma de bonuses relativos en decimal.
 * @param absoluteCritBonus  Suma de bonuses absolutos/flat en decimal. Default 0.
 */
export function totalCritChance(
	baseCritChance: number,
	relativeCritBonus: number,
	absoluteCritBonus = 0,
): number {
	return baseCritChance * (1 + relativeCritBonus) + absoluteCritBonus;
}

/**
 * Calcula el crit damage total en formato decimal (1.0 significa sin bonus).
 *
 * Formula:
 *   totalCritDamage = baseCritDamage * (1 + relativeCritDamageBonus) + absoluteCritDamageBonus
 *
 * @param baseCritDamage            Crit multiplier base en decimal (2.0 = 2x).
 * @param relativeCritDamageBonus   Suma de mods relativos sobre crit damage en decimal.
 * @param absoluteCritDamageBonus   Suma de bonuses flat en decimal. Default 0.
 */
export function totalCritDamage(
	baseCritDamage: number,
	relativeCritDamageBonus: number,
	absoluteCritDamageBonus = 0,
): number {
	return baseCritDamage * (1 + relativeCritDamageBonus) + absoluteCritDamageBonus;
}

/**
 * Resultado de la resolucion de tiers de crit.
 * Tier garantizado + chance de tier adicional.
 *
 * Ejemplo:
 *   totalDecimal 0.75 -> tier 0, chanceToNextTier 0.75
 *   totalDecimal 1.75 -> tier 1, chanceToNextTier 0.75
 *   totalDecimal 2.40 -> tier 2, chanceToNextTier 0.40
 */
export type CritTierResult = {
	/** Tier de crit garantizado (0 = sin crit garantizado). */
	guaranteedTier: number;
	/** Probabilidad de subir al siguiente tier (0.0 - 1.0). */
	chanceToNextTier: number;
};

/**
 * Resuelve el tier de crit a partir del crit chance total en decimal.
 *
 * Formula (Docs/reference/wiki/mechanics/critical-hits.md):
 *   tier = floor(totalCritChanceDecimal)
 *   chanceToNextTier = frac(totalCritChanceDecimal)
 *
 * @param totalDecimal Crit chance total en decimal (resultado de totalCritChance).
 */
export function resolveCritTier(totalDecimal: number): CritTierResult {
	const clamped = Math.max(0, totalDecimal);
	const guaranteedTier = Math.floor(clamped);
	const chanceToNextTier = clamped - guaranteedTier;
	return { guaranteedTier, chanceToNextTier };
}

/**
 * Multiplicador de dano para un tier de crit especifico.
 *
 * Formula (Docs/reference/wiki/mechanics/critical-hits.md):
 *   criticalTierMultiplier = 1 + tier * (totalCritDamage - 1)
 *
 * Ejemplos:
 *   tier 0 -> 1.0       (sin crit)
 *   tier 1 -> critDamage normal
 *   tier 2 -> agrega otro exceso sobre 1.0 (orange crit)
 *   tier 3 -> red crit
 *
 * @param tier          Tier de crit (entero >= 0).
 * @param critDamage    Crit damage total en decimal (resultado de totalCritDamage).
 */
export function critTierMultiplier(tier: number, critDamage: number): number {
	return 1 + tier * (critDamage - 1);
}

/**
 * Multiplicador de dano promedio esperado considerando crit chance.
 * Util para comparar builds sin simular cada hit.
 *
 * Formula (Docs/reference/wiki/mechanics/critical-hits.md):
 *   averageDamageMultiplier = 1 + totalCritChanceDecimal * (totalCritDamage - 1)
 *
 * Contempla crit chance > 100% correctamente (ej. 1.75 para orange crit frecuente).
 *
 * @param critChanceDecimal Crit chance total en decimal (puede superar 1.0).
 * @param critDamage        Crit damage total en decimal.
 */
export function averageCritMultiplier(critChanceDecimal: number, critDamage: number): number {
	return 1 + Math.max(0, critChanceDecimal) * (critDamage - 1);
}
