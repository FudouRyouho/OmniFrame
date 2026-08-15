/**
 * @domain Engine / Formulas / Status / DotPopulation
 * @SSoT docs/domains/engine/design/damage-status-model.md §Población/RNG — modelo resuelto
 *
 * Glue DoT-específico del generador agnóstico (`proc-population.ts`): convierte cada `ProcEvent`
 * esperado en un `DotPulse`, con `value` PRE-ESCALADO por `chance × peso` (ya colapsado en
 * `event.expected`) al nacer el proc — compute-once, la misma disciplina que ya rige `dot-tick.ts`.
 * `dot-timeline.ts` NO se toca: sigue recibiendo `DotPulse[]` plano, ciego a de dónde salió `value`.
 *
 * `tickValue` es SOURCE-SIDE (`dotTickValue(...)`, no depende del evento ni de `chance`/`peso`) —
 * lo computa el caller una vez por tipo, no esta función. `shape` es la forma del pulso para ese
 * tipo (ticks/intervalo/delay), dato de `status-effects.md`, tampoco responsabilidad de este glue.
 */

import type { ProcEvent } from "./proc-population";
import type { DotPulse } from "./dot-timeline";

export interface DotPulseShape {
	/** Cantidad de ticks del pulso (duración en ticks del tipo). */
	ticks: number;
	/** Segundos entre ticks (default 1, igual que `DotPulse.interval`). */
	interval?: number;
	/** Delay desde el evento hasta el primer tick (default 1). */
	procDelay?: number;
}

/** Un `ProcEvent` esperado + su forma de pulso → un `DotPulse` con `value` pre-escalado. */
export function dotPulseFromProcEvent(
	event: ProcEvent,
	tickValue: number,
	shape: DotPulseShape,
): DotPulse {
	return {
		firstTick: event.timestamp + (shape.procDelay ?? 1),
		ticks: shape.ticks,
		value: tickValue * event.expected,
		interval: shape.interval,
	};
}
