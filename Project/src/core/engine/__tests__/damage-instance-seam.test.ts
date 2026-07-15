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
import { cedo, lanka, BUILDS } from '../fixtures/builds';
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

// El DoT NO escala con el daño compuesto (incluye mods de elemento) sino con el base innato × Serration;
// su own_element sale de los mods del propio elemento — NO de `final/base-1` (que daba Serration = bug).
// Confirmado in-game: `references/ingame-tests/dot-scaling.md` (Tiberon, Slash DoT invariante al agregar Heat).
describe('deriveInstance — escalado de DoT (fix dot_scaling C1→C2)', () => {
  it('SIN mods de elemento (boltor): dotModdedBase == moddedBase (no hay mod-elemento que excluir)', () => {
    const inst = deriveInstance(weaponOf(BUILDS.boltor()));
    expect(inst.dotModdedBase).toBeCloseTo(inst.moddedBase, 3);
    expect(Object.keys(inst.ownElementBonusPct).length).toBe(0);
  });

  it('CON mods de elemento (cedo): dotModdedBase EXCLUYE el daño de mods → estrictamente < moddedBase', () => {
    const inst = deriveInstance(weaponOf(cedo(true)));
    expect(inst.dotModdedBase).toBeGreaterThan(0);
    expect(inst.dotModdedBase).toBeLessThan(inst.moddedBase);
  });

  it('ownElementBonusPct = mods del propio elemento (componentes), NO el combinado ni Serration', () => {
    const oe = deriveInstance(weaponOf(cedo(true))).ownElementBonusPct;
    // cedo trae mods de toxin + cold (que combinan a viral). own_element captura los COMPONENTES por su
    // token literal — el combinado (viral) NO, porque no hay mod de viral (regla del wiki).
    expect(oe.toxin).toBeGreaterThan(0);
    expect(oe.cold).toBeGreaterThan(0);
    expect(oe.viral).toBeUndefined();
    // Serration (WEAPON_ADD_DAMAGE) no es token de elemento → estructuralmente no puede filtrarse acá.
    expect('damage' in oe).toBe(false);
  });
});
