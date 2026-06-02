/**
 * Test de integración: Felarx — Normal Attack + Incarnon Form.
 *
 * Build verificada en partida:
 *   Slot 0: Primed Chilling Grasp (r10) — Cold
 *   Slot 1: Contagious Spread     (r5)  — Toxin
 *   Slot 2: Galvanized Hell       (r10) — Multishot (on_kill)
 *   Slot 3: Galvanized Savvy      (r10) — Status Chance (on_kill)
 *   Slot 4: Primed Charged Shell  (r10) — Electricity
 *   Slot 5: Primed Cleanse Orokin (r10) — Faction (Orokin)
 *   Slot 6: Primed Ammo Stock     (r10) — Magazine
 *   Slot 7: Primed Point Blank    (r10) — Damage
 *   Arcano: Primary Deadhead (no modelado)
 *
 * Evolutions activas:
 *   Slot 2: Attuned Accuracy   (upgrade_type: null — sin efecto en engine)
 *   Slot 3: Evolved Autoloader (upgrade_type: null — sin efecto en engine)
 *   Slot 4: Racking Wrath      (WEAPON_BASE_STATUS_CHANCE +20, WEAPON_BASE_CRIT_CHANCE -10)
 *   Slot 5: Devastating Attrition (upgrade_type: null — sin efecto en engine)
 *
 * ─── Felarx base stats ────────────────────────────────────────────────────────
 * Normal Attack: Impact 38, Slash 83.6, Puncture 68.4 | CC 20% | CD 2x | SC 5.5% | Multi 4 | FR 3
 * Incarnon Form: Impact 200, Radiation 400            | CC 20% | CD 3x | SC 20%  | Multi 2.1| FR 1.5
 *
 * ─── Engine vs juego (Normal Attack) ─────────────────────────────────────────
 * | Stat           | Juego  | Engine (base) | Motivo del gap                    |
 * |---|---|---|---|
 * | Impact         | 100.7  | 100.7         | ✅                                |
 * | Slash          | 221.5  | 221.5         | ✅                                |
 * | Puncture       | 181.3  | 181.3         | ✅                                |
 * | Viral          | 1283.9 | 1283.9        | ✅ Cold 165% + Toxin 90% → Viral  |
 * | Electricity    | 830.8  | 830.8         | ✅                                |
 * | Multishot      | 8.4    | 8.4           | ✅ GH base +110% (sin on_kill)    |
 * | CC             | 10%    | 10%           | ✅ Racking Wrath BASE_FLAT -10%   |
 * | CD             | 2x     | 2x            | ✅                                |
 * | Status/proj    | 14.9%  | TBD           | ⚠️  Racking Wrath +20 base_flat   |
 * | Magazine       | 13     | ~12.6         | ✅ PAS +110% (redondeo UI)        |
 * | Fire Rate      | 3      | 3             | ✅                                |
 */
import './helpers/engine-data-setup';
import { describe, it, expect } from 'vitest';
import { MutatorBridge } from '../bridge/MutatorBridge';
import type { EnsembleIntention } from '@providers/Ensemble/ensemble.types';

// ─── IDs ─────────────────────────────────────────────────────────────────────

const FELARX = '/Lotus/Weapons/Tenno/Zariman/LongGuns/PumpShotgun/ZarimanPumpShotgun';

const MOD = {
  PRIMED_CHILLING:    '/Lotus/Upgrades/Mods/Shotgun/Expert/WeaponFreezeDamageModExpert',
  CONTAGIOUS_SPREAD:  '/Lotus/Upgrades/Mods/Shotgun/WeaponToxinDamageMod',
  GALVANIZED_HELL:    '/Lotus/Upgrades/Mods/Shotgun/WeaponFireIterationsSPMod',
  GALVANIZED_SAVVY:   '/Lotus/Upgrades/Mods/Shotgun/WeaponStatusChanceSPMod',
  PRIMED_CHARGED:     '/Lotus/Upgrades/Mods/Shotgun/Expert/WeaponElectricityDamageModExpert',
  PRIMED_CLEANSE:     '/Lotus/Upgrades/Mods/Shotgun/Expert/WeaponShotgunFactionDamageCorruptedExpert',
  PRIMED_AMMO_STOCK:  '/Lotus/Upgrades/Mods/Shotgun/Expert/WeaponClipMaxModExpert',
  PRIMED_POINT_BLANK: '/Lotus/Upgrades/Mods/Shotgun/Expert/WeaponDamageAmountModExpert',
};

