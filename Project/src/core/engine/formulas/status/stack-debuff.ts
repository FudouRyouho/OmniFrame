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
 * LEYES de crit-buff-por-stack (`OQ-ENGINE-12`, status-effects.md §Weakened/§Cold). El target
 * debilitado sube el crit del ATACANTE — misma forma Familia A, aplicada al crit en vez del daño.
 * Constantes de ley fija (no config per-sim); si algún día se vuelven ajustables, migran a `GameLaws`.
 */
/** Weakened (Puncture): +5% crit chance/stack, cap +25% a 5 stacks. */
export const WEAKENED_CRIT_LAW: StackDebuffLaw = { first: 5, perAdditional: 5, cap: 25 };
/** Freeze (Cold): +0.1× crit damage (1er) luego +0.05×/stack, cap +0.5× (≈9 stacks). */
export const COLD_CRIT_LAW: StackDebuffLaw = { first: 0.1, perAdditional: 0.05, cap: 0.5 };

/**
 * **Los parámetros de las leyes de status viven acá, con su fórmula** (`arch-decisions §17`: el default
 * es del concepto, junto a su fórmula; sólo el *desvío* es del portador). Antes viajaban en `GameLaws`,
 * una tabla plana que el estado transportaba hasta cada behavior — y §17 la desarma por estructural: un
 * valor plano **no tiene dónde poner su procedencia**, así que no puede expresar *"0.26 por defecto ·
 * 0.50 si el receptor lleva la marca de Hydroid · +2 al cap si el emisor tiene esmeralda"*.
 *
 * Estos seis quedan como las constantes que siempre fueron. La cadena de desvíos (emisor/receptor) es
 * otra cosa y no está construida: cuando lo esté, entra por acá — no reabriendo la tabla plana.
 */
export const CORROSIVE_MAX_STACKS = 10;
export const CORROSIVE_INITIAL_STRIP_PCT = 26;
export const CORROSIVE_STACK_STRIP_PCT = 6;
export const STATUS_MAX_STACKS = 10;
export const STATUS_INITIAL_BONUS_PCT = 100;  // +100% Viral/Magnetic al 1er stack (×2.0)
export const STATUS_STACK_BONUS_PCT = 25;     // +25% por stack extra

/**
 * Infection (Viral) — multiplicador al daño recibido en la capa de salud.
 * `2 + 0.25 × (n−1)`, cap ×4.25 a 10 stacks (status-effects.md §Infection, verificado in-game).
 */
export function infectionLaw(
	initialBonusPct: number = STATUS_INITIAL_BONUS_PCT,
	stackBonusPct: number = STATUS_STACK_BONUS_PCT,
): StackDebuffLaw {
	return { first: 1 + initialBonusPct / 100, perAdditional: stackBonusPct / 100, cap: 4.25 };
}

/**
 * Disruption (Magnetic) — multiplicador al daño recibido en la capa de shields/Overguard.
 * PROVISIONAL = misma LEY que Infection (preserva el comportamiento actual: ×4.25 a 10). La wiki
 * dice ×3.25 a 10 (status-effects.md §Disruption), pero el dato está sin verificar — OQ-ENGINE
 * O4 (damage-flow-model §8): "verificar contra /w/Magnetic_Damage ANTES de instanciar 3.25;
 * hipótesis: 100% a Overguard cruza el dato". Hasta cerrarlo, Disruption hereda Infection.
 */
export function disruptionLaw(
	initialBonusPct: number = STATUS_INITIAL_BONUS_PCT,
	stackBonusPct: number = STATUS_STACK_BONUS_PCT,
): StackDebuffLaw {
	return infectionLaw(initialBonusPct, stackBonusPct);
}

/**
 * Corrosion (Corrosive) — fracción de armor stripeada, temporal por stack.
 * `min(0.26 + 0.06 × (n−1), 0.80)` (status-effects.md §Corrosion: 1→26%, 5→50%, 10→80% máximo).
 * `initialStripPct=26` → first=0.26, `stackStripPct=6` → perAdd=0.06; cap 0.80 = strip máximo.
 */
export function corrosionLaw(
	initialStripPct: number = CORROSIVE_INITIAL_STRIP_PCT,
	stackStripPct: number = CORROSIVE_STACK_STRIP_PCT,
): StackDebuffLaw {
	return { first: initialStripPct / 100, perAdditional: stackStripPct / 100, cap: 0.8 };
}
