/**
 * Laetum — Normal / Incarnon Form / Radial, migrado al "clic" (output/consume; build en fixtures/builds).
 *
 * Modelo del que es consumidor: pistola single + radial, con dos ejes propios que
 * ningún otro de los 4 cubre:
 *   1. Propagación de `condition` en un PERK (no en un mod): lethal_rearmament
 *      (on_headshot → +30% reload). Base inactivo, estático activo. El bucket lo muestra.
 *   2. Flat de status post-mods SIN dividir: Elemental Excess +20 ADD_FLAT cae entero en
 *      total_flat (single projectile) — contraste con Felarx, donde el flat se divide por pellet.
 *   3. Tercera geometría: auto_radial_attack (AoE Radiation), no un proyectil.
 *
 * Build verificada en partida:
 *   Pistol Pestilence (0), Ice Storm (1), Galvanized Shot (2), Galvanized Diffusion (3),
 *   Lethal Torrent (4), Hornet Strike (5), Gunslinger (6), Primed Heated Charge (7).
 *   Evolutions: Rapid Wrath (FR +20 ADD), Lethal Rearmament (reload +30 on_headshot),
 *   Elemental Excess (status +20 ADD_FLAT, CC −10 BASE_FLAT); resto sin efecto.
 *
 * Fórmula status:  22 × (1 + 0.60 PP + 0.80 GS) + 20 = 22×2.4 + 20 = 72.8
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { laetum, LAETUM } from '../fixtures/builds';

await loadEngineData(new NodeAdapter());

const base = (profile = 'base') => consume(laetum(profile), { flags: {} }).weapon(LAETUM);
const stat = (profile = 'base') => consume(laetum(profile)).weapon(LAETUM);

// ─── Estabilidad: Normal Attack base ─────────────────────────────────────────────

describe('Laetum — Normal Attack base (estabilidad)', () => {
  it('físico: Impact 204.8, Slash 307.2 (× PPB 3.2)', () => {
    const w = base();
    expect(w.node('WEAPON_ADD_IMPACT_DAMAGE').final).toBeCloseTo(204.8, 1);
    expect(w.node('WEAPON_ADD_SLASH_DAMAGE').final).toBeCloseTo(307.2, 1);
  });
  it('Viral 512 (Toxin+Cold), Heat 844.8 (standalone)', () => {
    const w = base();
    expect(w.node('WEAPON_ADD_VIRAL_DAMAGE').final).toBeCloseTo(512, 1);
    expect(w.node('WEAPON_ADD_HEAT_DAMAGE').final).toBeCloseTo(844.8, 1);
  });
  it('Multishot 2.7, Fire Rate 6.3, Magazine ~16.8', () => {
    const w = base();
    expect(w.node('WEAPON_ADD_MULTISHOT').final).toBeCloseTo(2.7, 1);
    expect(w.node('WEAPON_ADD_FIRE_RATE').final).toBeCloseTo(6.3, 1);
    expect(w.node('WEAPON_ADD_MAGAZINE_MAX').final).toBeCloseTo(16.8, 0);
  });
});

// ─── Lógica: status — flat post-mods SIN dividir (contraste con Felarx) ──────────

describe('Laetum — status: flat post-mods sin dividir (lógica)', () => {
  it('base 22, mods_add_pct 140 (PP+GS), total_flat 20 (entero) → 72.8', () => {
    const n = base().node('WEAPON_ADD_STATUS_CHANCE');
    expect(n.base).toBeCloseTo(22, 0);
    expect(n.mods_add_pct).toBeCloseTo(140, 0);  // Pistol Pestilence 60 + Galvanized Shot 80
    expect(n.total_flat).toBeCloseTo(20, 0);     // Elemental Excess +20, NO dividido (single projectile)
    expect(n.final).toBeCloseTo(72.8, 1);
  });
});

// ─── Lógica: CC — Elemental Excess BASE_FLAT ─────────────────────────────────────

describe('Laetum — CC: Elemental Excess BASE_FLAT (lógica)', () => {
  it('base 22, base_flat −10 → 12', () => {
    const n = base().node('WEAPON_ADD_CRIT_CHANCE');
    expect(n.base).toBeCloseTo(22, 0);
    expect(n.base_flat).toBeCloseTo(-10, 0);
    expect(n.final).toBeCloseTo(12, 1);
  });
});

// ─── Lógica: el modelo estrella — condition en un PERK (on_headshot) ─────────────
//
// lethal_rearmament: on_headshot → +30% reload (ADD). Ningún mod toca reload, así que el
// efecto del perk es nítido. El engine RESPETA la condition del perk (regresión histórica:
// antes el IncarnonRepository no propagaba `condition` → el perk aplicaba siempre).

describe('Laetum — perk condicional: on_headshot → reload (lógica)', () => {
  it('base: on_headshot inactivo → mods_add_pct 0, reload 100', () => {
    const n = base().node('WEAPON_ADD_RELOAD_SPEED');
    expect(n.mods_add_pct).toBeCloseTo(0, 1);
    expect(n.final).toBeCloseTo(100, 1);
  });
  it('estático: on_headshot activo → mods_add_pct 30, reload 130', () => {
    const n = stat().node('WEAPON_ADD_RELOAD_SPEED');
    expect(n.mods_add_pct).toBeCloseTo(30, 1);
    expect(n.final).toBeCloseTo(130, 1);
  });
});

// ─── Lógica: multishot on_kill (Galvanized Diffusion) ────────────────────────────

describe('Laetum — multishot on_kill (lógica)', () => {
  it('base: mods_add_pct 170 (GD 110 + LT 60) → 2.7', () => {
    const n = base().node('WEAPON_ADD_MULTISHOT');
    expect(n.base).toBeCloseTo(1, 0);
    expect(n.mods_add_pct).toBeCloseTo(170, 0);
    expect(n.final).toBeCloseTo(2.7, 1);
  });
  it('estático: mods_add_pct 290 (+120 on_kill) → 3.9', () => {
    const n = stat().node('WEAPON_ADD_MULTISHOT');
    expect(n.mods_add_pct).toBeCloseTo(290, 0);
    expect(n.final).toBeCloseTo(3.9, 1);
  });
});

// ─── Estabilidad: Incarnon Form base ─────────────────────────────────────────────

describe('Laetum — Incarnon Form base (estabilidad)', () => {
  it('Impact 320, Viral 320, Heat 528 (base 100 × 3.2)', () => {
    const w = base('incarnon_form');
    expect(w.node('WEAPON_ADD_IMPACT_DAMAGE').final).toBeCloseTo(320, 1);
    expect(w.node('WEAPON_ADD_VIRAL_DAMAGE').final).toBeCloseTo(320, 1);
    expect(w.node('WEAPON_ADD_HEAT_DAMAGE').final).toBeCloseTo(528, 1);
  });
  it('Status 72.8 (misma fórmula), CC 12, Fire Rate 16.8, Multishot 2.7', () => {
    const w = base('incarnon_form');
    expect(w.node('WEAPON_ADD_STATUS_CHANCE').final).toBeCloseTo(72.8, 1);
    expect(w.node('WEAPON_ADD_CRIT_CHANCE').final).toBeCloseTo(12, 1);
    expect(w.node('WEAPON_ADD_FIRE_RATE').final).toBeCloseTo(16.8, 1);
    expect(w.node('WEAPON_ADD_MULTISHOT').final).toBeCloseTo(2.7, 1);
  });
});

// ─── Estabilidad: Auto Radial Attack (3ra geometría) ─────────────────────────────

describe('Laetum — Auto Radial Attack base (estabilidad)', () => {
  it('Radiation 960, Viral 960, Heat 1584 (base Radiation 300 × 3.2)', () => {
    const w = base('auto_radial_attack');
    expect(w.node('WEAPON_ADD_RADIATION_DAMAGE').final).toBeCloseTo(960, 1);
    expect(w.node('WEAPON_ADD_VIRAL_DAMAGE').final).toBeCloseTo(960, 1);
    expect(w.node('WEAPON_ADD_HEAT_DAMAGE').final).toBeCloseTo(1584, 1);
  });
  it('Status 72.8 y CC 12 (misma fórmula en los tres perfiles)', () => {
    const w = base('auto_radial_attack');
    expect(w.node('WEAPON_ADD_STATUS_CHANCE').final).toBeCloseTo(72.8, 1);
    expect(w.node('WEAPON_ADD_CRIT_CHANCE').final).toBeCloseTo(12, 1);
  });
});

// ─── Borde de C1 — preguntas abiertas (it.todo) ──────────────────────────────────
// Laetum = single + radial (3 geometrías). El radial es el eje C2 distintivo.

describe('Laetum — borde de C1 (preguntas abiertas)', () => {
  it.todo('C2: aplicación de status/daño en ataque radial AoE (geometría distinta) — hit-mechanic.md §AoE');
  it.todo('C2: roll de crit tier por hit en las 3 geometrías — AtomicSimulator [hit-mechanic.md:110]');
  it.todo('C1-gap: source_id ausente en perks → audit trace inatribuible [engine/status.md §Deudas]');
});
