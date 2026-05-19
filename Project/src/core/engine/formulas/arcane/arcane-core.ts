/**
 * @domain Engine / Formulas / Arcane
 * @SSoT docs/domains/engine/status.md
 * @status bloqueado — Pendiente arcane-stats.override.json
 */

export type ArcaneOverrideStat = {
	upgradeType: string;
	values: number[];
};

export type ArcaneOverrideEntry = {
	name: string;
	rank: number | null;
	stats: ArcaneOverrideStat[];
};

export type ArcaneOverrideMap = Record<string, ArcaneOverrideEntry>;

export type EquippedArcane = {
	uniqueName: string;
	rank: number;
};

export type ArcaneBonus = {
	bonuses: Record<string, number>;
	missing: string[];
};

/** Excluidos v1 por complejidad de activación. */
export const ARCANE_V1_EXCLUSIONS: Record<string, string> = {
	"Arcane_Energize": "on-energy-pickup",
	"Arcane_Velocity": "on-crit",
	"Arcane_Strike":   "on-hit",
	"Arcane_Fury":     "on-melee-hit",
};

export function collectArcaneBonuses(
	arcanes: EquippedArcane[],
	overrides: ArcaneOverrideMap,
): ArcaneBonus {
	const bonuses: Record<string, number> = {};
	const missing: string[] = [];

	for (const equipped of arcanes) {
		const override = overrides[equipped.uniqueName];
		if (!override || !Array.isArray(override.stats) || override.stats.length === 0) {
			missing.push(equipped.uniqueName);
			continue;
		}

		for (const stat of override.stats) {
			const index = Math.max(0, Math.min(equipped.rank, stat.values.length - 1));
			const value = stat.values[index] ?? 0;
			bonuses[stat.upgradeType] = (bonuses[stat.upgradeType] ?? 0) + value;
		}
	}

	return { bonuses, missing };
}
