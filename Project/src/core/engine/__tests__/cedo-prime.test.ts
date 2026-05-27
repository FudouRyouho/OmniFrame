/**
 * Test de integración: Cedo Prime (Normal Attack) contra datos reales del Arsenal.
 *
 * Build verificada en partida (2026-05-27):
 *   Toxic Barrage (r3), Shotgun Barrage (r5), Critical Deceleration (r5),
 *   Primed Chilling Grasp (r10), Primed Point Blank (r10), Galvanized Savvy (r10),
 *   Galvanized Hell (r10) ← NOT IN OVERRIDE JSON (deuda OQ-ENGINE-6 relacionada),
 *   Primed Ravage (r10).
 *   Exilus: Galvanized Acceleration ← NOT IN OVERRIDE JSON (+proyectil speed, no afecta stats).
 *   Arcano: Primary Crux ← no modelado.
 *
 * Stats del juego (Normal Attack, sin Galvanized Hell ni condicionales):
 *   Puncture: 84.8 | Viral: 190.8 | CC: 72% | CM: 5x | SC/proj: 4.8% | FR: 7.65
 *   Multishot: 14.7 ← EXPECTED FAIL (Galvanized Hell ausente del override JSON)
 *
 * Nota sobre perfiles: solo se testa Normal Attack ('base'). Alt-Fire y Radial Attack
 * son perfiles separados — requieren OQ-ENGINE-2 (profile switching en runtime).
 */
import { describe, it, expect, beforeAll } from 'vitest';
import weaponsData from '../../../../public/data/weapons.json';
import modOverrides from '../../../../public/data/mod-stats.override.json';
import { ItemRepository } from '../hydration/ItemRepository';
import { MutatorBridge } from '../bridge/MutatorBridge';
import type { EnsembleIntention } from '@providers/Ensemble/ensemble.types';

// ─── IDs ─────────────────────────────────────────────────────────────────────

const CEDO_PRIME = '/Lotus/Weapons/Tenno/LongGuns/PrimeCedo/PrimeCedoWeapon';

const MOD = {
  TOXIC_BARRAGE:        '/Lotus/Upgrades/Mods/Shotgun/DualStat/PoisonEventShotgunMod',      // r3 max
  SHOTGUN_BARRAGE:      '/Lotus/Upgrades/Mods/Shotgun/WeaponFireRateMod',                    // r5 max
  CRITICAL_DECEL:       '/Lotus/Upgrades/Mods/Shotgun/DualStat/CorruptedCritChanceFireRateShotgun', // r5 max
  PRIMED_CHILLING:      '/Lotus/Upgrades/Mods/Shotgun/Expert/WeaponFreezeDamageModExpert',  // r10 max
  PRIMED_POINT_BLANK:   '/Lotus/Upgrades/Mods/Shotgun/Expert/WeaponDamageAmountModExpert',  // r10 max
  GALVANIZED_SAVVY:     '/Lotus/Upgrades/Mods/Shotgun/WeaponStatusChanceSPMod',              // r10 max
  PRIMED_RAVAGE:        '/Lotus/Upgrades/Mods/Shotgun/Expert/WeaponCritDamageModExpert',    // r10 max
};

// Galvanized Hell — NOT IN OVERRIDE JSON (deuda: data faltante, independiente de OQ-ENGINE-6)
// const GALVANIZED_HELL = '/Lotus/Upgrades/Mods/Shotgun/WeaponFireIterationsGalvanizedMod';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildIntention(): EnsembleIntention {
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
        // Orden de slot: respeta la posición para la combinación elemental
        0: { itemId: MOD.TOXIC_BARRAGE,      rank: 30, level: 3 },  // Toxin slot 0
        1: { itemId: MOD.SHOTGUN_BARRAGE,    rank: 30, level: 5 },
        2: { itemId: MOD.CRITICAL_DECEL,     rank: 30, level: 5 },
        3: { itemId: MOD.PRIMED_CHILLING,    rank: 30, level: 10 }, // Cold slot 3
        4: { itemId: MOD.PRIMED_POINT_BLANK, rank: 30, level: 10 },
        5: { itemId: MOD.GALVANIZED_SAVVY,   rank: 30, level: 10 },
        // slot 6: Galvanized Hell — no disponible en datos
        7: { itemId: MOD.PRIMED_RAVAGE,      rank: 30, level: 10 },
      }
    },
    environment: { targetLevel: 1, targetFaction: null, isSteelPath: false },
  };
}

