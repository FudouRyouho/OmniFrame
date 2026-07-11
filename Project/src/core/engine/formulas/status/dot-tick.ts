/**
 * @domain Engine / Formulas / Status / DotTick
 * @SSoT references/wiki/mechanics/status-effects.md §Procs de tipo DoT
 *
 * Familia C — LEY del VALOR de UN tick de DoT (arch-decisions §14, damage-status-model §Checkpoint 3).
 * PROTOTIPO: sólo el valor de un tick, parte NO-faction, NO-timeline:
 *
 *   tick = coef × modded_base × (1 + own_element) × (1 + status_damage)
 *
 * FUERA (gated, `todo` en los tests — no se computa acá):
 *   - `× (1 + faction)²` (double-dip de bucket②) — eje faction diferido, discusión aparte.
 *   - el timeline: cuántos ticks, decay, N-timers, `processDots` — C2 (Slice 3).
 *   - la aplicación (¿el tick pega a salud/shields?, True bypassa armor) — resolución, no valor.
 *
 * El `StatusEngine` inline actual computa esto INCOMPLETO (le faltan términos — §Checkpoint 3).
 * Esta función nace limpia y citada; la reconciliación del `StatusEngine` es deuda separada
 * (mismo patrón que Familia A: la ley vive en `formulas/`, el orquestador se alinea después).
 */

export type DotType = "slash" | "toxin" | "heat" | "electricity" | "gas";

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
