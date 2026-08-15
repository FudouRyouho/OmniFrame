/**
 * @domain Engine / Formulas / Status / ProcSelection
 * @SSoT references/wiki/mechanics/status-effects.md §Aplicación
 *
 * LEY de SELECCIÓN de status (qué proc sale): ponderado por la participación de cada tipo de
 * daño en el hit (`Proc Type Chance = Damage ÷ Total Damage`). Migrada desde `common/status-base.ts`
 * (arch-decisions §14 / O2): es ley de status, no de tipo de daño. El `ELEMENT_COMBINATIONS`
 * (qué elemento RESULTA de combinar dos primarios) se queda en `common/status-base.ts` — es ley
 * de tipo de daño, eje ortogonal.
 */

import type { DamageType } from "@shared/types";

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
