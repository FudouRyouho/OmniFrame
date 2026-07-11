/**
 * Tramo (a) del método — composición a 100% FORZADO, todo sintético → número EXACTO reproducible.
 * `damage-status-model.md §Modelo de timeline`. Sin dados (100% status), sin hidratación (params
 * sintéticos). Sube peldaño por peldaño: 1 instancia → multishot → N balas (ventana) → composición
 * de estados → end-to-end (dotTickValue → escenario → superposición). La estadística (status<100%) y
 * la integración (arma real) son tramos (b)/(c), aparte.
 */
import { describe, it, expect } from 'vitest';
import { pulseTotal, timelineByTick, damageInWindow } from '../../formulas/status/dot-timeline';
import { forcedFiringPulses, type ForcedFiringScenario } from './harness';
import { dotTickValue } from '../../formulas/status/dot-tick';

// Toxina forzada, 6 ticks de 50, delay 1s — el "arma sintética" base.
const base: ForcedFiringScenario = { shots: 1, fireRate: 1, ticks: 6, tickValue: 50 };

describe('(a.1) una instancia — el piso', () => {
  it('1 bala, 1 pellet → 1 pulso → total 300 (6×50)', () => {
    const pulses = forcedFiringPulses(base);
    expect(pulses).toHaveLength(1);
    expect(pulseTotal(pulses)).toBe(300);
  });
});

describe('(a.2) multishot — a 100% forzado es un multiplicador de amplitud', () => {
  it('multishot 3 → 3 pulsos concurrentes en la misma fase → cada tick vale 150, total 900', () => {
    const pulses = forcedFiringPulses({ ...base, multishot: 3 });
    expect(pulses).toHaveLength(3);
    expect(pulseTotal(pulses)).toBe(900); // 3 × 300
    // los 3 pellets tickean juntos (mismo disparo): cada segundo golpeado vale 3×50
    expect(timelineByTick(pulses).get(1)).toBe(150);
    expect(timelineByTick(pulses).get(6)).toBe(150);
  });
});

describe('(a.3) ventana de tiempo — vaciar N balas fasa los pulsos', () => {
  it('3 balas a fireRate 1 → pulsos en s1, s2, s3 (delay 1); total 900, curva en montaña', () => {
    const pulses = forcedFiringPulses({ ...base, shots: 3 });
    expect(pulseTotal(pulses)).toBe(900); // 3 × 300, independiente del fase
    const curve = timelineByTick(pulses);
    // s1: solo bala 1 (50). s2: balas 1+2 (100). s3..s6: las 3 (150). rampa de bajada después.
    expect(curve.get(1)).toBe(50);
    expect(curve.get(2)).toBe(100);
    expect(curve.get(3)).toBe(150);
    expect(curve.get(6)).toBe(150);
    expect(curve.get(7)).toBe(100); // bala 1 ya murió
    expect(curve.get(8)).toBe(50);  // solo bala 3 sigue viva
  });

  it('fireRate más alto front-loadea el daño: más daño en la ventana temprana [0,3)', () => {
    // Medido con damageInWindow (robusto), NO con ticks simultáneos (artefacto de alineación):
    // fast vacía las 6 balas antes de t=1, así que para t=3 ya cayeron muchos más ticks.
    const slow = forcedFiringPulses({ ...base, shots: 6, fireRate: 1 });
    const fast = forcedFiringPulses({ ...base, shots: 6, fireRate: 6 });
    expect(damageInWindow(fast, 0, 3)).toBeGreaterThan(damageInWindow(slow, 0, 3));
    // el TOTAL es idéntico (mismas 6 balas) — solo cambia la distribución en el tiempo
    expect(pulseTotal(fast)).toBe(pulseTotal(slow));
  });
});

describe('(a.4) composición de estados — superponer dos listas de pulsos', () => {
  it('slash (0.35×base) + toxin (0.5×base) forzados = suma de totales', () => {
    const moddedBase = 1000;
    const slash = forcedFiringPulses({ shots: 1, fireRate: 1, ticks: 6, tickValue: dotTickValue('slash', moddedBase) });
    const toxin = forcedFiringPulses({ shots: 1, fireRate: 1, ticks: 6, tickValue: dotTickValue('toxin', moddedBase) });
    // slash: 6 × 350 = 2100; toxin: 6 × 500 = 3000
    expect(pulseTotal(slash)).toBeCloseTo(2100, 5);
    expect(pulseTotal(toxin)).toBeCloseTo(3000, 5);
    expect(pulseTotal([...slash, ...toxin])).toBeCloseTo(5100, 5);
  });
});

describe('(a.5) end-to-end sintético — dotTickValue → escenario → superposición', () => {
  it('arma sintética: base 1000, +90% toxina, +100% status damage, multishot 2, 3 balas de toxina', () => {
    const tick = dotTickValue('toxin', 1000, 90, 100); // 0.5 × 1000 × 1.9 × 2.0 = 1900
    expect(tick).toBeCloseTo(1900, 5);
    const pulses = forcedFiringPulses({ shots: 3, fireRate: 1, multishot: 2, ticks: 6, tickValue: tick });
    // 3 balas × 2 pellets × 6 ticks × 1900 = 68400, exacto y reproducible
    expect(pulses).toHaveLength(6);
    expect(pulseTotal(pulses)).toBeCloseTo(68400, 5);
  });
});
