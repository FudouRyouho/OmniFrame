/**
 * @domain Engine / Formulas / Common / Scaling
 * @SSoT references/wiki/mechanics/calculating-bonuses.md (ley del bonus aditivo `1 + Σ`)
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

/**
 * Familia `STACK_DECAY_BUFF` (arch-decisions §11): evento discreto → +val por stack, cap Nx.
 * `stacks` es C1-declarado (mismo escalón que `activeStacks` de CO) — no modela decay/duration
 * real (C2, diferido, `OQ-ENGINE-16`). Nace en `common/` (no `formulas/arcane/`, nunca existió):
 * el primer consumidor real es un mod (Galvanized), no un arcano — dispara la promoción que §11
 * ya anticipaba, sin necesidad de migrar nada.
 */
export function stackDecayBonusPct(perStackPct: number, stacks: number, cap: number): number {
	return perStackPct * clamp(stacks, 0, cap);
}

export function clampRank(rank: number, values: number[]): number {
	if (values.length === 0) return 0;
	return Math.max(0, Math.min(rank, values.length - 1));
}

export function applyAdditiveBonus(base: number, bonusPct: number): number {
	return base * additiveBonusMultiplier(bonusPct);
}
