/**
 * @module weapon-condition-overload
 * @description Adaptador de Condition Overload (CO) y GunCO para armas.
 *
 * Implementa los tres behavior types documentados por la wiki:
 *   - Adding:     CO es aditivo junto a Serration/Hornet Strike en el pool sumado.
 *   - Multiplying: CO es un multiplicador por fuera del pool aditivo.
 *   - None:       El ataque no recibe bonus CO (ej. explosion radial, AoE separado).
 *
 * Fuente canonica:
 *   - Docs/reference/wiki/mechanics/condition-overload.md
 *   - https://wiki.warframe.com/w/Condition_Overload_(Mechanic)
 *   - https://wiki.warframe.com/w/Condition_Overload
 *   - https://wiki.warframe.com/w/Galvanized_Aptitude
 *
 * Mods de referencia v1:
 *   Condition Overload (melee):   +80%   por status unico (behavior: adding por defecto en la mayoria)
 *   Galvanized Aptitude (rifle):  +40%   por status * stacks (hasta 2 stacks)
 *   Galvanized Savvy (shotgun):   +40%   por status * stacks (hasta 2 stacks)
 *   Galvanized Shot (secondary):  +40%   por status * stacks (hasta 3 stacks)
 *
 * Fuera de alcance v1:
 *   - catalogo completo de comportamiento por arma y por ataque
 *   - stance edge cases de melee
 *   - interacciones raras con perks Incarnon
 *   - child projectiles exoticos
 */

import { round2 } from "../common/scaling-base";

/**
 * Behavior type de Condition Overload para un ataque especifico.
 * Fuente: Docs/reference/wiki/mechanics/condition-overload.md (seccion "Behavior types")
 */
export type COBehaviorType = "adding" | "multiplying" | "none";

/**
 * Parametros para calcular el bonus CO de un mod o arcano.
 */
export type COModParams = {
	/** Bonus porcentual por status unico por stack (ej. 80 para CO, 40 para Galvanized). */
	perStatusBonusPct: number;
	/** Stacks activos del mod galvanized (siempre 1 para CO clasico). */
	activeStacks: number;
};

/**
 * Resultado del calculo de CO para un ataque.
 */
export type WeaponCOResult = {
	/** Behavior type del ataque. */
	behavior: COBehaviorType;
	/** Bonus CO total en porcentaje. 0 si behavior es "none". */
	coBonusPct: number;
	/** Dano final con CO aplicado segun su behavior. */
	finalDamageWithCO: number;
};

/**
 * Calcula el bonus CO total a partir de los parametros del mod y el contexto activo.
 *
 * Formula CO melee (Docs/reference/wiki/mechanics/condition-overload.md):
 *   coBonus = coPerStatus * uniqueStatusCount
 *
 * Formula GunCO (Galvanized):
 *   guncoBonus = perStatusBonus * activeStacks * uniqueStatusCount
 *
 * @param mod              Parametros del mod CO (bonus pct y stacks).
 * @param uniqueStatusCount Cantidad de estados unicos activos en el objetivo.
 */
export function coBonusPct(mod: COModParams, uniqueStatusCount: number): number {
	return mod.perStatusBonusPct * mod.activeStacks * uniqueStatusCount;
}

/**
 * Aplica el bonus CO sobre el dano base segun el behavior del ataque.
 *
 * Behavior Adding (mas comun, hitscan normales):
 *   finalDamage = baseDamage * (1 + additiveDamageBonuses + coBonus) * otherMultipliers
 *   El co entra en el mismo pool que Serration/Hornet Strike.
 *
 * Behavior Multiplying (proyectiles, wave projectiles):
 *   finalDamage = baseDamage * (1 + additiveDamageBonuses) * (1 + coBonus) * otherMultipliers
 *   El co es un multiplicador separado y por tanto mas fuerte.
 *
 * Behavior None:
 *   finalDamage = baseDamage * (1 + additiveDamageBonuses) * otherMultipliers
 *   El co no aplica (radial/AoE que no recibe bonus CO).
 *
 * Fuente: Docs/reference/wiki/mechanics/condition-overload.md (seccion "Behavior types")
 *
 * @param baseDamage            Dano base del arma (antes de cualquier bonus).
 * @param additiveDamageBonusPct Suma de bonuses aditivos en porcentaje (Serration, etc.).
 * @param coBonusPctValue       Bonus CO calculado en porcentaje.
 * @param behavior              Behavior type del ataque.
 * @param otherMultipliers      Multiplicadores adicionales (faction, faction bonus, etc.). Default 1.
 */
export function applyConditionOverload(
	baseDamage: number,
	additiveDamageBonusPct: number,
	coBonusPctValue: number,
	behavior: COBehaviorType,
	otherMultipliers = 1,
): WeaponCOResult {
	let finalDamageWithCO: number;

	if (behavior === "adding") {
		finalDamageWithCO = baseDamage
			* (1 + (additiveDamageBonusPct + coBonusPctValue) / 100)
			* otherMultipliers;
	} else if (behavior === "multiplying") {
		finalDamageWithCO = baseDamage
			* (1 + additiveDamageBonusPct / 100)
			* (1 + coBonusPctValue / 100)
			* otherMultipliers;
	} else {
		// behavior "none": CO no aplica
		finalDamageWithCO = baseDamage
			* (1 + additiveDamageBonusPct / 100)
			* otherMultipliers;
	}

	return {
		behavior,
		coBonusPct: coBonusPctValue,
		finalDamageWithCO: round2(finalDamageWithCO),
	};
}
