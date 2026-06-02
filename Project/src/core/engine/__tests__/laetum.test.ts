/**
 * Test de integración: Laetum — Normal Attack, Incarnon Form, Radial Attack.
 *
 * Build verificada en partida:
 *   Slot 0: Pistol Pestilence    (r3 max)  — Toxin +60%, Status +60%
 *   Slot 1: Ice Storm            (r5 max)  — Cold +40%, Magazine +40%
 *   Slot 2: Galvanized Shot      (r10 max) — Status +80% base, +120% cond (on_kill, unmapeado)
 *   Slot 3: Galvanized Diffusion (r10 max) — Multishot +110% base, +120% cond (on_kill)
 *   Slot 4: Lethal Torrent       (r5 max)  — Fire Rate +60%, Multishot +60%
 *   Slot 5: Hornet Strike        (r10 max) — Damage +220%
 *   Slot 6: Gunslinger           (r5 max)  — Fire Rate +72%
 *   Slot 7: Primed Heated Charge (r10 max) — Heat +165%
 *   Exilus: Steady Hands (recoil — sin efecto en stats de daño, omitido)
 *
 * Evolutions: Rapid Wrath, Lethal Rearmament, Elemental Excess, Devouring Attrition
 *   — Rapid Wrath:       WEAPON_ADD_FIRE_RATE +20  (ADD, aplica a ambos modos)
 *   — Elemental Excess:  WEAPON_FLAT_STATUS_CHANCE +20 (ADD_FLAT post-mods, "added last")
 *                        WEAPON_BASE_CRIT_CHANCE   -10 (BASE_FLAT, amplificado por CC mods)
 *   — Lethal Rearmament: upgrade_type null (recarga condicional, sin efecto en engine)
 *   — Devouring Attrition: upgrade_type null (sin efecto en engine)
 *
 * ─── Laetum base stats ────────────────────────────────────────────────────────
 * Normal Attack:     Impact 64, Slash 96          | CC 22% | CD 2.2x | SC 22% | FR 2.5 | Multi 1
 * Incarnon Form:     Impact 100                   | CC 22% | CD 2.2x | SC 22% | FR 6.67
 * Auto Radial Attack: Radiation 300               | CC 22% | CD 2.2x | SC 22% | FR 6.67
 * (CC y SC incluyen ya Elemental Excess: CC=12%, SC con evo=42% sin mods)
 *
 * ─── Verificación de fórmulas ─────────────────────────────────────────────────
 *
 * Status (ADD_FLAT confirmado):
 *   22 × (1 + 0.6 + 0.8) + 20 = 22 × 2.4 + 20 = 52.8 + 20 = 72.8%  ✓
 *           PP    GS_base
 *   Si fuera BASE_FLAT: (22+20) × 2.4 = 100.8%  ✗
 *
 * Multishot base mode:   1 × (1 + 1.10 + 0.60) = 2.7  ✓
 *                                  GD     LT
 * Multishot static mode: 1 × (1 + 1.10 + 0.60 + 1.20) = 3.9  (GD on_kill activo)
 *
 * Fire Rate:  2.5 × (1 + 0.20 + 0.60 + 0.72) = 2.5 × 2.52 = 6.3  Normal ✓
 *                          RW    LT   Gunslinger
 *             6.67 × 2.52 = 16.8  Incarnon ✓
 *
 * Daño Normal (WEAPON_DAMAGE mult = 1 + 2.20 = 3.2):
 *   Impact:    64 × 3.2 = 204.8                                                    ✓
 *   Slash:     96 × 3.2 = 307.2                                                    ✓
 *   Viral:     (160×0.4 + 160×0.6) × 3.2 = 160 × 3.2 = 512  (slot0 Toxin + slot1 Cold)  ✓
 *   Heat:      160 × 1.65 × 3.2 = 844.8                                            ✓
 *
 * Daño Incarnon (base 100):
 *   Impact: 100 × 3.2 = 320 | Viral: 100 × 3.2 = 320 | Heat: 100×1.65×3.2 = 528   ✓
 *
 * Daño Radial (base Radiation 300):
 *   Radiation: 300 × 3.2 = 960 | Viral: 300×3.2 = 960 | Heat: 300×1.65×3.2 = 1584 ✓
 *
 * ─── Engine vs juego ──────────────────────────────────────────────────────────
 * | Stat              | Juego   | Engine       | Estado                            |
 * |---|---|---|---|
 * | Status (Normal)   | 72.8%   | 72.8%        | ✅ WEAPON_FLAT_STATUS_CHANCE fix  |
 * | CC                | 12%     | 12%          | ✅ BASE_FLAT -10 correcto          |
 * | Multishot (base)  | 2.7     | 2.7          | ✅                                |
 * | Multishot (GD x2) | —       | 3.9          | ✅ static mode, on_kill activo    |
 * | Fire Rate Normal  | 6.3     | 6.3          | ✅                                |
 * | Fire Rate Incarnon| 16.8    | 16.8         | ✅ Incarnon FR 6.67 × 2.52        |
 * | Incarnon Multi    | 2.7     | 2.7          | ✅ base_multi=1 × 2.7             |
 * | GD conditional    | —       | +120% on_kill| ✅ condición mapeada              |
 */
