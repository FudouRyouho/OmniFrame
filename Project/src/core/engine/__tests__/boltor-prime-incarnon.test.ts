/**
 * Test de integración: Boltor Prime — Incarnon Genesis perks.
 *
 * Valida que los perks de evolución se aplican como BASE_FLAT sobre los atributos
 * del perfil activo. Datos de referencia: wikitext + capturas del Arsenal en partida.
 *
 * Boltor Prime Normal Attack base:
 *   Impact 4.6, Puncture 41.4 → total 46
 *   CC 12%, CM 2×, SC 34%
 *
 * Boltor Prime Incarnon Form base:
 *   Impact 2.4, Slash 14.4, Puncture 7.2 → total 24
 *   CC 24%, CM 3×, SC 20%
 */
import './helpers/engine-data-setup';
import { describe, it, expect } from 'vitest';
import { MutatorBridge } from '../bridge/MutatorBridge';
import type { EnsembleIntention } from '@providers/Ensemble/ensemble.types';

// ─── IDs ─────────────────────────────────────────────────────────────────────

const BOLTOR_PRIME = '/Lotus/Weapons/Tenno/LongGuns/PrimeBoltor/PrimeBoltor';
const SERRATION    = '/Lotus/Upgrades/Mods/Rifle/WeaponDamageAmountMod';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeIntention(overrides: {
  profile?: string;
  perks?: Record<number, string>;
  mods?: Record<number, { id: string; rank: number }>;
}): EnsembleIntention {
  const intention: EnsembleIntention = {
    items: {
      warframe:         { itemId: null, rank: 30, shards: [] },
      primary:          { itemId: BOLTOR_PRIME, rank: 30, active_profile: overrides.profile ?? 'base', evolution_perks: overrides.perks },
      secondary:        { itemId: null, rank: 30 },
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

  if (overrides.mods) {
    intention.mods['primary'] = Object.fromEntries(
      Object.entries(overrides.mods).map(([slot, m]) => [
        slot,
        { itemId: m.id, rank: 30, level: m.rank }
      ])
    );
  }

  return intention;
}

function simulate(intention: EnsembleIntention) {
  const bridge = new MutatorBridge();
  const result = bridge.simulateFromIntention(intention);
  const weapon = result.entities.find(e => e.id === BOLTOR_PRIME);
  if (!weapon) throw new Error(`Entidad ${BOLTOR_PRIME} no encontrada`);
  return weapon.attributes;
}

;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Boltor Prime — Normal Attack sin perks (stats base)', () => {
  it('daño base: Impact 4.6, Puncture 41.4', () => {
    const attrs = simulate(makeIntention({}));
    expect(attrs.WEAPON_ADD_IMPACT_DAMAGE?.final).toBeCloseTo(4.6, 1);
    expect(attrs.WEAPON_ADD_PUNCTURE_DAMAGE?.final).toBeCloseTo(41.4, 1);
  });

  it('WEAPON_DAMAGE.base = 46', () => {
    const attrs = simulate(makeIntention({}));
    expect(attrs.WEAPON_DAMAGE?.final).toBeCloseTo(46, 0);
  });

  it('crit y status base: CC 12, CM 2, SC 34', () => {
    const attrs = simulate(makeIntention({}));
    expect(attrs.WEAPON_ADD_CRIT_CHANCE?.final).toBeCloseTo(12, 1);
    expect(attrs.WEAPON_ADD_CRIT_MULT?.final).toBeCloseTo(2.0, 1);
    expect(attrs.WEAPON_ADD_STATUS_CHANCE?.final).toBeCloseTo(34, 1);
  });
});

