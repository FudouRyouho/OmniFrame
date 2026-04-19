/**
 * @module engine/index
 * @description Engine v1 — orquestador de cálculo puro.
 *
 * Implementa: calculate(resolved: ResolvedLayout, context: CalculationContext): EngineOutput
 *
 * El Engine recibe ResolvedLayout (B2) — base stats + lista plana de ResolvedStat[] por canal,
 * ya resuelta por el Resolver — y devuelve EngineOutput (B3) con los stats calculados.
 *
 * El Engine:
 *   - NO accede a ningún JSON ni dataset
 *   - NO tiene estado interno
 *   - Agrega ResolvedStat[] por upgradeType (suma) y delega fórmulas a los módulos de formulas/
 *   - Para armas: agrega mods weapon-level y aplica a cada ataque por separado (C38)
 *   - Ruteado de AVATAR_ABILITY_STRENGTH: no va a los stats base — va a abilityStrength (C35/NOTA-A)
 *
 * Contratos cerrados: C35, C36, C37, C38 — Docs/decisions/stage-0-architecture-decisions.md
 * Fórmulas: Docs/domains/engine/formula-overview.md
 */

import { round2 } from "./formulas/common/scaling-base";
import {
	calculateWarframeStats,
	type WarframeModBonuses,
} from "./formulas/warframe/warframe-core";
import {
	calculateWeaponStats,
	type WeaponModBonuses,
} from "./formulas/weapon/weapon-core";

// =============================================================================
// BOUNDARY B2 — ResolvedLayout (Resolver → Engine)
// =============================================================================

export type AttackDeliveryType =
	| "hitscan-single"
	| "projectile-single"
	| "projectile-charged"
	| "pellet-shot"
	| "beam-continuous"
	| "aoe"
	| "dot-secondary"
	| "thrown"
	| "unknown";

export type DamageMap = Partial<Record<string, number>>;

export interface WeaponAttack {
	name: string;
	totalDamage: number;
	damage: DamageMap;
	critChance: number;
	critMult: number;
	statusChance: number;
	fireRate: number;
	deliveryType: AttackDeliveryType;
}

export interface WeaponBase {
	uniqueName: string;
	magazineSize: number;
	reloadTime: number;
	multishot: number;
	attacks: WeaponAttack[];
}

export interface WarframeBase {
	uniqueName: string;
	health: number;
	shield: number;
	armor: number;
	power: number;
	sprintSpeed: number;
}

export interface ResolvedStat {
	upgradeType: string;
	value: number;
	condition: string | null;
}

export interface ResolvedChannel<TBase> {
	base: TBase;
	stats: ResolvedStat[];
}

export interface ResolvedLayout {
	warframe?: ResolvedChannel<WarframeBase>;
	primaryWeapon?: ResolvedChannel<WeaponBase>;
	secondaryWeapon?: ResolvedChannel<WeaponBase>;
	meleeWeapon?: ResolvedChannel<WeaponBase>;
}

export interface CalculationContext {
	// v1: vacío — todas las condiciones tratadas como activas
	// v1+: ConditionState[] con las condiciones activas del jugador
}

// =============================================================================
// BOUNDARY B3 — EngineOutput (Engine → Resolver)
// =============================================================================

export interface WarframeStatOutput {
	health: number;
	shield: number;
	armor: number;
	power: number;
	sprintSpeed: number;
	/**
	 * Multiplicador de Ability Strength derivado de AVATAR_ABILITY_STRENGTH.
	 * Canal separado — no afecta los stats base del Warframe (NOTA-A).
	 * Solo presente si hay mods de Ability Strength equipados.
	 * Ejemplo: Intensify rank 5 (30%) → abilityStrength = 1.30
	 */
	abilityStrength?: number;
}

export interface WeaponAttackOutput {
	name: string;
	totalDamage: number;
	critChance: number;
	critMult: number;
	statusChance: number;
	fireRate: number;
	multishot: number;
	/** 1 + critChance * (critMult - 1) */
	averageCritMultiplier: number;
}

