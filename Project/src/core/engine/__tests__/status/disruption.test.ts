/**
 * Disruption (Magnetic) — caso mínimo aislado (altitud 2). Multiplicador al daño recibido en las
 * capas de SHIELD y OVERGUARD, con **una sola ley** para las dos (`DC-OQ-ENGINE-O4`, cerrada con
 * #17 y #37). Familia A. Ver status-effects.md §Disruption.
 */
import { describe, it, expect } from 'vitest';
import { makeIsolatedTarget, resolveIsolated } from './harness';
import { stackDebuffValue, disruptionLaw } from '../../formulas/status/stack-debuff';
import { STATUS_INITIAL_BONUS_PCT as SIB, STATUS_STACK_BONUS_PCT as SSB } from '../../formulas/status/stack-debuff';


describe('Disruption — una ley, dos capas: shield y overguard (DC-OQ-ENGINE-O4)', () => {
  it.each([
    [1, 2.0], [10, 4.25],
  ])('n=%i multiplica el daño a shields ×%f', (n, mult) => {
    const damage = { impact: 100 }; // no-toxin → capa shields
    const base = resolveIsolated(damage, makeIsolatedTarget({ shields: 100000 }));
    const withDisruption = resolveIsolated(damage, makeIsolatedTarget({ shields: 100000, stacks: { disruption: n } }));
    expect(withDisruption.shield_damage).toBeCloseTo(base.shield_damage * mult, 5);
    expect(withDisruption.shield_damage).toBeCloseTo(base.shield_damage * stackDebuffValue(disruptionLaw(SIB, SSB), n), 5);
  });

  /**
   * La mitad de O4 que no era aritmética: **la cobertura**. El `layerMult` declara `overguard` con la
   * MISMA `disruptionLaw()`, no con una tabla propia — la fuente da una sola frase para las dos capas
   * (`damage-magnetic-damage.wikitext:23`) y DE lo confirma en el changelog (`:175`).
   *
   * Se mide sobre el multiplicador de la capa y no sobre el daño derramado porque **el derrame del
   * excedente amplificado es una pregunta abierta** (#43: `receive()` derrama sin des-amplificar, y las
   * dos lecturas dan números creíbles — pide medición in-game). La cantidad se declara en el harness,
   * como en `overguard-e2e`: es un test de LEY, no del origen (que existe desde #38).
   */
  it.each([
    [1, 2.0], [10, 4.25],
  ])('n=%i multiplica el daño al overguard ×%f — misma ley que el shield', (n, mult) => {
    const t = makeIsolatedTarget({ overguard: 100000, shields: 100000, stacks: { disruption: n } });
    expect(t.getDamageMultiplier('overguard', 0)).toBeCloseTo(mult, 5);
    expect(t.getDamageMultiplier('overguard', 0)).toBeCloseTo(t.getDamageMultiplier('shield', 0), 5);
  });

  /**
   * El límite de la decisión, fijado como caso: `overshield` NO recibe el multiplicador. No es
   * simetría rota por olvido — la fuente nombra Shields y Overguard, y **calla** sobre Overshields
   * (`DC-OQ-ENGINE-O4`). Si alguien lo agrega "por coherencia", esto lo obliga a traer la fuente.
   */
  it('overshield NO recibe el multiplicador — la fuente calla y no se inventa', () => {
    const t = makeIsolatedTarget({ overshield: 100000, stacks: { disruption: 10 } });
    expect(t.getDamageMultiplier('overshield', 0)).toBe(1);
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
  it.todo('Electricity al romper Overguard: 3% del máximo por stack — #18');
  it.todo('Disruption niega la recarga natural de shields durante el proc — C2');
  it.todo('decay/timeline real de Disruption (6s, timer por stack) — C2');
  it.todo('Disruption sobre el JUGADOR: misma LEY, distinto portador — #16');
});
