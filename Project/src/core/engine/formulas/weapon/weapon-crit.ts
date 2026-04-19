/**
 * @module weapon-crit
 * @description Adaptador de criticos para armas.
 *
 * Aplica las primitivas de crit-base al canal de arma. Gestiona el contexto
 * especifico de armas: cada pellet hace su propia tirada, el multishot amplifica
 * el dano critico esperado por disparo, y los mods de crit son relativos a la base del arma.
 *
 * Fuente canonica:
 *   - Docs/reference/wiki/mechanics/critical-hits.md
 *   - https://wiki.warframe.com/w/Critical_Hit
 *   - https://wiki.warframe.com/w/Damage/Calculation  (formula: Critical Hit = Total Damage * [1 + ceil(CC) * (CM - 1)])
 *
 * Nota del canal:
 *   Armas siempre pueden critar. Los mods de crit del arma son bonuses relativos a su base.
 *   Exaltadas y habilidades con crit habilitado usan ability-crit.ts, no este modulo.
 *
 * Fuera de alcance:
 *   - quantization exacta del base critical damage
 *   - headcrit completo por tipo de enemigo
 *   - casos de buffs que alteran base antes de quantization
 */

import {
	totalCritChance,
	totalCritDamage,
	resolveCritTier,
	averageCritMultiplier,
	type CritTierResult,
} from "../common/crit-base";
import { round2 } from "../common/scaling-base";

/**
 * Resultado del calculo de criticos de un arma.
 */
export type WeaponCritResult = {
	/** Crit chance final en decimal con todos los mods aplicados. */
	moddedCritChance: number;
	/** Crit multiplier final en decimal con todos los mods aplicados. */
	moddedCritDamage: number;
	/**
	 * Resolucion de tiers: tier garantizado y chance al siguiente tier.
	 * Util para mostrar en UI si el arma ya garantiza yellow/orange/red crit.
	 */
	tierResult: CritTierResult;
	/**
	 * Multiplicador de dano promedio esperado por hit, considerando crit chance > 100%.
	 * Formula: 1 + critChanceDecimal * (critDamage - 1)
	 * Util para comparacion de builds sin simular cada hit.
	 */
	averageMultiplier: number;
};

/**
 * Calcula los stats de critico de un arma con mods aplicados.
 *
 * Los mods de crit chance de arma son bonuses RELATIVOS a la base del arma:
 *   moddedCritChance = baseCritChance * (1 + relativeCritBonus)
 *
 * Para bonuses absolutos/flat (Archon Shards, Cathode Grace en armas) usar absoluteCritBonus.
 *
 * Fuente: Docs/reference/wiki/mechanics/critical-hits.md
 *   totalCritChance = baseCritChance * (1 + relativeCritBonus) + absoluteCritBonus
 *
 * @param baseCritChance          Crit chance base del arma en decimal (0.25 = 25%).
 * @param baseCritDamage          Crit multiplier base del arma en decimal (2.0 = 2x).
 * @param relativeCritChancePct   Suma de mods relativos de crit chance en porcentaje (150 = +150%).
 * @param relativeCritDamagePct   Suma de mods relativos de crit damage en porcentaje (120 = +120%).
 * @param absoluteCritChance      Bonus flat de crit chance en decimal. Default 0.
 * @param absoluteCritDamage      Bonus flat de crit damage en decimal. Default 0.
 */
export function calculateWeaponCrit(
	baseCritChance: number,
	baseCritDamage: number,
	relativeCritChancePct: number,
	relativeCritDamagePct: number,
	absoluteCritChance = 0,
	absoluteCritDamage = 0,
): WeaponCritResult {
	const moddedCritChance = totalCritChance(
		baseCritChance,
		relativeCritChancePct / 100,
		absoluteCritChance,
	);
	const moddedCritDamage = totalCritDamage(
		baseCritDamage,
		relativeCritDamagePct / 100,
		absoluteCritDamage,
	);
	const tierResult = resolveCritTier(moddedCritChance);
	const avg = averageCritMultiplier(moddedCritChance, moddedCritDamage);

	return {
		moddedCritChance: round2(moddedCritChance),
		moddedCritDamage: round2(moddedCritDamage),
		tierResult,
		averageMultiplier: round2(avg),
	};
}

/**
 * Dano promedio esperado de un hit considerando multishot y crit.
 *
 * Para armas normales (no beam), cada instancia de multishot hace su propia tirada.
 * La formula de dano esperado total por disparo es:
 *   expectedDamagePerTrigger = moddedDamage * expectedInstances * averageCritMultiplier
 *
 * Fuente: Docs/reference/wiki/mechanics/critical-hits.md ("Regla importante con pellets y multishot")
 *
 * @param moddedDamage       Dano total del arma con mods de dano aplicados.
 * @param expectedInstances  Numero esperado de instancias por disparo (de weapon-multishot).
 * @param critAvgMultiplier  Multiplicador de dano critico promedio (de calculateWeaponCrit).
 */
export function expectedDamagePerTrigger(
	moddedDamage: number,
	expectedInstances: number,
	critAvgMultiplier: number,
): number {
	return round2(moddedDamage * expectedInstances * critAvgMultiplier);
}
