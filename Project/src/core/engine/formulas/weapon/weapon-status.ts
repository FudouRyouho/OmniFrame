/**
 * @module weapon-status
 * @description Adaptador de status (proc) para armas.
 *
 * Calcula el status chance total del arma con mods y el peso de proc por tipo de dano.
 * El peso de proc determina que tipo de estado aplica cuando el roll de status tiene exito;
 * subir el dano de un tipo aumenta su peso y por tanto su probabilidad de proc.
 *
 * Fuente canonica:
 *   - Docs/reference/wiki/mechanics/damage-types.md
 *   - https://wiki.warframe.com/w/Status_Effect
 *   - https://wiki.warframe.com/w/Damage
 *
 * Formula central:
 *   statusChanceTotal = base * (1 + relativeBonus)
 *   procTypeChance(type) = damageOfType / totalDamage
 *
 * Alcance v1:
 *   - status chance total moddado
 *   - proc weight por tipo de dano
 *   - combinacion elemental
 *   - procs esperados por disparo (junto con multishot)
 *
 * Fuera de alcance v1:
 *   - DoT / ticks por segundo
 *   - acumulacion real de stacks sobre el enemigo
 *   - resistencias por tipo de salud o faccion
 */

import type { DamageType } from "@lib/types";
import { totalStatusChance, procWeightByType, resolveElementalCombination, PRIMARY_ELEMENTS } from "../common/status-base";
import { round2 } from "../common/scaling-base";

/**
 * Resultado del calculo de status de un arma.
 */
export type WeaponStatusResult = {
	/** Status chance total en decimal con mods aplicados. */
	moddedStatusChance: number;
	/**
	 * Peso de proc por tipo de dano (0.0 - 1.0 por tipo).
	 * Representa la probabilidad de que ese tipo especifico sea el que aplica proc
	 * cuando el roll de status tiene exito.
	 */
	procWeights: Partial<Record<DamageType, number>>;
	/**
	 * Elemental secundario resultante de combinar elementales primarios presentes, o null.
	 * Solo considera los tipos con dano > 0 al momento del calculo.
	 */
	combinedElement: DamageType | null;
	/**
	 * Procs esperados por disparo (status chance * instancias esperadas).
	 * Para proyectiles: instancias = multishot esperado.
	 * Para beams: instancias = 1 (el tick, con statusChance escalada por multishot).
	 */
	expectedProcsPerTrigger: number;
};

/**
 * Calcula el estado de status de un arma con mods y breakdown de dano.
 *
 * @param baseStatusChance   Status chance base del arma en decimal (0.18 = 18%).
 * @param relativeStatusPct  Suma de mods relativos de status en porcentaje.
 * @param damageBreakdown    Dano por tipo TRAS aplicar mods de dano elemental.
 * @param expectedInstances  Instancias esperadas de impacto por disparo (de weapon-multishot).
 *                           Para beams, pasar el statusChance efectivo (base * scaleFactor).
 */
export function calculateWeaponStatus(
	baseStatusChance: number,
	relativeStatusPct: number,
	damageBreakdown: Partial<Record<DamageType, number>>,
	expectedInstances: number,
): WeaponStatusResult {
	const moddedStatusChance = totalStatusChance(baseStatusChance, relativeStatusPct / 100);
	const procWeights = procWeightByType(damageBreakdown);

	// Detecta elementales primarios presentes para calcular combinacion elemental.
	const presentPrimaries = new Set<DamageType>(
		(Object.keys(damageBreakdown) as DamageType[]).filter(
			(t) => PRIMARY_ELEMENTS.has(t) && (damageBreakdown[t] ?? 0) > 0,
		),
	);
	const combinedElement = resolveElementalCombination(presentPrimaries);

	// Procs esperados por disparo.
	// Formula: expectedProcsPerTrigger ~= expectedInstances * statusChancePerHit
	// Fuente: Docs/reference/wiki/mechanics/multishot.md (seccion "Implicacion para status")
	const expectedProcsPerTrigger = round2(expectedInstances * moddedStatusChance);

	return {
		moddedStatusChance: round2(moddedStatusChance),
		procWeights,
		combinedElement,
		expectedProcsPerTrigger,
	};
}
