/**
 * @module status-base
 * @description Primitivas canonicas de estado (proc/status) compartidas por todos los canales.
 *
 * El sistema de status en Warframe es transversal: armas, habilidades y otras fuentes
 * pueden aplicar procs. La matematica base (chance total, peso por tipo, combinacion elemental)
 * es identica entre canales; lo que cambia es como cada canal activa o limita estos procs.
 *
 * Fuente canonica primaria:
 *   - Docs/reference/wiki/mechanics/damage-types.md
 *   - https://wiki.warframe.com/w/Status_Effect
 *   - https://wiki.warframe.com/w/Damage
 *
 * Alcance de este modulo (v1):
 *   - status chance total
 *   - proc weight por tipo de dano (para elegir que proc aplica)
 *   - combinacion elemental canonica
 *
 * Fuera de alcance v1:
 *   - DoT / ticks por segundo
 *   - stacks reales sobre el enemigo a lo largo del tiempo
 *   - ramp temporal de Heat
 *   - resistencias por faccion o tipo de salud del enemigo
 */

import type { DamageType } from "@lib/types";

/**
 * Tipos elementales primarios que participan en combinacion elemental.
 * Fuente: Docs/reference/wiki/mechanics/damage-types.md
 */
export const PRIMARY_ELEMENTS: ReadonlySet<DamageType> = new Set<DamageType>([
	"heat", "cold", "electricity", "toxin",
]);

/**
 * Tabla canonica de combinaciones elementales.
 * Cada par [A, B] produce el elemental secundario correspondiente.
 * El orden dentro del par no importa para la busqueda.
 *
 * Fuente: Docs/reference/wiki/mechanics/damage-types.md
 *   Heat + Cold       = Blast
 *   Heat + Electricity = Radiation
 *   Heat + Toxin      = Gas
 *   Cold + Electricity = Magnetic
 *   Cold + Toxin      = Viral
 *   Electricity + Toxin = Corrosive
 */
export const ELEMENT_COMBINATIONS: ReadonlyArray<{
	a: DamageType;
	b: DamageType;
	result: DamageType;
}> = [
	{ a: "heat",        b: "cold",        result: "blast"     },
	{ a: "heat",        b: "electricity", result: "radiation" },
	{ a: "heat",        b: "toxin",       result: "gas"       },
	{ a: "cold",        b: "electricity", result: "magnetic"  },
	{ a: "cold",        b: "toxin",       result: "viral"     },
	{ a: "electricity", b: "toxin",       result: "corrosive" },
] as const;

/**
 * Tipos especiales que no participan en el arbol elemental.
 * Fuente: Docs/reference/wiki/mechanics/damage-types.md
 */
export const SPECIAL_DAMAGE_TYPES: ReadonlySet<DamageType> = new Set<DamageType>([
	"void", "tau", "true",
]);

/**
 * Calcula el status chance total en formato decimal.
 *
 * Formula base (Docs/domains/engine/formula-overview.md):
 *   statusChanceTotal = base * (1 + relativeBonus)
 *
 * @param baseStatusChance  Status chance base en decimal (0.18 = 18%).
 * @param relativeBonus     Suma de mods relativos en decimal.
 */
export function totalStatusChance(baseStatusChance: number, relativeBonus: number): number {
	return baseStatusChance * (1 + relativeBonus);
}

/**
 * Calcula el peso de proc de cada tipo de dano presente en un hit.
 *
 * Formula canonica (Docs/reference/wiki/mechanics/damage-types.md):
 *   procTypeChance(type) = damageOfType / totalDamage
 *
 * Esto determina que tipo de proc aplica cuando el status chance roll tiene exito.
 * Subir Slash sube la chance de Bleed; subir Heat sube la chance de Ignite, etc.
 *
 * @param damageBreakdown Mapa de tipo de dano -> valor de dano en ese tipo.
 * @returns Mapa de tipo de dano -> probabilidad de proc (0.0 - 1.0). Solo tipos con dano > 0.
 */
export function procWeightByType(
	damageBreakdown: Partial<Record<DamageType, number>>,
): Partial<Record<DamageType, number>> {
	const entries = Object.entries(damageBreakdown) as Array<[DamageType, number | undefined]>;
	const total = entries.reduce((sum, [, v]) => sum + (v ?? 0), 0);

	if (total <= 0) return {};

	const result: Partial<Record<DamageType, number>> = {};
	for (const [type, value] of entries) {
		if (value && value > 0) {
			result[type] = value / total;
		}
	}
	return result;
}

/**
 * Resuelve la combinacion elemental de un conjunto de elementales primarios presentes.
 * Retorna el elemental secundario resultante si hay un par valido, o null si no aplica.
 *
 * Nota: solo se combina el primer par valido encontrado en la tabla canonica.
 * Combinaciones multiples o en cadena quedan fuera del alcance v1.
 *
 * Fuente: Docs/reference/wiki/mechanics/damage-types.md (tabla de combinaciones)
 *
 * @param elements Conjunto de tipos elementales presentes (puede incluir no-primarios).
 * @returns El elemental secundario combinado, o null si no hay combinacion aplicable.
 */
export function resolveElementalCombination(elements: ReadonlySet<DamageType>): DamageType | null {
	for (const combo of ELEMENT_COMBINATIONS) {
		if (elements.has(combo.a) && elements.has(combo.b)) {
			return combo.result;
		}
	}
	return null;
}
