/**
 * @domain Engine / Formulas / Weapon / ConditionOverload
 * @SSoT docs/domains/engine/formula-overview.md
 */

import { round2 } from "../common/scaling-base";

export type COBehaviorType = "adding" | "multiplying" | "none";

export type COModParams = {
	/** Bonus porcentual por status unico por stack (ej. 80 para CO, 40 para Galvanized). */
	perStatusBonusPct: number;
	/** Stacks activos del mod galvanized (siempre 1 para CO clasico). */
	activeStacks: number;
};

export type WeaponCOResult = {
	behavior: COBehaviorType;
	coBonusPct: number;
	finalDamageWithCO: number;
};

export function coBonusPct(mod: COModParams, uniqueStatusCount: number): number {
	return mod.perStatusBonusPct * mod.activeStacks * uniqueStatusCount;
}

export function applyConditionOverload(
	baseDamage: number,
	additiveDamageBonusPct: number,
	coBonusPctValue: number,
	behavior: COBehaviorType,
	otherMultipliers = 1,
): WeaponCOResult {
	let finalDamageWithCO: number;

	if (behavior === "adding") {
		finalDamageWithCO = baseDamage
			* (1 + (additiveDamageBonusPct + coBonusPctValue) / 100)
			* otherMultipliers;
	} else if (behavior === "multiplying") {
		finalDamageWithCO = baseDamage
			* (1 + additiveDamageBonusPct / 100)
			* (1 + coBonusPctValue / 100)
			* otherMultipliers;
	} else {
		// behavior "none": CO no aplica
		finalDamageWithCO = baseDamage
			* (1 + additiveDamageBonusPct / 100)
			* otherMultipliers;
	}

	return {
		behavior,
		coBonusPct: coBonusPctValue,
		finalDamageWithCO: round2(finalDamageWithCO),
	};
}