export interface WeaponStatOutput {
	magazineSize: number;
	reloadTime: number;
	/** Mismo orden y largo que WeaponBase.attacks[] (C38). */
	attacks: WeaponAttackOutput[];
}

export interface EngineOutput {
	warframe?: WarframeStatOutput;
	primaryWeapon?: WeaponStatOutput;
	secondaryWeapon?: WeaponStatOutput;
	meleeWeapon?: WeaponStatOutput;
}

// =============================================================================
// IMPLEMENTACIÓN
// =============================================================================

/** Agrega ResolvedStat[] en un mapa upgradeType → suma de valores. */
function aggregateStats(stats: ResolvedStat[]): Record<string, number> {
	const agg: Record<string, number> = {};
	for (const stat of stats) {
		agg[stat.upgradeType] = (agg[stat.upgradeType] ?? 0) + stat.value;
	}
	return agg;
}

function calculateWarframeChannel(channel: ResolvedChannel<WarframeBase>): WarframeStatOutput {
	const agg = aggregateStats(channel.stats);

	const modBonuses: WarframeModBonuses = {
		AVATAR_HEALTH_MAX:   agg.AVATAR_HEALTH_MAX,
		AVATAR_SHIELD_MAX:   agg.AVATAR_SHIELD_MAX,
		AVATAR_ARMOUR:       agg.AVATAR_ARMOUR,
		AVATAR_POWER_MAX:    agg.AVATAR_POWER_MAX,
		AVATAR_SPRINT_SPEED: agg.AVATAR_SPRINT_SPEED,
	};

	const result = calculateWarframeStats(channel.base, modBonuses);

	const output: WarframeStatOutput = {
		health:      result.stats.health.calculated,
		shield:      result.stats.shield.calculated,
		armor:       result.stats.armor.calculated,
		power:       result.stats.energy.calculated,
		sprintSpeed: result.stats.sprintSpeed.calculated,
	};

	// AVATAR_ABILITY_STRENGTH → no va a los stats base; se expone como abilityStrength
	if (agg.AVATAR_ABILITY_STRENGTH !== undefined) {
		output.abilityStrength = round2(1 + agg.AVATAR_ABILITY_STRENGTH / 100);
	}

	return output;
}

function calculateWeaponChannel(channel: ResolvedChannel<WeaponBase>): WeaponStatOutput {
	const agg = aggregateStats(channel.stats);

	const modBonuses: WeaponModBonuses = {
		WEAPON_DAMAGE_AMOUNT:   agg.WEAPON_DAMAGE_AMOUNT,
		WEAPON_CRIT_CHANCE:     agg.WEAPON_CRIT_CHANCE,
		WEAPON_CRIT_DAMAGE:     agg.WEAPON_CRIT_DAMAGE,
		WEAPON_PROC_CHANCE:     agg.WEAPON_PROC_CHANCE,
		WEAPON_FIRE_RATE:       agg.WEAPON_FIRE_RATE,
		WEAPON_RELOAD_SPEED:    agg.WEAPON_RELOAD_SPEED,
		WEAPON_CLIP_MAX:        agg.WEAPON_CLIP_MAX,
		WEAPON_FIRE_ITERATIONS: agg.WEAPON_FIRE_ITERATIONS,
	};

	return calculateWeaponStats(channel.base, modBonuses);
}

/**
 * Calcula los stats finales para todas las entidades del layout.
 *
 * @param resolved Layout con base stats + ResolvedStat[] ya resueltos por el Resolver.
 * @param _context v1: vacío — todas las condiciones activas.
 */
export function calculate(
	resolved: ResolvedLayout,
	_context: CalculationContext,
): EngineOutput {
	const output: EngineOutput = {};

	if (resolved.warframe) {
		output.warframe = calculateWarframeChannel(resolved.warframe);
	}

	for (const slot of ["primaryWeapon", "secondaryWeapon", "meleeWeapon"] as const) {
		const channel = resolved[slot];
		if (channel) {
			output[slot] = calculateWeaponChannel(channel);
		}
	}

	return output;
}
