/**
 * @domain Engine / Formulas / Status / DotTick
 * @SSoT references/wiki/mechanics/status-effects.md §Procs de tipo DoT
 *
 * Familia C — LEY del VALOR de UN tick de DoT (arch-decisions §14). Sólo el valor de un tick, parte
 * NO-faction, NO-timeline:
 *
 *   tick = coef × modded_base × (1 + own_element) × (1 + status_damage)
 *
 * **Wired** (modelo unificado de proc, `6947eb1`): lo consumen los DoT behaviors (bleed/poison/ignite)
 * al aplicar el proc (`behaviors.ts`). El `advance` del behavior emite y `resolveDamageEvent` resuelve.
 *
 * FUERA (gated — no se computa acá):
 *   - `× (1 + faction)²` (double-dip de bucket②) — mitad live del tick, `OQ-ENGINE-20`.
 *   - el timeline: cuántos ticks, decay, N-timers — vive en `dot-timeline.ts` + el behavior.
 *   - la aplicación (¿el tick pega a salud/shields?, True bypassa armor) — resolución, no valor.
 */

import type { DamageType } from "@shared/types";

/**
 * Dominio del coeficiente de tick — subset DERIVADO del canónico (`Extract`: un typo colapsa a `never`,
 * y renombrar un `DamageType` rompe la lista acá en vez de divergir en silencio). NO es una categoría
 * semántica de "los tipos DoT": es, estructuralmente, los tipos que HOY cargan un coeficiente de tick
 * escalado por daño del arma.
 *
 * ⚠️ **Deuda semántica abierta (no resuelta acá):** "DoT" es un COMPORTAMIENTO (daño sobre el tiempo),
 * no un grupo invariante — p. ej. `status_damage` afecta también a tipos fuera de este set (Blast, que
 * no es DoT). El naming `DotType` presume una categoría que no cierra; modelar el eje comportamiento
 * aparte del eje coeficiente es trabajo propio, no esta vuelta.
 */
export type DotType = Extract<DamageType, "slash" | "toxin" | "heat" | "electricity" | "gas">;

/** Coeficiente por tipo (status-effects.md §DoT): Slash 0.35 (True), resto 0.5. */
export const DOT_COEF: Readonly<Record<DotType, number>> = {
	slash: 0.35,
	toxin: 0.5,
	heat: 0.5,
	electricity: 0.5,
	gas: 0.5,
};

/**
 * Valor de un tick. `moddedBase` = daño base modificado TOTAL de la instancia (sin faction).
 * `ownElementBonusPct` = mods del propio elemento (ej. +Toxin% amplifica el tick de Toxin).
 *
 * **Excepción Slash (status-effects.md §Bleed):** los mods de Slash% NO amplifican el bleed →
 * `own_element` se fuerza a 0 para `slash`, sin importar el argumento.
 */
export function dotTickValue(
	type: DotType,
	moddedBase: number,
	ownElementBonusPct = 0,
	statusDamageBonusPct = 0,
): number {
	const ownElement = type === "slash" ? 0 : ownElementBonusPct;
	return DOT_COEF[type] * moddedBase * (1 + ownElement / 100) * (1 + statusDamageBonusPct / 100);
}
