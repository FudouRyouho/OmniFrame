/**
 * @domain Engine / Formulas / Common / Critical
 * @SSoT references/wiki/mechanics/critical-hits.md
 */

export function totalCritChance(
	baseCritChance: number,
	relativeCritBonus: number,
	absoluteCritBonus = 0,
): number {
	return baseCritChance * (1 + relativeCritBonus) + absoluteCritBonus;
}

export function totalCritDamage(
	baseCritDamage: number,
	relativeCritDamageBonus: number,
	absoluteCritDamageBonus = 0,
): number {
	return baseCritDamage * (1 + relativeCritDamageBonus) + absoluteCritDamageBonus;
}

export type CritTierResult = {
	guaranteedTier: number;
	chanceToNextTier: number;
};

export function resolveCritTier(totalDecimal: number): CritTierResult {
	const clamped = Math.max(0, totalDecimal);
	const guaranteedTier = Math.floor(clamped);
	const chanceToNextTier = clamped - guaranteedTier;
	return { guaranteedTier, chanceToNextTier };
}

export function critTierMultiplier(tier: number, critDamage: number): number {
	return 1 + tier * (critDamage - 1);
}

export function averageCritMultiplier(critChanceDecimal: number, critDamage: number): number {
	return 1 + Math.max(0, critChanceDecimal) * (critDamage - 1);
}