describe('Boltor Prime — EVO II: Hunter\'s Mantra (+4 BASE_FLAT a WEAPON_DAMAGE)', () => {
  // WEAPON_DAMAGE: base=46, base_flat=4 → final=50, globalMult=50/46
  const perks: Record<number, string> = { 2: 'hunters_mantra' };

  it('WEAPON_DAMAGE.final = 50 (sin mods de daño)', () => {
    const attrs = simulate(makeIntention({ perks }));
    expect(attrs.WEAPON_DAMAGE?.final).toBeCloseTo(50, 0);
  });

  it('daños se escalan proporcionalmente con globalMult=50/46', () => {
    const attrs = simulate(makeIntention({ perks }));
    const mult = 50 / 46;
    expect(attrs.WEAPON_ADD_IMPACT_DAMAGE?.final).toBeCloseTo(4.6 * mult, 1);
    expect(attrs.WEAPON_ADD_PUNCTURE_DAMAGE?.final).toBeCloseTo(41.4 * mult, 1);
  });

  it('Serration +165% amplifica el perk: (46+4) × 2.65 = 132.5', () => {
    const attrs = simulate(makeIntention({ perks, mods: { 0: { id: SERRATION, rank: 10 } } }));
    expect(attrs.WEAPON_DAMAGE?.final).toBeCloseTo(132.5, 0);
    expect(attrs.WEAPON_ADD_PUNCTURE_DAMAGE?.final).toBeCloseTo(41.4 * (132.5 / 46), 1);
  });
});

describe('Boltor Prime — EVO IV: Commodore\'s Fortune (+14% BASE_FLAT a CC)', () => {
  // CC: base=12, base_flat=14 → final=26% (sin mods de CC)
  const perks: Record<number, string> = { 4: 'commodores_fortune' };

  it('CC aumenta de 12 a 26% (12 + 14 BASE_FLAT)', () => {
    const attrs = simulate(makeIntention({ perks }));
    expect(attrs.WEAPON_ADD_CRIT_CHANCE?.final).toBeCloseTo(26, 1);
  });

  it('CM y SC no se ven afectados', () => {
    const attrs = simulate(makeIntention({ perks }));
    expect(attrs.WEAPON_ADD_CRIT_MULT?.final).toBeCloseTo(2.0, 1);
    expect(attrs.WEAPON_ADD_STATUS_CHANCE?.final).toBeCloseTo(34, 1);
  });
});

describe('Boltor Prime — EVO II + EVO IV combinados', () => {
  const perks: Record<number, string> = { 2: 'hunters_mantra', 4: 'commodores_fortune' };

  it('WEAPON_DAMAGE = 50, CC = 26 (perks independientes)', () => {
    const attrs = simulate(makeIntention({ perks }));
    expect(attrs.WEAPON_DAMAGE?.final).toBeCloseTo(50, 0);
    expect(attrs.WEAPON_ADD_CRIT_CHANCE?.final).toBeCloseTo(26, 1);
  });
});

describe('Boltor Prime — Incarnon Form (perfil incarnon_form)', () => {
  // Incarnon Form base: Impact 2.4, Slash 14.4, Puncture 7.2 → total 24
  // CC 24%, CM 3×, SC 20%

  it('stats base del perfil incarnon_form', () => {
    const attrs = simulate(makeIntention({ profile: 'incarnon_form' }));
    expect(attrs.WEAPON_ADD_IMPACT_DAMAGE?.final).toBeCloseTo(2.4, 1);
    expect(attrs.WEAPON_ADD_SLASH_DAMAGE?.final).toBeCloseTo(14.4, 1);
    expect(attrs.WEAPON_ADD_PUNCTURE_DAMAGE?.final).toBeCloseTo(7.2, 1);
    expect(attrs.WEAPON_DAMAGE?.final).toBeCloseTo(24, 0);
    expect(attrs.WEAPON_ADD_CRIT_CHANCE?.final).toBeCloseTo(24, 1);
    expect(attrs.WEAPON_ADD_CRIT_MULT?.final).toBeCloseTo(3.0, 1);
    expect(attrs.WEAPON_ADD_STATUS_CHANCE?.final).toBeCloseTo(20, 1);
  });

  it('Commodore\'s Fortune en Incarnon Form: CC 24 + 14 = 38%', () => {
    const perks: Record<number, string> = { 4: 'commodores_fortune' };
    const attrs = simulate(makeIntention({ profile: 'incarnon_form', perks }));
    expect(attrs.WEAPON_ADD_CRIT_CHANCE?.final).toBeCloseTo(38, 1);
  });
});
