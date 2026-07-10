/**
 * Infection (Viral) — caso mínimo aislado (altitud 2). MODELADO hoy: multiplicador al daño recibido
 * en la capa de SALUD (Familia A). Ver status-effects.md §Infection.
 *
 * Migra la cobertura de `enemy-state-status-multiplier.test.ts` (Viral en salud + Toxin bypass) al
 * harness de aislamiento.
 */
import { describe, it, expect } from 'vitest';
import { makeIsolatedTarget, resolveIsolated } from './harness';
import { stackDebuffValue, infectionLaw } from '../../formulas/status/stack-debuff';
import { BASELINE_GAME_LAWS } from '../../contracts';

const { status_initial_bonus: SIB, status_stack_bonus: SSB } = BASELINE_GAME_LAWS;

describe('Infection — multiplicador a la capa salud (MODELADO)', () => {
  it.each([
    [1, 2.0], [3, 2.5], [10, 4.25],
  ])('n=%i multiplica el daño a salud ×%f', (n, mult) => {
    const damage = { WEAPON_ADD_IMPACT_DAMAGE: 100 }; // target sin shields → capa salud
    const base = resolveIsolated(damage, makeIsolatedTarget({}));
    const withInfection = resolveIsolated(damage, makeIsolatedTarget({ stacks: { infection: n } }));
    expect(withInfection.health_damage).toBeCloseTo(base.health_damage * mult, 5);
    // Consistente con la LEY pura (altitud 1):
    expect(withInfection.health_damage).toBeCloseTo(base.health_damage * stackDebuffValue(infectionLaw(SIB, SSB), n), 5);
  });

  it('Toxin bypassa shields y su daño a salud recibe el multiplicador de Infection', () => {
    const damage = { WEAPON_ADD_TOXIN_DAMAGE: 100 }; // bypass shields → salud aun con shields presentes
    const base = resolveIsolated(damage, makeIsolatedTarget({ shields: 500 }));
    const withInfection = resolveIsolated(damage, makeIsolatedTarget({ shields: 500, stacks: { infection: 1 } }));
    expect(base.shield_damage).toBe(0);            // toxin no toca shields
    expect(withInfection.health_damage).toBeCloseTo(base.health_damage * 2.0, 5);
  });

  it('Infection NO afecta la capa shields (solo salud)', () => {
    const damage = { WEAPON_ADD_IMPACT_DAMAGE: 100 }; // no-toxin → golpea shields si existen
    const base = resolveIsolated(damage, makeIsolatedTarget({ shields: 500 }));
    const withInfection = resolveIsolated(damage, makeIsolatedTarget({ shields: 500, stacks: { infection: 10 } }));
    expect(withInfection.shield_damage).toBeCloseTo(base.shield_damage, 5); // sin cambio en shields
  });

  it('sin stacks: multiplicador neutro', () => {
    const damage = { WEAPON_ADD_IMPACT_DAMAGE: 100 };
    const target = makeIsolatedTarget({});
    expect(target.getDamageMultiplier(false)).toBe(1.0);
    expect(resolveIsolated(damage, target).health_damage).toBeCloseTo(100, 5);
  });

  // Lo que NO tenemos hoy:
  it.todo('los DoTs que pegan a salud se amplifican ×Infection mientras el proc está activo — depende de Familia C (tick)');
  it.todo('decay/timeline real de Infection (6s, timer por stack) — C2');
  it.todo('Infection sobre el JUGADOR: misma LEY, distinto portador — gate O1');
});
