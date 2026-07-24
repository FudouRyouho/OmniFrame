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
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { rhino, RHINO, rhinoRoar, TIBERON_PRIME } from '../fixtures/builds';
import { SimulationEngine } from '../resolve/SimulationEngine';
import { BASELINE_GAME_LAWS } from '../contracts';
import type { SimulationEntity, AttributeNode, AccumulatorModifier, SimulationContext } from '../contracts';

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

// ─── Fase 1a — Roar: el derive cross-entity source→target (fixture sintético) ───────
//
// Primer buff source→target en C1-estático: un warframe compone un bonus escalado por su PROPIO
// strength (Roar = 0.50×str), que fluye CROSS-ENTITY al pool de facción del arma y multiplica su
// daño — coincidiendo con la matemática exacta de la wiki (references/wiki/abilities/Rhino/Roar/Roar.md).
//
// SINTÉTICO a nivel engine (2 entidades + modifier hand-built): NO pasa por la hidratación de ability
// (eso es Fase 1b, con dato real). Prueba la CAPACIDAD (arista del grafo vía `source_entity`), no el
// adaptador. Guardrail (arch §15/§16, .working/ability-model-debate §11): SOLO el HIT directo, Roar
// asumido-activo. NO toca el DoT (dotModdedBase lee solo WEAPON_ADD_DAMAGE → double-dip = OQ-20). NO
// pasa por ModRepository → el shim C2F_FACTION_TOKENS_DEFERRED no lo afecta.

const node = (base: number, mods_add_pct = 0): AttributeNode => ({
  base, base_flat: 0, base_add_pct: 0, mods_add_pct, total_flat: 0, multiplicative: 1.0, final: base,
});

const CTX: SimulationContext = {
  active_profile_id: 'base', flags: {}, variables: {}, laws: BASELINE_GAME_LAWS,
};

/** Warframe sintético (Rhino-like): strength 254% (base 100 + mods 154, como fixture_01). */
function synthWarframe(): SimulationEntity {
  return {
    id: 'wf', unique_name: 'wf', domain: 'warframe', kind: 'warframe', persistence: 'PE', tags: ['warframe'],
    attributes: { AVATAR_ADD_ABILITY_STRENGTH: node(100) },
  };
}

/** Arma sintética: Serration +165% (pool aditivo) + un daño-token físico + pool de facción vacío. */
function synthWeapon(): SimulationEntity {
  return {
    id: 'gun', unique_name: 'gun', domain: 'weapon', kind: 'primary', persistence: 'PE', tags: ['weapon'],
    attributes: {
      WEAPON_ADD_DAMAGE: node(100),                 // pool aditivo (Serration) — factor 2.65 con +165
      GAMEPLAY_MULT_FACTION_DAMAGE: node(100),       // pool de facción — vacío hasta que Roar lo llene
      WEAPON_ADD_IMPACT_DAMAGE: node(100),           // el daño-token que lee ambos pools (§16)
    },
  };
}

/** Strength +154% sobre el warframe (Blind Rage + Transient, como fixture_01 → 254%). El derive de
 *  Roar lo lee cross-entity, así que debe venir como modifier (resetAccumulators zeroea lo horneado). */
const STRENGTH: AccumulatorModifier = {
  id: 'strength-mods', source_id: 'Mod:strength',
  target_entity: 'wf', target_attribute: 'AVATAR_ADD_ABILITY_STRENGTH', operation: 'ADD', value: 154,
};

/** Serration +165% sobre el pool aditivo del arma (mod ordinario, weapon-local). */
const SERRATION: AccumulatorModifier = {
  id: 'serration', source_id: 'Mod:serration',
  target_entity: 'gun', target_attribute: 'WEAPON_ADD_DAMAGE', operation: 'ADD', value: 165,
};

/** Roar hand-built: apunta al pool de FACCIÓN del arma, escala CROSS-ENTITY con el strength del warframe.
 *  value 50 × (strength.final/base = 2.54) = +127% → factor de facción 2.27. */
const ROAR: AccumulatorModifier = {
  id: 'roar', source_id: 'Ability:roar',
  target_entity: 'gun', target_attribute: 'GAMEPLAY_MULT_FACTION_DAMAGE', operation: 'ADD', value: 50,
  source_entity: 'wf', source_attribute: 'AVATAR_ADD_ABILITY_STRENGTH',
};

function resolveWith(mods: AccumulatorModifier[]): SimulationEntity {
  const engine = new SimulationEngine();
  const wf = synthWarframe();
  const gun = synthWeapon();
  engine.addEntity(wf);
  engine.addEntity(gun);
  mods.forEach(m => engine.addModifier(m));
  engine.resolve(CTX);
  return gun;
}

