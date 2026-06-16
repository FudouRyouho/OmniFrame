/**
 * Rhino fixture_01 — primer warframe net-new (Capa 2). Ejerce el flujo A→B→C sobre una
 * entidad NO-arma: la intención warframe deriva a una entidad PE con nodos AVATAR_* sobre los
 * que mods (%) y shards (flat) componen. Sin habilidades (Roar/Iron Skin = paso siguiente).
 *
 * Verifica los dos ejes del slice base:
 *   - eje 1 (dato base): health/shield/armor/energy salen del raw de warframes.json (sin override);
 *   - eje 2 (mods): los AVATAR_ADD_ABILITY_* componen sobre base 100; el shard flat compone sobre
 *     la armadura base — `Total = Base × (1 + Mods%) + Flat` (references/wiki/mechanics/armor.md).
 *
 * Valores verificados contra el motor vía `npm run oracle -- rhino` antes de asertar (no inventados).
 */
import { loadEngineData } from '../fixtures/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { rhino, RHINO } from '../fixtures/builds';

await loadEngineData(new NodeAdapter());

const wf = () => consume(rhino(), { flags: {} }).weapon(RHINO);

describe('Rhino fixture_01 — base + mods Tier 1 (flujo A→B→C, entidad warframe)', () => {
  // ── Eje 1: dato base del warframe (del raw, sin override) ──────────────────────
  it('health/shield/energy base salen del raw y no se modifican en Tier 1', () => {
    expect(wf().node('AVATAR_ADD_HEALTH_MAX').final).toBe(270);
    expect(wf().node('AVATAR_ADD_SHIELD_MAX').final).toBe(455);
    expect(wf().node('AVATAR_ADD_ENERGY_MAX').final).toBe(100);
  });

  // ── Eje 2: mods de habilidad componen sobre base 100 ──────────────────────────
  it('strength: base 100 + Blind Rage (+99) + Transient Fortitude (+55) = 254%', () => {
    const str = wf().node('AVATAR_ADD_ABILITY_STRENGTH');
    expect(str.base).toBe(100);
    expect(str.mods_add_pct).toBeCloseTo(154, 5);
    expect(str.final).toBeCloseTo(254, 5);
  });

  it('range: base 100 + Stretch (+45) = 145%', () => {
    expect(wf().node('AVATAR_ADD_ABILITY_RANGE').final).toBeCloseTo(145, 5);
  });

  it('duration: base 100 + Primed Continuity (+55) − Transient Fortitude (−27.5) = 127.5%', () => {
    expect(wf().node('AVATAR_ADD_ABILITY_DURATION').final).toBeCloseTo(127.5, 5);
  });

  it('efficiency: base 100 − Blind Rage (−55) = 45%', () => {
    expect(wf().node('AVATAR_ADD_ABILITY_EFFICIENCY').final).toBeCloseTo(45, 5);
  });

  // ── Eje 2: shard flat compone sobre la base de armadura (mismo nodo) ───────────
  it('armor: base 240 × (1 + 0%) + 2×225 (shards Tau azules) = 690 — flat post-escala', () => {
    const armor = wf().node('AVATAR_ADD_ARMOUR');
    expect(armor.base).toBe(240);          // dato base del raw
    expect(armor.mods_add_pct).toBe(0);    // sin mod % de armadura en Tier 1
    expect(armor.total_flat).toBe(450);    // 2 shards × 225 (Tau), bucket flat
    expect(armor.final).toBe(690);         // 240 × 1 + 450 — el shard NO se amplifica
  });

  // ── La entidad es un warframe limpio, sin contaminación de arma ────────────────
  it('no inyecta nodo WEAPON_ADD_DAMAGE (eso es un hack de composición de arma)', () => {
    expect(() => wf().node('WEAPON_ADD_DAMAGE')).toThrow();
  });
});

// ─── Borde — lo que fixture_01 NO modela todavía (it.todo) ─────────────────────────

describe('Rhino — borde (próximos peldaños del linaje)', () => {
  // Eje 3 atómico (C1 vía source_attribute, NO abre el contrato de fórmula dedicada):
  it.todo('Roar: Bonus Damage = 50% × strength (scaling atómico al grafo) — fixture_03');
  // Composición cross-stat = fórmula dedicada (B), diferida:
  it.todo('Iron Skin overguard = (1200×str) + armor×(2.5×str) — fórmula dedicada [post-scope]');
  it.todo('cross-entity: Roar buffea el daño del arma equipada (ruteo por canal) — fixture_04');
});
