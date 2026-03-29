/**
 * @module weapon-multishot
 * @description Adaptador de multishot para armas.
 *
 * Calcula el projectile count esperado por disparo y diferencia entre
 * el comportamiento de armas normales (proyectil/pellet) y armas de haz continuo (beam).
 *
 * Esta distincion es importante porque:
 *   - En proyectiles/pellets: multishot crea instancias adicionales con tiradas
 *     propias de crit y status.
 *   - En beams: multishot no crea ticks adicionales; escala el dano del tick existente
 *     y la status chance efectiva de ese tick.
 *
 * Fuente canonica:
 *   - Docs/reference/wiki/mechanics/multishot.md
 *   - https://wiki.warframe.com/w/Multishot
 *   - https://wiki.warframe.com/w/Continuous_Weapon
 *
 * Formulas implementadas:
 *   totalProjectiles = baseProjectileCount * (1 + multishotModifier / 100)
 *   guaranteedProjectiles = floor(totalProjectiles)
 *   chanceExtraProjectile = frac(totalProjectiles)
 *
 *   Para beams:
 *     beamEffectiveStatusChancePerTick = baseStatusChance * totalProjectilesDecimal
 *
 * Fuera de alcance de este modulo:
 *   - accuracy y spread real por distancia
 *   - casos especiales de speargun throw
 *   - armas con multishot innate no reflejado en el dataset
 */

/**
 * Tipos de delivery de ataque reconocidos por el engine v1.
 * Fuente: Docs/reference/wiki/mechanics/multishot.md (seccion "Casos que el engine debe distinguir")
 */
export type AttackDeliveryType =
	| "hitscan-single"
	| "projectile-single"
	| "pellet-shot"
	| "beam-continuous"
	| "unknown";

/**
 * Resultado del calculo de multishot para un disparo.
 */
export type MultishotResult = {
	/** Proyectiles garantizados por disparo. */
	guaranteed: number;
	/** Probabilidad de proyectil adicional (0.0 - 1.0). */
	chanceExtra: number;
	/**
	 * Valor decimal total (ej. 2.8 = 2 garantizados + 80% de chance de un tercero).
	 * Util para calculos de dano esperado y DPS.
	 */
	totalDecimal: number;
	/**
	 * Indica si el arma es de haz continuo (beam).
	 * En ese caso multishot escala el dano del tick y la status chance efectiva,
	 * NO crea instancias adicionales de crit/status.
	 */
	isContinuous: boolean;
};

/**
 * Calcula el projectile count esperado y la forma del multishot para un arma.
 *
 * Formula (Docs/reference/wiki/mechanics/multishot.md):
 *   totalProjectiles = baseProjectileCount * (1 + multishotModifier / 100)
 *   guaranteed = floor(totalProjectiles)
 *   chanceExtra = frac(totalProjectiles)
 *
 * @param baseProjectileCount  Proyectiles base del arma (normalmente 1; shotguns pueden tener mas).
 * @param multishotModifierPct Bonus porcentual total de mods de multishot (100 = +100%).
 * @param deliveryType         Tipo de delivery del ataque, para distinguir beam de proyectil.
 */
export function calculateMultishot(
	baseProjectileCount: number,
	multishotModifierPct: number,
	deliveryType: AttackDeliveryType = "unknown",
): MultishotResult {
	const base = Math.max(1, baseProjectileCount);
	const totalDecimal = base * (1 + multishotModifierPct / 100);
	const guaranteed = Math.floor(totalDecimal);
	const chanceExtra = totalDecimal - guaranteed;
	const isContinuous = deliveryType === "beam-continuous";

	return { guaranteed, chanceExtra, totalDecimal, isContinuous };
}

/**
 * Calcula el numero esperado de instancias de impacto por disparo (para DPS promedio).
 *
 * Para proyectiles/pellets:
 *   expectedInstances = guaranteed + chanceExtra
 *
 * Para beams:
 *   No se multiplican instancias; el valor es 1 (el tick). El dano del tick
 *   se escala por totalDecimal en el calculo de beam (ver beamTickScaleFactor).
 *
 * @param result Resultado de calculateMultishot.
 */
export function expectedHitInstances(result: MultishotResult): number {
	if (result.isContinuous) return 1;
	return result.guaranteed + result.chanceExtra;
}

/**
 * Factor de escala del tick para armas beam.
 *
 * En beam/continuous weapons, multishot no crea ticks adicionales sino que
 * escala el dano y la status chance del tick existente.
 *
 * Formula (Docs/reference/wiki/mechanics/multishot.md, seccion "Continuous / beam weapons"):
 *   beamTickDamage = baseTickDamage * totalProjectilesDecimal
 *   beamEffectiveStatusChancePerTick = baseStatusChance * totalProjectilesDecimal
 *
 * @param result Resultado de calculateMultishot (debe ser isContinuous = true).
 */
export function beamTickScaleFactor(result: MultishotResult): number {
	return result.totalDecimal;
}
