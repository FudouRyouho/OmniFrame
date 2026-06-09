/**
 * Cedo Prime (Normal Attack) — migrado al "clic" (helpers/consume).
 *
 * Modelo del que es consumidor: escopeta multi-pellet + flag `on_kill`.
 * El eje distintivo se ve por bucket: el multishot pasa de 14.7 (base) a 23.1 (estático)
 * porque el bonus on_kill de Galvanized Hell entra en `mods_add_pct` solo con el flag activo.
 *
 * Build verificada en partida (2026-05-27):
 *   Toxic Barrage (r3), Shotgun Barrage (r5), Critical Deceleration (r5),
 *   Primed Chilling Grasp (r10), Primed Point Blank (r10), Galvanized Savvy (r10),
 *   Galvanized Hell (r10), Primed Ravage (r10).
 *
 * ─── Estado real del engine (verificado 2026-06-09 vía clic) ──────────────────────
 * | Stat              | Juego  | Engine | Nota                                          |
 * |---|---|---|---|
 * | Puncture          | 84.8   | 84.8   | WEAPON_ADD_DAMAGE (PPB)                        |
 * | Viral             | 190.8  | 190.8  | ✅ combine Cold+Toxin YA funciona              |
 * | Crit Chance       | 72%    | 72%    | Critical Decel +200%                          |
 * | Crit Mult         | 5.04x  | 5.04x  | Primed Ravage +110%                           |
 * | Status/proj       | 4.8%   | 4.8%   | GS base +80% + Toxic Barrage +60%             |
 * | Fire Rate         | 7.65   | 7.65   | Shotgun Barrage +90%, Crit Decel −20%         |
 * | Multishot (base)  | —      | 14.7   | GH +110% (on_kill inactivo)                   |
 * | Multishot (estát) | —      | 23.1   | GH +110% + on_kill +120%                      |
 *
 * Deuda viva: Galvanized Savvy stat 1 (`WEAPON_DAMAGE_IF_VICTIM_PROC_ACTIVE`, on_kill)
 * sin mapear (pendiente D-6) → el status NO sube en modo estático. Ver el test de status.
 */
import './helpers/engine-data-setup';
import { describe, it, expect } from 'vitest';
import { consume } from './helpers/consume';
import type { EnsembleIntention } from '@providers/Ensemble/ensemble.types';

const CEDO_PRIME = '/Lotus/Weapons/Tenno/LongGuns/PrimeCedo/PrimeCedoWeapon';

const MOD = {
  TOXIC_BARRAGE:      '/Lotus/Upgrades/Mods/Shotgun/DualStat/PoisonEventShotgunMod',
  SHOTGUN_BARRAGE:    '/Lotus/Upgrades/Mods/Shotgun/WeaponFireRateMod',
  CRITICAL_DECEL:     '/Lotus/Upgrades/Mods/Shotgun/DualStat/CorruptedCritChanceFireRateShotgun',
  PRIMED_CHILLING:    '/Lotus/Upgrades/Mods/Shotgun/Expert/WeaponFreezeDamageModExpert',
  PRIMED_POINT_BLANK: '/Lotus/Upgrades/Mods/Shotgun/Expert/WeaponDamageAmountModExpert',
  GALVANIZED_SAVVY:   '/Lotus/Upgrades/Mods/Shotgun/WeaponStatusChanceSPMod',
  GALVANIZED_HELL:    '/Lotus/Upgrades/Mods/Shotgun/WeaponFireIterationsSPMod',
  PRIMED_RAVAGE:      '/Lotus/Upgrades/Mods/Shotgun/Expert/WeaponCritDamageModExpert',
};

function cedo(withGH = false): EnsembleIntention {
  const mods: Record<number, { itemId: string; rank: number; level: number }> = {
    0: { itemId: MOD.TOXIC_BARRAGE,      rank: 30, level: 3  },
    1: { itemId: MOD.SHOTGUN_BARRAGE,    rank: 30, level: 5  },
    2: { itemId: MOD.CRITICAL_DECEL,     rank: 30, level: 5  },
    3: { itemId: MOD.PRIMED_CHILLING,    rank: 30, level: 10 },
    4: { itemId: MOD.PRIMED_POINT_BLANK, rank: 30, level: 10 },
    5: { itemId: MOD.GALVANIZED_SAVVY,   rank: 30, level: 10 },
    7: { itemId: MOD.PRIMED_RAVAGE,      rank: 30, level: 10 },
  };
  if (withGH) mods[6] = { itemId: MOD.GALVANIZED_HELL, rank: 30, level: 10 };
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
    mods: { primary: mods },
    environment: { targetLevel: 1, targetFaction: null, isSteelPath: false },
  };
}

/** Modo base: flags vacías, ninguna condición activa. */
const base = (withGH = false) => consume(cedo(withGH), { flags: {} }).weapon(CEDO_PRIME);
/** Modo estático: flags derivadas del equipamiento → on_kill activo. */
const stat = (withGH = false) => consume(cedo(withGH)).weapon(CEDO_PRIME);

// ─── Estabilidad: stats no condicionales (.final) ────────────────────────────────