import './helpers/engine-data-setup';
import { describe, it, expect } from 'vitest';
import { MutatorBridge }      from '../bridge/MutatorBridge';
import type { EnsembleIntention } from '@providers/Ensemble/ensemble.types';

// ─── IDs ─────────────────────────────────────────────────────────────────────

const LAETUM = '/Lotus/Weapons/Tenno/Zariman/Pistols/HeavyPistol/ZarimanHeavyPistol';

const MOD = {
  PISTOL_PESTILENCE:    '/Lotus/Upgrades/Mods/Pistol/DualStat/PoisonEventPistolMod',
  ICE_STORM:            '/Lotus/Upgrades/Mods/Pistol/DualStat/IceStormMod',
  GALVANIZED_SHOT:      '/Lotus/Upgrades/Mods/Pistol/WeaponStatusChanceSPMod',
  GALVANIZED_DIFFUSION: '/Lotus/Upgrades/Mods/Pistol/WeaponFireIterationsSPMod',
  LETHAL_TORRENT:       '/Lotus/Upgrades/Mods/Pistol/DualStat/GrinderMod',
  HORNET_STRIKE:        '/Lotus/Upgrades/Mods/Pistol/WeaponDamageAmountMod',
  GUNSLINGER:           '/Lotus/Upgrades/Mods/Pistol/WeaponFireRateMod',
  PRIMED_HEATED_CHARGE: '/Lotus/Upgrades/Mods/Pistol/Expert/WeaponFireDamageModExpert',
};

