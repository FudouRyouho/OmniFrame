/**
 * Timeline de DoT — superposición de pulsos DECLARADOS (suelo C1, Slice 3a).
 * `damage-status-model.md §Modelo de timeline`. La línea de tiempo se EVALÚA (suma de pulsos), no se
 * simula con un reloj. Cada pulso es de amplitud constante — el caso limpio, antes de las 5 fronteras.
 *
 * El caso canónico es la tabla que el usuario dibujó a mano (dos pulsos fasados): la prueba de que el
 * timeline del caso declarado es forma cerrada, no un substrato steppeado.
 */
import { describe, it, expect } from 'vitest';
import { pulseTotal, timelineByTick, tickTimes, type DotPulse } from '../../formulas/status/dot-timeline';

// La tabla del usuario: pulso A (50) tickea en s1..s6; pulso B (100) tickea en s2..s7.
const A: DotPulse = { firstTick: 1, ticks: 6, value: 50 };
const B: DotPulse = { firstTick: 2, ticks: 6, value: 100 };

describe('Timeline — un solo pulso', () => {
  it('6 ticks × 50 = 300 total, ticks en s1..s6', () => {
    expect(pulseTotal([A])).toBe(300);
    expect(tickTimes(A)).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe('Timeline — la tabla del usuario (dos pulsos fasados)', () => {
  it('la curva reproduce las columnas dibujadas a mano', () => {
    const curve = timelineByTick([A, B]);
    // s1: solo A (50). s2..s6: A+B (150). s7: solo B (100).
    expect(curve.get(1)).toBe(50);
    expect(curve.get(2)).toBe(150);
    expect(curve.get(3)).toBe(150);
    expect(curve.get(4)).toBe(150);
    expect(curve.get(5)).toBe(150);
    expect(curve.get(6)).toBe(150);
    expect(curve.get(7)).toBe(100);
    expect(curve.get(0)).toBeUndefined(); // nadie tickea en s0
  });

  it('la curva es asimétrica: sube (50→150) y baja (150→100) — la montañita', () => {
    const curve = timelineByTick([A, B]);
    expect(curve.get(1)).toBeLessThan(curve.get(2)!);   // rampa de subida
    expect(curve.get(7)).toBeLessThan(curve.get(6)!);   // rampa de bajada
  });

  it('total = área = 300 + 600 = 900', () => {
    expect(pulseTotal([A, B])).toBe(900);
  });
});

describe('Timeline — el total es independiente del fase', () => {
  it('mover el inicio de un pulso cambia la curva pero NO el total', () => {
    const shifted: DotPulse = { ...B, firstTick: 5 }; // B empieza mucho después
    expect(pulseTotal([A, shifted])).toBe(900);        // total idéntico
    // pero la curva sí cambia: ahora s7 y s10 difieren del caso original
    expect(timelineByTick([A, shifted]).get(2)).toBe(50); // en s2 ya no está B
  });
});
