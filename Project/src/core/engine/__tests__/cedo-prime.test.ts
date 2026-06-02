/**
 * Test de integración: Cedo Prime (Normal Attack) contra datos reales del Arsenal.
 *
 * Build verificada en partida (2026-05-27):
 *   Toxic Barrage (r3), Shotgun Barrage (r5), Critical Deceleration (r5),
 *   Primed Chilling Grasp (r10), Primed Point Blank (r10), Galvanized Savvy (r10),
 *   Galvanized Hell (r10), Primed Ravage (r10).
 *
 * ─── Estado del engine vs juego (2026-05-29) ──────────────────────────────────
 *
 * | Stat              | Juego  | Engine        | Estado                                       |
 * |---|---|---|---|
 * | Puncture          | 84.8   | 84.8          | ✅ WEAPON_ADD_DAMAGE mapeado (PPB)            |
 * | Viral             | 190.8  | undefined     | ❌ WEAPON_PERCENT_BASE_DAMAGE_ADDED pendiente |
 * | Crit Chance       | 72%    | 72%           | ✅ WEAPON_ADD_CRIT_CHANCE mapeado             |
 * | Crit Mult         | 5.04x  | 5.04x         | ✅ WEAPON_ADD_CRIT_MULT mapeado               |
 * | Status/proj       | 4.8%   | 4.8%          | ✅ WEAPON_ADD_STATUS_CHANCE mapeado           |
 * | Fire Rate         | 7.65   | 7.65          | ✅ WEAPON_ADD_FIRE_RATE mapeado               |
 * | Multishot (base)  | —      | 14.7          | ✅ GH base +110%, on_kill inactivo            |
 * | Multishot (estát) | —      | 23.1          | ✅ GH base +110% + on_kill +120% activo       |
 *
 * Nota: Galvanized Savvy tiene dos stats:
 *   stat 0 — +80% WEAPON_ADD_STATUS_CHANCE, condition: null → siempre activo.
 *   stat 1 — WEAPON_DAMAGE_IF_VICTIM_PROC_ACTIVE, condition: "on_kill" → pendiente D-6.
 *
 * Nota: Primed Chilling (Cold) y Toxic Barrage (Toxin) tienen su daño elemental
 *   bajo WEAPON_PERCENT_BASE_DAMAGE_ADDED — pendiente de mapear. Sin esos elementos
 *   no hay combinación Viral → WEAPON_ADD_VIRAL_DAMAGE no existe en el grafo.
 */
import './helpers/engine-data-setup';
import { describe, it, expect } from 'vitest';
import { MutatorBridge } from '../bridge/MutatorBridge';
import type { EnsembleIntention } from '@providers/Ensemble/ensemble.types';

// ─── IDs ─────────────────────────────────────────────────────────────────────

const CEDO_PRIME = '/Lotus/Weapons/Tenno/LongGuns/PrimeCedo/PrimeCedoWeapon';

const MOD = {
  TOXIC_BARRAGE:        '/Lotus/Upgrades/Mods/Shotgun/DualStat/PoisonEventShotgunMod',
  SHOTGUN_BARRAGE:      '/Lotus/Upgrades/Mods/Shotgun/WeaponFireRateMod',
  CRITICAL_DECEL:       '/Lotus/Upgrades/Mods/Shotgun/DualStat/CorruptedCritChanceFireRateShotgun',
  PRIMED_CHILLING:      '/Lotus/Upgrades/Mods/Shotgun/Expert/WeaponFreezeDamageModExpert',
  PRIMED_POINT_BLANK:   '/Lotus/Upgrades/Mods/Shotgun/Expert/WeaponDamageAmountModExpert',
  GALVANIZED_SAVVY:     '/Lotus/Upgrades/Mods/Shotgun/WeaponStatusChanceSPMod',
  GALVANIZED_HELL:      '/Lotus/Upgrades/Mods/Shotgun/WeaponFireIterationsSPMod',
  PRIMED_RAVAGE:        '/Lotus/Upgrades/Mods/Shotgun/Expert/WeaponCritDamageModExpert',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildIntention(includeGalvanizedHell = false): EnsembleIntention {
  return {
    items: {
      warframe:         { itemId: null, rank: 30, shards: [] },
      primary:          { itemId: CEDO_PRIME, rank: 30, active_profile: 'base' },
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
        0: { itemId: MOD.TOXIC_BARRAGE,      rank: 30, level: 3  },
        1: { itemId: MOD.SHOTGUN_BARRAGE,    rank: 30, level: 5  },
        2: { itemId: MOD.CRITICAL_DECEL,     rank: 30, level: 5  },
        3: { itemId: MOD.PRIMED_CHILLING,    rank: 30, level: 10 },
        4: { itemId: MOD.PRIMED_POINT_BLANK, rank: 30, level: 10 },
        5: { itemId: MOD.GALVANIZED_SAVVY,   rank: 30, level: 10 },
        ...(includeGalvanizedHell ? { 6: { itemId: MOD.GALVANIZED_HELL, rank: 30, level: 10 } } : {}),
        7: { itemId: MOD.PRIMED_RAVAGE,      rank: 30, level: 10 },
      }
    },
    environment: { targetLevel: 1, targetFaction: null, isSteelPath: false },
  };
}

/** Sin condicionales — flags: {} explícito. */
function simulateBase(includeGalvanizedHell = false) {
  const bridge = new MutatorBridge();
  const result = bridge.simulateFromIntention(buildIntention(includeGalvanizedHell), { flags: {} });
  const weapon = result.entities.find(e => e.id === CEDO_PRIME);
  if (!weapon) throw new Error(`Entidad ${CEDO_PRIME} no encontrada`);
  return weapon.attributes;
}

