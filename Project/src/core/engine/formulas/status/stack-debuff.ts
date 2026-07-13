/**
 * @domain Engine / Formulas / Status / StackDebuff
 * @SSoT references/wiki/mechanics/status-effects.md §Procs de stack (Debuff acumulable)
 *
 * LEY de Familia A (arch-decisions §14, damage-flow-model §5): "primer stack especial +
 * incremento lineal, con techo" — `f(n) = first + perAdd × max(0, n−1)`, clamp opcional.
 * Función pura número→número, agnóstica a source/target (es ley del juego, no "fórmula de
 * enemigo"): el orquestador (EnemyState) lee los stacks y llama acá. Keyeada por EFECTO
 * (Infection/Disruption/Corrosion), NO por tipo de daño — un efecto puede aplicarse sin su
 * tipo de daño homónimo (Arista 1, damage-flow-model §2).
 *
 * Familia C (DoT-tick dependiente del daño del arma) NO vive acá — tiene su propio plan
 * (damage-status-model.md §Checkpoint 3). El armor-strip por tiempo de Heat (Ignite) tampoco
 * es Familia A (rampa por tiempo transcurrido, no por stacks) — se queda inline en EnemyState.
 */

import { effectOfDamageType, type DamageType, type StatusEffect } from "@shared/types";

/**
 * Efectos con ESTADO rastreado hoy (los 4 con LEY que resuelve en C1). Subconjunto del vocabulario
 * canónico `StatusEffect` (@shared): `Extract` verifica EN TIPOS que son miembros válidos (un typo
 * colapsa a `never`). QUÉ se trackea es conocimiento del engine; el NOMBRE del efecto es canónico.
 */
export type TrackedStatusEffect = Extract<StatusEffect, "corrosion" | "infection" | "ignite" | "disruption">;

/** Tipos de daño cuyo efecto tiene LEY rastreada en C1 (engine-side; el mapeo tipo→efecto es canónico). */
const TRACKED_EFFECT_TYPES = ["corrosive", "viral", "heat", "magnetic"] as const satisfies readonly DamageType[];

/**
 * Arista 1 aplicada al keying legacy de `dot_pools`: `damage_<type>_dot` → efecto, DERIVADO del
 * canónico (`effectOfDamageType`), ya no hardcodeado. El espacio `dot_key` sigue vivo porque
 * `dot_pools` lo usa (frontera 1/3, muere con la migración de pools); el EFECTO ya no cuelga de una
 * tabla-sombra. Ver `docs/semantic/damage-types.md §Arista 1`.
 */
export const EFFECT_BY_DOT_KEY: Readonly<Record<string, TrackedStatusEffect>> = Object.fromEntries(
	TRACKED_EFFECT_TYPES.map((t): [string, TrackedStatusEffect] => [
		`damage_${t}_dot`,
		effectOfDamageType(t) as TrackedStatusEffect,
	]),
);

/** Parámetros de la LEY de Familia A para un efecto concreto. */
export interface StackDebuffLaw {
	/** Valor en el 1er stack (n=1). */
	first: number;
	/** Incremento por stack adicional (n>1). */
	perAdditional: number;
	/** Techo opcional del valor resultante. */
	cap?: number;
}

/**
 * LEY de Familia A: `f(n) = first + perAdd × max(0, n−1)`, clamp al `cap` opcional.
 * Definida para n≥1 (un stack existe); el orquestador guarda `n>0` antes de llamar, porque
 * el "valor neutro" difiere por efecto (×1.0 para multiplicadores, 0 para strip) y no es
 * responsabilidad de esta primitiva.
 */
export function stackDebuffValue(law: StackDebuffLaw, n: number): number {
	const raw = law.first + law.perAdditional * Math.max(0, n - 1);
	return law.cap !== undefined ? Math.min(raw, law.cap) : raw;
}

/**
 * Infection (Viral) — multiplicador al daño recibido en la capa de salud.
 * `2 + 0.25 × (n−1)`, cap ×4.25 a 10 stacks (status-effects.md §Infection, verificado in-game).
 * Los coeficientes vienen de GameLaws (configurables, override vía MutatorBridge);
 * `initialBonusPct=100` → first=2.0, `stackBonusPct=25` → perAdd=0.25.
 */
export function infectionLaw(initialBonusPct: number, stackBonusPct: number): StackDebuffLaw {
	return { first: 1 + initialBonusPct / 100, perAdditional: stackBonusPct / 100, cap: 4.25 };
}

/**
 * Disruption (Magnetic) — multiplicador al daño recibido en la capa de shields/Overguard.
 * PROVISIONAL = misma LEY que Infection (preserva el comportamiento actual: ×4.25 a 10). La wiki
 * dice ×3.25 a 10 (status-effects.md §Disruption), pero el dato está sin verificar — OQ-ENGINE
 * O4 (damage-flow-model §8): "verificar contra /w/Magnetic_Damage ANTES de instanciar 3.25;
 * hipótesis: 100% a Overguard cruza el dato". Hasta cerrarlo, Disruption hereda Infection.
 */
export function disruptionLaw(initialBonusPct: number, stackBonusPct: number): StackDebuffLaw {
	return infectionLaw(initialBonusPct, stackBonusPct);
}

/**
 * Corrosion (Corrosive) — fracción de armor stripeada, temporal por stack.
 * `min(0.26 + 0.06 × (n−1), 0.80)` (status-effects.md §Corrosion: 1→26%, 5→50%, 10→80% máximo).
 * `initialStripPct=26` → first=0.26, `stackStripPct=6` → perAdd=0.06; cap 0.80 = strip máximo.
 */
export function corrosionLaw(initialStripPct: number, stackStripPct: number): StackDebuffLaw {
	return { first: initialStripPct / 100, perAdditional: stackStripPct / 100, cap: 0.8 };
}
