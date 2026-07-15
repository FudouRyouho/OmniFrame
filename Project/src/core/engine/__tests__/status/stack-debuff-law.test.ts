/**
 * Familia A — LEY pura de stack-debuff (altitud 1: número→número, sin orquestador).
 * `f(n) = first + perAdd × max(0, n−1)`, clamp opcional. arch-decisions §14 / damage-flow-model §5.
 *
 * Acá se asserta que la ARITMÉTICA es correcta contra references/wiki/mechanics/status-effects.md.
 * El cableado a-través-de-`EnemyState` (altitud 2) vive en los per-effect tests (corrosion/infection/
 * disruption), vía el harness de aislamiento — NO se duplica la ley acá.
 */
import { describe, it, expect } from 'vitest';
import {
  stackDebuffValue,
  infectionLaw,
  disruptionLaw,
  corrosionLaw,
} from '../../formulas/status/stack-debuff';
import { effectOfDamageType } from '@shared/types';
import { BASELINE_GAME_LAWS } from '../../contracts';

const { status_initial_bonus: SIB, status_stack_bonus: SSB } = BASELINE_GAME_LAWS;
const { corrosive_initial_strip: CIS, corrosive_stack_strip: CSS } = BASELINE_GAME_LAWS;

describe('Familia A — primitiva pura f(n) = first + perAdd × max(0, n−1)', () => {
  it('n=1 devuelve first exacto (max(0,0)=0)', () => {
    expect(stackDebuffValue({ first: 2.0, perAdditional: 0.25 }, 1)).toBe(2.0);
    expect(stackDebuffValue({ first: 0.26, perAdditional: 0.06 }, 1)).toBeCloseTo(0.26, 10);
  });

  it('clampea al cap cuando se supera', () => {
    expect(stackDebuffValue({ first: 0.26, perAdditional: 0.06, cap: 0.8 }, 100)).toBe(0.8);
    expect(stackDebuffValue({ first: 2.0, perAdditional: 0.25, cap: 4.25 }, 100)).toBe(4.25);
  });

  it('sin cap no clampea', () => {
    expect(stackDebuffValue({ first: 2.0, perAdditional: 0.25 }, 100)).toBeCloseTo(2 + 0.25 * 99, 10);
  });
});

describe('Suite enumerada — cada efecto × su LEY contra status-effects.md', () => {
  // Infection (Viral): multiplier = 2 + 0.25×(n−1), cap ×4.25 (§Infection).
  it.each([
    [1, 2.0], [2, 2.25], [3, 2.5], [5, 3.0], [10, 4.25],
  ])('Infection n=%i → ×%f', (n, expected) => {
    expect(stackDebuffValue(infectionLaw(SIB, SSB), n)).toBeCloseTo(expected, 5);
  });

  // Corrosion (Corrosive): strip = min(0.26 + 0.06×(n−1), 0.80) (§Corrosion tabla 1/5/10).
  it.each([
    [1, 0.26], [5, 0.50], [10, 0.80],
  ])('Corrosion n=%i → strip %f', (n, expected) => {
    expect(stackDebuffValue(corrosionLaw(CIS, CSS), n)).toBeCloseTo(expected, 5);
  });

  // Disruption (Magnetic): PROVISIONAL = Infection (O4: wiki dice ×3.25 a 10, sin verificar).
  // Tripwire deliberado: cuando O4 se cierre, el valor esperado cambia acá.
  it.each([
    [1, 2.0], [10, 4.25],
  ])('Disruption n=%i → ×%f (provisional = Infection, O4)', (n, expected) => {
    expect(stackDebuffValue(disruptionLaw(SIB, SSB), n)).toBeCloseTo(expected, 5);
  });
});

describe('Arista 1 — mapeo tipo→efecto (canónico @shared, sin tabla-sombra)', () => {
  it('effectOfDamageType resuelve los 4 efectos con LEY de Familia A', () => {
    expect(effectOfDamageType('corrosive')).toBe('corrosion');
    expect(effectOfDamageType('viral')).toBe('infection');
    expect(effectOfDamageType('heat')).toBe('ignite');
    expect(effectOfDamageType('magnetic')).toBe('disruption');
  });

  it('true no dispara proc (sin efecto)', () => {
    expect(effectOfDamageType('true')).toBeNull();
  });
});
