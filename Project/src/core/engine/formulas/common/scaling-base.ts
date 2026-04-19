/**
 * @module scaling-base
 * @description Primitivas matematicas de escalado compartidas por todos los canales del engine.
 *
 * Estas funciones no conocen el canal (weapon, warframe, ability) ni el tipo de entidad.
 * Son operaciones puras sin estado que implementan los patrones documentados en:
 *   - Docs/domains/engine/formula-overview.md
 *   - Docs/domains/data/abilities/formula-patterns.md
 *
 * Fuente canonica:
 *   - https://wiki.warframe.com/w/Damage/Calculation
 *   - https://wiki.warframe.com/w/Abilities
 */

/**
 * Convierte un bonus porcentual en su forma multiplicativa.
 *
 * Formula documentada:
 *   multiplier = 1 + bonusPct / 100
 *
 * Ejemplos:
 *   additiveBonusMultiplier(100)  -> 2.0  (Serration al max)
 *   additiveBonusMultiplier(0)    -> 1.0  (sin bonus)
 *   additiveBonusMultiplier(-50)  -> 0.5  (penalizacion)
 *
 * @param bonusPct Bonus en puntos porcentuales (100 = +100%).
 */
export function additiveBonusMultiplier(bonusPct: number): number {
	return 1 + bonusPct / 100;
}

/**
 * Redondea un numero a dos cifras decimales.
 * Usado de forma consistente en todo el engine para evitar imprecisiones de punto flotante
 * en la capa de presentacion.
 *
 * @param value Numero a redondear.
 */
export function round2(value: number): number {
	return Math.round(value * 100) / 100;
}

/**
 * Restringe un valor entre un minimo y un maximo (clamp).
 *
 * Patron documentado en formula-patterns.md como "ambos caps":
 *   resultado = clamp(variable * baseValue, capMin, cap)
 *
 * @param value Valor a restringir.
 * @param min   Minimo permitido (inclusive).
 * @param max   Maximo permitido (inclusive).
 */
export function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

/**
 * Restringe el indice de rank al rango valido de un array de valores.
 * Se usa para leer valores de mods/arcanos sin salirse del array.
 *
 * @param rank   Rank equipado (0-based).
 * @param values Array de valores por rank.
 */
export function clampRank(rank: number, values: number[]): number {
	if (values.length === 0) return 0;
	return Math.max(0, Math.min(rank, values.length - 1));
}

/**
 * Calcula el stat final aplicando un conjunto de bonuses aditivos sobre la base.
 *
 * Formula dominante del engine (Docs/domains/engine/formula-overview.md):
 *   statFinal = base * (1 + suma_de_bonuses_del_mismo_upgradeType)
 *
 * @param base       Valor base del stat.
 * @param bonusPct   Suma total de bonuses porcentuales del mismo upgradeType.
 */
export function applyAdditiveBonus(base: number, bonusPct: number): number {
	return base * additiveBonusMultiplier(bonusPct);
}