function simulate() {
  const bridge = new MutatorBridge();
  const result = bridge.simulateFromIntention(buildIntention());
  const weapon = result.entities.find(e => e.id === CEDO_PRIME);
  if (!weapon) throw new Error(`Entidad ${CEDO_PRIME} no encontrada`);
  return weapon.attributes;
}

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeAll(() => {
  ItemRepository.load(weaponsData as any[]);
  ItemRepository.loadOverrides(modOverrides as Record<string, any>);
});

// ─── Tests (Normal Attack / perfil 'base') ────────────────────────────────────

describe('Cedo Prime — daño físico y elemental', () => {
  // Base: Puncture 32. globalMult = 84.8/32 = 2.65
  // Viral: (32 × 60/100 + 32 × 165/100) × 2.65 = 72 × 2.65 = 190.8
  it('Puncture: 32 × 2.65 = 84.8', () => {
    expect(simulate().WEAPON_ADD_PUNCTURE_DAMAGE?.final).toBeCloseTo(84.8, 1);
  });

  it('Viral (Toxin + Cold combinados): 190.8', () => {
    expect(simulate().WEAPON_ADD_VIRAL_DAMAGE?.final).toBeCloseTo(190.8, 1);
  });

  it('WEAPON_DAMAGE.final con Primed Point Blank +165%: 32 × 2.65 = 84.8', () => {
    expect(simulate().WEAPON_DAMAGE?.final).toBeCloseTo(84.8, 1);
  });
});

describe('Cedo Prime — crit', () => {
  // CC base 24%, Critical Decel +200% → 24 × 3 = 72%
  it('Crit Chance: 72%', () => {
    expect(simulate().WEAPON_ADD_CRIT_CHANCE?.final).toBeCloseTo(72, 0);
  });

  // CM base 2.4x, Primed Ravage +110% → 2.4 × 2.1 = 5.04x
  it('Crit Mult: 5.04x (~5x)', () => {
    expect(simulate().WEAPON_ADD_CRIT_MULT?.final).toBeCloseTo(5.04, 1);
  });
});

describe('Cedo Prime — status', () => {
  // SC base 2%, Toxic Barrage +60%, Galvanized Savvy +80% → 2 × (1 + 1.4) = 4.8%
  it('Status/Projectile: 4.8%', () => {
    expect(simulate().WEAPON_ADD_STATUS_CHANCE?.final).toBeCloseTo(4.8, 1);
  });
});

describe('Cedo Prime — fire rate', () => {
  // Base 4.5, Shotgun Barrage +90%, Critical Decel -20% → 4.5 × 1.7 = 7.65
  // Galvanized Acceleration (exilus) = +proyectil speed, NO afecta fire rate
  it('Fire Rate: 7.65', () => {
    expect(simulate().WEAPON_ADD_FIRE_RATE?.final).toBeCloseTo(7.65, 2);
  });
});

// ─── Deuda conocida: Galvanized Hell ausente del override JSON ────────────────
//
// Galvanized Hell es el mod de multishot de la build (slot 6).
// Su unique_name no existe en mod-stats.override.json.
// El token que usaría es WEAPON_FIRE_ITERATIONS (ver OQ-ENGINE-6), pero incluso
// fijando ese token, Galvanized Hell necesita ser agregado al override primero.
//
// El engine produce multishot base = 7 (stats base del Cedo Prime).
// El juego muestra 14.7 (7 × (1 + 110%) con ~5 stacks de Galvanized Hell).
// Diferencia de datos, no de fórmula.

describe('Cedo Prime — multishot con Galvanized Hell', () => {
  // El test usa slot 6 vacío (Galvanized Hell no está en buildIntention()).
  // Para testear multishot agregamos el mod explícitamente.
  it('Galvanized Hell max base (+110%): 7 × 2.1 = 14.7', () => {
    const intention = buildIntention();
    intention.mods['primary'][6] = {
      itemId: '/Lotus/Upgrades/Mods/Shotgun/WeaponFireIterationsSPMod',
      rank: 30,
      level: 10,
    };
    const bridge = new MutatorBridge();
    const result = bridge.simulateFromIntention(intention);
    const weapon = result.entities.find(e => e.id === CEDO_PRIME);
    expect(weapon?.attributes.WEAPON_ADD_MULTISHOT?.final).toBeCloseTo(14.7, 1);
  });
});