const PERKS = {
  2: 'rapid_wrath',
  3: 'lethal_rearmament',
  4: 'elemental_excess',
  5: 'devouring_attrition',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildIntention(profile: string = 'base'): EnsembleIntention {
  return {
    items: {
      warframe:         { itemId: null, rank: 30, shards: [] },
      secondary:        { itemId: LAETUM, rank: 30, active_profile: profile, evolution_perks: PERKS },
      primary:          { itemId: null, rank: 30 },
      melee:            { itemId: null, rank: 30 },
      companion:        { itemId: null, rank: 30 },
      companion_weapon: { itemId: null, rank: 30 },
      archwing:         { itemId: null, rank: 30 },
      archgun:          { itemId: null, rank: 30 },
      archmelee:        { itemId: null, rank: 30 },
      necramech:        { itemId: null, rank: 30 },
    },
    mods: {
      secondary: {
        // Slot 0+1: Toxin + Cold → Viral. Heat (slot 7) → standalone.
        0: { itemId: MOD.PISTOL_PESTILENCE,    rank: 30, level: 10 },
        1: { itemId: MOD.ICE_STORM,            rank: 30, level: 10 },
        2: { itemId: MOD.GALVANIZED_SHOT,      rank: 30, level: 10 },
        3: { itemId: MOD.GALVANIZED_DIFFUSION, rank: 30, level: 10 },
        4: { itemId: MOD.LETHAL_TORRENT,       rank: 30, level: 10 },
        5: { itemId: MOD.HORNET_STRIKE,        rank: 30, level: 10 },
        6: { itemId: MOD.GUNSLINGER,           rank: 30, level: 10 },
        7: { itemId: MOD.PRIMED_HEATED_CHARGE, rank: 30, level: 10 },
      }
    },
    environment: { targetLevel: 1, targetFaction: null, isSteelPath: false },
  };
}

function simulateBase(profile: string = 'base') {
  const bridge = new MutatorBridge();
  const result = bridge.simulateFromIntention(buildIntention(profile), { flags: {} });
  const weapon = result.entities.find(e => e.id === LAETUM);
  if (!weapon) throw new Error(`Entidad ${LAETUM} no encontrada`);
  return weapon.attributes;
}

function simulateStatic(profile: string = 'base') {
  const bridge = new MutatorBridge();
  const result = bridge.simulateFromIntention(buildIntention(profile));
  const weapon = result.entities.find(e => e.id === LAETUM);
  if (!weapon) throw new Error(`Entidad ${LAETUM} no encontrada`);
  return weapon.attributes;
}

// ─── Suite 1: Normal Attack — modo base (flags: {}) ───────────────────────────

describe('Laetum — Normal Attack, modo base', () => {
  it('Impact: 204.8 — base 64 × PPB 3.2', () => {
    expect(simulateBase().WEAPON_ADD_IMPACT_DAMAGE?.final).toBeCloseTo(204.8, 1);
  });

  it('Slash: 307.2 — base 96 × 3.2', () => {
    expect(simulateBase().WEAPON_ADD_SLASH_DAMAGE?.final).toBeCloseTo(307.2, 1);
  });

  it('Viral 512 — Toxin 60% + Cold 40% combinan (slot 0+1), × 3.2', () => {
    // Toxin: 160×0.6=96 | Cold: 160×0.4=64 | Viral: 160 × 3.2 = 512
    expect(simulateBase().WEAPON_ADD_VIRAL_DAMAGE?.final).toBeCloseTo(512, 1);
  });

  it('Heat 844.8 — PHC 165% × 3.2 (slot 7, standalone)', () => {
    // 160 × 1.65 × 3.2 = 844.8
    expect(simulateBase().WEAPON_ADD_HEAT_DAMAGE?.final).toBeCloseTo(844.8, 1);
  });

  it('CC 12% — base 22% + Elemental Excess BASE_FLAT -10%', () => {
    // (22 + (-10)) × 1.0 = 12%
    expect(simulateBase().WEAPON_ADD_CRIT_CHANCE?.final).toBeCloseTo(12, 1);
  });

  it('Status 72.8% — Elemental Excess ADD_FLAT +20 (post-mods)', () => {
    // 22 × (1 + 0.6 + 0.8) + 20 = 22 × 2.4 + 20 = 72.8%
    // PP +60% status | GS base +80% status | Elemental Excess +20 ADD_FLAT
    expect(simulateBase().WEAPON_ADD_STATUS_CHANCE?.final).toBeCloseTo(72.8, 1);
  });

  it('Multishot 2.7 — GD base +110% + LT +60%', () => {
    // 1 × (1 + 1.10 + 0.60) = 2.7
    expect(simulateBase().WEAPON_ADD_MULTISHOT?.final).toBeCloseTo(2.7, 1);
  });

  it('Fire Rate 6.3 — Rapid Wrath +20% + LT +60% + Gunslinger +72%', () => {
    // 2.5 × (1 + 0.20 + 0.60 + 0.72) = 2.5 × 2.52 = 6.3
    expect(simulateBase().WEAPON_ADD_FIRE_RATE?.final).toBeCloseTo(6.3, 1);
  });

  it('Magazine 16.8 (≈17) — base 12 × (1 + Ice Storm 40%)', () => {
    // 12 × 1.4 = 16.8. El juego redondea a 17.
    expect(simulateBase().WEAPON_ADD_MAGAZINE_MAX?.final).toBeCloseTo(16.8, 0);
  });
});

// ─── Suite 2: Normal Attack — modo estático ────────────────────────────────────

describe('Laetum — Normal Attack, modo estático (on_kill activo)', () => {
  it('Multishot 3.9 — GD base +110% + on_kill +120% + LT +60%', () => {
    // 1 × (1 + 1.10 + 1.20 + 0.60) = 3.9
    // Juego sin matar muestra 2.7 (Arsenal sin on_kill).
    expect(simulateStatic().WEAPON_ADD_MULTISHOT?.final).toBeCloseTo(3.9, 1);
  });

  it('Status 72.8% — GS condicional WEAPON_DAMAGE_IF_VICTIM_PROC_ACTIVE sin mapear', () => {
    // on_kill activo, pero el bonus de GS (WEAPON_DAMAGE_IF_VICTIM_PROC_ACTIVE) está unmapeado.
    // Status igual que modo base. Sin cambio.
    expect(simulateStatic().WEAPON_ADD_STATUS_CHANCE?.final).toBeCloseTo(72.8, 1);
  });

  it('Viral 512 — elementales no son condicionales', () => {
    expect(simulateStatic().WEAPON_ADD_VIRAL_DAMAGE?.final).toBeCloseTo(512, 1);
  });
});

// ─── Suite 3: Incarnon Form — modo base ───────────────────────────────────────

describe('Laetum — Incarnon Form, modo base', () => {
  it('Impact 320 — base 100 × 3.2', () => {
    expect(simulateBase('incarnon_form').WEAPON_ADD_IMPACT_DAMAGE?.final).toBeCloseTo(320, 1);
  });

  it('Viral 320 — (Cold + Toxin) sobre base 100 × 3.2', () => {
    // 100×0.4 (Cold) + 100×0.6 (Toxin) = 100 × 3.2 = 320
    expect(simulateBase('incarnon_form').WEAPON_ADD_VIRAL_DAMAGE?.final).toBeCloseTo(320, 1);
  });

  it('Heat 528 — PHC 165% sobre base 100 × 3.2', () => {
    // 100 × 1.65 × 3.2 = 528
    expect(simulateBase('incarnon_form').WEAPON_ADD_HEAT_DAMAGE?.final).toBeCloseTo(528, 1);
  });

  it('Status 72.8% — misma fórmula, mismo base, ambos modos', () => {
    expect(simulateBase('incarnon_form').WEAPON_ADD_STATUS_CHANCE?.final).toBeCloseTo(72.8, 1);
  });

  it('CC 12% — Elemental Excess BASE_FLAT -10% aplica a ambos modos', () => {
    expect(simulateBase('incarnon_form').WEAPON_ADD_CRIT_CHANCE?.final).toBeCloseTo(12, 1);
  });

  it('Fire Rate 16.8 — base Incarnon 6.67 (attack.speed) × 2.52', () => {
    // 6.67 × (1 + 0.20 + 0.60 + 0.72) = 16.8
    expect(simulateBase('incarnon_form').WEAPON_ADD_FIRE_RATE?.final).toBeCloseTo(16.8, 1);
  });

  it('Multishot 2.7 — base Incarnon = 1, misma fórmula que Normal', () => {
    expect(simulateBase('incarnon_form').WEAPON_ADD_MULTISHOT?.final).toBeCloseTo(2.7, 1);
  });
});

// ─── Suite 4: Radial Attack — modo base ───────────────────────────────────────

describe('Laetum — Auto Radial Attack, modo base', () => {
  it('Radiation 960 — base Radiation 300 × 3.2', () => {
    expect(simulateBase('auto_radial_attack').WEAPON_ADD_RADIATION_DAMAGE?.final).toBeCloseTo(960, 1);
  });

  it('Viral 960 — (Cold + Toxin) sobre base Radiation 300 × 3.2', () => {
    // 300×0.4 (Cold) + 300×0.6 (Toxin) = 300 × 3.2 = 960
    expect(simulateBase('auto_radial_attack').WEAPON_ADD_VIRAL_DAMAGE?.final).toBeCloseTo(960, 1);
  });

  it('Heat 1584 — PHC 165% sobre base 300 × 3.2', () => {
    // 300 × 1.65 × 3.2 = 1584
    expect(simulateBase('auto_radial_attack').WEAPON_ADD_HEAT_DAMAGE?.final).toBeCloseTo(1584, 1);
  });

  it('Status 72.8% — misma fórmula en los tres perfiles', () => {
    expect(simulateBase('auto_radial_attack').WEAPON_ADD_STATUS_CHANCE?.final).toBeCloseTo(72.8, 1);
  });

  it('CC 12% — misma fórmula en los tres perfiles', () => {
    expect(simulateBase('auto_radial_attack').WEAPON_ADD_CRIT_CHANCE?.final).toBeCloseTo(12, 1);
  });
});