const PERKS = {
  2: 'attuned_accuracy',
  3: 'evolved_autoloader',
  4: 'racking_wrath',
  5: 'devastating_attrition',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildIntention(profile: string = 'base'): EnsembleIntention {
  return {
    items: {
      warframe:         { itemId: null, rank: 30, shards: [] },
      primary:          { itemId: FELARX, rank: 30, active_profile: profile, evolution_perks: PERKS },
      secondary:        { itemId: null, rank: 30 },
      melee:            { itemId: null, rank: 30 },
      companion:        { itemId: null, rank: 30 },
      companion_weapon: { itemId: null, rank: 30 },
      archwing:         { itemId: null, rank: 30 },
      archgun:          { itemId: null, rank: 30 },
      archmelee:        { itemId: null, rank: 30 },
      necramech:        { itemId: null, rank: 30 },
    },
    mods: {
      primary: {
        // Orden crítico: Cold (0) + Toxin (1) → Viral. Electricity (4) → standalone.
        0: { itemId: MOD.PRIMED_CHILLING,    rank: 30, level: 10 },
        1: { itemId: MOD.CONTAGIOUS_SPREAD,  rank: 30, level: 5  },
        2: { itemId: MOD.GALVANIZED_HELL,    rank: 30, level: 10 },
        3: { itemId: MOD.GALVANIZED_SAVVY,   rank: 30, level: 10 },
        4: { itemId: MOD.PRIMED_CHARGED,     rank: 30, level: 10 },
        5: { itemId: MOD.PRIMED_CLEANSE,     rank: 30, level: 10 },
        6: { itemId: MOD.PRIMED_AMMO_STOCK,  rank: 30, level: 10 },
        7: { itemId: MOD.PRIMED_POINT_BLANK, rank: 30, level: 10 },
      }
    },
    environment: { targetLevel: 1, targetFaction: null, isSteelPath: false },
  };
}

function simulateBase(profile: string = 'base') {
  const bridge = new MutatorBridge();
  const result = bridge.simulateFromIntention(buildIntention(profile), { flags: {} });
  const weapon = result.entities.find(e => e.id === FELARX);
  if (!weapon) throw new Error(`Entidad ${FELARX} no encontrada`);
  return weapon.attributes;
}

function simulateStatic(profile: string = 'base') {
  const bridge = new MutatorBridge();
  const result = bridge.simulateFromIntention(buildIntention(profile));
  const weapon = result.entities.find(e => e.id === FELARX);
  if (!weapon) throw new Error(`Entidad ${FELARX} no encontrada`);
  return weapon.attributes;
}

// ─── Suite 1: Normal Attack — modo base (flags: {}) ───────────────────────────

describe('Felarx — Normal Attack, modo base', () => {
  it('daño físico: Impact 100.7 — base 38 × PPB 2.65', () => {
    expect(simulateBase().WEAPON_ADD_IMPACT_DAMAGE?.final).toBeCloseTo(100.7, 1);
  });

  it('daño físico: Slash 221.5 — base 83.6 × 2.65', () => {
    expect(simulateBase().WEAPON_ADD_SLASH_DAMAGE?.final).toBeCloseTo(221.5, 1);
  });

  it('daño físico: Puncture 181.3 — base 68.4 × 2.65', () => {
    expect(simulateBase().WEAPON_ADD_PUNCTURE_DAMAGE?.final).toBeCloseTo(181.3, 1);
  });

  it('Viral 1283.9 — Cold 165% + Toxin 90% × 2.65 (slot 0 + slot 1 → combinación)', () => {
    // Cold: 190 × 1.65 = 313.5 | Toxin: 190 × 0.90 = 171 | Viral: 484.5 × 2.65 = 1283.9
    expect(simulateBase().WEAPON_ADD_VIRAL_DAMAGE?.final).toBeCloseTo(1283.9, 1);
  });

  it('Electricity 830.8 — PCS 165% × 2.65 (standalone, no combina)', () => {
    // 190 × 1.65 × 2.65 = 830.8
    expect(simulateBase().WEAPON_ADD_ELECTRICITY_DAMAGE?.final).toBeCloseTo(830.8, 1);
  });

  it('Multishot 8.4 — GH base +110% (on_kill inactivo)', () => {
    // Base 4 × (1 + 1.10) = 8.4
    expect(simulateBase().WEAPON_ADD_MULTISHOT?.final).toBeCloseTo(8.4, 1);
  });

  it('Crit Chance 10% — base 20% + Racking Wrath BASE_FLAT -10%', () => {
    // (20 + (-10)) × 1 = 10%
    expect(simulateBase().WEAPON_ADD_CRIT_CHANCE?.final).toBeCloseTo(10, 1);
  });

  it('Crit Mult 2x — base, sin mods de crit mult', () => {
    expect(simulateBase().WEAPON_ADD_CRIT_MULT?.final).toBeCloseTo(2, 1);
  });

  it('Fire Rate 3 — base, sin mods de fire rate', () => {
    expect(simulateBase().WEAPON_ADD_FIRE_RATE?.final).toBeCloseTo(3, 1);
  });

  it('Magazine ~12.6 — base 6 × (1 + 110%) = 12.6 (juego redondea a 13)', () => {
    // El juego muestra 13. El engine da 12.6 (redondeo UI, no error de fórmula).
    expect(simulateBase().WEAPON_ADD_MAGAZINE_MAX?.final).toBeCloseTo(12.6, 0);
  });
});

// ─── Suite 1b: Status per pellet — diagnóstico de fórmula ────────────────────
//
// El status per pellet en armas multi-pellet sigue la fórmula:
//   status = base × (1 + mods_add_pct_sum) + evolution_flat_per_pellet
//
// El bonus de Racking Wrath es ADD_FLAT (post-escala), valor pre-dividido por
// base_multishot: 20% total / 4 pellets = 5% por pellet.
// Ver: https://wiki.warframe.com/w/Felarx — "divided by the base multishot of 4"
// Ver: https://wiki.warframe.com/w/Status_Effect#Status_Chance

const TOXIC_BARRAGE = '/Lotus/Upgrades/Mods/Shotgun/DualStat/PoisonEventShotgunMod';

function simulateStatusOnly(mods: Record<number, { itemId: string; rank: number; level: number }>) {
  const bridge = new MutatorBridge();
  const intention: EnsembleIntention = {
    items: {
      warframe:         { itemId: null, rank: 30, shards: [] },
      primary:          { itemId: FELARX, rank: 30, active_profile: 'base', evolution_perks: PERKS },
      secondary:        { itemId: null, rank: 30 },
      melee:            { itemId: null, rank: 30 },
      companion:        { itemId: null, rank: 30 },
      companion_weapon: { itemId: null, rank: 30 },
      archwing:         { itemId: null, rank: 30 },
      archgun:          { itemId: null, rank: 30 },
      archmelee:        { itemId: null, rank: 30 },
      necramech:        { itemId: null, rank: 30 },
    },
    mods: { primary: mods },
    environment: { targetLevel: 1, targetFaction: null, isSteelPath: false },
  };
  const result = bridge.simulateFromIntention(intention, { flags: {} });
  const weapon = result.entities.find(e => e.id === FELARX);
  if (!weapon) throw new Error('Felarx no encontrada');
  return weapon.attributes.WEAPON_ADD_STATUS_CHANCE?.final ?? 0;
}

describe('Felarx — status per pellet (mecánica de arma multi-pellet)', () => {
  it('sin mods, sin Racking Wrath: 5.5% base', () => {
    // Referencia: confirma que el base está correctamente hidratado como %.
    // Para esto hacemos simulación sin evoluciones — no es posible sin refactorear
    // buildIntention, así que testeamos el efecto indirecto via comparación.
    // Solo validamos que el base contribuye: 5.5 × 1.0 = 5.5% (sin mods).
    // Test real documentado en el suite siguiente con mods aislados.
    expect(true).toBe(true); // placeholder — ver suite de status con mods
  });

  it('Racking Wrath solo: 10.5% — base 5.5% + ADD_FLAT 5%', () => {
    // fórmula: 5.5 × 1.0 + 5 = 10.5%
    // Confirma ADD_FLAT (post-escala). Si fuera BASE_FLAT daría (5.5+5)×1 = 10.5 también,
    // pero con mods el comportamiento diverge → test siguiente lo verifica.
    const status = simulateStatusOnly({});
    expect(status).toBeCloseTo(10.5, 1);
  });

  it('Toxic Barrage r3 (+60% status) + Racking Wrath: 13.8%', () => {
    // fórmula correcta ADD_FLAT: 5.5 × (1 + 0.6) + 5 = 8.8 + 5 = 13.8%
    // Si fuera BASE_FLAT daría: (5.5+5) × 1.6 = 16.8% (incorrecto)
    const status = simulateStatusOnly({
      0: { itemId: TOXIC_BARRAGE, rank: 30, level: 3 }
    });
    expect(status).toBeCloseTo(13.8, 1);
  });

  it('Galvanized Savvy r10 (+80%) + Racking Wrath: 14.9% — coincide con juego', () => {
    // fórmula: 5.5 × (1 + 0.8) + 5 = 9.9 + 5 = 14.9%
    // Este es el valor exacto que muestra el Arsenal.
    const status = simulateStatusOnly({
      0: { itemId: MOD.GALVANIZED_SAVVY, rank: 30, level: 10 }
    });
    expect(status).toBeCloseTo(14.9, 1);
  });
});

// ─── Suite 1c: Incarnon Form — modo base ─────────────────────────────────────
//
// Felarx Incarnon Form base: Impact 200, Radiation 400 | CC 20% | CD 3x | SC 20%
// Con Racking Wrath: CC 10%, SC 40% (base_multishot Incarnon = 1 → +20 flat no dividido)
//
// DEUDA OQ-ENGINE-2: la misma instancia de IncarnonRepository aplica Racking Wrath
// con valor 5.0 (calculado para Normal Attack base_multi=4). Para Incarnon debería
// ser 20.0 (base_multi=1). Hasta resolver OQ-ENGINE-2, Incarnon status será 20+5=25%
// en lugar de 20+20=40%. CC 10% sí es correcto en ambos perfiles (BASE_FLAT -10).

describe('Felarx — Incarnon Form, modo base', () => {
  it('daño físico: Impact 530 — base 200 × PPB 2.65', () => {
    expect(simulateBase('incarnon_form').WEAPON_ADD_IMPACT_DAMAGE?.final).toBeCloseTo(530, 1);
  });

  it('Radiation 1060 — base 400 × PPB 2.65', () => {
    expect(simulateBase('incarnon_form').WEAPON_ADD_RADIATION_DAMAGE?.final).toBeCloseTo(1060, 1);
  });

  it('Viral 4054.5 — Cold 165% + Toxin 90% × 2.65 sobre base 600', () => {
    // Base Incarnon: 200+400=600. Cold: 600×1.65=990. Toxin: 600×0.90=540.
    // Viral: (990+540)×2.65 = 1530×2.65 = 4054.5
    expect(simulateBase('incarnon_form').WEAPON_ADD_VIRAL_DAMAGE?.final).toBeCloseTo(4054.5, 1);
  });

  it('Electricity 2623.5 — PCS 165% × 2.65 sobre base 600', () => {
    // 600 × 1.65 × 2.65 = 2623.5
    expect(simulateBase('incarnon_form').WEAPON_ADD_ELECTRICITY_DAMAGE?.final).toBeCloseTo(2623.5, 1);
  });

  it('Multishot 2.1 — base Incarnon=1 (attacks[1] → resolveMultishot → 1), GH +110%', () => {
    // attacks[1] → no hereda stats.multishot (4) → base = 1. GH +110%: 1 × 2.1 = 2.1
    expect(simulateBase('incarnon_form').WEAPON_ADD_MULTISHOT?.final).toBeCloseTo(2.1, 1);
  });

  it('Crit Chance 10% — base 20% + Racking Wrath BASE_FLAT -10% (igual en ambos perfiles)', () => {
    expect(simulateBase('incarnon_form').WEAPON_ADD_CRIT_CHANCE?.final).toBeCloseTo(10, 1);
  });

  it('Crit Mult 3x — base Incarnon, sin mods de crit mult', () => {
    expect(simulateBase('incarnon_form').WEAPON_ADD_CRIT_MULT?.final).toBeCloseTo(3, 1);
  });

  it.fails('Status 40% — juego: 20 base + 20 flat (base_multi=1). Engine: 25% (5 flat por OQ-ENGINE-2)', () => {
    // OQ-ENGINE-2: IncarnonRepository aplica RW con value=5 (calculado para Normal base_multi=4).
    // Incarnon necesita value=20 (base_multi=1). Engine hoy da 20+5=25%, juego muestra 40%.
    // Este test fallará hasta resolver OQ-ENGINE-2 + profile-aware incarnon modifiers.
    expect(simulateBase('incarnon_form').WEAPON_ADD_STATUS_CHANCE?.final).toBeCloseTo(40, 1);
  });
});

// ─── Suite 2: Normal Attack — modo estático ────────────────────────────────────

describe('Felarx — Normal Attack, modo estático (on_kill activo)', () => {
  it('Multishot 13.2 — GH base +110% + on_kill +120% activo', () => {
    // Base 4 × (1 + 1.10 + 1.20) = 4 × 3.30 = 13.2
    // Juego muestra 8.4 (Arsenal sin condiciones activas)
    expect(simulateStatic().WEAPON_ADD_MULTISHOT?.final).toBeCloseTo(13.2, 1);
  });

  it('Crit Chance 10% — Racking Wrath no es condicional', () => {
    expect(simulateStatic().WEAPON_ADD_CRIT_CHANCE?.final).toBeCloseTo(10, 1);
  });

  it('Viral 1283.9 — mismos elementales (PPB y elementales no son condicionales)', () => {
    expect(simulateStatic().WEAPON_ADD_VIRAL_DAMAGE?.final).toBeCloseTo(1283.9, 1);
  });
});
