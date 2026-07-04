/**
 * Nikana Prime (Normal Attack) — HIT-BASE MELEE determinista (OQ-ENGINE-14, ladrillo 1).
 *
 * Primer melee del engine. Objetivo ACOTADO: probar que el grafo genérico resuelve un melee
 * igual que un gun — damage+tipos, crit, status, attack_speed (=fire_rate). SIN combo, SIN
 * heavy, SIN slam, SIN CO. Solo el hit primario con mods básicos genéricos.
 *
 * Melee entra por el slot `melee` del ensemble (no primary). `kind=melee` solo evita el gate
 * isWarframe; el resto del grafo es agnóstico al tipo de arma (arch-decisions §1).
 *
 * Nikana Prime base: damage 198, crit 28%/2.4x, status 28%, attack_speed 1.08.
 * Mods: Primed Pressure Point (+165% dmg), True Steel (+120% cc, rank-max verificado),
 *        Organ Shatter (+90% cm), Melee Prowess (+90% sc).
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { nikana, NIKANA_PRIME } from '../fixtures/builds';

await loadEngineData(new NodeAdapter());

const base = () => consume(nikana(false)).weapon(NIKANA_PRIME);
const withMods = () => consume(nikana(true)).weapon(NIKANA_PRIME);

// ─── DNA base: el melee hidrata sus stats como cualquier arma ─────────────────────

describe('Nikana Prime — hidratación base (melee entra al grafo)', () => {
  it('damage 198, crit 28%, crit_mult 2.4, status 28%, attack_speed 1.08', () => {
    const w = base();
    expect(w.node('WEAPON_ADD_DAMAGE').final).toBeCloseTo(198, 0);
    expect(w.node('WEAPON_ADD_CRIT_CHANCE').final).toBeCloseTo(28, 0);
    expect(w.node('WEAPON_ADD_CRIT_MULT').final).toBeCloseTo(2.4, 1);
    expect(w.node('WEAPON_ADD_STATUS_CHANCE').final).toBeCloseTo(28, 0);
    expect(w.node('WEAPON_ADD_FIRE_RATE').final).toBeCloseTo(1.08, 2);
  });
});

// ─── Composición con mods básicos: base × (1 + mods%) ─────────────────────────────

describe('Nikana Prime — composición con mods básicos (el grafo compone igual que un gun)', () => {
  it('damage 524.7 — Primed Pressure Point +165% (198 × 2.65)', () => {
    expect(withMods().node('WEAPON_ADD_DAMAGE').final).toBeCloseTo(524.7, 1);
  });
  it('crit chance 61.6% — True Steel +120% (28 × 2.2)', () => {
    expect(withMods().node('WEAPON_ADD_CRIT_CHANCE').final).toBeCloseTo(61.6, 1);
  });
  it('crit mult 4.56 — Organ Shatter +90% (2.4 × 1.9)', () => {
    expect(withMods().node('WEAPON_ADD_CRIT_MULT').final).toBeCloseTo(4.56, 2);
  });
  it('status 53.2% — Melee Prowess +90% (28 × 1.9)', () => {
    expect(withMods().node('WEAPON_ADD_STATUS_CHANCE').final).toBeCloseTo(53.2, 1);
  });
});

// ─── Resto de perfiles: Slam / Heavy Slam (attacks[] con damage propio) ───────────
//
// Solo el HIT-BASE de cada perfil (damage propio + crit/status heredados del arma). La
// mecánica AoE del slam (radio, falloff, forced impact) NO se modela aquí — es mecánica,
// diferida (references no la cubren, ver OQ-ENGINE-14). Deja el grafo melee resolviendo
// todos los perfiles del arma.

const slamBase = () => consume(nikana(false, 'slam_attack')).weapon(NIKANA_PRIME);
const heavySlamBase = () => consume(nikana(false, 'heavy_slam_attack')).weapon(NIKANA_PRIME);

describe('Nikana Prime — perfiles Slam / Heavy Slam (hit-base por perfil)', () => {
  it('Slam Attack: damage 396 (impact propio del perfil)', () => {
    expect(slamBase().node('WEAPON_ADD_DAMAGE').final).toBeCloseTo(396, 0);
    expect(slamBase().node('WEAPON_ADD_IMPACT_DAMAGE').final).toBeCloseTo(396, 0);
  });
  it('Heavy Slam Attack: damage 594 (blast propio del perfil)', () => {
    expect(heavySlamBase().node('WEAPON_ADD_DAMAGE').final).toBeCloseTo(594, 0);
    expect(heavySlamBase().node('WEAPON_ADD_BLAST_DAMAGE').final).toBeCloseTo(594, 0);
  });
  it('cada perfil usa SUS stats del data: Slam crit 28%/2.4x pero status 10% (≠ Normal 28%)', () => {
    // El grafo toma el stat del perfil activo, no lo hereda ciegamente del arma.
    const s = slamBase();
    expect(s.node('WEAPON_ADD_CRIT_CHANCE').final).toBeCloseTo(28, 0);   // = Normal
    expect(s.node('WEAPON_ADD_CRIT_MULT').final).toBeCloseTo(2.4, 1);    // = Normal
    expect(s.node('WEAPON_ADD_STATUS_CHANCE').final).toBeCloseTo(10, 0); // propio del slam (data: 0.1)
  });
});
