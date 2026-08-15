/**
 * Harrow — Penance. Cuarta habilidad que el motor consume por HIDRATACIÓN REAL (Roar, Speed,
 * Warcry, Penance), y la que **estrena `WEAPON_ADD_FIRE_RATE`**: el nodo estaba materializado y
 * ninguna habilidad lo había ejercido — sólo mods.
 *
 * Sus dos buffs van a la MISMA entidad (el arma), a diferencia de Warcry —que reparte entre
 * warframe y melee— y de Speed, que reparte entre tres. Lo que aportan es otro contraste: **caen
 * en nodos con molde de base distinto**. Fire rate arranca del dato real del arma (5 disparos/s de
 * la Tiberon Prime) y reload de una base sintética `100` = "sin mods"; el mismo `%` produce
 * `6.75` en uno y `170` en el otro. Es el discriminador que documenta `ItemRepository`, visto
 * desde una sola habilidad.
 *
 * El reload además reusa el nodo que ya ejercía Volt Speed, así que las dos fuentes se contrastan
 * cayendo en el mismo bucket (`mods_add_pct`, junto a los mods de reload).
 *
 * Fidelidad (`references/wiki/warframes/harrow/penance.md`): fire rate 35% y reload 70% a rank 3,
 * ambos × Ability Strength.
 *
 * Valores verificados con `npm run oracle -- nodes harrow_penance` ANTES de asertar.
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { harrow, harrowPenance, HARROW, TIBERON_PRIME } from '../fixtures/builds';

await loadEngineData(new NodeAdapter());

const wf  = (b = harrow()) => consume(b, { flags: {} }).weapon(HARROW);
const gun = (b = harrow()) => consume(b, { flags: {} }).weapon(TIBERON_PRIME);

// ─── La entidad ────────────────────────────────────────────────────────────────────

describe('Harrow — la entidad', () => {
  it('health/shield/armor/energy salen del raw y no se modifican sin mods', () => {
    expect(wf().node('AVATAR_ADD_HEALTH_MAX').final).toBe(270);
    expect(wf().node('AVATAR_ADD_SHIELD_MAX').final).toBe(455);
    expect(wf().node('AVATAR_ADD_ARMOUR').final).toBe(185);
    expect(wf().node('AVATAR_ADD_ENERGY_MAX').final).toBe(100);
  });
});

// ─── Penance — los dos buffs, a la misma entidad y con bases distintas ──────────────

describe('Penance — fire rate y reload sobre el arma', () => {
  it('fire rate: +35% sobre la base REAL del arma — 5 × 1.35 = 6.75', () => {
    const fr = gun(harrowPenance()).node('WEAPON_ADD_FIRE_RATE');
    expect(fr.base).toBe(5);                // disparos/s de la Tiberon Prime, dato del arma
    expect(fr.mods_add_pct).toBe(35);
    expect(fr.multiplicative).toBe(1);      // compone con los mods, no en un escalón propio
    expect(fr.final).toBe(6.75);
  });

  it('reload: +70% sobre base SINTÉTICA 100 — el mismo % en otra unidad', () => {
    const rl = gun(harrowPenance()).node('WEAPON_ADD_RELOAD_SPEED');
    expect(rl.base).toBe(100);              // "sin mods", no un dato del arma
    expect(rl.mods_add_pct).toBe(70);
    expect(rl.final).toBe(170);
  });

  it('sin la habilidad, ninguno de los dos nodos se mueve', () => {
    expect(gun().node('WEAPON_ADD_FIRE_RATE').final).toBe(5);
    expect(gun().node('WEAPON_ADD_RELOAD_SPEED').final).toBe(100);
  });
});

describe('Penance — escalado por Ability Strength', () => {
  const build = harrowPenance({ strength: true });   // Blind Rage +99%

  it('Blind Rage lleva strength a 199%', () => {
    expect(wf(build).node('AVATAR_ADD_ABILITY_STRENGTH').final).toBe(199);
  });

  it('los dos buffs escalan con el mismo strength: 35 → 69.65% · 70 → 139.3%', () => {
    expect(gun(build).node('WEAPON_ADD_FIRE_RATE').mods_add_pct).toBeCloseTo(69.65, 10);
    expect(gun(build).node('WEAPON_ADD_RELOAD_SPEED').mods_add_pct).toBeCloseTo(139.3, 10);
  });

  it('fire rate 5 × 1.6965 = 8.4825 · reload 100 × 2.393 = 239.3', () => {
    expect(gun(build).node('WEAPON_ADD_FIRE_RATE').final).toBeCloseTo(8.4825, 10);
    expect(gun(build).node('WEAPON_ADD_RELOAD_SPEED').final).toBeCloseTo(239.3, 10);
  });
});

// ─── Borde — lo que Penance NO modela todavía (it.todo) ─────────────────────────────

describe('Penance — borde', () => {
  // La wiki le atribuye un tercer buff de melee attack speed y consigna su valor como `??%` en
  // los cuatro rangos; la descripción oficial de la habilidad no lo menciona y la UI del juego
  // tampoco lo publica. No hay número que anotar — hueco de la FUENTE, no del modelo.
  it.todo('melee attack speed — la fuente no publica el valor (`??%`)');
  // El costo es el shield entero y la duración se DERIVA de cuánto se drenó (4s base + 1.25/1.33/
  // 1.43/1.54s por cada 100 de shield, tope 120s). C1 proyecta la habilidad como siempre-activa
  // (`arch-decisions §15`), así que no computa duración ni consume el pool de shields.
  it.todo('costo del shield entero y duración derivada del shield drenado — C1 no computa duración');
  // 5% del daño hecho POR Harrow se convierte en salud para él y los aliados en Affinity Range
  // (50m, no afectado por Ability Range). Sustain sobre entidades que el modelo no tiene.
  it.todo('life steal en Affinity Range — sustain, y sin aliados como entidad (`OQ-ENGINE-31`)');
});
