/**
 * @domain Engine / Formulas / Weapon
 * @SSoT docs/domains/engine/status.md
 */

import { applyAdditiveBonus, round2 } from "../common/scaling-base";

interface WeaponAttackInput {
	name: string;
	totalDamage: number;
	critChance: number;
	critMult: number;
	statusChance: number;
	fireRate: number;
}

interface WeaponBaseInput {
	magazineSize: number;
	reloadTime: number;
	multishot: number;
	attacks: WeaponAttackInput[];
}

export type WeaponAttackResult = {
	name: string;
	totalDamage: number;
	critChance: number;
	critMult: number;
	statusChance: number;
	fireRate: number;
	multishot: number;
	/** 1 + critChance * (critMult - 1) */
	averageCritMultiplier: number;
};

export type WeaponStatResult = {
	magazineSize: number;
	reloadTime: number;
	attacks: WeaponAttackResult[];
};

export type WeaponModBonuses = {
	WEAPON_DAMAGE_AMOUNT?: number;
	WEAPON_CRIT_CHANCE?: number;
	WEAPON_CRIT_DAMAGE?: number;
	WEAPON_PROC_CHANCE?: number;
	WEAPON_FIRE_RATE?: number;
	WEAPON_RELOAD_SPEED?: number;
	WEAPON_CLIP_MAX?: number;
	WEAPON_FIRE_ITERATIONS?: number;
};

function calculateAttack(
	attack: WeaponAttackInput,
	bonuses: WeaponModBonuses,
	multishotCalc: number,
): WeaponAttackResult {
	const critChance = round2(applyAdditiveBonus(attack.critChance, bonuses.WEAPON_CRIT_CHANCE ?? 0));
	const critMult   = round2(applyAdditiveBonus(attack.critMult,   bonuses.WEAPON_CRIT_DAMAGE ?? 0));
	return {
		name:                  attack.name,
		totalDamage:           round2(applyAdditiveBonus(attack.totalDamage,   bonuses.WEAPON_DAMAGE_AMOUNT ?? 0)),
		critChance,
		critMult,
		statusChance:          round2(applyAdditiveBonus(attack.statusChance,  bonuses.WEAPON_PROC_CHANCE ?? 0)),
		fireRate:              round2(applyAdditiveBonus(attack.fireRate,       bonuses.WEAPON_FIRE_RATE ?? 0)),
		multishot:             multishotCalc,
		averageCritMultiplier: round2(1 + critChance * (critMult - 1)),
	};
}

export function calculateWeaponStats(
	weapon: WeaponBaseInput,
	bonuses: WeaponModBonuses,
): WeaponStatResult {
	const reloadDivisor = Math.max(0.01, 1 + (bonuses.WEAPON_RELOAD_SPEED ?? 0) / 100);
	const multishotCalc = round2(applyAdditiveBonus(weapon.multishot, bonuses.WEAPON_FIRE_ITERATIONS ?? 0));

	return {
		magazineSize: round2(applyAdditiveBonus(weapon.magazineSize, bonuses.WEAPON_CLIP_MAX ?? 0)),
		reloadTime:   round2(weapon.reloadTime / reloadDivisor),
		attacks:      weapon.attacks.map(a => calculateAttack(a, bonuses, multishotCalc)),
	};
}