/** Modo estático — flags derivadas del equipamiento, todas las condiciones activas. */
function simulateStatic(includeGalvanizedHell = false) {
  const bridge = new MutatorBridge();
  const result = bridge.simulateFromIntention(buildIntention(includeGalvanizedHell));
  const weapon = result.entities.find(e => e.id === CEDO_PRIME);
  if (!weapon) throw new Error(`Entidad ${CEDO_PRIME} no encontrada`);
  return weapon.attributes;
}

// ─── Suite 1: Modo base (flags: {}) ──────────────────────────────────────────

describe('Cedo Prime — modo base (flags: {})', () => {
  it('daño global: 84.8 — Primed Point Blank +165%', () => {
    // Base 32 × (1 + 1.65) = 84.8. WEAPON_ADD_DAMAGE → WEAPON_DAMAGE attr.
    expect(simulateBase().WEAPON_DAMAGE?.final).toBeCloseTo(84.8, 1);
  });

  it('Puncture: 84.8 — daño físico × multiplicador global', () => {
    expect(simulateBase().WEAPON_ADD_PUNCTURE_DAMAGE?.final).toBeCloseTo(84.8, 1);
  });

  it('status chance: 4.8% — GS base +80% + Toxic Barrage +60%', () => {
    // 2% × (1 + 0.8 + 0.6) = 4.8%. Ambos mods con WEAPON_ADD_STATUS_CHANCE.
    expect(simulateBase().WEAPON_ADD_STATUS_CHANCE?.final).toBeCloseTo(4.8, 1);
  });

  it('crit chance: 72% — Critical Decel +200%', () => {
    // Base 24% × (1 + 2.0) = 72%.
    expect(simulateBase().WEAPON_ADD_CRIT_CHANCE?.final).toBeCloseTo(72, 0);
  });

  it('crit mult: 5.04x — Primed Ravage +110%', () => {
    // Base 2.4 × (1 + 1.1) = 5.04x.
    expect(simulateBase().WEAPON_ADD_CRIT_MULT?.final).toBeCloseTo(5.04, 1);
  });

  it('fire rate: 7.65 — Shotgun Barrage +90%, Critical Decel -20%', () => {
    // Base 4.5 × (1 + 0.9 - 0.2) = 7.65.
    expect(simulateBase().WEAPON_ADD_FIRE_RATE?.final).toBeCloseTo(7.65, 2);
  });

  it('multishot sin GH: 7 (base)', () => {
    expect(simulateBase().WEAPON_ADD_MULTISHOT?.final).toBeCloseTo(7, 1);
  });

  it('multishot con GH base: 14.7 — solo +110%, on_kill inactivo', () => {
    // GH stat 0: +110%, condition null → activo siempre.
    // GH stat 1: +120%, condition "on_kill" → flags: {} → inactivo.
    // 7 × (1 + 1.10) = 14.7
    expect(simulateBase(true).WEAPON_ADD_MULTISHOT?.final).toBeCloseTo(14.7, 1);
  });
});

// ─── Suite 2: Modo estático (flags derivadas) ─────────────────────────────────

describe('Cedo Prime — modo estático (flags derivadas del equipamiento)', () => {
  it('multishot con GH: 23.1 — base +110% + on_kill +120% activo', () => {
    // deriveStaticFlags activa on_kill=true → ambas partes de GH aplican.
    // 7 × (1 + 1.10 + 1.20) = 23.1
    // Diferencia clave vs modo base (14.7): verifica que deriveStaticFlags funciona.
    expect(simulateStatic(true).WEAPON_ADD_MULTISHOT?.final).toBeCloseTo(23.1, 1);
  });

  it('status chance: 4.8% — GS condicional (WEAPON_DAMAGE_IF_VICTIM_PROC_ACTIVE) sin mapear', () => {
    // GS stat 1 pendiente D-6 → on_kill no cambia status vs modo base.
    expect(simulateStatic().WEAPON_ADD_STATUS_CHANCE?.final).toBeCloseTo(4.8, 1);
  });

  it('crit chance: 72% — Critical Decel no es condicional', () => {
    expect(simulateStatic().WEAPON_ADD_CRIT_CHANCE?.final).toBeCloseTo(72, 0);
  });

  it('crit mult: 5.04x — Primed Ravage no es condicional', () => {
    expect(simulateStatic().WEAPON_ADD_CRIT_MULT?.final).toBeCloseTo(5.04, 1);
  });

  it('fire rate: 7.65 — Shotgun Barrage y Crit Decel no son condicionales', () => {
    expect(simulateStatic().WEAPON_ADD_FIRE_RATE?.final).toBeCloseTo(7.65, 2);
  });
});

// ─── Suite 3: Deuda activa ────────────────────────────────────────────────────
//
// Falla intencionalmente hasta que WEAPON_PERCENT_BASE_DAMAGE_ADDED sea mapeado.
// No modificar la expectativa — es la referencia del gap contra el juego.

describe('Cedo Prime — daño elemental combinado', () => {
  it('Viral: 190.8 — Toxin (Toxic Barrage) + Cold (Primed Chilling) combinados', () => {
    // Toxin 60% + Cold 165% del daño base → combinan en Viral.
    // (32 × 0.6 + 32 × 1.65) × 2.65 = 190.8
    expect(simulateStatic().WEAPON_ADD_VIRAL_DAMAGE?.final).toBeCloseTo(190.8, 1);
  });
});
