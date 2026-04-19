/**
 * @module warframe-core
 * @description Adaptador de calculo de stats base del Warframe.
 *
 * Aplica los bonuses de mods sobre los stats de salud/escudo/armadura/energia/sprint.
 * Usa las primitivas de scaling-base como capa matematica; este modulo solo conoce
 * el dominio "warframe" y sus upgradeTypes.
 *
 * Formula dominante (Docs/domains/engine/formula-overview.md):
 *   statFinal = base * (1 + suma_de_bonuses_del_mismo_upgradeType)
 *
 * Fuente canonica:
 *   - Docs/domains/engine/formula-overview.md
 *   - Docs/domains/data/mods/upgrade-taxonomy.md
 *   - https://wiki.warframe.com/w/Warframe_Attributes
 *
 * Fuera de alcance de este modulo:
 *   - habilidades y sus escalados STR/DUR/RNG/EFF
 *   - Archon Shards (se agregan como bonus en el contexto del layout, no aqui)
 *   - resistencias por faccion o por tipo de enemigo
 */

import { applyAdditiveBonus, round2 } from "../common/scaling-base";

/** Subset de stats base del Warframe que el Engine necesita para el cálculo. */
interface WarframeBaseStats {
	health: number;
	shield: number;
	armor: number;
	power: number;
	sprintSpeed: number;
}

/**
 * Resultado de un stat individual: valor base y valor calculado tras aplicar mods.
 */
export type StatResult = {
	/** Valor base extraido del dataset (sin mods). */
	base: number;
	/** Valor calculado tras aplicar todos los bonuses de mods. */
	calculated: number;
};

/**
 * Resultado del calculo de stats del Warframe.
 */
export type WarframeStatResult = {

	stats: {
		health: StatResult;
		shield: StatResult;
		armor: StatResult;
		energy: StatResult;
		sprintSpeed: StatResult;
	};
};

/**
 * Bonuses agregados por upgradeType para el warframe.
 * Los valores son sumas de porcentajes (100 = +100%).
 *
 * UpgradeTypes reconocidos aqui (Docs/domains/data/mods/upgrade-taxonomy.md):
 *   AVATAR_HEALTH_MAX   - Vitality y equivalentes
 *   AVATAR_SHIELD_MAX   - Redirection y equivalentes
 *   AVATAR_ARMOUR       - Steel Fiber y equivalentes (confirmado del override real)
 *   AVATAR_POWER_MAX    - Flow y equivalentes
 *   AVATAR_SPRINT_SPEED - Rush y equivalentes
 */
export type WarframeModBonuses = {
	AVATAR_HEALTH_MAX?: number;
	AVATAR_SHIELD_MAX?: number;
	AVATAR_ARMOUR?: number;
	AVATAR_POWER_MAX?: number;
	AVATAR_SPRINT_SPEED?: number;
};

/**
 * Calcula los stats finales de un Warframe aplicando sus mods.
 *
 * @param warframe Stats base del Warframe (duck-typed — acepta WarframeBase del Resolver o Warframe del dataset).
 * @param bonuses  Mapa de upgradeType -> bonus porcentual total acumulado de todos los mods.
 */
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
			sprintSpeed: {
				base: warframe.sprintSpeed,
				calculated: round2(applyAdditiveBonus(warframe.sprintSpeed, bonuses.AVATAR_SPRINT_SPEED ?? 0)),
			},
		},
	};
}
