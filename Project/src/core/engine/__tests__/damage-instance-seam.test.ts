/**
 * Seam C1→C2 — `deriveInstance` (simulation-architecture §2.0.1).
 *
 * La Instancia es el potencial ①② que C2 **CONSUME** de la salida de C1 (no re-extrae). Estos tests
 * lockean las INVARIANTES del átomo + que lee los nodos correctos de C1 sin re-componer — el hogar
 * único de la derivación que comparten los 3 proyectores (`CombatSimulator`/`CombatCalculator`/
 * `TimelineSimulator`). Si el seam se rompe, se rompe acá, no disperso en cada proyector.
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { deriveInstance } from '../simulate/combat/damage-instance';
import { damageTypeFromToken } from '../contracts/damage-logic';
import { cedo, lanka } from '../fixtures/builds';
import type { SimulationEntity } from '../contracts';
import type { EnsembleIntention } from '@shared/types/ensemble';

await loadEngineData(new NodeAdapter());

function weaponOf(intention: EnsembleIntention): SimulationEntity {
  const e = consume(intention, { flags: {} }).snapshot().find((x) => x.domain === 'weapon');
  if (!e) throw new Error('seam test: el build no tiene entidad de arma');
  return e;
}

describe('deriveInstance — invariantes del átomo (seam C1→C2)', () => {
  it('moddedBase = Σ damageByToken = Σ damageByType', () => {
    const inst = deriveInstance(weaponOf(cedo(true)));
    const sumTokens = Object.values(inst.damageByToken).reduce((a, b) => a + b, 0);
    const sumTypes = Object.values(inst.damageByType).reduce((a, b) => a + (b ?? 0), 0);
    expect(inst.moddedBase).toBeCloseTo(sumTokens, 6);
    expect(inst.moddedBase).toBeCloseTo(sumTypes, 6);
    expect(inst.moddedBase).toBeGreaterThan(0);
  });

  it('damageByToken y damageByType = la misma info keyeada distinto (vía damageTypeFromToken)', () => {
    const inst = deriveInstance(weaponOf(cedo(true)));
    for (const [token, dmg] of Object.entries(inst.damageByToken)) {
      const type = damageTypeFromToken(token);
      if (type) expect(inst.damageByType[type]).toBeCloseTo(dmg, 6);
    }
  });

  it('lee los nodos de C1 (crit/status/multishot) sin re-componer', () => {
    const entity = weaponOf(cedo(true));
    const inst = deriveInstance(entity);
    const a = entity.attributes;
    expect(inst.critChance).toBe(a['WEAPON_ADD_CRIT_CHANCE']?.final ?? 0);
    expect(inst.critMult).toBe(a['WEAPON_ADD_CRIT_MULT']?.final ?? 1);
    expect(inst.statusChance).toBeCloseTo((a['WEAPON_ADD_STATUS_CHANCE']?.final ?? 0) / 100, 6);
    expect(inst.multishot).toBe(a['WEAPON_ADD_MULTISHOT']?.final ?? 1);
  });

  it('es pura: dos derivaciones del mismo entity dan el mismo moddedBase', () => {
    const entity = weaponOf(lanka('charged_shot'));
    expect(deriveInstance(entity).moddedBase).toBe(deriveInstance(entity).moddedBase);
  });

  it('target-agnóstica: carga ①②, NO campos de target/③ ni de cadencia/Schedule', () => {
    const inst = deriveInstance(weaponOf(lanka('charged_shot')));
    const keys = Object.keys(inst);
    // presente: el átomo ①②
    for (const k of ['damageByToken', 'damageByType', 'moddedBase', 'critChance', 'multishot', 'statusChance']) {
      expect(keys).toContain(k);
    }
    // ausente: ③ (target) y Schedule (cadencia) — no son de la Instancia (§2.0.1)
    for (const k of ['armor', 'faction', 'fireRate', 'reload', 'magSize', 'dr']) {
      expect(keys).not.toContain(k);
    }
  });
});
