/**
 * @domain Engine / Formulas / Weapon / Critical
 * @SSoT docs/domains/engine/formula-overview.md
 */

import {
	totalCritChance,
	totalCritDamage,
	resolveCritTier,
	averageCritMultiplier,
	type CritTierResult,
} from "../common/crit-base";
import { round2 } from "../common/scaling-base";

export type WeaponCritResult = {
	tierResult: CritTierResult;
	averageMultiplier: number;
};

export function calculateWeaponCrit(
	baseCritChance: number,
	baseCritDamage: number,
	relativeCritChancePct: number,
	relativeCritDamagePct: number,
	absoluteCritChance = 0,
	absoluteCritDamage = 0,
): WeaponCritResult {
	const moddedCritChance = totalCritChance(
		baseCritChance,
		relativeCritChancePct / 100,
		absoluteCritChance,
	);
	const moddedCritDamage = totalCritDamage(
		baseCritDamage,
		relativeCritDamagePct / 100,
		absoluteCritDamage,
	);
	const tierResult = resolveCritTier(moddedCritChance);
	const avg = averageCritMultiplier(moddedCritChance, moddedCritDamage);

	return {
		moddedCritChance: round2(moddedCritChance),
		moddedCritDamage: round2(moddedCritDamage),
		tierResult,
		averageMultiplier: round2(avg),
	};
}

export function expectedDamagePerTrigger(
	moddedDamage: number,
	expectedInstances: number,
	critAvgMultiplier: number,
): number {
	return round2(moddedDamage * expectedInstances * critAvgMultiplier);
}
