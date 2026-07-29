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
    // La cadencia melee vive en su propio nodo (familia MELEE), no en el de las armas de
    // fuego: el raw ya la trae separada (`attack.speed` vs `stats.fire_rate`) y son stats
    // distintos — fire rate es disparos/s, attack speed un multiplicador de animación.
    expect(w.node('MELEE_ADD_ATTACK_SPEED').final).toBeCloseTo(1.08, 2);
  });

  // El token declara el dominio: una melee NO materializa el nodo de las armas de fuego.
  // Antes compartían nodo, así que un mod de fire rate podía aterrizar sobre una espada
  // y la UI proyectaba el label 'FIRE RATE' para un arma cuerpo a cuerpo.
  it('una melee NO tiene nodo de fire rate (el dominio lo declara el token)', () => {
    expect(() => base().node('WEAPON_ADD_FIRE_RATE')).toThrow();
  });

  // El mismo criterio, aplicado al resto de los stats de arma de fuego. Las 224 melee del
  // dataset no traen `magazine_size` ni `reload_time`: los nodos existían por un `?? 0` que
  // inventaba un cargador de 0 balas y una recarga de 0s en una espada, y la UI los proyectaba
  // ("MAGAZINE 0", "RELOAD SPEED 100%"). El recoil no tiene dato que lo gatee — lo gatea el
  // dominio. Ver ItemRepository.normalizeWeapon (`firearmNodes`).
  it('una melee NO materializa cargador, recarga ni recoil', () => {
    const w = base();
    expect(() => w.node('WEAPON_ADD_MAGAZINE_MAX')).toThrow();
    expect(() => w.node('WEAPON_ADD_RELOAD_SPEED')).toThrow();
    expect(() => w.node('WEAPON_ADD_RECOIL')).toThrow();
  });

  // Fury es el mod que destapó la separación: su label dice "+30% Attack Speed" pero su
  // `upgrade_type` decía `WEAPON_ADD_FIRE_RATE` — la contradicción vivía escrita en nuestro
  // propio override normalizado. Ahora compone sobre el nodo que su label declara.
  it('Fury (+30% Attack Speed) compone sobre el nodo melee: 1.08 × 1.30 = 1.404', () => {
    const w = consume(nikana(false, 'base', false, false, true)).weapon(NIKANA_PRIME);
    const speed = w.node('MELEE_ADD_ATTACK_SPEED');
    expect(speed.base).toBeCloseTo(1.08, 2);
    expect(speed.mods_add_pct).toBeCloseTo(30, 5);
    expect(speed.final).toBeCloseTo(1.404, 3);
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

// ═══ 5. Blood Rush — familia COMBO_SCALED_ADD (ladrillo #3, melee-combo.md §4) ══════
//
// Distinta de Heavy Slam: trae `value` propio (rank real del mod, 40 en rank 10/10) y rutea
// FIJO a `ADD` (mods_add_pct), no `multiplicative`. Efecto = val × meleeComboMult(count). El
// `condition: 'per_melee_combo_multiplier'` del dato NO es gate — ModRepository lo descarta y
// construye COMBO_SCALED_ADD directo (escala disfrazada de condición, mismo patrón que CO tuvo
// con `per_status_type_on_target`). Vehículo: Blood Rush rank 10 (+40% base), perfil `base` (light
// attack — Blood Rush no exige heavy, a diferencia del combo-como-daño de §3).

const bloodRush = (combo: number) =>
  consume(nikana(false, 'base', false, true), { variables: { melee_combo_count: combo } }).weapon(NIKANA_PRIME);

describe('Nikana Prime — Blood Rush (familia COMBO_SCALED_ADD)', () => {
  it('combo 0 → mult 1 (tier base) → +40 en mods_add_pct de WEAPON_ADD_CRIT_CHANCE', () => {
    expect(bloodRush(0).node('WEAPON_ADD_CRIT_CHANCE').mods_add_pct).toBeCloseTo(40, 1);
  });
  it('combo 20 → mult 2 → +80 (val × mult, no identidad)', () => {
    expect(bloodRush(20).node('WEAPON_ADD_CRIT_CHANCE').mods_add_pct).toBeCloseTo(80, 1);
  });
  it('cap 12x: combo 240 → mult 12 → +480', () => {
    expect(bloodRush(240).node('WEAPON_ADD_CRIT_CHANCE').mods_add_pct).toBeCloseTo(480, 1);
  });
  it('sin declarar combo → mult 1 igual (no dropea, mismo default que Heavy Slam) → +40', () => {
    expect(consume(nikana(false, 'base', false, true)).weapon(NIKANA_PRIME).node('WEAPON_ADD_CRIT_CHANCE').mods_add_pct)
      .toBeCloseTo(40, 1);
  });
  it('el perfil light NO recibe el multiplicative del combo (eje ortogonal a Heavy Slam §3)', () => {
    expect(bloodRush(60).node('WEAPON_ADD_CRIT_CHANCE').multiplicative).toBeCloseTo(1, 3);
  });
});

// ─── Borde — la cadencia melee en C2 (it.todo) ─────────────────────────────────────
//
// Este archivo es íntegramente C1: ningún test ejerce C2 sobre melee, y por eso el error de
// abajo está latente, no activo. `CombatCalculator` y `TimelineSimulator` leen
// `WEAPON_ADD_FIRE_RATE` — un nodo que una melee ya no materializa — y caen a su default (`|| 1`),
// devolviendo un número plausible y falso en vez de fallar. Encima, aun leyendo el nodo correcto,
// `MELEE_ADD_ATTACK_SPEED` es un multiplicador sobre la animación del stance, NO golpes/segundo:
// convertirlo en cadencia absoluta requiere el swing time base por stance, que NO existe en
// ninguna fuente del pipeline (el dataset no trae stance ni tiempos de animación; el Public Export
// tampoco los publica). El gap es de dato antes que de diseño — candidato a medición propia
// (`references/ingame-tests/`), no a cosecha. Alcance en OQ-ENGINE-14.

describe('Nikana Prime — cadencia en C2 (gap de dato, no de diseño)', () => {
  it.todo('C2: una melee NO debe caer al default de fire rate — hoy `|| 1` devuelve 1 golpe/s en silencio [OQ-ENGINE-14]');
  it.todo('C2: ley de cadencia melee = swing time base por stance × MELEE_ADD_ATTACK_SPEED — el swing time no existe en ninguna fuente [OQ-ENGINE-14]');
});
