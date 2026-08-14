/**
 * Familia A — LEY pura de stack-debuff (altitud 1: número→número, sin orquestador).
 * `f(n) = first + perAdd × max(0, n−1)`, clamp opcional. arch-decisions §14 / damage-flow-model §5.
 *
 * Acá se asserta que la ARITMÉTICA es correcta contra references/wiki/mechanics/status-effects.md.
 * El cableado a-través-de-`EntityState` (altitud 2) vive en los per-effect tests (corrosion/infection/
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
import {
  STATUS_INITIAL_BONUS_PCT as SIB, STATUS_STACK_BONUS_PCT as SSB,
  CORROSIVE_INITIAL_STRIP_PCT as CIS, CORROSIVE_STACK_STRIP_PCT as CSS,
} from '../../formulas/status/stack-debuff';


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

  // Corrosion (Corrosive): strip = min(0.26 + 0.06×(n−1), 1.00) (§Corrosion tabla 1/5/10).
  it.each([
    [1, 0.26], [5, 0.50], [10, 0.80],
  ])('Corrosion n=%i → strip %f', (n, expected) => {
    expect(stackDebuffValue(corrosionLaw(CIS, CSS), n)).toBeCloseTo(expected, 5);
  });

  /**
   * EL 80 % ES `f(10)`, NO EL TECHO — y los dos casos que lo prueban vienen de la misma página.
   *
   * `damage-corrosive-damage.wikitext` declara *"80% **at 10 stacks**"* y, dos líneas después, que el
   * Emerald Archon Shard sube el máximo de procs y que *"Applying **14** stacks can **fully remove all
   * armor**"*. Los 14 no son una regla aparte: son dónde la fórmula cruza el 100 % (`f(13) = 0.98`).
   *
   * Con un techo de 0.80 los dos casos devolvían 80 % — un número creíble que contradice a la fuente
   * sin que nada lo señale, y que además vuelve **inobservable** el desvío del emisor que
   * `references/ingame-tests/status-stack-caps.md` mide (cap 10 → 19 por 3 × Tauforged Emerald).
   */
  it.each([
    [13, 0.98], [14, 1.00], [19, 1.00],
  ])('Corrosion sobre el cap de stacks por defecto: n=%i → strip %f', (n, expected) => {
    expect(stackDebuffValue(corrosionLaw(CIS, CSS), n)).toBeCloseTo(expected, 5);
  });

  /**
   * El segundo caso, por un camino independiente: la pasiva de Hydroid **modifica** `first` a 50 %
   * (§17, `modifica` ⊥ `fuerza`) y la fuente declara *"100% armor reduction **at 10 stacks**"*.
   *
   * `corrosionLaw` ya acepta ese parámetro, así que el desvío del RECEPTOR es verificable hoy, antes
   * de que exista el canal que lo emita — lo que falta es quién lo declare, no la ley que lo aplique.
   */
  it('Hydroid (first=50%) llega a 100% de strip en 10 stacks, no a 80%', () => {
    expect(stackDebuffValue(corrosionLaw(50, CSS), 10)).toBeCloseTo(1.0, 5);
    expect(stackDebuffValue(corrosionLaw(50, CSS), 1)).toBeCloseTo(0.5, 5);
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
