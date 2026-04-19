/**
 * @module weapon-core
 * @description Cálculo de stats de arma por ataque — Engine v1.
 *
 * Recibe WeaponBase (con attacks[] ya normalizados por generate-data) y
 * los bonuses de mods agregados. Devuelve WeaponStatResult con:
 *   - stats weapon-level (magazine, reload) calculados una vez
 *   - stats per-attack (damage, crit, status, fireRate) calculados por ataque
 *   - averageCritMultiplier por ataque: 1 + critChance * (critMult - 1)
 *
 * Los mods de arma son weapon-level: se agregan una vez y se aplican a todos
 * los ataques por igual (C38).
 *
 * UpgradeTypes confirmados del override real (2026-03-28):
 *   WEAPON_DAMAGE_AMOUNT   - Serration, Hornet Strike, Pressure Point
 *   WEAPON_CRIT_CHANCE     - Point Strike, Pistol Gambit, True Steel
 *   WEAPON_CRIT_DAMAGE     - Vital Sense, Primed Pistol Gambit
 *   WEAPON_PROC_CHANCE     - Rifle Aptitude, Shotgun Savvy
 *   WEAPON_FIRE_RATE       - Speed Trigger, Lethal Torrent (parte)
 *   WEAPON_RELOAD_SPEED    - Fast Hands, Primed Fast Hands
 *   WEAPON_CLIP_MAX        - Primed Magazine Warp, Ammo Stock
 *   WEAPON_FIRE_ITERATIONS - Split Chamber, Barrel Diffusion, Hell's Chamber
 *
 * Fuentes:
 *   - Docs/domains/engine/formula-overview.md
 *   - Docs/decisions/stage-0-architecture-decisions.md (C38, C39)
 */

import { applyAdditiveBonus, round2 } from "../common/scaling-base";

// --- Input duck-typing interfaces ---

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

// --- Output types ---

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

/**
 * Bonuses agregados por upgradeType para un arma.
 * Todos los valores son sumas de porcentajes (100 = +100%).
 */
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

/**
 * Calcula un ataque individual aplicando mods weapon-level.
 *
 * multishot se aplica UNA VEZ por arma pero se expone en cada ataque
 * para que la UI pueda mostrarlo por ataque (C38).
 */
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

/**
 * Calcula los stats finales de un arma aplicando sus mods.
 *
 * Reload: el bonus aumenta la velocidad → reduce el tiempo.
 *   reloadFinal = reloadBase / (1 + reloadBonus / 100)
 *
 * Magazine: bonus aditivo estándar.
 *
 * Multishot: bonus aditivo, calculado weapon-level, expuesto por ataque.
 *
 * @param weapon  WeaponBase ya normalizado por generate-data (duck-typed).
 * @param bonuses Mapa upgradeType → bonus porcentual total acumulado.
 */
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
