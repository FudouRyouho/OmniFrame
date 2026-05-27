/**
 * Test de integración: Aklex Prime contra datos del juego.
 *
 * Arma elegida porque:
 *   - Sin evolución Incarnon activa (perfil "Normal Attack" es la base)
 *   - Stats simples: 3 tipos de daño físico, CC 25%, CM 2x, SC 25%
 *   - Mods de referencia fácil de verificar en partida
 *
 * Fuente de datos: public/data/weapons.json + mod-stats.override.json
 * Cómo verificar: equipar en el juego sin catalizador adicional y comparar
 * los valores en la pantalla de stats del Arsenal (sin modificar, con cada mod).
 */
import { describe, it, expect, beforeAll } from 'vitest';
import weaponsData from '../../../../public/data/weapons.json';
import modOverrides from '../../../../public/data/mod-stats.override.json';
import { ItemRepository } from '../hydration/ItemRepository';
import { MutatorBridge } from '../bridge/MutatorBridge';
import type { EnsembleIntention } from '@providers/Ensemble/ensemble.types';

// ─── IDs ─────────────────────────────────────────────────────────────────────

const AKLEX_PRIME = '/Lotus/Weapons/Tenno/Akimbo/AkLexPrimePistols';

// Mods secundaria — base ranks usados (0-indexed, coincide con el nivel del juego)
const MOD = {
  HORNET_STRIKE:  '/Lotus/Upgrades/Mods/Pistol/WeaponDamageAmountMod',   // 11 ranks, rank 10 = +220%
  PISTOL_GAMBIT:  '/Lotus/Upgrades/Mods/Pistol/WeaponCritChanceMod',      // 6 ranks, rank 5 = +120%
  TARGET_CRACKER: '/Lotus/Upgrades/Mods/Pistol/WeaponCritDamageMod',     // 6 ranks, rank 5 = +60%
  BARREL_DIFFUSION:'/Lotus/Upgrades/Mods/Pistol/WeaponFireIterationsMod', // 6 ranks, rank 5 = +120%
  LETHAL_TORRENT: '/Lotus/Upgrades/Mods/Pistol/DualStat/GrinderMod',     // 6 ranks
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyIntention(): EnsembleIntention {
  return {
    items: {
      warframe:         { itemId: null, rank: 30, shards: [] },
      primary:          { itemId: null, rank: 30 },
      secondary:        { itemId: AKLEX_PRIME, rank: 30, active_profile: 'base' },
      melee:            { itemId: null, rank: 30 },
      companion:        { itemId: null, rank: 30 },
      companion_weapon: { itemId: null, rank: 30 },
      archwing:         { itemId: null, rank: 30 },
      archgun:          { itemId: null, rank: 30 },
      archmelee:        { itemId: null, rank: 30 },
      necramech:        { itemId: null, rank: 30 },
    },
    mods: {},
    environment: { targetLevel: 1, targetFaction: null, isSteelPath: false },
  };
}

function withMods(
  mods: Record<number, { id: string; rank: number }>
): EnsembleIntention {
  const intention = emptyIntention();
  intention.mods['secondary'] = Object.fromEntries(
    Object.entries(mods).map(([slot, m]) => [
      slot,
      { itemId: m.id, rank: 30, level: m.rank }
    ])
  );
  return intention;
}

function simulate(intention: EnsembleIntention) {
  const bridge = new MutatorBridge();
  const result = bridge.simulateFromIntention(intention);
  const weapon = result.entities.find(e => e.id === AKLEX_PRIME);
  if (!weapon) throw new Error(`Entidad ${AKLEX_PRIME} no encontrada en el resultado`);
  return weapon.attributes;
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeAll(() => {
  ItemRepository.load(weaponsData as any[]);
  ItemRepository.loadOverrides(modOverrides as Record<string, any>);
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Aklex Prime — sin mods (stats base)', () => {
  it('daño físico coincide con wiki', () => {
    const attrs = simulate(emptyIntention());
    expect(attrs.WEAPON_ADD_IMPACT_DAMAGE?.final).toBeCloseTo(15, 0);
    expect(attrs.WEAPON_ADD_SLASH_DAMAGE?.final).toBeCloseTo(15, 0);
    expect(attrs.WEAPON_ADD_PUNCTURE_DAMAGE?.final).toBeCloseTo(120, 0);
  });

  it('crit y status coinciden con wiki', () => {
    const attrs = simulate(emptyIntention());
    expect(attrs.WEAPON_ADD_CRIT_CHANCE?.final).toBeCloseTo(25, 1);
    expect(attrs.WEAPON_ADD_CRIT_MULT?.final).toBeCloseTo(2.0, 1);
    expect(attrs.WEAPON_ADD_STATUS_CHANCE?.final).toBeCloseTo(25, 1);
  });

  it('WEAPON_DAMAGE.base = suma de daños del perfil (Impact 15 + Slash 15 + Puncture 120 = 150)', () => {
    const attrs = simulate(emptyIntention());
    expect(attrs.WEAPON_DAMAGE?.final).toBeCloseTo(150, 0);
  });
});

describe('Aklex Prime — Hornet Strike rango máximo (+220% daño)', () => {
  // Hornet Strike max (rank 10): +220%
  // WEAPON_DAMAGE: 150 × (1 + 220/100) = 480 → globalDmgMult = 480/150 = 3.2
  // Cada daño base × 3.2
  const attrs = () => simulate(withMods({ 0: { id: MOD.HORNET_STRIKE, rank: 10 } }));

  it('Impact: 15 × 3.2 = 48', () => expect(attrs().WEAPON_ADD_IMPACT_DAMAGE?.final).toBeCloseTo(48, 0));
  it('Slash: 15 × 3.2 = 48',  () => expect(attrs().WEAPON_ADD_SLASH_DAMAGE?.final).toBeCloseTo(48, 0));
  it('Puncture: 120 × 3.2 = 384', () => expect(attrs().WEAPON_ADD_PUNCTURE_DAMAGE?.final).toBeCloseTo(384, 0));
  it('WEAPON_DAMAGE.final con Hornet Strike +220%: 150 × 3.2 = 480', () => expect(attrs().WEAPON_DAMAGE?.final).toBeCloseTo(480, 0));
});

describe('Aklex Prime — crit mods al máximo', () => {
  // Pistol Gambit max (rank 5): +120% CC → 25 × (1 + 1.20) = 55
  it('Pistol Gambit max: CC 25 → 55%', () => {
    const attrs = simulate(withMods({ 0: { id: MOD.PISTOL_GAMBIT, rank: 5 } }));
    expect(attrs.WEAPON_ADD_CRIT_CHANCE?.final).toBeCloseTo(55, 1);
  });

  // Target Cracker max (rank 5): +60% CM → 2.0 × (1 + 0.60) = 3.2
  it('Target Cracker max: CM 2.0 → 3.2x', () => {
    const attrs = simulate(withMods({ 0: { id: MOD.TARGET_CRACKER, rank: 5 } }));
    expect(attrs.WEAPON_ADD_CRIT_MULT?.final).toBeCloseTo(3.2, 2);
  });

  it('Pistol Gambit + Target Cracker: CC 55, CM 3.2', () => {
    const attrs = simulate(withMods({
      0: { id: MOD.PISTOL_GAMBIT, rank: 5 },
      1: { id: MOD.TARGET_CRACKER, rank: 5 },
    }));
    expect(attrs.WEAPON_ADD_CRIT_CHANCE?.final).toBeCloseTo(55, 1);
    expect(attrs.WEAPON_ADD_CRIT_MULT?.final).toBeCloseTo(3.2, 2);
  });
});

describe('Aklex Prime — build completa: HS + PG + TC', () => {
  // En partida: 480 daño total, CC 55%, CM 3.2x, SC 25%
  it('stats combinadas coinciden con Arsenal', () => {
    const attrs = simulate(withMods({
      0: { id: MOD.HORNET_STRIKE,  rank: 10 },
      1: { id: MOD.PISTOL_GAMBIT,  rank: 5 },
      2: { id: MOD.TARGET_CRACKER, rank: 5 },
    }));

    expect(attrs.WEAPON_ADD_IMPACT_DAMAGE?.final).toBeCloseTo(48, 0);
    expect(attrs.WEAPON_ADD_SLASH_DAMAGE?.final).toBeCloseTo(48, 0);
    expect(attrs.WEAPON_ADD_PUNCTURE_DAMAGE?.final).toBeCloseTo(384, 0);
    expect(attrs.WEAPON_ADD_CRIT_CHANCE?.final).toBeCloseTo(55, 1);
    expect(attrs.WEAPON_ADD_CRIT_MULT?.final).toBeCloseTo(3.2, 2);
    expect(attrs.WEAPON_ADD_STATUS_CHANCE?.final).toBeCloseTo(25, 1);
  });
});

// ─── Deuda conocida: WEAPON_FIRE_ITERATIONS no mapeado ────────────────────────
//
// Todos los mods de multishot (Barrel Diffusion, Lethal Torrent, Split Chamber,
// Hell's Chamber, Vigilante Armaments, etc. — 11 mods en total) usan el token
// `WEAPON_FIRE_ITERATIONS` en mod-stats.override.json.
//
// Ese token NO está en el array UPGRADES ni en UPGRADE_MAP de shared/types/modifier.ts.
// `resolveToken()` tampoco puede manejarlo (OPERATION_MAP no tiene 'FIRE').
// Resultado: los mods de multishot caen en console.warn y son silenciosamente ignorados.
//
// Fix pendiente (OQ-ENGINE-6): agregar al UPGRADE_MAP —
//   WEAPON_FIRE_ITERATIONS: { attr: 'WEAPON_ADD_MULTISHOT', op: 'ADD' }
// o renombrar el token en el override JSON a WEAPON_ADD_MULTISHOT (vocab D-6).
//
// Hasta que esté resuelto, estos tests documentan el comportamiento ESPERADO:

describe('Aklex Prime — mods de multishot', () => {
  // Barrel Diffusion max (rank 5): +120% multishot
  // 1 × (1 + 120/100) = 2.2 projectiles promedio
  it('Barrel Diffusion max: multishot 1 → 2.2', () => {
    const attrs = simulate(withMods({ 0: { id: MOD.BARREL_DIFFUSION, rank: 5 } }));
    expect(attrs.WEAPON_ADD_MULTISHOT?.final).toBeCloseTo(2.2, 1);
  });

  // Lethal Torrent max (rank 5): +60% multishot + 60% fire rate
  it('Lethal Torrent max: multishot 1 → 1.6, fire rate escala también', () => {
    const attrs = simulate(withMods({ 0: { id: MOD.LETHAL_TORRENT, rank: 5 } }));
    expect(attrs.WEAPON_ADD_MULTISHOT?.final).toBeCloseTo(1.6, 1);
    expect(attrs.WEAPON_ADD_FIRE_RATE?.final).toBeCloseTo(2.667 * 1.6, 2);
  });

  // Build con los 3 mods de daño + Barrel Diffusion: números finales en partida
  it('HS + BD: multishot 2.2, daños × 3.2, CC 25, CM 2x', () => {
    const attrs = simulate(withMods({
      0: { id: MOD.HORNET_STRIKE,   rank: 10 },
      1: { id: MOD.BARREL_DIFFUSION, rank: 5 },
    }));
    expect(attrs.WEAPON_ADD_MULTISHOT?.final).toBeCloseTo(2.2, 1);
    expect(attrs.WEAPON_ADD_PUNCTURE_DAMAGE?.final).toBeCloseTo(384, 0);
  });
});
