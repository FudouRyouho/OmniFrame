/**
 * Tiberon Prime — reproducción END-TO-END del test in-game de DoT scaling.
 * SSoT del ground-truth: `references/ingame-tests/dot-scaling.md` (Tiberon vs Arid Butcher lvl215).
 *
 * Valida el fix `dot_scaling` (contrato C1→C2) contra dato REAL de partida: el DoT escala con el base
 * innato × Serration (NO el compuesto), y su `own_element` sale de los mods del propio elemento. La firma
 * empírica que lockea el fix: **el Slash DoT NO cambia al agregar un mod de Heat** (el hit sí, el DoT no).
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { deriveInstance } from '../simulate/combat/damage-instance';
import { dotTickValue } from '../formulas/status/dot-tick';
import { tiberon } from '../fixtures/builds';
import type { SimulationEntity } from '../contracts';

await loadEngineData(new NodeAdapter());

const inst = (heat: boolean) => {
  const e = consume(tiberon(heat), { flags: {} }).snapshot().find((x) => x.domain === 'weapon') as SimulationEntity;
  return deriveInstance(e);
};

describe('Tiberon Prime — DoT scaling reproduce el test in-game (ingame-tests/dot-scaling.md)', () => {
  it('sin Heat: moddedBase = dotModdedBase = 127.2 (total físico display in-game)', () => {
    const i = inst(false);
    expect(i.moddedBase).toBeCloseTo(127.2, 1);
    expect(i.dotModdedBase).toBeCloseTo(127.2, 1);
    expect(Object.keys(i.ownElementBonusPct).length).toBe(0);
  });

  it('con Thermite: el HIT crece (moddedBase 203.5) pero el DoT-base NO (dotModdedBase 127.2)', () => {
    const i = inst(true);
    expect(i.moddedBase).toBeCloseTo(203.5, 1);   // hit total con Heat (in-game 203.5)
    expect(i.dotModdedBase).toBeCloseTo(127.2, 1); // DoT-base EXCLUYE el Heat de mod → invariante
    expect(i.ownElementBonusPct.heat).toBe(60);    // Thermite Rounds +60%
  });

  it('FIRMA EMPÍRICA: el Slash DoT tick (≈45) es idéntico con y sin Heat', () => {
    const tick = (i: ReturnType<typeof deriveInstance>) =>
      dotTickValue('slash', i.dotModdedBase, i.ownElementBonusPct.slash ?? 0, i.statusDamageBonusPct);
    const noHeat = tick(inst(false));
    const withHeat = tick(inst(true));
    expect(noHeat).toBeCloseTo(44.52, 1);      // 0.35 × 127.2 ≈ 45 (in-game 45)
    expect(withHeat).toBeCloseTo(noHeat, 5);   // agregar Heat NO mueve el bleed — la firma del fix
  });

  it('Heat DoT con own_element de Thermite (pre-armor 101.76 = 0.5 × 127.2 × 1.60)', () => {
    const i = inst(true);
    const heatTick = dotTickValue('heat', i.dotModdedBase, i.ownElementBonusPct.heat ?? 0, i.statusDamageBonusPct);
    expect(heatTick).toBeCloseTo(101.76, 1);   // in-game 81 post-armor (Arid Butcher lvl215) — resolución ③ aparte
  });
});
