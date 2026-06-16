/**
 * Felarx — Normal Attack + Incarnon Form, migrado al "clic" (output/consume; build en fixtures/builds).
 *
 * Modelo del que es consumidor: escopeta multi-pellet con **flat ÷ multishot acoplado al perfil**.
 * Racking Wrath aporta status como ADD_FLAT, pero el valor está pre-dividido por el base_multishot
 * del perfil: 20% total / 4 pellets = +5 por pellet en Normal Attack. Ese +5 aterriza en `total_flat`.
 *
 * OQ-ENGINE-2 (vivo): en Incarnon Form el base_multishot pasa a 1, así que el flat debería re-dividirse
 * a +20, no +5. El motor sigue aplicando +5. Verificado 2026-06-09: con GS +80% el status queda en 41%
 * (20×1.8 + 5), no 25% como decía el comentario viejo — el motor cambió. El bucket localiza la causa:
 * `total_flat = 5` cuando debería ser 20. El target in-game exacto no está verificado.
 *
 * Build verificada en partida:
 *   Primed Chilling (0), Contagious Spread (1), Galvanized Hell (2), Galvanized Savvy (3),
 *   Primed Charged Shell (4), Primed Cleanse Orokin (5), Primed Ammo Stock (6), Primed Point Blank (7).
 *   Evolutions: Racking Wrath (status +20 ADD_FLAT, CC −10 BASE_FLAT); resto sin efecto en engine.
 *
 * Fórmula status per-pellet:  base × (1 + Σ mods_add_pct) + flat_per_pellet
 *   Ref: https://wiki.warframe.com/w/Felarx — "divided by the base multishot of 4"
 */
import { loadEngineData } from '../fixtures/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import type { EnsembleIntention } from '@shared/types/ensemble';
import { felarx, felarxItems, FELARX, GALVANIZED_SAVVY, TOXIC_BARRAGE, BASE_ENV } from '../fixtures/builds';

await loadEngineData(new NodeAdapter());

type Slots = Record<number, { itemId: string; rank: number; level: number }>;

/** Solo perks + los status mods dados — aísla la fórmula per-pellet (micro-fixture del test). */
function felarxStatus(statusMods: Slots): EnsembleIntention {
  return { items: felarxItems('base'), mods: { primary: statusMods }, environment: BASE_ENV };
}

const fullBase   = (profile = 'base') => consume(felarx(profile), { flags: {} }).weapon(FELARX);
const fullStatic = (profile = 'base') => consume(felarx(profile)).weapon(FELARX);
const statusOnly = (mods: Slots)      => consume(felarxStatus(mods), { flags: {} }).weapon(FELARX);

// ─── Estabilidad: Normal Attack base (.final) ────────────────────────────────────

describe('Felarx — Normal Attack base (estabilidad)', () => {
  it('físico: Impact 100.7, Slash 221.5, Puncture 181.3 (× PPB 2.65)', () => {
    const w = fullBase();
    expect(w.node('WEAPON_ADD_IMPACT_DAMAGE').final).toBeCloseTo(100.7, 1);
    expect(w.node('WEAPON_ADD_SLASH_DAMAGE').final).toBeCloseTo(221.5, 1);
    expect(w.node('WEAPON_ADD_PUNCTURE_DAMAGE').final).toBeCloseTo(181.3, 1);
  });
  it('Viral 1283.9 (Cold+Toxin combinan) y Electricity 830.8 (standalone)', () => {
    const w = fullBase();
    expect(w.node('WEAPON_ADD_VIRAL_DAMAGE').final).toBeCloseTo(1283.9, 1);
    expect(w.node('WEAPON_ADD_ELECTRICITY_DAMAGE').final).toBeCloseTo(830.8, 1);
  });
  it('CC 10% (RW −10 base_flat), CM 2x, FR 3, Magazine ~12.6', () => {
    const w = fullBase();
    expect(w.node('WEAPON_ADD_CRIT_CHANCE').final).toBeCloseTo(10, 1);
    expect(w.node('WEAPON_ADD_CRIT_MULT').final).toBeCloseTo(2, 1);
    expect(w.node('WEAPON_ADD_FIRE_RATE').final).toBeCloseTo(3, 1);
    expect(w.node('WEAPON_ADD_MAGAZINE_MAX').final).toBeCloseTo(12.6, 0);
  });
});

// ─── Lógica: multishot y el flag on_kill ─────────────────────────────────────────

describe('Felarx — multishot por buckets (on_kill)', () => {
  it('base: base 4, mods_add_pct 110 (GH stat 0) → 8.4', () => {
    const ms = fullBase().node('WEAPON_ADD_MULTISHOT');
    expect(ms.base).toBeCloseTo(4, 0);
    expect(ms.mods_add_pct).toBeCloseTo(110, 0);
    expect(ms.final).toBeCloseTo(8.4, 1);
  });
  it('estático: mods_add_pct 230 (+120 on_kill) → 13.2', () => {
    const ms = fullStatic().node('WEAPON_ADD_MULTISHOT');
    expect(ms.mods_add_pct).toBeCloseTo(230, 0);
    expect(ms.final).toBeCloseTo(13.2, 1);
  });
});

// ─── Lógica: status per-pellet — el flat ÷ multishot en total_flat ───────────────
//
// El modelo de Felarx. Racking Wrath = +20 status ADD_FLAT, pre-dividido por base_multishot=4
// → +5 por pellet en `total_flat`. La fórmula: base 5.5 × (1 + mods_add_pct) + 5.

