/**
 * @domain Engine / Formulas / Common / Status
 * @SSoT docs/semantic/damage-types.md
 *
 * Ley de TIPO de daño (combinación elemental) + status chance del arma. La ley de SELECCIÓN
 * de proc (`procWeightByType`) se movió a `formulas/status/proc-selection.ts` (arch-decisions §14):
 * es ley de status, no de tipo de daño.
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

export function totalStatusChance(baseStatusChance: number, relativeBonus: number): number {
	return baseStatusChance * (1 + relativeBonus);
}

export function resolveElementalCombination(elements: ReadonlySet<DamageType>): DamageType | null {
	for (const combo of ELEMENT_COMBINATIONS) {
		if (elements.has(combo.a) && elements.has(combo.b)) {
			return combo.result;
		}
	}
	return null;
}
