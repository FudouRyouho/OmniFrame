/**
 * Disruption (Magnetic) — caso mínimo aislado (altitud 2). MODELADO hoy: multiplicador al daño
 * recibido en la capa de SHIELDS (y Overguard). Familia A, PROVISIONAL = Infection — #17 (verificar
 * contra /w/Magnetic_Damage). Ver status-effects.md §Disruption.
 */
import { describe, it, expect } from 'vitest';
import { makeIsolatedTarget, resolveIsolated } from './harness';
import { stackDebuffValue, disruptionLaw } from '../../formulas/status/stack-debuff';
import { STATUS_INITIAL_BONUS_PCT as SIB, STATUS_STACK_BONUS_PCT as SSB } from '../../formulas/status/stack-debuff';


describe('Disruption — multiplicador a la capa shields (MODELADO, provisional O4)', () => {
  it.each([
    [1, 2.0], [10, 4.25],
  ])('n=%i multiplica el daño a shields ×%f (provisional = Infection)', (n, mult) => {
    const damage = { impact: 100 }; // no-toxin → capa shields
    const base = resolveIsolated(damage, makeIsolatedTarget({ shields: 100000 }));
    const withDisruption = resolveIsolated(damage, makeIsolatedTarget({ shields: 100000, stacks: { disruption: n } }));
    expect(withDisruption.shield_damage).toBeCloseTo(base.shield_damage * mult, 5);
    expect(withDisruption.shield_damage).toBeCloseTo(base.shield_damage * stackDebuffValue(disruptionLaw(SIB, SSB), n), 5);
  });

  it('Disruption NO afecta la capa salud (solo shields)', () => {
    const damage = { impact: 100 }; // sin shields → capa salud
    const base = resolveIsolated(damage, makeIsolatedTarget({}));
    const withDisruption = resolveIsolated(damage, makeIsolatedTarget({ stacks: { disruption: 10 } }));
    expect(withDisruption.health_damage).toBeCloseTo(base.health_damage, 5); // sin cambio en salud
  });

  it('sin stacks: multiplicador neutro', () => {
    expect(makeIsolatedTarget({ shields: 500 }).getDamageMultiplier("shield")).toBe(1.0);
  });

  // Lo que NO tenemos hoy:
  it.todo('verificar la curva de Disruption contra /w/Magnetic_Damage — #17');
  it.todo('Electricity al romper Overguard: 3% del máximo por stack — #18');
  it.todo('Disruption niega la recarga natural de shields durante el proc — C2');
  it.todo('decay/timeline real de Disruption (6s, timer por stack) — C2');
  it.todo('Disruption sobre el JUGADOR: misma LEY, distinto portador — #16');
});
