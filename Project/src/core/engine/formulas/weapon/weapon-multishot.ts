/**
 * @domain Engine / Formulas / Weapon / Multishot
 * @SSoT docs/domains/engine/formula-overview.md
 */

export type AttackDeliveryType =
	| "hitscan-single"
	| "projectile-single"
	| "pellet-shot"
	| "beam-continuous"
	| "unknown";

export type MultishotResult = {
	guaranteed: number;
	chanceExtra: number;
	totalDecimal: number;
	isContinuous: boolean;
};

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

export function expectedHitInstances(result: MultishotResult): number {
	if (result.isContinuous) return 1;
	return result.guaranteed + result.chanceExtra;
}

export function beamTickScaleFactor(result: MultishotResult): number {
	return result.totalDecimal;
}
