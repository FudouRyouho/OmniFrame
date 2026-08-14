/**
 * @module ability-crit
 * @description Crits de habilidades — subset canonico v1 (caso Gyre unicamente).
 *
 * En Warframe, la gran mayoria de habilidades NO pueden hacer crit. Las habilidades
 * por defecto tienen 0% de crit chance y no se benefician de mods de crit de armas.
 *
 * ⚠️ **ESA PREMISA ES MÁS GRUESA QUE LA FUENTE — declarado, no corregido acá.**
 * `references/wiki/mechanics/universal-weapon-bonuses.md` (capturada 2026-08-14) parte el eje en tres
 * estados, no dos, y este módulo sólo conoce el primero:
 *
 *   - **`N/A`** — *"completely incapable of landing critical hits, **even when buffed with flat
 *     critical chance bonuses**"*. Es el caso que este archivo describe.
 *   - **`0%`** — puede critear, pero **requiere** una fuente *absoluta* (Arcane Avenger 45%, Charm
 *     200%, Covenant). "0% de crit chance" no implica "no puede critear".
 *   - **crit base propio** — cinco habilidades listadas lo traen sin ningún buff: Sporespring
 *     `75% / 2.0x`, Breach Surge `100% / 1.5x`, Tether-Flechette Orb `50% / 2.0x`, Ulfrun's Descent
 *     `20% / 1.5x`, Enthrall `5% / 1.5x`.
 *
 * Y hay una exclusión medida que tampoco está modelada: el crit damage absoluto universal **no aplica
 * a ninguna habilidad de Gyre** — justo el caso que este módulo sí cubre.
 *
 * No se reescribe en este pase: sigue sin consumidor (`ability-emission.test.ts` lo ancla), y hacerlo
 * pide antes decidir de dónde sale el crit base de una habilidad, que es dato de la tabla y no ley.
 *
 * Excepciones canonicas confirmadas por wiki (unicas soportadas en v1):
 *
 *   1. **Gyre** (Warframe):
 *      - Pasiva: todas las habilidades de Gyre tienen +10% de crit chance base.
 *      - Cathode Grace (augment de Coil Horizon): +50% crit chance adicional a
 *        armas Y habilidades mientras Coil Horizon este activo.
 *        Valores por rank del augment: r0=+25%, r1=+30%, r2=+40%, r3=+50%.
 *      - Cathode Grace NO requiere activar Coil Horizon constantemente; el buff
 *        permanece activo hasta que Coil Horizon expire.
 *      - Fuente: https://wiki.warframe.com/w/Gyre/Abilities
 *
 *   2. **Voruna** (Warframe) — Ulfrun's Descent:
 *      - La cuarta habilidad de Voruna hereda la crit chance del arma de melé equipada.
 *      - Fuera del scope de v1 (requiere lookup de stats del arma activa en slot melé).
 *
 *   3. **Nokko** — Sporespring:
 *      - Mecanica especial: fuera del scope de v1.
 *
 * Fuente canonica:
 *   https://wiki.warframe.com/w/Critical_Hit#Abilities
 *
 * Delegacion:
 *   Este modulo delega a `crit-base.ts` para la matematica de crit. No duplica formulas.
 */

import {
	averageCritMultiplier,
	resolveCritTier,
	totalCritChance,
	totalCritDamage,
} from "../common/crit-base";

/**
 * Tipo de excepcion de crit de habilidad soportada en v1.
 * Cada valor corresponde a un Warframe canonico con crit en habilidades.
 */
export type AbilityCritException = "gyre";

/**
 * Bonuses de crit de Gyre provenientes del pasivo y/o Cathode Grace.
 *
 * - `passiveBaseCritPct`: +10% base crit chance de la pasiva de Gyre.
 *   Siempre activo si el Warframe es Gyre. Es bonus ABSOLUTO (se suma al base).
 *   No escala con Ability Strength.
 *   Fuente: https://wiki.warframe.com/w/Gyre/Abilities#Passive
 *
 * - `cathodeGraceCritPct`: Bonus adicional de crit chance (armas Y habilidades)
 *   del augment Cathode Grace activo. Requiere que Coil Horizon haya sido
 *   activado al menos una vez y no haya expirado.
 *   Valores por rank augment: r0=25, r1=30, r2=40, r3=50.
 *   En el engine v1, se trata como bonus estatico (asumiendo el buff activo).
 *   Fuente: https://wiki.warframe.com/w/Cathode_Grace
 *
 * - `hasCathodeGrace`: true si Cathode Grace esta equipado como augment activo.
 */
