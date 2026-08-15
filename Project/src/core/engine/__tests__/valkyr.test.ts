/**
 * Valkyr — Warcry. Tercera habilidad que el motor consume por HIDRATACIÓN REAL (Roar, Speed,
 * Warcry), y la primera que reparte **dos ejes distintos sobre dos entidades distintas**: el
 * armor vuelve al warframe que castea, el attack speed alcanza la melee equipada.
 *
 * Lo que agrega sobre Speed es el eje de **armadura porcentual desde una habilidad**. Rhino ya
 * ejerce `AVATAR_ADD_ARMOUR`, pero sólo con shards FLAT — su `mods_add_pct` queda en `0`, así que
 * el bucket porcentual del nodo nunca se había ejercido. Warcry es la primera fuente que lo puebla.
 *
 * Fidelidad (`references/wiki/mechanics/buff-debuff.md` §Defense): el `+50%` de Warcry es
 * "multiplicativo de la base" y **stackea aditivamente con mods como Steel Fiber** — o sea entra
 * al mismo bucket que ellos y multiplica la base junto a ellos, no en un escalón propio. Por eso
 * aterriza en `mods_add_pct` y no en `multiplicative` (`armor.md`).
 *
 * Los dos stats salen de DOS renglones del `.md` de la UI: a diferencia del `Speed Multiplier:
 * 1,75x` de Volt —un renglón que la UI colapsa y el motor separa—, acá el juego ya los muestra
 * aparte y la anotación los sigue.
 *
 * Estructura: la entidad primero (tripwire del dataset, crece cuando crezca Valkyr), la mecánica
 * después. Valores verificados con `npm run oracle -- nodes valkyr_warcry` ANTES de asertar.
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { valkyr, valkyrWarcry, VALKYR, NIKANA_PRIME } from '../fixtures/builds';

await loadEngineData(new NodeAdapter());

const wf    = (b = valkyr()) => consume(b, { flags: {} }).weapon(VALKYR);
const melee = (b = valkyr()) => consume(b, { flags: {} }).weapon(NIKANA_PRIME);

// ─── La entidad — dato base del raw, sin habilidad ni mods ──────────────────────────
//
// No prueba el motor (Rhino ya fijó que los stats base salen del raw): prueba que el dataset
// tiene los números de ESTA entidad, y sostiene la aritmética de todo lo que sigue. Crece
// cuando crezca Valkyr — pasiva Rage, Hysteria exaltada.

describe('Valkyr — la entidad', () => {
  it('health/shield/energy salen del raw y no se modifican sin mods', () => {
    expect(wf().node('AVATAR_ADD_HEALTH_MAX').final).toBe(650);
    expect(wf().node('AVATAR_ADD_SHIELD_MAX').final).toBe(135);
    expect(wf().node('AVATAR_ADD_ENERGY_MAX').final).toBe(100);
  });

  it('armor base 855 — el más alto del corpus, y el operando de Warcry', () => {
    const armor = wf().node('AVATAR_ADD_ARMOUR');
    expect(armor.base).toBe(855);
    expect(armor.mods_add_pct).toBe(0);   // sin fuente porcentual todavía
    expect(armor.final).toBe(855);
  });

  it('movement speed 1.1 — escala, no porcentaje (mismo molde que Volt 1.0)', () => {
    expect(wf().node('AVATAR_ADD_MOVEMENT_SPEED').final).toBe(1.1);
  });
});

// ─── Warcry — los dos ejes, cada uno a su entidad ───────────────────────────────────

describe('Warcry — armor al warframe, attack speed a la melee', () => {
  it('armor: +50% entra al bucket de los mods — 855 × 1.5 = 1282.5', () => {
    const armor = wf(valkyrWarcry()).node('AVATAR_ADD_ARMOUR');
    expect(armor.base).toBe(855);
    expect(armor.mods_add_pct).toBe(50);    // el bucket que Rhino dejaba en 0
    expect(armor.multiplicative).toBe(1);   // NO es un escalón propio
    expect(armor.final).toBe(1282.5);
  });

  it('attack speed: +50% sobre la base de la Nikana Prime — 1.08 × 1.5 = 1.62', () => {
    const spd = melee(valkyrWarcry()).node('MELEE_ADD_ATTACK_SPEED');
    expect(spd.base).toBe(1.08);            // dato del arma, no de la habilidad
    expect(spd.mods_add_pct).toBe(50);
    expect(spd.final).toBeCloseTo(1.62, 10);
  });

  it('sin la habilidad, ninguno de los dos nodos se mueve', () => {
    expect(wf().node('AVATAR_ADD_ARMOUR').final).toBe(855);
    expect(melee().node('MELEE_ADD_ATTACK_SPEED').final).toBe(1.08);
  });
});

describe('Warcry — escalado por Ability Strength', () => {
  const build = valkyrWarcry({ strength: true });   // Blind Rage +99%

  it('Blind Rage lleva strength a 199%', () => {
    expect(wf(build).node('AVATAR_ADD_ABILITY_STRENGTH').final).toBe(199);
  });

  it('los DOS ejes escalan con el mismo strength: 50 × 1.99 = 99.5%', () => {
    expect(wf(build).node('AVATAR_ADD_ARMOUR').mods_add_pct).toBe(99.5);
    expect(melee(build).node('MELEE_ADD_ATTACK_SPEED').mods_add_pct).toBe(99.5);
  });

  it('armor 855 × 1.995 = 1705.725 · attack speed 1.08 × 1.995 = 2.1546', () => {
    expect(wf(build).node('AVATAR_ADD_ARMOUR').final).toBeCloseTo(1705.725, 10);
    expect(melee(build).node('MELEE_ADD_ATTACK_SPEED').final).toBeCloseTo(2.1546, 10);
  });
});

// ─── Borde — lo que Warcry NO modela todavía (it.todo) ──────────────────────────────

describe('Warcry — borde', () => {
  // Warcry alcanza a los aliados ("bolsters Armor and Attack Speed for allies", descripción
  // oficial; `buff-debuff.md` lo lista como `User/Ally`). El modelo no tiene aliados como
  // entidad — mismo hueco que el cap-para-aliados de Volt Speed. Ver `OQ-ENGINE-31`.
  it.todo('el buff alcanza a los aliados en Affinity Range — requiere aliados como entidad');
  // El slow a enemigos cercanos existe en el juego (`buff-debuff.md` §Crowd Control lo lista
  // bajo `Slowed`/`Enemy`) pero NO aparece en la UI de la habilidad, así que no hay stat que
  // anotar. Además es un debuff sobre el enemigo: territorio C2, sin nodo hoy.
  it.todo('slow a enemigos cercanos — debuff sobre el enemigo (C2), y la UI no lo publica');
  // ETERNAL WAR extiende la duración por kill (2s/kill, tope 40s). Es duración condicionada a
  // un evento; C1 proyecta la habilidad como siempre-activa (`arch-decisions §15`), así que la
  // duración no se computa y el augment no tiene dónde aterrizar.
  it.todo('augment ETERNAL WAR — duración por kill, y C1 no computa duración');
});
