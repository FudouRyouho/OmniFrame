/**
 * @module ability-status
 * @description Status de habilidades — subset canonico v1.
 *
 * El sistema de status en habilidades es fundamentalmente diferente al de armas:
 *
 * Diferencias clave vs. armas:
 *   1. Las habilidades NO tienen "status chance" en el mismo sentido que armas.
 *      No existe un porcentaje acumulado que modee un dado — el status es o 100%
 *      garantizado (effect siempre ocurre) o condicional de otra forma.
 *   2. Los efectos de estado de una habilidad son parte de su diseno: Frost crea
 *      Freeze directamente, sin tirada de dados.
 *   3. Ability Strength aumenta la duracion/potencia del CC pero NO incrementa
 *      "proc chance" como tal.
 *   4. Auras de status (Nidus, por ejemplo) tampoco tienen "status chance" clasica.
 *
 * Que si aplica en v1:
 *
 *   A. **Tipos de dano de una habilidad**: necesarios para calcular que procs
 *      se aplican y cuales elementos combinados se forman (ej. Ember Fire +
 *      cold env → Blast). El calculo de combinacion delega a `status-base.ts`.
 *
 *   B. **Nombre canonico del proc**: cada habilidad puede proclamar que tipo
 *      de status aplica (Heat, Cold, Electricity, etc.) para informar al usuario.
 *
 *   C. **Indicador de proc garantizado vs. chanceable**: para el breakdown textual.
 *
 * Casos excluidos del scope v1:
 *   - Contaminacion de status entre habilidades y proyectiles de arma (Wukong, etc.)
 *   - Status por arma proxy (Nidus Larva, Khora Strangledome)
 *   - Stacks dinamicos de status (Nidus Mutation)
 *
 * Fuente canonica:
 *   https://wiki.warframe.com/w/Status_Effect#Abilities
 *   https://wiki.warframe.com/w/Damage
 */

import type { DamageType } from "@shared/types";
import { resolveElementalCombination } from "../common/status-base";

/**
 * Mapa de tipo de dano -> porcentaje de participacion (debe sumar ~100).
 * Equivalente a Partial<Record<DamageType, number>>.
 */
export type DamageBreakdown = Partial<Record<DamageType, number>>;

/**
 * Comportamiento de proc de una habilidad en v1.
 *
 * - `"guaranteed"`: la habilidad siempre aplica el proc, sin tirada de dados.
 *   Ejemplo: Freeze de Frost, Fire de Ember.
 *
 * - `"conditional"`: el proc depende de un evento externo (hit, kill, cast count).
 *   Fuera del scope de calculo estatico v1 — se declara pero no se computa.
 *
 * - `"none"`: la habilidad no aplica estado de status conocido (dano puro o CC fisico).
 */
export type AbilityProcBehavior = "guaranteed" | "conditional" | "none";

/**
 * Descriptor de status de una habilidad individual.
 */
export type AbilityStatusDescriptor = {
	/** Tipos de dano de la habilidad (map de tipo -> porcentaje, debe sumar 100). */
	damageBreakdown: DamageBreakdown;
	/** Como aplica el proc: garantizado, condicional o ninguno. */
	procBehavior: AbilityProcBehavior;
	/**
	 * Elemento combinado resultante si la habilidad formula combinaciones elementales.
	 * null si solo usa elementos primarios o dano fisico.
	 * Calculado automaticamente desde `damageBreakdown` via `resolveElementalCombination`.
	 */
	combinedElement: string | null;
};

/**
 * Construye el descriptor de status de una habilidad a partir de su breakdown de dano.
 *
 * En v1, todas las habilidades que hacen proc son tratadas como "guaranteed" a menos
 * que el caller marque explicitamente `procBehavior: "conditional"`.
 *
 * La combinacion de elementos (ej. Heat + Cold → Blast) se calcula automaticamente
 * usando la misma logica que las armas (tabla canonica de `status-base.ts`).
 *
 * @param damageBreakdown Map de tipo de dano -> porcentaje (ej. { "Heat": 60, "Cold": 40 }).
 * @param procBehavior    Si la habilidad garantiza o condiciona el proc. Default "guaranteed".
 */
export function describeAbilityStatus(
	damageBreakdown: DamageBreakdown,
	procBehavior: AbilityProcBehavior = "guaranteed",
): AbilityStatusDescriptor {
	// resolveElementalCombination espera un Set de tipos de dano activos.
	const elementSet = new Set(Object.keys(damageBreakdown) as DamageType[]);
	const combinedElement = resolveElementalCombination(elementSet);

	return {
		damageBreakdown,
		procBehavior,
		combinedElement,
	};
}

/**
 * Genera la etiqueta de texto para mostrar el tipo de proc de una habilidad.
 * Util para consumers dev y vistas diagnósticas del engine.
 *
 * Ejemplos de salida:
 *   - "Heat (garantizado)"
 *   - "Blast (garantizado) [Heat + Cold]"
 *   - "Conditional – fuera de scope v1"
 *   - "Sin proc de status"
 *
 * @param descriptor Descriptor generado por `describeAbilityStatus`.
 * @param primaryElement Elemento principal visible al usuario (si no hay combinacion).
 */
export function formatAbilityStatusLabel(
	descriptor: AbilityStatusDescriptor,
	primaryElement?: string,
): string {
	if (descriptor.procBehavior === "none") {
		return "Sin proc de status";
	}
	if (descriptor.procBehavior === "conditional") {
		return "Condicional — fuera de scope v1";
	}

	// Guaranteed
	if (descriptor.combinedElement) {
		const sources = Object.keys(descriptor.damageBreakdown).join(" + ");
		return `${descriptor.combinedElement} (garantizado) [${sources}]`;
	}

	const element = primaryElement ?? Object.keys(descriptor.damageBreakdown)[0] ?? "Desconocido";
	return `${element} (garantizado)`;
}
