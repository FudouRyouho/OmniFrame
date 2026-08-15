/**
 * @domain Engine / Formulas / Status / DotTimeline
 * @SSoT docs/domains/engine/design/damage-status-model.md §Modelo de timeline
 *
 * Agregación cerrada de DoT en el tiempo (arch-decisions §8.1, peldaño 2→3): el suelo C1 del
 * timeline. Cada instancia de DoT es un **pulso** `{ firstTick, ticks, value }` — nace en un
 * momento, tickea N veces con un valor constante. La línea de tiempo es la **superposición**
 * (suma) de los pulsos. NO hay reloj steppeado: se evalúa, no se simula.
 *
 * VÁLIDO SOLO mientras los pulsos estén DECLARADOS y de AMPLITUD CONSTANTE. Las 5 fronteras que lo
 * rompen (Heat consolidado, coupling Viral-en-vivo, pulsos-que-generan-pulsos, terminación por
 * muerte/detonación, densidad→EV) están en `damage-status-model.md §Modelo de timeline` — ahí entra
 * el substrato steppeado (C2), no acá.
 */

/** Un pulso de DoT: nace en `firstTick`, hace `ticks` ticks de `value`, cada `interval` segundos. */
export interface DotPulse {
	/** Segundo del primer tick (inicio + delay). */
	firstTick: number;
	/** Cantidad de ticks (el "ancho" del pulso). */
	ticks: number;
	/** Daño por tick — constante (la "amplitud"). */
	value: number;
	/** Segundos entre ticks (default 1). */
	interval?: number;
}

/** Los instantes en que un pulso tickea: `firstTick, firstTick+interval, …` (N valores). */
export function tickTimes(p: DotPulse): number[] {
	const interval = p.interval ?? 1;
	return Array.from({ length: p.ticks }, (_, k) => p.firstTick + k * interval);
}

/**
 * Daño TOTAL de la superposición = `Σ (ticks × value)`. **Independiente del fase**: cuándo empieza
 * cada pulso no cambia el total, solo su distribución por segundo. Suficiente para daño-total / TTK.
 */
export function pulseTotal(pulses: readonly DotPulse[]): number {
	return pulses.reduce((sum, p) => sum + p.ticks * p.value, 0);
}

/**
 * La CURVA: daño por cada instante de tick de la ventana = suma de los pulsos que tickean en ese
 * instante. Reproduce las "columnas" del modelo (la montañita). Depende del fase. Keyed por el
 * instante del tick (redondeado a 1e-6 para tolerar intervalos fraccionarios).
 */
export function timelineByTick(pulses: readonly DotPulse[]): Map<number, number> {
	const curve = new Map<number, number>();
	for (const p of pulses) {
		for (const t of tickTimes(p)) {
			const key = Math.round(t * 1e6) / 1e6;
			curve.set(key, (curve.get(key) ?? 0) + p.value);
		}
	}
	return curve;
}

/**
 * Daño de los ticks que caen en la ventana `[from, to)` — la medida ROBUSTA de tasa (DPS por
 * ventana). A diferencia de `timelineByTick` (ticks en el MISMO instante), no depende de la
 * alineación de los ticks: al disparar rápido los ticks caen en tiempos fraccionarios que no
 * colisionan, y `timelineByTick` los subestima. Para "¿cuánto daño por segundo?" se usa esta, no
 * la curva de instantes. (Hallazgo del tramo (a): reproducir el dato expuso el artefacto.)
 */
export function damageInWindow(pulses: readonly DotPulse[], from: number, to: number): number {
	let sum = 0;
	for (const p of pulses) {
		for (const t of tickTimes(p)) {
			if (t >= from && t < to) sum += p.value;
		}
	}
	return sum;
}

