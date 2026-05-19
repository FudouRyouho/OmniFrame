/**
 * @domain Engine / Formulas / Warframe
 * @SSoT docs/domains/engine/status.md
 */

import { applyAdditiveBonus, round2 } from "../common/scaling-base";

interface WarframeBaseStats {
	health: number;
	shield: number;
	armor: number;
	power: number;
	sprint_speed: number;
}

export type StatResult = {
	base: number;
	calculated: number;
};

export type WarframeStatResult = {
	stats: {
		health: StatResult;
		shield: StatResult;
		armor: StatResult;
		energy: StatResult;
		sprint_speed: StatResult;
	};
};

export type WarframeModBonuses = {
	AVATAR_HEALTH_MAX?: number;
	AVATAR_SHIELD_MAX?: number;
	AVATAR_ARMOUR?: number;
	AVATAR_POWER_MAX?: number;
	AVATAR_SPRINT_SPEED?: number;
};

export function calculateWarframeStats(
	warframe: WarframeBaseStats,
	bonuses: WarframeModBonuses,
): WarframeStatResult {
	return {
		stats: {
			health: {
				base: warframe.health,
				calculated: round2(applyAdditiveBonus(warframe.health, bonuses.AVATAR_HEALTH_MAX ?? 0)),
			},
			shield: {
				base: warframe.shield,
				calculated: round2(applyAdditiveBonus(warframe.shield, bonuses.AVATAR_SHIELD_MAX ?? 0)),
			},
			armor: {
				base: warframe.armor,
				calculated: round2(applyAdditiveBonus(warframe.armor, bonuses.AVATAR_ARMOUR ?? 0)),
			},
			energy: {
				base: warframe.power,
				calculated: round2(applyAdditiveBonus(warframe.power, bonuses.AVATAR_POWER_MAX ?? 0)),
			},
			sprint_speed: {
				base: warframe.sprint_speed,
				calculated: round2(applyAdditiveBonus(warframe.sprint_speed, bonuses.AVATAR_SPRINT_SPEED ?? 0)),
			},
		},
	};
}
