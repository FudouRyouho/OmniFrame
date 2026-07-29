/**
 * Volt Speed — 2ª habilidad que el motor consume por HIDRATACIÓN REAL (la 1ª fue Roar).
 *
 * Lo que agrega respecto a Roar (`rhino.test.ts` Fase 1b):
 *   - el destino NO es un pool de daño sino un nodo de **utilidad** del arma
 *     (`WEAPON_ADD_RELOAD_SPEED`, base 100) que ya estaba materializado;
 *   - el token `$$` se resuelve **por sintaxis** (`resolveToken`: WEAPON + ADD → op `ADD`),
 *     sin entrada propia en `UPGRADE_MAP`;
 *   - **cero código nuevo**: sólo la anotación `$$WEAPON_ADD_RELOAD_SPEED` en
 *     `references/game-ui/Volt.md`. Es la prueba de que el pipeline
 *     `.md → parser → override → AbilityRepository → grafo` cierra solo.
 *
 * Fidelidad (`references/wiki/abilities/Volt/Speed/Speed.md`): el buff de reload
 * **stackea ADITIVAMENTE** con los mods de reload — la wiki lo declara con ejemplo:
 * `Speed(25%) × Intensify(1.3) + Quickdraw(48%)`. Por eso aterriza en `mods_add_pct`,
 * junto a los mods, y no en un bucket propio.
 *
 * Valores verificados con `npm run oracle -- nodes volt_speed` ANTES de asertar.
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { volt, voltSpeed, VOLT, TIBERON_PRIME, NIKANA_PRIME } from '../fixtures/builds';

await loadEngineData(new NodeAdapter());

const reloadOf = (intention: ReturnType<typeof volt>) =>
  consume(intention, { flags: {} }).weapon(TIBERON_PRIME).node('WEAPON_ADD_RELOAD_SPEED');

describe('Volt Speed — buff cross-entity a un nodo de utilidad del arma', () => {
  it('baseline: sin la ability, el nodo de reload queda en su base (no-op)', () => {
    const reload = reloadOf(volt());
    expect(reload.base).toBe(100);
    expect(reload.mods_add_pct).toBe(0);
    expect(reload.final).toBe(100);
  });

  it('con Speed (strength 100%): +25% de reload — el valor de la carta, sin amplificar', () => {
    const reload = reloadOf(voltSpeed());
    expect(reload.mods_add_pct).toBeCloseTo(25, 5);   // 25 × (100/100)
    expect(reload.final).toBeCloseTo(125, 5);         // 100 × (1 + 0.25)
  });

  // El escalado por Ability Strength lo hace el GRAFO (arista `source_attribute` →
  // AVATAR_ADD_ABILITY_STRENGTH), no el hidratador: mismo mecanismo que Roar.
  it('con Speed + Blind Rage (strength 199%): +49.75% = 25 × 1.99', () => {
    const build = voltSpeed({ strength: true });
    const out = consume(build, { flags: {} });
    // el strength vive en el WARFRAME (source de la arista); el reload, en el ARMA (target)
    expect(out.weapon(VOLT).node('AVATAR_ADD_ABILITY_STRENGTH').final).toBeCloseTo(199, 5);
    const reload = out.weapon(TIBERON_PRIME).node('WEAPON_ADD_RELOAD_SPEED');
    expect(reload.mods_add_pct).toBeCloseTo(49.75, 5);
    expect(reload.final).toBeCloseTo(149.75, 5);
  });

  it('aislamiento: quitar la ability de la intención devuelve el nodo a su base', () => {
    const sinSpeed = voltSpeed();
    delete sinSpeed.items.warframe.abilities;
    expect(reloadOf(sinSpeed).final).toBe(100);
  });
});

// ─── Los otros dos buffs de Speed — un renglón de la UI, dos stats distintos ────────
//
// La wiki da los tres buffs (rank 3): Movement Speed 75%, Melee Attack Speed 75%, Reload
// Speed 25% — los tres `× Ability Strength` y los tres ADITIVOS con los mods de su stat.
// La UI del juego colapsa los dos primeros en un solo renglón (`Speed Multiplier: 1,75x`),
// así que el `.md` lleva DOS `$$` en esa línea y el parser emite `upgrade_type: string[]`.
//
// Dos conversiones que este bloque fija (si alguna se rompe, el número miente en silencio):
//   1. UNIDAD: `1,75x` es multiplicador; el motor consume porcentaje aditivo → +75%.
//      Sin la conversión entraría como +1.75%, plausible y falso.
//   2. RUTEO: el token declara la entidad. `AVATAR_*` vuelve al warframe que castea,
//      `MELEE_*` alcanza sólo la melee. No hay fan-out ciego a "las armas equipadas".
//
// El nodo de movement es una ESCALA, no un porcentaje: `sprint_speed` del raw (mal nombrado
// por DE — es el modificador base de Movement Speed) vale 1.0 para Volt = 6 m/s de walk.
// Ver `references/wiki/mechanics/movement-speed.md`.

const movementOf = (intention: ReturnType<typeof volt>) =>
  consume(intention, { flags: {} }).weapon(VOLT).node('AVATAR_ADD_MOVEMENT_SPEED');

describe('Volt Speed — movement speed (el buff vuelve al warframe que castea)', () => {
  it('baseline: sin la ability, el nodo queda en el sprint_speed del raw (1.0 = 6 m/s)', () => {
    const mov = movementOf(volt());
    expect(mov.base).toBeCloseTo(1, 5);
    expect(mov.mods_add_pct).toBe(0);
    expect(mov.final).toBeCloseTo(1, 5);
  });

  it('con Speed: +75% desde un dato que dice 1,75 — la unidad se convierte, no se copia', () => {
    const mov = movementOf(voltSpeed());
    expect(mov.mods_add_pct).toBeCloseTo(75, 5);   // NO 1.75
    expect(mov.final).toBeCloseTo(1.75, 5);        // 1.0 × (1 + 0.75)
  });

  it('con Blind Rage (strength 199%): +149.25% = 75 × 1.99', () => {
    const mov = movementOf(voltSpeed({ strength: true }));
    expect(mov.mods_add_pct).toBeCloseTo(149.25, 5);
    expect(mov.final).toBeCloseTo(2.4925, 5);
  });
});

describe('Volt Speed — melee attack speed (el buff alcanza sólo la melee)', () => {
  const speedOf = (intention: ReturnType<typeof volt>) =>
    consume(intention, { flags: {} }).weapon(NIKANA_PRIME).node('MELEE_ADD_ATTACK_SPEED');

  it('baseline: la Nikana sin la ability queda en su attack speed nato (1.08)', () => {
    const spd = speedOf(voltSpeed({ melee: true }));
    expect(spd.base).toBeCloseTo(1.08, 2);
  });

  it('con Speed: 1.08 × 1.75 = 1.89 — el mismo renglón que dio el movement speed', () => {
    const spd = speedOf(voltSpeed({ melee: true }));
    expect(spd.mods_add_pct).toBeCloseTo(75, 5);
    expect(spd.final).toBeCloseTo(1.89, 5);
  });

  // El ruteo por familia es lo que hace esto cierto: el token `MELEE_*` no alcanza al rifle.
  // Antes el repo hacía fan-out a TODA arma equipada y sólo la ausencia del nodo evitaba el
  // aterrizaje — ruteo por accidente. Ahora el rifle ni siquiera recibe el modifier.
  it('el buff melee NO toca la primaria (el token declara la entidad, no la pertenencia)', () => {
    const out = consume(voltSpeed({ melee: true }), { flags: {} });
    expect(() => out.weapon(TIBERON_PRIME).node('MELEE_ADD_ATTACK_SPEED')).toThrow();
    // y el de reload sigue llegando al rifle, que es su destino legítimo
    expect(out.weapon(TIBERON_PRIME).node('WEAPON_ADD_RELOAD_SPEED').final).toBeCloseTo(125, 5);
  });
});

// ─── Borde — lo que Speed NO modela todavía (it.todo) ──────────────────────────────

describe('Volt Speed — borde', () => {
  // Cap asimétrico (wiki): el movement speed capea a 150% para ALIADOS y no capea para
  // el propio Volt. Depende de quién recibe, no de la fuente — eje distinto a los caps
  // por-fuente (Icy Avalanche, Recompense). El modelo no tiene aliados como entidad.
  it.todo('cap de movement speed 150% sólo para aliados (no para el caster)');
  // Los aliados pueden hacer backflip para quitarse el buff: opt-out por entidad receptora,
  // no modelable en C1 estático (la ability es asumida-activa, arch §15).
  it.todo('opt-out del buff por backflip del aliado — requiere source-state vivo (gate G-a)');
  // AVATAR_ADD_SPRINT_SPEED y AVATAR_ADD_PARKOUR_VELOCITY existen como token sin nodo. Son
  // stats DISTINTOS de movement speed (movement-speed.md): Rush no afecta el walk, y parkour
  // velocity gobierna bullet jump/rodar. El shard ámbar ya declara el segundo en el dato.
  it.todo('AVATAR_ADD_SPRINT_SPEED — materializar cuando llegue Rush (¿display-only?)');
  it.todo('AVATAR_ADD_PARKOUR_VELOCITY — consumidor de dato ya vivo: shard ámbar +15%/+22.5%');
});