describe('Cedo — modo base (estabilidad: .final)', () => {
  it('daño global 84.8 — PPB +165%', () => {
    expect(base().node('WEAPON_DAMAGE').final).toBeCloseTo(84.8, 1);
  });
  it('Puncture 84.8 — físico × mult global', () => {
    expect(base().node('WEAPON_ADD_PUNCTURE_DAMAGE').final).toBeCloseTo(84.8, 1);
  });
  it('status 4.8% — GS base +80% + Toxic Barrage +60%', () => {
    expect(base().node('WEAPON_ADD_STATUS_CHANCE').final).toBeCloseTo(4.8, 1);
  });
  it('crit 72% — Critical Decel +200%', () => {
    expect(base().node('WEAPON_ADD_CRIT_CHANCE').final).toBeCloseTo(72, 0);
  });
  it('crit mult 5.04x — Primed Ravage +110%', () => {
    expect(base().node('WEAPON_ADD_CRIT_MULT').final).toBeCloseTo(5.04, 1);
  });
  it('fire rate 7.65 — Shotgun Barrage +90%, Crit Decel −20% (dual-stat)', () => {
    expect(base().node('WEAPON_ADD_FIRE_RATE').final).toBeCloseTo(7.65, 2);
  });
  it('multishot 7 sin Galvanized Hell (base del arma)', () => {
    expect(base(false).node('WEAPON_ADD_MULTISHOT').final).toBeCloseTo(7, 1);
  });
});

// ─── Lógica: el flag on_kill en el bucket del multishot ──────────────────────────
//
// Eje distintivo de Cedo. Galvanized Hell aporta dos partes:
//   stat 0: +110%, condition null → siempre en mods_add_pct.
//   stat 1: +120%, condition on_kill → entra a mods_add_pct SOLO en modo estático.
// El bucket lo muestra: 110 (base) vs 230 (estático), sobre el mismo base=7.

describe('Cedo — multishot por buckets: el flag on_kill (lógica)', () => {
  it('modo base — solo GH stat 0: mods_add_pct = 110 → 7×2.10 = 14.7', () => {
    const ms = base(true).node('WEAPON_ADD_MULTISHOT');
    expect(ms.base).toBeCloseTo(7, 0);
    expect(ms.mods_add_pct).toBeCloseTo(110, 0);   // on_kill inactivo
    expect(ms.final).toBeCloseTo(14.7, 1);
  });
  it('modo estático — GH stat 0 + on_kill: mods_add_pct = 230 → 7×3.30 = 23.1', () => {
    const ms = stat(true).node('WEAPON_ADD_MULTISHOT');
    expect(ms.base).toBeCloseTo(7, 0);
    expect(ms.mods_add_pct).toBeCloseTo(230, 0);   // +120 del on_kill ya presente
    expect(ms.final).toBeCloseTo(23.1, 1);
  });
});

// ─── Estabilidad: modo estático, lo no-condicional no cambia ─────────────────────

describe('Cedo — modo estático (estabilidad)', () => {
  it('crit, crit mult y fire rate no cambian (no son condicionales)', () => {
    const w = stat();
    expect(w.node('WEAPON_ADD_CRIT_CHANCE').final).toBeCloseTo(72, 0);
    expect(w.node('WEAPON_ADD_CRIT_MULT').final).toBeCloseTo(5.04, 1);
    expect(w.node('WEAPON_ADD_FIRE_RATE').final).toBeCloseTo(7.65, 2);
  });
  it('status sigue 4.8% — DEUDA: GS on_kill (WEAPON_DAMAGE_IF_VICTIM_PROC_ACTIVE) sin mapear', () => {
    // El bonus on_kill de Galvanized Savvy no está mapeado → el status no sube con el flag.
    expect(stat().node('WEAPON_ADD_STATUS_CHANCE').final).toBeCloseTo(4.8, 1);
  });
});

// ─── Combine elemental: Viral ya funciona ────────────────────────────────────────

describe('Cedo — Viral combine (funciona)', () => {
  it('Viral 190.8 — Cold (Primed Chilling) + Toxin (Toxic Barrage) combinan × PPB', () => {
    // (32×0.6 + 32×1.65) × 2.65 = 190.8. El nodo existe y computa (antes era deuda).
    expect(stat().node('WEAPON_ADD_VIRAL_DAMAGE').final).toBeCloseTo(190.8, 1);
  });
});

// ─── Borde de C1 — preguntas abiertas (it.todo) ──────────────────────────────────
//
// Cedo es la shotgun pura (proyectil multi-pellet, no-incarnon): el baseline correcto.
// C1 cubre los STATS (arriba: daño, crit chance, status per-pellet, multishot, fire rate).
// Lo que sigue NO es C1 — vive en C2 (combat) o es un gap de mapeo. No se fabrica respuesta:
// el todo acuña la pregunta. Ref: references/wiki/mechanics/hit-mechanic.md §Relevancia para el engine.

describe('Cedo — borde de C1 (preguntas abiertas)', () => {
  it.todo('C2: daño dividido por pellet (total/multishot) — CombatSimulator [hit-mechanic.md:57]');
  it.todo('C2: distribución de crit tier por pellet — AtomicSimulator.calculateCritDistribution [hit-mechanic.md:110]');
  it.todo('C2: procs/disparo = multishot × status_per_pellet — StatusEngine (parcial) [status-chance-mechanics.md:27]');
  it.todo('C1-gap: WEAPON_DAMAGE_IF_VICTIM_PROC_ACTIVE (GS on_kill) sin mapear — damage no sube en estático [D-6]');
  it.todo('C1? falloff de daño por distancia (shotgun) — verificar si C1 lo expone o es C2');
});
