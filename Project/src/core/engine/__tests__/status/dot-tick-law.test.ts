/**
 * Familia C — LEY pura del VALOR de un tick de DoT (altitud 1: número→número).
 * `tick = coef × modded_base × (1 + own_element) × (1 + status_damage)`, parte NO-faction, NO-timeline.
 * arch-decisions §14 / damage-status-model §Checkpoint 3. Citado contra status-effects.md §Procs DoT.
 *
 * Faction (`×(1+faction)²`) y timeline (ticks/decay/N-timers) NO se assertan acá — son `todo` en los
 * per-effect tests. Acá sólo se verifica que la aritmética del valor de un tick es correcta.
 */
import { describe, it, expect } from 'vitest';
import { dotTickValue, DOT_COEF, type DotType } from '../../formulas/status/dot-tick';

describe('Familia C — coeficiente por tipo (status-effects.md §DoT)', () => {
  it('Slash = 0.35 (True); Toxin/Heat/Electricity/Gas = 0.5', () => {
    expect(DOT_COEF.slash).toBe(0.35);
    expect(DOT_COEF.toxin).toBe(0.5);
    expect(DOT_COEF.heat).toBe(0.5);
    expect(DOT_COEF.electricity).toBe(0.5);
    expect(DOT_COEF.gas).toBe(0.5);
  });
});

describe('Familia C — valor base del tick (sin bonos)', () => {
  it.each<[DotType, number]>([
    ['slash', 35], ['toxin', 50], ['heat', 50], ['electricity', 50], ['gas', 50],
  ])('%s: coef × 100 = %i', (type, expected) => {
    expect(dotTickValue(type, 100)).toBeCloseTo(expected, 5);
  });
});

describe('Familia C — (1 + own_element): el propio elemento amplifica, Slash NO', () => {
  it('Toxin: +90% Toxin amplifica el tick (0.5 × 100 × 1.9 = 95)', () => {
    expect(dotTickValue('toxin', 100, 90)).toBeCloseTo(95, 5);
  });

  it('Slash EXCEPCIÓN: los mods de Slash% NO amplifican el bleed (own_element forzado 0)', () => {
    expect(dotTickValue('slash', 100, 90)).toBeCloseTo(35, 5); // idéntico a sin bono
    expect(dotTickValue('slash', 100, 999)).toBeCloseTo(35, 5);
  });
});

describe('Familia C — (1 + status_damage): amplifica en todos los tipos', () => {
  it.each<[DotType, number]>([
    ['slash', 70], ['toxin', 100],
  ])('%s con +100%% status damage duplica el tick', (type, expected) => {
    expect(dotTickValue(type, 100, 0, 100)).toBeCloseTo(expected, 5);
  });

  it('composición completa Toxin: 0.5 × 100 × (1+0.9) × (1+1.0) = 190', () => {
    expect(dotTickValue('toxin', 100, 90, 100)).toBeCloseTo(190, 5);
  });
});
