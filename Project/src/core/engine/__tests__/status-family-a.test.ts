/**
 * Familia A de status (LEY `f(n) = first + perAdd × max(0, n−1)`, clamp opcional) — las
 * hipótesis-test falsables de damage-flow-model §7. Sin build, sin partida: aritmética pura
 * contra references/wiki/mechanics/status-effects.md + regresión contra EnemyState.
 *
 * Tres hipótesis:
 *  1. La función pura reproduce EXACTO lo que EnemyState da hoy Y matchea la wiki.
 *  2. Suite enumerada: cada efecto × su LEY contra la wiki (valida la HIPÓTESIS, no una instancia).
 *  3. Key-por-efecto: el ESTADO se keyea por efecto (corrosion), desacoplado del tipo (corrosive).
 */
import { describe, it, expect } from 'vitest';
import {
  stackDebuffValue,
  infectionLaw,
  disruptionLaw,
  corrosionLaw,
  EFFECT_BY_DOT_KEY,
  EFFECT_BY_DAMAGE_TYPE,
} from '../formulas/status/stack-debuff';
import { EnemyState } from '../simulate/enemies/EnemyState';
import type { ScaledEnemy, EnemyDNA } from '../simulate/enemies/EnemyRepository';
import { BASELINE_GAME_LAWS } from '../contracts';

// Coeficientes baseline (GameLaws): status_initial_bonus=100, status_stack_bonus=25,
// corrosive_initial_strip=26, corrosive_stack_strip=6.
const { status_initial_bonus: SIB, status_stack_bonus: SSB } = BASELINE_GAME_LAWS;
const { corrosive_initial_strip: CIS, corrosive_stack_strip: CSS } = BASELINE_GAME_LAWS;

function makeScaled(armor: number): ScaledEnemy {
  const dna: EnemyDNA = {
    unique_name: 'test-enemy', base_level: 1,
    health: 1000, health_type: 'Flesh',
    armor, armor_type: 'None',
    shields: 0, shield_type: 'Shields', faction: 'Grineer',
  };
  return { dna, current_level: 1, current_health: 1000, current_armor: armor, current_shields: 0 };
}

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
  // Este test fija el comportamiento ACTUAL (×4.25); cuando O4 se cierre, el valor esperado
  // cambia acá (tripwire deliberado).
  it.each([
    [1, 2.0], [10, 4.25],
  ])('Disruption n=%i → ×%f (provisional = Infection, O4)', (n, expected) => {
    expect(stackDebuffValue(disruptionLaw(SIB, SSB), n)).toBeCloseTo(expected, 5);
  });
});

describe('Regresión — la primitiva reproduce EXACTO lo que EnemyState da hoy', () => {
  it('Infection: getDamageMultiplier(false) == LEY para n ∈ {1,2,3,5,10}', () => {
    for (const n of [1, 2, 3, 5, 10]) {
      const state = new EnemyState(makeScaled(0), BASELINE_GAME_LAWS);
      state.stacks.infection = n;
      expect(state.getDamageMultiplier(false)).toBeCloseTo(stackDebuffValue(infectionLaw(SIB, SSB), n), 10);
    }
  });

  it('Disruption: getDamageMultiplier(true) == LEY para n ∈ {1,10}', () => {
    for (const n of [1, 10]) {
      const state = new EnemyState(makeScaled(0), BASELINE_GAME_LAWS);
      state.stacks.disruption = n;
      expect(state.getDamageMultiplier(true)).toBeCloseTo(stackDebuffValue(disruptionLaw(SIB, SSB), n), 10);
    }
  });

  it('Corrosion: getEffectiveArmor aplica el strip de la LEY (armor 1000)', () => {
    for (const [n, expectedStrip] of [[1, 0.26], [5, 0.50], [10, 0.80]] as const) {
      const state = new EnemyState(makeScaled(1000), BASELINE_GAME_LAWS);
      state.stacks.corrosion = n;
      const expectedArmor = 1000 * (1 - expectedStrip);
      expect(state.getEffectiveArmor(0)).toBeCloseTo(expectedArmor, 5);
    }
  });

  it('sin stacks: multiplicador neutro y armor intacto', () => {
    const state = new EnemyState(makeScaled(500), BASELINE_GAME_LAWS);
    expect(state.getDamageMultiplier(false)).toBe(1.0);
    expect(state.getDamageMultiplier(true)).toBe(1.0);
    expect(state.getEffectiveArmor(0)).toBe(500);
  });
});

describe('Key-por-efecto — el ESTADO se keyea por EFECTO, no por tipo de daño', () => {
  it('el estado corrosion stripea armor sin referirse al tipo de daño corrosive', () => {
    // Con la clave vieja (`damage_corrosive`, por tipo) esto no se podía expresar sin conflacionar
    // "aplicar el efecto Corrosion" con "hacer daño corrosivo". Ahora la clave ES el efecto:
    // una instancia sintética (habilidad) que aplica Corrosion sin daño corrosivo cae acá limpio.
    const state = new EnemyState(makeScaled(1000), BASELINE_GAME_LAWS);
    state.stacks.corrosion = 5; // efecto, no tipo
    expect(state.getEffectiveArmor(0)).toBeCloseTo(500, 5);
  });

  it('Arista 1: el mapeo tipo→efecto existe y está separado del contenedor de estado', () => {
    expect(EFFECT_BY_DOT_KEY['damage_corrosive_dot']).toBe('corrosion');
    expect(EFFECT_BY_DOT_KEY['damage_viral_dot']).toBe('infection');
    expect(EFFECT_BY_DAMAGE_TYPE['corrosive']).toBe('corrosion');
    expect(EFFECT_BY_DAMAGE_TYPE['viral']).toBe('infection');
    // Slash/Toxin (DoT puro) no tienen efecto de stack → no están en el mapeo.
    expect(EFFECT_BY_DOT_KEY['damage_slash_dot']).toBeUndefined();
  });
});
