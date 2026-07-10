/**
 * @domain Engine / Formulas / Weapon / Status
 * @SSoT docs/semantic/damage-types.md
 */

import type { DamageType } from "@shared/types";
import { totalStatusChance, resolveElementalCombination, PRIMARY_ELEMENTS } from "../common/status-base";
import { procWeightByType } from "../status/proc-selection";
import { round2 } from "../common/scaling-base";

export type WeaponStatusResult = {
	moddedStatusChance: number;
	procWeights: Partial<Record<DamageType, number>>;
	combinedElement: DamageType | null;
	expectedProcsPerTrigger: number;
};

export function calculateWeaponStatus(
	baseStatusChance: number,
	relativeStatusPct: number,
	damageBreakdown: Partial<Record<DamageType, number>>,
	expectedInstances: number,
): WeaponStatusResult {
	const moddedStatusChance = totalStatusChance(baseStatusChance, relativeStatusPct / 100);
	const procWeights = procWeightByType(damageBreakdown);

	// Detecta elementales primarios presentes para calcular combinacion elemental.
	const presentPrimaries = new Set<DamageType>(
		(Object.keys(damageBreakdown) as DamageType[]).filter(
			(t) => PRIMARY_ELEMENTS.has(t) && (damageBreakdown[t] ?? 0) > 0,
		),
	);
	const combinedElement = resolveElementalCombination(presentPrimaries);

	const expectedProcsPerTrigger = round2(expectedInstances * moddedStatusChance);

	return {
		moddedStatusChance: round2(moddedStatusChance),
		procWeights,
		combinedElement,
		expectedProcsPerTrigger,
	};
}
