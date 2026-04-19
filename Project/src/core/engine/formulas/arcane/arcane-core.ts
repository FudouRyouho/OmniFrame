/**
 * @module arcane-core
 * @description Adaptador de arcanos para el engine v1 (subset minimo estatico).
 *
 * Los arcanos en Warframe son mejoras de equipamiento con efectos que van desde
 * bonuses pasivos directos hasta activaciones condicionales complejas (on-kill, on-hit,
 * on-cast, stacks, etc.). Este modulo cubre SOLO el subset v1: arcanos de bonus
 * directo y estatico, sin condicion de activacion ni stacks dinamicos.
 *
 * Nota arquitectural sobre los datos de arcanos:
 *   El tipo `Arcane` del proyecto almacena los efectos como texto crudo en
 *   `levelStats: { stats: string[] }[]`. No existe aun una fuente numerica
 *   estructurada y parseada equivalente a `mod-stats.override.json` para arcanos.
 *
 *   Para que los arcanos participen en el engine, se necesita un artefacto de datos
 *   similar: `arcane-stats.override.json`. Ese archivo sigue la misma forma que
 *   ModOverrideEntry: uniqueName -> { name, rank, stats: [{ upgradeType, values }] }.
 *
 *   Hasta que ese artefacto exista, este modulo define el contrato de aplicacion
 *   y los tipos de entrada/salida. La lista de arcanos soportados en v1 es explicita
 *   para no dar soporte implicito a arcanos sin datos validados.
 *
 * Subset v1 soportado (arcanos de bonus estatico directo, sin stacks dinamicos):
 *   - Arcane Grace     (category/compatName: warframe) -> AVATAR_HEALTH_MAX plano por stack
 *   - Arcane Guardian  (category/compatName: warframe) -> AVATAR_ARMOR_MAX plano por stack
 *   - Arcane Energize  (category/compatName: warframe) -> requiere activacion on-energy-pickup -> fuera de v1
 *   - Arcane Velocity  (category/compatName: secondary) -> WEAPON_FIRE_RATE flat on-crit -> fuera de v1 (condicional)
 *
 * Nota: la lista de exclusiones documenta explicitamente que NO se soporta para
 * evitar expectativas erroneas en el consumer textual.
 *
 * Fuente canonica de referencia:
 *   - https://wiki.warframe.com/w/Arcane_Enhancement
 *   - Docs/domains/builder-engine/gaps.md (arcanes.json sin datos estructurados: "no en v1")
 *
 * Estado actual:
 *   BLOQUEADO por ausencia de arcane-stats.override.json.
 *   Este modulo define contratos y aplica bonuses cuando se provean los datos.
 *   La UI textual puede mostrar "arcanos: sin datos aun" hasta que el artefacto exista.
 */

/**
 * Entrada de override para un arcano en el formato de datos del engine.
 * Equivalente al ModOverrideEntry de mods.
 */
export type ArcaneOverrideStat = {
	/** upgradeType canonico del engine (ej. AVATAR_ARMOR_MAX). */
	upgradeType: string;
	/** Valores por rank del arcano (index = rank). */
	values: number[];
};

export type ArcaneOverrideEntry = {
	/** Nombre visible del arcano. */
	name: string;
	/**
	 * Rank equipado (0-based). null si aplica al rank de la entrada del override.
	 * Para arcanos, rank va de 0 a maxRank - 1.
	 */
	rank: number | null;
	stats: ArcaneOverrideStat[];
};

/** Mapa de uniqueName de arcano -> entrada de override con valores numericos. */
export type ArcaneOverrideMap = Record<string, ArcaneOverrideEntry>;

/**
 * Arcano equipado como parte de un layout.
 */
export type EquippedArcane = {
	uniqueName: string;
	rank: number;
};

/**
 * Resultado del calculo de bonuses de arcanos.
 */
export type ArcaneBonus = {
	/** Mapa de upgradeType -> bonus porcentual total acumulado de todos los arcanos equipados. */
	bonuses: Record<string, number>;
	/** Arcanos que no se encontraron en el override. */
	missing: string[];
};

/**
 * Lista de arcanos excluidos explicitamente del subset v1.
 * La razon de exclusion se documenta junto a cada uno.
 *
 * Esta lista existe para que el consumer textual pueda mostrar
 * un aviso explicito en vez de silenciar el problema.
 */
export const ARCANE_V1_EXCLUSIONS: Record<string, string> = {
	"Arcane_Energize": "activacion condicional on-energy-pickup; requiere simulacion de evento",
	"Arcane_Velocity": "activacion condicional on-crit; no es bonus estatico",
	"Arcane_Strike":   "activacion condicional on-hit; no es bonus estatico",
	"Arcane_Fury":     "activacion condicional on-melee-hit; stacks dinamicos",
};

/**
 * Acumula los bonuses de upgradeType de los arcanos equipados usando el override map.
 *
 * Solo procesa arcanos presentes en el override. Los faltantes se registran en `missing`.
 * No aplica arcanos con activacion condicional; eso requiere un contexto de evento
 * que no existe en el calculo estatico v1.
 *
 * @param arcanes  Lista de arcanos equipados (uniqueName + rank).
 * @param overrides Mapa de uniqueName -> valores numericos parseados.
 */
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
