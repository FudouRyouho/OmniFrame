/**
 * Boltor Prime — Incarnon Genesis, migrado al "clic" (output/consume; build en fixtures/builds).
 *
 * Demuestra estabilidad y lógica conviviendo sobre la MISMA fuente:
 *   - estabilidad → se lee `.final` (¿el número es correcto?)
 *   - lógica      → se leen los buckets (¿en qué capa aterrizó el aporte?)
 * Ambas salen de un único `consume(intention)`; cambiar de aserción no re-simula.
 *
 * Boltor Prime Normal Attack base:  Impact 4.6, Puncture 41.4 → 46 | CC 12%, CM 2×, SC 34%
 * Boltor Prime Incarnon Form base:  Impact 2.4, Slash 14.4, Puncture 7.2 → 24 | CC 24%, CM 3×, SC 20%
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { boltor, BOLTOR_PRIME, SERRATION } from '../fixtures/builds';

await loadEngineData(new NodeAdapter());

/** Atajo: resuelve una intención y devuelve la sonda del arma. */
const probe = (opts: Parameters<typeof boltor>[0] = {}) =>
  consume(boltor(opts), { flags: {} }).weapon(BOLTOR_PRIME);

// ─── Estabilidad: stats base del perfil Normal Attack ────────────────────────────

describe('Boltor — Normal Attack base (estabilidad: .final)', () => {
  it('daño físico: Impact 4.6, Puncture 41.4', () => {
    const w = probe();
    expect(w.node('WEAPON_ADD_IMPACT_DAMAGE').final).toBeCloseTo(4.6, 1);
    expect(w.node('WEAPON_ADD_PUNCTURE_DAMAGE').final).toBeCloseTo(41.4, 1);
  });

  it('WEAPON_ADD_DAMAGE = 46; CC 12, CM 2, SC 34', () => {
    const w = probe();
    expect(w.node('WEAPON_ADD_DAMAGE').final).toBeCloseTo(46, 0);
    expect(w.node('WEAPON_ADD_CRIT_CHANCE').final).toBeCloseTo(12, 1);
    expect(w.node('WEAPON_ADD_CRIT_MULT').final).toBeCloseTo(2.0, 1);
    expect(w.node('WEAPON_ADD_STATUS_CHANCE').final).toBeCloseTo(34, 1);
  });
});

// ─── Lógica: linaje de WEAPON_ADD_DAMAGE por bucket ──────────────────────────────────

describe('Boltor — WEAPON_ADD_DAMAGE por buckets (lógica: dónde aterriza)', () => {
  it('peldaño 0 — base limpia: todo en base, sin aportes', () => {
    const d = probe().node('WEAPON_ADD_DAMAGE');
    expect(d.base).toBeCloseTo(46, 0);
    expect(d.base_flat).toBe(0);
    expect(d.mods_add_pct).toBe(0);
    expect(d.final).toBeCloseTo(46, 0);
  });

  it('peldaño 1 — +Hunter\'s Mantra: el perk en base_flat (NO en mods)', () => {
    const d = probe({ perks: { 2: 'hunters_mantra' } }).node('WEAPON_ADD_DAMAGE');
    expect(d.base_flat).toBe(4);
    expect(d.mods_add_pct).toBe(0);
    expect(d.final).toBeCloseTo(50, 0);
  });

  it('peldaño 2 — +Serration: el mod en mods_add_pct, amplifica (base+base_flat)', () => {
    const d = probe({ perks: { 2: 'hunters_mantra' }, mods: { 0: SERRATION } }).node('WEAPON_ADD_DAMAGE');
    expect(d.base_flat).toBe(4);        // perk sigue en base_flat
    expect(d.mods_add_pct).toBe(165);   // Serration en mods_add_pct
    // El orden de capas: (46+4) × 2.65 = 132.5, no 46×2.65 + 4.
    expect(d.final).toBeCloseTo(132.5, 0);
  });
});

// ─── EVO IV: Commodore's Fortune (CC +14 BASE_FLAT) ──────────────────────────────

describe('Boltor — EVO IV Commodore\'s Fortune', () => {
  it('CC: +14 en base_flat → 12+14 = 26 (lógica + estabilidad)', () => {
    const cc = probe({ perks: { 4: 'commodores_fortune' } }).node('WEAPON_ADD_CRIT_CHANCE');
    expect(cc.base_flat).toBe(14);
    expect(cc.final).toBeCloseTo(26, 1);
  });

  it('CM y SC no se ven afectados', () => {
    const w = probe({ perks: { 4: 'commodores_fortune' } });
    expect(w.node('WEAPON_ADD_CRIT_MULT').final).toBeCloseTo(2.0, 1);
    expect(w.node('WEAPON_ADD_STATUS_CHANCE').final).toBeCloseTo(34, 1);
  });
});

describe('Boltor — EVO II + EVO IV combinados (perks independientes)', () => {
  it('WEAPON_ADD_DAMAGE = 50, CC = 26', () => {
    const w = probe({ perks: { 2: 'hunters_mantra', 4: 'commodores_fortune' } });
    expect(w.node('WEAPON_ADD_DAMAGE').final).toBeCloseTo(50, 0);
    expect(w.node('WEAPON_ADD_CRIT_CHANCE').final).toBeCloseTo(26, 1);
  });
});