describe('Rhino Fase 1a — Roar (derive cross-entity source→target, sintético)', () => {
  // fixture_03 (número): el derive cross-entity produce el bonus correcto en el pool de facción.
  it('fixture_03: Roar = 50% × strength(254%) = +127% en el pool de facción del arma', () => {
    const gun = resolveWith([STRENGTH, SERRATION, ROAR]);
    const faction = gun.attributes['GAMEPLAY_MULT_FACTION_DAMAGE'];
    expect(faction.mods_add_pct).toBeCloseTo(127, 5); // 50 × 2.54
    expect(faction.final).toBeCloseTo(227, 5);        // base 100 × (1 + 1.27)
  });

  // fixture_04 (cadena, el hito): el HIT directo = base × (1+serration) × (1+roar), matemática wiki.
  it('fixture_04: HIT = 100 × (1+1.65) × (1+1.27) = 601.55 (Serration × Roar)', () => {
    const gun = resolveWith([STRENGTH, SERRATION, ROAR]);
    expect(gun.attributes['WEAPON_ADD_IMPACT_DAMAGE'].final).toBeCloseTo(601.55, 3);
  });

  // Aislar la contribución de Roar: sin él, solo Serration → 265 (el pool de facción es no-op, factor 1.0).
  it('baseline sin Roar: HIT = 100 × (1+1.65) = 265 (pool de facción vacío)', () => {
    const gun = resolveWith([STRENGTH, SERRATION]);
    expect(gun.attributes['WEAPON_ADD_IMPACT_DAMAGE'].final).toBeCloseTo(265, 3);
  });
});

// ─── Fase 1b — Roar por HIDRATACIÓN REAL (AbilityRepository, no hand-built) ─────────
//
// El salto de 1a→1b: en 1a el modifier de Roar se construía a mano en el fixture (probaba
// la CAPACIDAD — la arista cross-entity del grafo). Acá el modifier lo PRODUCE la
// hidratación desde el dato real (`ability-stats.override`, upgrade_type poblado con
// `$$GAMEPLAY_MULT_FACTION_DAMAGE`): AbilityRepository lee la ability activa declarada en la
// intención (`abilities:[{id}]`), resuelve el verbo muta-state y emite el buff cross-entity.
// Es fixture_03 realizado por el motor de datos — cierra "¿el motor consume habilidades?".
//
// Build: Rhino (strength 254%) + Tiberon Prime (sin mods) + Roar. Roar asumido-activo
// (proyección estática del source-state, §15; source-state vivo/duración = gate G-a diferido).

const roarWeapon = () => consume(rhinoRoar(), { flags: {} }).weapon(TIBERON_PRIME);

describe('Rhino Fase 1b — Roar (hidratación real: AbilityRepository → pool de facción)', () => {
  it('el buff aterriza en el pool de facción del arma: +127% = 50% × strength(254%)', () => {
    const faction = roarWeapon().node('GAMEPLAY_MULT_FACTION_DAMAGE');
    expect(faction.base).toBe(100);
    expect(faction.mods_add_pct).toBeCloseTo(127, 5); // 50 (base_value real del override) × 2.54
    expect(faction.final).toBeCloseTo(227, 5);         // 100 × (1 + 1.27)
  });

  it('aislamiento: sin la ability declarada, el pool de facción es no-op (100)', () => {
    const noRoar = rhinoRoar();
    delete noRoar.items.warframe.abilities; // misma build, sin el verbo muta-state
    const faction = consume(noRoar, { flags: {} }).weapon(TIBERON_PRIME).node('GAMEPLAY_MULT_FACTION_DAMAGE');
    expect(faction.final).toBe(100);
  });
});

// ─── Borde — lo que el linaje NO modela todavía (it.todo) ──────────────────────────

describe('Rhino — borde (próximos peldaños del linaje)', () => {
  // Composición cross-stat = fórmula dedicada (B). DIFERIDA por `OQ-ENGINE-24`: el mecanismo no se
  // paga hasta recorrer habilidades simples y tener el conteo real de formas (hoy 1 de 1241
  // `upgrade_by` del override emite modifier — Roar). El gap está caracterizado y ROJO-ejecutable en
  // `cross-stat-derivation.test.ts` (2 `it.fails`): "× Strength" es estructuralmente inexpresable por
  // el acumulador, y la derivación post-resolve no sobrevive al `resolve()` siguiente.
  it.todo('Iron Skin overguard = ([1200 + 2.5 × TotalArmor] × Strength) + Absorbed — fórmula dedicada [OQ-ENGINE-24]');
});
