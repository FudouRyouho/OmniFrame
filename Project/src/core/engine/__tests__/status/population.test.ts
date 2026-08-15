/**
 * Eje Población/RNG — tramo (b) del método, prototipo. `damage-status-model.md §Población/RNG —
 * modelo resuelto`. `expectedProcEvents` colapsa los "2 niveles" (por-pellet + por-hit-a-SC>100%)
 * en una sola llamada con `statusChance` crudo (Wald: `E[N]=chance`, `OQ-ENGINE-19` no bloquea).
 * `dotPulseFromProcEvent` es el glue DoT-específico: pre-escala `value` por `chance×peso` al armar
 * el `DotPulse`, sin tocar `dot-timeline.ts` (sigue recibiendo `DotPulse[]` plano).
 */
import { describe, it, expect } from 'vitest';
import { expectedProcEvents } from '../../formulas/status/proc-population';
import { dotPulseFromProcEvent } from '../../formulas/status/dot-population';
import { pulseTotal } from '../../formulas/status/dot-timeline';
import { dotTickValue } from '../../formulas/status/dot-tick';

describe('expectedProcEvents — un pellet, un tipo', () => {
	it('SC=30%, un solo tipo de daño → weight=1.0, expected=0.3', () => {
		const events = expectedProcEvents({ toxin: 100 }, 0.3, 5);
		expect(events).toEqual([{ type: 'toxin', timestamp: 5, expected: 0.3 }]);
	});

	it('tipo con daño 0 no genera evento (procWeightByType ya lo filtra)', () => {
		const events = expectedProcEvents({ toxin: 100, slash: 0 }, 0.3, 0);
		expect(events).toHaveLength(1);
		expect(events[0].type).toBe('toxin');
	});
});

describe('expectedProcEvents — un pellet, tipos mixtos (peso = Damage÷Total)', () => {
	it('slash 60 + toxin 40, SC=50% → expected proporcional al peso de cada tipo', () => {
		const events = expectedProcEvents({ slash: 60, toxin: 40 }, 0.5, 0);
		const byType = Object.fromEntries(events.map((e) => [e.type, e.expected]));
		expect(byType.slash).toBeCloseTo(0.3, 10); // 0.5 × 0.6
		expect(byType.toxin).toBeCloseTo(0.2, 10); // 0.5 × 0.4
	});
});

describe('expectedProcEvents — SC>100% no capea (colapsa los 2 niveles del modelo)', () => {
	it('SC=234% con un solo tipo → expected=2.34, sin cap a 1.0', () => {
		const events = expectedProcEvents({ heat: 100 }, 2.34, 0);
		expect(events[0].expected).toBeCloseTo(2.34, 10);
	});
});

describe('dotPulseFromProcEvent — pre-escala value por chance×peso', () => {
	it('value = tickValue × event.expected; firstTick = timestamp + procDelay (default 1)', () => {
		const event = { type: 'toxin' as const, timestamp: 5, expected: 0.3 };
		const pulse = dotPulseFromProcEvent(event, 500, { ticks: 6 });
		expect(pulse).toEqual({ firstTick: 6, ticks: 6, value: 150, interval: undefined }); // 500×0.3
	});

	it('procDelay e interval explícitos se respetan', () => {
		const event = { type: 'heat' as const, timestamp: 2, expected: 1 };
		const pulse = dotPulseFromProcEvent(event, 100, { ticks: 4, interval: 0.5, procDelay: 0 });
		expect(pulse).toEqual({ firstTick: 2, ticks: 4, value: 100, interval: 0.5 });
	});
});

describe('end-to-end — expectedProcEvents → dotPulseFromProcEvent → pulseTotal', () => {
	it('el total esperado coincide con chance × peso × ticks × tickValue (linealidad)', () => {
		const moddedBase = 1000;
		const tickValue = dotTickValue('toxin', moddedBase); // 0.5 × 1000 = 500
		const [event] = expectedProcEvents({ toxin: 100 }, 0.4, 0); // expected = 0.4
		const pulse = dotPulseFromProcEvent(event, tickValue, { ticks: 6 });
		// total esperado = 0.4 × 6 × 500 = 1200
		expect(pulseTotal([pulse])).toBeCloseTo(1200, 5);
	});
});

// — Gated, NO prototipado esta sesión (ver damage-status-model.md §Población/RNG + OQ-ENGINE-19) —
describe('Población/RNG — residuos gated', () => {
	it.todo('OQ-ENGINE-19: generador discreto exacto de N proc-slots a SC>100% — no bloquea (Wald)');
	it.todo('cronograma real de disparos (fireRate × multishot → timestamps) — tramo (c), integración de arma real; hoy solo forcedFiringPulses (harness, sintético) o timestamp manual');
	it.todo('generalización a stack-debuff (mismo generador, distinto consumidor) — gated por la brecha del decay escalar de `behaviors.ts` (§Estado real de EntityState.ts)');
});
