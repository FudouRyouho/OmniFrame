/**
 * @domain Engine / Formulas / Common / Scaling
 * @SSoT docs/domains/engine/formula-overview.md
 */

export function additiveBonusMultiplier(bonusPct: number): number {
	return 1 + bonusPct / 100;
}

export function round2(value: number): number {
	return Math.round(value * 100) / 100;
}

export function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

export function clampRank(rank: number, values: number[]): number {
	if (values.length === 0) return 0;
	return Math.max(0, Math.min(rank, values.length - 1));
}

export function applyAdditiveBonus(base: number, bonusPct: number): number {
	return base * additiveBonusMultiplier(bonusPct);
}
