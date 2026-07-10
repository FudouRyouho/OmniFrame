/**
 * Corrosion (Corrosive) — caso mínimo aislado (altitud 2: instancia → resolución → target).
 * MODELADO hoy: armor strip por stack (Familia A). Ver status-effects.md §Corrosion.
 *
 * Qué NO modelamos (todos abajo): decay/timeline real, replace-oldest sobre-cap, Corrosion sobre
 * el jugador (contenedor entidad-neutral, gate O1).
 */
import { describe, it, expect } from 'vitest';
import { makeIsolatedTarget, resolveIsolated, ISOLATED_FACTION } from './harness';
import { stackDebuffValue, corrosionLaw } from '../../formulas/status/stack-debuff';
import { BASELINE_GAME_LAWS } from '../../contracts';
import { targetFactionMult } from '../../contracts/damage-multipliers';

const { corrosive_initial_strip: CIS, corrosive_stack_strip: CSS } = BASELINE_GAME_LAWS;

describe('harness — invariante de aislamiento', () => {
  it('la facción sentinela neutraliza la matriz③ (×1.0 para todo tipo)', () => {
    expect(targetFactionMult('WEAPON_ADD_CORROSIVE_DAMAGE', ISOLATED_FACTION)).toBe(1);
    expect(targetFactionMult('WEAPON_ADD_IMPACT_DAMAGE', ISOLATED_FACTION)).toBe(1);
    expect(targetFactionMult('WEAPON_ADD_VIRAL_DAMAGE', ISOLATED_FACTION)).toBe(1);
  });
});

describe('Corrosion — armor strip (MODELADO)', () => {
  it.each([
    [1, 0.26], [5, 0.50], [10, 0.80],
  ])('n=%i stripea el armor del target aislado a la fracción de la LEY (strip %f)', (n, strip) => {
    const target = makeIsolatedTarget({ armor: 1000, stacks: { corrosion: n } });
    expect(target.getEffectiveArmor(0)).toBeCloseTo(1000 * (1 - strip), 5);
    // Consistente con la LEY pura (altitud 1):
    expect(target.getEffectiveArmor(0)).toBeCloseTo(1000 * (1 - stackDebuffValue(corrosionLaw(CIS, CSS), n)), 5);
  });

  it('el strip llega a la resolución: más stacks de Corrosion → más daño a salud (menos DR)', () => {
    const damage = { WEAPON_ADD_IMPACT_DAMAGE: 100 }; // no-toxin, target sin shields → capa salud
    const noStrip = resolveIsolated(damage, makeIsolatedTarget({ armor: 1000, health: 100000 }));
    const strip5 = resolveIsolated(damage, makeIsolatedTarget({ armor: 1000, health: 100000, stacks: { corrosion: 5 } }));
    const strip10 = resolveIsolated(damage, makeIsolatedTarget({ armor: 1000, health: 100000, stacks: { corrosion: 10 } }));
    expect(strip5.health_damage).toBeGreaterThan(noStrip.health_damage);
    expect(strip10.health_damage).toBeGreaterThan(strip5.health_damage);
  });

  it('sin stacks: armor intacto', () => {
    expect(makeIsolatedTarget({ armor: 1000 }).getEffectiveArmor(0)).toBe(1000);
  });

  // Lo que NO tenemos hoy (frontera explícita — no assertar números contra maquinaria ausente):
  it.todo('decay/timeline real de Corrosion (8s, timer por stack) — C2, processDots N-timers');
  it.todo('sobre-cap: el 11º stack reemplaza al más viejo (replace-oldest) — C2');
  it.todo('Corrosion sobre el JUGADOR: misma LEY, distinto portador — gate O1 (contenedor entidad-neutral)');
});
