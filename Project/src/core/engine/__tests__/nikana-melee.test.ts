/**
 * Nikana Prime — test único del arma (un archivo por arma). Cubre TODAS sus builds/mecánicas
 * melee, cada una en su bloque `describe` sobre el MISMO fixture `nikana()` parametrizado
 * (`withMods`, `profile`, `withCO`) + el `context` de `consume()` (`variables`). Así se soportan
 * varias builds en un solo archivo: no hace falta un test por mecánica, basta variar los args del
 * fixture y las variables de contexto. Secciones:
 *   1. Hit-base (OQ-ENGINE-14 ladrillo 1) — el grafo genérico resuelve un melee como un gun.
 *   2. Condition Overload — familia CO, reusa `CONDITION_OVERLOAD` (arch-decisions §9).
 *   3. Heavy Slam — combo multiplier, primer consumidor de daño (melee-combo.md §4.1).
 *
 * Nikana Prime base: damage 198, crit 28%/2.4x, status 28%, attack_speed 1.08. Slam 396,
 * Heavy Slam 594 blast (arsenal in-game, combo 0 → ×1). Mods básicos: Primed Pressure Point
 * (+165% dmg), True Steel (+120% cc), Organ Shatter (+90% cm), Melee Prowess (+90% sc).
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { nikana, NIKANA_PRIME } from '../fixtures/builds';

await loadEngineData(new NodeAdapter());

const base = () => consume(nikana(false)).weapon(NIKANA_PRIME);
const withMods = () => consume(nikana(true)).weapon(NIKANA_PRIME);

// ═══ 1. Hit-base (OQ-ENGINE-14 ladrillo 1) ════════════════════════════════════════
//
// Melee entra por el slot `melee` del ensemble (no primary). `kind=melee` solo evita el gate
// isWarframe; el resto del grafo es agnóstico al tipo de arma (arch-decisions §1).

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

// ─── Perfiles Slam / Heavy Slam (hit-base por perfil, SIN combo) ───────────────────
//
// Solo el HIT-BASE de cada perfil (damage propio + crit/status heredados del arma). La
// mecánica AoE del slam (radio, falloff, forced impact) NO se modela aquí. El heavy slam
// acá es 594 PURO (combo 0 → ×1) — la base del perfil; el ×combo va en la sección 3.

const slamBase = () => consume(nikana(false, 'slam_attack')).weapon(NIKANA_PRIME);
const heavySlamBase = () => consume(nikana(false, 'heavy_slam_attack')).weapon(NIKANA_PRIME);

describe('Nikana Prime — perfiles Slam / Heavy Slam (hit-base por perfil)', () => {
  it('Slam Attack: damage 396 (impact propio del perfil)', () => {
    expect(slamBase().node('WEAPON_ADD_DAMAGE').final).toBeCloseTo(396, 0);
    expect(slamBase().node('WEAPON_ADD_IMPACT_DAMAGE').final).toBeCloseTo(396, 0);
  });
  it('Heavy Slam Attack: damage 594 (blast propio del perfil, combo 0 → ×1)', () => {
    expect(heavySlamBase().node('WEAPON_ADD_DAMAGE').final).toBeCloseTo(594, 0);
    expect(heavySlamBase().node('WEAPON_ADD_BLAST_DAMAGE').final).toBeCloseTo(594, 0);
  });
  it('cada perfil usa SUS stats del data: Slam crit 28%/2.4x pero status 10% (≠ Normal 28%)', () => {
    const s = slamBase();
    expect(s.node('WEAPON_ADD_CRIT_CHANCE').final).toBeCloseTo(28, 0);   // = Normal
    expect(s.node('WEAPON_ADD_CRIT_MULT').final).toBeCloseTo(2.4, 1);    // = Normal
    expect(s.node('WEAPON_ADD_STATUS_CHANCE').final).toBeCloseTo(10, 0); // propio del slam (data: 0.1)
  });
});

// ═══ 2. Condition Overload (melee) — cierre del frente CO ══════════════════════════
//
// CO *clásico* melee: coefBase 80 (no 40), 1x (sin stacks). Normal Attack tiene shot_type=None
// → default co_behavior `adding` (kind=melee + None). N declarado en variables; sin stacks → 1x.
// Bonus = coBonusPct(80 × 1 × N) → mods_add_pct. Ver arch-decisions §9.

const co = (n: number) =>
  consume(nikana(false, 'base', true), { variables: { status_type_count: n } }).weapon(NIKANA_PRIME);
const coSinN = () => consume(nikana(false, 'base', true)).weapon(NIKANA_PRIME);

describe('Nikana Prime — Condition Overload (adding, melee shot_type None)', () => {
  it('N=3 → +240% en mods_add_pct (80 × 1 × 3), NO multiplicative', () => {
    const n = co(3).node('WEAPON_ADD_DAMAGE');
    expect(n.mods_add_pct).toBeCloseTo(240, 0);
    expect(n.multiplicative).toBeCloseTo(1.0, 3);
  });
  it('coefBase 80 (no 40), 1x: N=1 → +80% (80 × 1 × 1)', () => {
    expect(co(1).node('WEAPON_ADD_DAMAGE').mods_add_pct).toBeCloseTo(80, 0);
  });
  it('linealidad en N (1x): N=5 → +400%', () => {
    expect(co(5).node('WEAPON_ADD_DAMAGE').mods_add_pct).toBeCloseTo(400, 0);
  });
  it('sin declarar N → el CO no aplica (mods_add_pct 0)', () => {
    expect(coSinN().node('WEAPON_ADD_DAMAGE').mods_add_pct).toBeCloseTo(0, 0);
  });
});

// ═══ 3. Heavy Slam — combo multiplier (§4.1, primer consumidor de daño) ═════════════
//
// `combo_mult = min(12, 1 + floor(count/20))` (melee-combo.ts) sobre el perfil heavy, bucket
// FIJO multiplicative. Base 594 (arsenal, combo 0 → ×1), confirmada = @wfcd. El modifier es
// intrínseco (sintetizado en hidratación, gate kind=melee + perfil heavy), no un mod equipado.
// Procedencia: base 594 (c) + mecánica ×combo (c, tooltip in-game); producto por tier = aritmética.
// Factor distancia (falloff radial 50%/6m + bonus por altura) diferido — esto es el centro 100%.

const heavy = (combo: number) =>
  consume(nikana(false, 'heavy_slam_attack'), { variables: { melee_combo_count: combo } }).weapon(NIKANA_PRIME);

describe('Nikana Prime — Heavy Slam combo multiplier', () => {
  it('combo 0 → ×1 → 594 (identidad, backward-compat con la base del perfil)', () => {
    expect(heavy(0).node('WEAPON_ADD_DAMAGE').final).toBeCloseTo(594, 0);
  });
  it('combo 60 → ×4 → 2376 (multiplicative = 4, no mods_add_pct)', () => {
    const n = heavy(60).node('WEAPON_ADD_DAMAGE');
    expect(n.multiplicative).toBeCloseTo(4, 3);
    expect(n.mods_add_pct).toBeCloseTo(0, 3);
    expect(n.final).toBeCloseTo(2376, 0);
  });
  it('propaga al tipo blast (594 → 2376 vía globalDmgMult, no solo al nodo agregado)', () => {
    expect(heavy(60).node('WEAPON_ADD_BLAST_DAMAGE').final).toBeCloseTo(2376, 0);
  });
  it('cap 12x: combo 240 → ×12 (no ×13) → 7128', () => {
    expect(heavy(240).node('WEAPON_ADD_DAMAGE').final).toBeCloseTo(594 * 12, 0);
  });
  it('umbral de tier: combo 19 → ×1, combo 20 → ×2', () => {
    expect(heavy(19).node('WEAPON_ADD_DAMAGE').final).toBeCloseTo(594, 0);
    expect(heavy(20).node('WEAPON_ADD_DAMAGE').final).toBeCloseTo(1188, 0);
  });
  it('sin declarar combo → ×1 (594, el modifier intrínseco no dropea, pega base)', () => {
    expect(consume(nikana(false, 'heavy_slam_attack')).weapon(NIKANA_PRIME).node('WEAPON_ADD_DAMAGE').final).toBeCloseTo(594, 0);
  });
  it('el combo NO toca el perfil normal (base): mismo build, perfil base sigue 198', () => {
    // Gate de perfil: el heavy multiplier solo entra en perfiles 'heavy*'. El light no.
    const n = consume(nikana(false, 'base'), { variables: { melee_combo_count: 60 } }).weapon(NIKANA_PRIME);
    expect(n.node('WEAPON_ADD_DAMAGE').final).toBeCloseTo(198, 0);
  });
});

// ═══ 4. CO × Heavy Slam — composición de dos mecánicas de familia ═══════════════════
//
// Prueba que CO (adding, mods_add_pct) y combo (multiplicative) componen en buckets separados
// sobre el mismo nodo, en el orden real del juego: `base × (1 + CO%) × combo_mult`.
// Requirió el fix del bug co_behavior (2026-07-05): el heavy slam es shot_type=AoE → antes caía
// en el default gun `AoE→none` y CO no aplicaba. Corregido a `kind=melee → adding` SIEMPRE
// (comunidad: "con Condition Overload, Pressure Point está de más"). Ahora CO buffea el heavy slam.

const coHeavy = (n: number, combo: number) =>
  consume(nikana(false, 'heavy_slam_attack', true), { variables: { status_type_count: n, melee_combo_count: combo } })
    .weapon(NIKANA_PRIME);

describe('Nikana Prime — CO × Heavy Slam (dos familias, buckets separados)', () => {
  it('CO adding en heavy slam (el fix: AoE ya NO fuerza none en melee)', () => {
    // N=3 → mods_add_pct = 80×1×3 = 240, sin combo declarado → multiplicative 1.
    const w = coHeavy(3, 0).node('WEAPON_ADD_DAMAGE');
    expect(w.mods_add_pct).toBeCloseTo(240, 0);
    expect(w.multiplicative).toBeCloseTo(1, 3);
    expect(w.final).toBeCloseTo(594 * 3.4, 0); // 2019.6
  });
  it('CO + combo componen: 594 × (1 + 240%) × 4 = 8078.4 (adding × multiplicative, orden real)', () => {
    const w = coHeavy(3, 60).node('WEAPON_ADD_DAMAGE');
    expect(w.mods_add_pct).toBeCloseTo(240, 0);   // CO
    expect(w.multiplicative).toBeCloseTo(4, 3);   // combo
    expect(w.final).toBeCloseTo(8078.4, 1);
  });
  it('propaga al blast con ambas mecánicas activas', () => {
    expect(coHeavy(3, 60).node('WEAPON_ADD_BLAST_DAMAGE').final).toBeCloseTo(8078.4, 1);
  });
});
