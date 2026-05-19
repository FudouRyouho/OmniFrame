/**
 * @domain Engine / Formulas / Weapon
 * @SSoT docs/domains/engine/status.md
 */

import { applyAdditiveBonus, round2 } from "../common/scaling-base";

interface WeaponAttackInput {
	name: string;
	total_damage: number;
	crit_chance: number;
	crit_mult: number;
	status_chance: number;
	fire_rate: number;
}

interface WeaponBaseInput {
	magazine_size: number;
	reload_time: number;
	multishot: number;
	attacks: WeaponAttackInput[];
}

export type WeaponAttackResult = {
	name: string;
	total_damage: number;
	crit_chance: number;
	crit_mult: number;
	status_chance: number;
	fire_rate: number;
	multishot: number;
	/** 1 + crit_chance * (crit_mult - 1) */
	average_crit_multiplier: number;
};

export type WeaponStatResult = {
	magazine_size: number;
	reload_time: number;
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
	multishot_calc: number,
): WeaponAttackResult {
	const crit_chance = round2(applyAdditiveBonus(attack.crit_chance, bonuses.WEAPON_CRIT_CHANCE ?? 0));
	const crit_mult   = round2(applyAdditiveBonus(attack.crit_mult,   bonuses.WEAPON_CRIT_DAMAGE ?? 0));
	return {
		name:                    attack.name,
		total_damage:            round2(applyAdditiveBonus(attack.total_damage,   bonuses.WEAPON_DAMAGE_AMOUNT ?? 0)),
		crit_chance,
		crit_mult,
		status_chance:           round2(applyAdditiveBonus(attack.status_chance,  bonuses.WEAPON_PROC_CHANCE ?? 0)),
		fire_rate:               round2(applyAdditiveBonus(attack.fire_rate,       bonuses.WEAPON_FIRE_RATE ?? 0)),
		multishot:               multishot_calc,
		average_crit_multiplier: round2(1 + crit_chance * (crit_mult - 1)),
	};
}

export function calculateWeaponStats(
	weapon: WeaponBaseInput,
	bonuses: WeaponModBonuses,
): WeaponStatResult {
	const reload_divisor = Math.max(0.01, 1 + (bonuses.WEAPON_RELOAD_SPEED ?? 0) / 100);
	const multishot_calc = round2(applyAdditiveBonus(weapon.multishot, bonuses.WEAPON_FIRE_ITERATIONS ?? 0));

	return {
		magazine_size: round2(applyAdditiveBonus(weapon.magazine_size, bonuses.WEAPON_CLIP_MAX ?? 0)),
		reload_time:   round2(weapon.reload_time / reload_divisor),
		attacks:       weapon.attacks.map(a => calculateAttack(a, bonuses, multishot_calc)),
	};
}
