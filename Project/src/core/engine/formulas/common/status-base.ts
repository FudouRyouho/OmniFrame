/**
 * @domain Engine / Formulas / Common / Status
 * @SSoT docs/domains/semantic/damage-types.md
 */

import type { DamageType } from "@shared/types";

export const PRIMARY_ELEMENTS: ReadonlySet<DamageType> = new Set<DamageType>([
	"heat", "cold", "electricity", "toxin",
]);

export const ELEMENT_COMBINATIONS: ReadonlyArray<{
	a: DamageType;
	b: DamageType;
	result: DamageType;
}> = [
	{ a: "heat",        b: "cold",        result: "blast"     },
	{ a: "heat",        b: "electricity", result: "radiation" },
	{ a: "heat",        b: "toxin",       result: "gas"       },
	{ a: "cold",        b: "electricity", result: "magnetic"  },
	{ a: "cold",        b: "toxin",       result: "viral"     },
	{ a: "electricity", b: "toxin",       result: "corrosive" },
] as const;

export const SPECIAL_DAMAGE_TYPES: ReadonlySet<DamageType> = new Set<DamageType>([
	"void", "tau", "true",
]);

export function totalStatusChance(baseStatusChance: number, relativeBonus: number): number {
	return baseStatusChance * (1 + relativeBonus);
}

export function procWeightByType(
	damageBreakdown: Partial<Record<DamageType, number>>,
): Partial<Record<DamageType, number>> {
	const entries = Object.entries(damageBreakdown) as Array<[DamageType, number | undefined]>;
	const total = entries.reduce((sum, [, v]) => sum + (v ?? 0), 0);

	if (total <= 0) return {};

	const result: Partial<Record<DamageType, number>> = {};
	for (const [type, value] of entries) {
		if (value && value > 0) {
			result[type] = value / total;
		}
	}
	return result;
}

export function resolveElementalCombination(elements: ReadonlySet<DamageType>): DamageType | null {
	for (const combo of ELEMENT_COMBINATIONS) {
		if (elements.has(combo.a) && elements.has(combo.b)) {
			return combo.result;
		}
	}
	return null;
}