// ─── Genesis activo: misma build, base vs incarnon_form ──────────────────────────
//
// Lo que NO modela overframe: con el genesis activo los perks aplican en AMBOS perfiles.
// El mismo +4 BASE aterriza en base_flat en los dos, pero el `base` difiere (46 vs 24)
// → el final difiere y el +4 pesa proporcionalmente más sobre el base chico de incarnon.

describe('Boltor — genesis activo: base vs incarnon_form (misma build)', () => {
  const PERKS = { 2: 'hunters_mantra', 4: 'commodores_fortune' };

  it('WEAPON_ADD_DAMAGE: perk +4 en base_flat en AMBOS perfiles (final 50 vs 28)', () => {
    const base = probe({ perks: PERKS, profile: 'base' }).node('WEAPON_ADD_DAMAGE');
    const inc  = probe({ perks: PERKS, profile: 'incarnon_form' }).node('WEAPON_ADD_DAMAGE');
    expect(base.base).toBeCloseTo(46, 0);
    expect(base.base_flat).toBe(4);
    expect(base.final).toBeCloseTo(50, 0);
    expect(inc.base).toBeCloseTo(24, 0);
    expect(inc.base_flat).toBe(4);
    expect(inc.final).toBeCloseTo(28, 0);
  });

  it('el +4 pesa proporcionalmente más en incarnon (base chico)', () => {
    const base = probe({ perks: PERKS, profile: 'base' }).node('WEAPON_ADD_DAMAGE');
    const inc  = probe({ perks: PERKS, profile: 'incarnon_form' }).node('WEAPON_ADD_DAMAGE');
    const baseGain = base.final / (base.final - base.base_flat); // 50/46 ≈ 1.087
    const incGain  = inc.final  / (inc.final  - inc.base_flat);  // 28/24 ≈ 1.167
    expect(incGain).toBeGreaterThan(baseGain);
  });

  it('CC: Commodore\'s Fortune +14 base_flat en ambos (26 vs 38)', () => {
    const base = probe({ perks: PERKS, profile: 'base' }).node('WEAPON_ADD_CRIT_CHANCE');
    const inc  = probe({ perks: PERKS, profile: 'incarnon_form' }).node('WEAPON_ADD_CRIT_CHANCE');
    expect(base.base_flat).toBe(14);
    expect(base.final).toBeCloseTo(26, 0);
    expect(inc.base_flat).toBe(14);
    expect(inc.final).toBeCloseTo(38, 0);
  });
});

// ─── Estabilidad: stats base del perfil Incarnon Form ────────────────────────────

describe('Boltor — Incarnon Form base (estabilidad: .final)', () => {
  it('stats del perfil incarnon_form', () => {
    const w = probe({ profile: 'incarnon_form' });
    expect(w.node('WEAPON_ADD_IMPACT_DAMAGE').final).toBeCloseTo(2.4, 1);
    expect(w.node('WEAPON_ADD_SLASH_DAMAGE').final).toBeCloseTo(14.4, 1);
    expect(w.node('WEAPON_ADD_PUNCTURE_DAMAGE').final).toBeCloseTo(7.2, 1);
    expect(w.node('WEAPON_ADD_DAMAGE').final).toBeCloseTo(24, 0);
    expect(w.node('WEAPON_ADD_CRIT_CHANCE').final).toBeCloseTo(24, 1);
    expect(w.node('WEAPON_ADD_CRIT_MULT').final).toBeCloseTo(3.0, 1);
    expect(w.node('WEAPON_ADD_STATUS_CHANCE').final).toBeCloseTo(20, 1);
  });
});

// ─── [debug ii] procedencia real (perks = source=unknown, ver engine/status.md) ──

describe('Boltor — audit trace de WEAPON_ADD_DAMAGE (debug)', () => {
  it('reporta procedencia real, perks incluidos', () => {
    const trace = probe({ perks: { 2: 'hunters_mantra' }, mods: { 0: SERRATION } }).audit('WEAPON_ADD_DAMAGE');
    console.log('\n[debug] WEAPON_ADD_DAMAGE audit trace:');
    trace.forEach((s, i) => console.log(`  ${i}: source=${s.source} op=${s.operation} impact=${s.impact}`));
    expect(trace.length).toBeGreaterThan(0);
  });
});

// ─── Borde de C1 — preguntas abiertas (it.todo) ──────────────────────────────────
// Boltor = proyectil single, genesis. C1 cubre los stats (arriba). Lo que sigue es C2 o gap.

describe('Boltor — borde de C1 (preguntas abiertas)', () => {
  it.todo('C2: roll de crit tier por hit — AtomicSimulator.calculateCritDistribution [hit-mechanic.md:110]');
  it.todo('C2: aplicación de proc de status por hit — StatusEngine [hit-mechanic.md:36]');
  it.todo('C1-gap: source_id ausente en perks → audit trace inatribuible [engine/status.md §Deudas]');
});