export type GyreCritBonuses = {
	/** Siempre 10 para Gyre. Bonus absoluto de la pasiva, no relativo. */
	passiveBaseCritPct: 10;
	/** Porcentaje de Cathode Grace segun rank del augment (0 si no equipado). */
	cathodeGraceCritPct: number;
	hasCathodeGrace: boolean;
};

/**
 * Resultado del calculo de crit de una habilidad de Gyre.
 */
export type AbilityCritResult = {
	/** Crit chance final en decimal (0–1 para 0–100%, puede superar 1 si >100%). */
	moddedCritChance: number;
	/** Crit damage multiplicador final (absoluto, no porcentual). */
	moddedCritDamage: number;
	/** Tier garantizado de crit y probabilidad de subir al siguiente tier. */
	tierResult: ReturnType<typeof resolveCritTier>;
	/** Multiplicador de crit promedio ponderado (para DPS teorico). */
	averageMultiplier: number;
};

/**
 * Calcula el crit de habilidades de Gyre, que tienen crit base desde la pasiva.
 *
 * Las habilidades de Gyre tienen:
 *   - baseCritChancePct: 10 (pasiva) + cualquier aumento externo si aplica (ninguno en v1)
 *   - baseCritDamagePct: 150 (multiplicador base de habilidades — mismo que armas melé por defecto)
 *
 * En v1 no hay mods que suban el crit de habilidades directamente (Organ Shatter etc. son
 * exclusivos de armas). Cathode Grace sube el chance pero NO el damage.
 *
 * @param bonuses        Bonuses de Gyre (pasiva + Cathode Grace si aplica).
 * @param baseCritDmgPct Crit damage base de la habilidad en %. Default 150 (x1.5).
 */
export function calculateGyreCrit(
	bonuses: GyreCritBonuses,
	baseCritDmgPct: number = 150,
): AbilityCritResult {
	// Crit chance: base de pasiva + Cathode Grace (ambos son bonuses absolutos).
	// No existe bonus relativo canonico en v1 para habilidades de Gyre.
	const absChanceDecimal =
		(bonuses.passiveBaseCritPct + bonuses.cathodeGraceCritPct) / 100;

	const moddedCritChance = totalCritChance(
		/* base */ 0,
		/* relativePct */ 0,
		/* absoluteDecimal */ absChanceDecimal,
	);

	// Crit damage: ningun mod de crit damage afecta habilidades en v1.
	const moddedCritDamage = totalCritDamage(
		/* base en decimal, ej 1.5 para 150% */ baseCritDmgPct / 100,
		/* relativePct */ 0,
		/* absoluteDecimal */ 0,
	);

	const tierResult = resolveCritTier(moddedCritChance);
	const averageMultiplier = averageCritMultiplier(moddedCritChance, moddedCritDamage);

	return {
		moddedCritChance,
		moddedCritDamage,
		tierResult,
		averageMultiplier,
	};
}

/**
 * Verifica si un Warframe (por uniqueName canonico) tiene excepcion de crit en habilidades.
 *
 * En v1 solo se reconoce Gyre. El conjunto puede expandirse en versiones futuras
 * cuando Voruna y Nokko sean implementados.
 *
 * @param warframeUniqueName uniqueName del Warframe (ej. "/Lotus/Powersuits/Gyre/Gyre")
 */
export function hasAbilityCritException(warframeUniqueName: string): boolean {
	// Gyre (incluye variantes Prime si se agrega en el futuro)
	return warframeUniqueName.toLowerCase().includes("gyre");
}

/**
 * Ratio por rank de Cathode Grace (augment de Coil Horizon).
 * Cada index corresponde al rank del augment (0-based).
 *
 * Fuente: https://wiki.warframe.com/w/Cathode_Grace
 */
export const CATHODE_GRACE_CRIT_PER_RANK: readonly number[] = [25, 30, 40, 50] as const;