describe('Felarx — status per-pellet (flat ÷ multishot en total_flat)', () => {
  it('Racking Wrath solo: base 5.5, total_flat 5, mods_add_pct 0 → 10.5', () => {
    const s = statusOnly({});
    const n = s.node('WEAPON_ADD_STATUS_CHANCE');
    expect(n.base).toBeCloseTo(5.5, 1);
    expect(n.total_flat).toBeCloseTo(5, 1);   // 20 / 4 pellets
    expect(n.mods_add_pct).toBeCloseTo(0, 1);
    expect(n.final).toBeCloseTo(10.5, 1);
  });
  it('+Toxic Barrage +60%: mods_add_pct 60, total_flat 5 → 13.8', () => {
    const n = statusOnly({ 0: { itemId: TOXIC_BARRAGE, rank: 30, level: 3 } }).node('WEAPON_ADD_STATUS_CHANCE');
    expect(n.mods_add_pct).toBeCloseTo(60, 1);
    expect(n.total_flat).toBeCloseTo(5, 1);
    expect(n.final).toBeCloseTo(13.8, 1);
  });
  it('+Galvanized Savvy +80%: mods_add_pct 80, total_flat 5 → 14.9 (coincide con Arsenal)', () => {
    const n = statusOnly({ 0: { itemId: GALVANIZED_SAVVY, rank: 30, level: 10 } }).node('WEAPON_ADD_STATUS_CHANCE');
    expect(n.mods_add_pct).toBeCloseTo(80, 1);
    expect(n.total_flat).toBeCloseTo(5, 1);
    expect(n.final).toBeCloseTo(14.9, 1);
  });
});

// ─── Estabilidad: Incarnon Form base (.final) ────────────────────────────────────

describe('Felarx — Incarnon Form base (estabilidad)', () => {
  it('Impact 530, Radiation 1060 (× PPB 2.65 sobre base 200/400)', () => {
    const w = fullBase('incarnon_form');
    expect(w.node('WEAPON_ADD_IMPACT_DAMAGE').final).toBeCloseTo(530, 1);
    expect(w.node('WEAPON_ADD_RADIATION_DAMAGE').final).toBeCloseTo(1060, 1);
  });
  it('Viral 4054.5, Electricity 2623.5 (sobre base Incarnon 600)', () => {
    const w = fullBase('incarnon_form');
    expect(w.node('WEAPON_ADD_VIRAL_DAMAGE').final).toBeCloseTo(4054.5, 1);
    expect(w.node('WEAPON_ADD_ELECTRICITY_DAMAGE').final).toBeCloseTo(2623.5, 1);
  });
  it('Multishot 2.1 (base Incarnon 1, GH +110%), CC 10%, CM 3x', () => {
    const w = fullBase('incarnon_form');
    expect(w.node('WEAPON_ADD_MULTISHOT').final).toBeCloseTo(2.1, 1);
    expect(w.node('WEAPON_ADD_CRIT_CHANCE').final).toBeCloseTo(10, 1);
    expect(w.node('WEAPON_ADD_CRIT_MULT').final).toBeCloseTo(3, 1);
  });
});

// ─── OQ-ENGINE-2: el flat NO se re-divide para el perfil incarnon ────────────────
//
// base_multishot incarnon = 1 → el flat debería re-dividirse a +20 (no +5). El bucket
// localiza la causa exacta sin depender del número in-game (no verificado).
// Nota (2026-06-09): el motor cambió desde el comentario viejo — Galvanized Savvy +80%
// AHORA aplica en incarnon (mods_add_pct=80), así que el final es 41 (= 20×1.8 + 5), no 25.

describe('Felarx — Incarnon status, OQ-ENGINE-2', () => {
  it('[realidad] base 20, GS +80% en mods_add_pct, flat sin re-dividir → 41', () => {
    const n = fullBase('incarnon_form').node('WEAPON_ADD_STATUS_CHANCE');
    expect(n.base).toBeCloseTo(20, 0);
    expect(n.mods_add_pct).toBeCloseTo(80, 0);   // Galvanized Savvy SÍ aplica en incarnon
    expect(n.total_flat).toBeCloseTo(5, 1);      // BUG OQ-ENGINE-2: +5, no re-dividido a 20
    expect(n.final).toBeCloseTo(41, 0);
  });
  it.fails('[target] el flat debería re-dividirse a 20 (base_multi=1) — rojo hasta OQ-ENGINE-2', () => {
    expect(fullBase('incarnon_form').node('WEAPON_ADD_STATUS_CHANCE').total_flat).toBeCloseTo(20, 1);
  });
});

// ─── Estabilidad: Normal Attack estático ─────────────────────────────────────────

describe('Felarx — Normal Attack estático (on_kill activo)', () => {
  it('Multishot 13.2; Viral 1283.9 (elementales no condicionales)', () => {
    expect(fullStatic().node('WEAPON_ADD_MULTISHOT').final).toBeCloseTo(13.2, 1);
    expect(fullStatic().node('WEAPON_ADD_VIRAL_DAMAGE').final).toBeCloseTo(1283.9, 1);
  });
});

// ─── Borde de C1 — preguntas abiertas (it.todo) ──────────────────────────────────
// Felarx = shotgun multi-pellet + incarnon. OQ-ENGINE-2 (flat no re-dividido) ya está como it.fails arriba.

describe('Felarx — borde de C1 (preguntas abiertas)', () => {
  it.todo('C2: daño÷pellet y distribución de crit tier por pellet — AtomicSimulator [hit-mechanic.md:57,110]');
  it.todo('C2: procs/disparo = multishot × status_per_pellet — StatusEngine [status-chance-mechanics.md:27]');
  it.todo('C1-gap: source_id ausente en perks → audit trace inatribuible [engine/status.md §Deudas]');
});
