/**
 * Crit-buff-por-stack (OQ-ENGINE-12): el target debilitado sube el crit del ATACANTE.
 *   - Weakened (Puncture) → +crit chance (%): +5×n, cap +25 a 5 stacks.
 *   - Freeze (Cold)       → +crit damage (×): +0.1+0.05(n−1), cap +0.5.
 * Verifica la LEY (getCritBonuses) + que `simulateAttack` LEE el bonus (el gancho).
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { deriveInstance } from '../simulate/combat/damage-instance';
import { CombatSimulator } from '../simulate/combat/CombatSimulator';
import { EnemyState } from '../simulate/enemies/EnemyState';
import { hostileEntity } from './hostile-entity';
import { BASELINE_GAME_LAWS } from '../contracts';
import { lanka } from '../fixtures/builds';
import type { SimulationEntity } from '../contracts';
import type { HitContext } from '../formulas/status/effect-behavior';

await loadEngineData(new NodeAdapter());

const DUMMY_HIT: HitContext = { moddedBase: 0, statusDamageBonusPct: 0, elementBonusPct: {} };
const laws = { ...BASELINE_GAME_LAWS };
const freshState = () => new EnemyState(hostileEntity('Arid Butcher', 100), laws);

describe('getCritBonuses — LEY de crit-buff por stack (OQ-ENGINE-12)', () => {
  it('Weakened: +5% crit chance por stack, cap +25 a 5 stacks', () => {
    const s = freshState();
    s.applyProc('weakened', DUMMY_HIT, 1, 0);
    expect(s.getCritBonuses(0).critChanceAdd).toBeCloseTo(5, 5);
    s.applyProc('weakened', DUMMY_HIT, 4, 0); // → 5 stacks
    expect(s.getCritBonuses(0).critChanceAdd).toBeCloseTo(25, 5);
    s.applyProc('weakened', DUMMY_HIT, 10, 0); // cap de stacks (5) → sigue 25
    expect(s.getCritBonuses(0).critChanceAdd).toBeCloseTo(25, 5);
  });

  it('Freeze: +0.1× (1er) luego +0.05×/stack de crit damage, cap +0.5×', () => {
    const s = freshState();
    s.applyProc('freeze', DUMMY_HIT, 1, 0);
    expect(s.getCritBonuses(0).critMultAdd).toBeCloseTo(0.1, 5);
    s.applyProc('freeze', DUMMY_HIT, 8, 0); // → 9 stacks
    expect(s.getCritBonuses(0).critMultAdd).toBeCloseTo(0.5, 5);
  });

  it('sin stacks → sin bonos; los ejes son independientes (Weakened≠crit dmg, Freeze≠crit chance)', () => {
    expect(freshState().getCritBonuses(0)).toEqual({ critChanceAdd: 0, critMultAdd: 0 });
    const w = freshState(); w.applyProc('weakened', DUMMY_HIT, 5, 0);
    expect(w.getCritBonuses(0).critMultAdd).toBe(0); // Weakened no toca crit damage
    const f = freshState(); f.applyProc('freeze', DUMMY_HIT, 5, 0);
    expect(f.getCritBonuses(0).critChanceAdd).toBe(0); // Freeze no toca crit chance
  });
});

describe('simulateAttack LEE el bonus de crit del target (el gancho)', () => {
  // Modo bulk (multishot > HYBRID_THRESHOLD) → avgCrit determinista, sin RNG.
  const bulkInstance = (critChance: number, critMult: number) => {
    const base = deriveInstance(
      consume(lanka('charged_shot'), { flags: {} }).snapshot().find((e) => e.domain === 'weapon') as SimulationEntity,
    );
    return { ...base, multishot: 25, critChance, critMult };
  };

  it('Weakened (más crit chance) sube el daño esperado del hit', () => {
    const inst = bulkInstance(30, 2.0);
    const clean = CombatSimulator.simulateAttack(inst, freshState(), 0).total_damage;
    const weakened = freshState(); weakened.applyProc('weakened', DUMMY_HIT, 5, 0); // +25% chance
    const buffed = CombatSimulator.simulateAttack(inst, weakened, 0).total_damage;
    expect(buffed).toBeGreaterThan(clean);
  });

  it('Freeze (más crit damage) sube el daño esperado del hit', () => {
    const inst = bulkInstance(30, 2.0);
    const clean = CombatSimulator.simulateAttack(inst, freshState(), 0).total_damage;
    const frozen = freshState(); frozen.applyProc('freeze', DUMMY_HIT, 9, 0); // +0.5× mult
    const buffed = CombatSimulator.simulateAttack(inst, frozen, 0).total_damage;
    expect(buffed).toBeGreaterThan(clean);
  });
});
