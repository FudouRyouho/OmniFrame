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
 * Fidelidad (`references/wiki/warframes/volt/speed.md`): el buff de reload
 * **stackea ADITIVAMENTE** con los mods de reload — la wiki lo declara con ejemplo:
 * `Speed(25%) × Intensify(1.3) + Quickdraw(48%)`. Por eso aterriza en `mods_add_pct`,
 * junto a los mods, y no en un bucket propio.
 *
 * Valores verificados con `npm run oracle -- nodes volt_speed` ANTES de asertar.
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { scene, player, onPlayer, withBearer, withMods, withAbilities } from '@shared/types/scene-compose';
import type { SlotMap, ModIntent } from '@shared/types/scene';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { volt, voltSpeed, voltParkour, voltMobilize, VOLT, VOLT_SPEED, TIBERON_PRIME, NIKANA_PRIME } from '../fixtures/builds';

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
    const sinSpeed = onPlayer(voltSpeed(), p => withAbilities(p, []));
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

// ─── Parkour Velocity — el tercer carril de movimiento, y su primer consumidor ──────
//
// `movement-speed.md` separa CINCO stats de movimiento que la UI del juego no distingue.
// Movement Speed (arriba) y Parkour Velocity son dos de ellos y **ninguno deriva del otro**:
// el primero gobierna walk/aim-walk/crouch, el segundo bullet jump, double jump, rolling y
// springs. Volt Speed toca el primero y no el segundo — verificado abajo.
//
// El nodo no existía: `AVATAR_ADD_PARKOUR_VELOCITY` era token sin nodo, así que el shard
// ámbar se hidrataba, resolvía su token y se perdía sin aterrizar. Su base es **sintética**
// (100 = sin mods, molde de `WEAPON_ADD_RELOAD_SPEED`) porque el raw no trae dato y no puede
// traerlo: el parkour no varía por warframe, a diferencia de `sprint_speed`.

const parkourOf = (intention: ReturnType<typeof volt>) =>
  consume(intention, { flags: {} }).weapon(VOLT).node('AVATAR_ADD_PARKOUR_VELOCITY');

describe('Volt — Parkour Velocity (shard ámbar sobre base sintética)', () => {
  it('baseline: el nodo existe sin shard y vale 100 (100% = sin mods)', () => {
    const parkour = parkourOf(volt());
    expect(parkour.base).toBe(100);
    expect(parkour.mods_add_pct).toBe(0);
    expect(parkour.final).toBe(100);
  });

  it('con el shard ámbar: +15% → 115', () => {
    const parkour = parkourOf(voltParkour());
    expect(parkour.mods_add_pct).toBeCloseTo(15, 5);
    expect(parkour.final).toBeCloseTo(115, 5);
  });

  it('tauforjado: +22.5% → 122.5 (el segundo valor del array, no un múltiplo del primero)', () => {
    const parkour = parkourOf(voltParkour({ tau: true }));
    expect(parkour.mods_add_pct).toBeCloseTo(22.5, 5);
    expect(parkour.final).toBeCloseTo(122.5, 5);
  });

  // Los tres carriles son stats distintos: la wiki lo dice literal ("Sprint Speed bonuses do not
  // affect Movement Speed") y el bullet jump no lo toca ninguno de los dos.
  it('Speed no toca el parkour, y el shard no toca el movement — carriles separados', () => {
    // Parkour (shard) + Speed (ability) sobre el mismo Volt: se COMPONE, no se fusionan dos escenas.
    const conAmbos = onPlayer(voltParkour(), p => withAbilities(p, [{ uniqueName: VOLT_SPEED }]));
    const out = consume(conAmbos, { flags: {} });
    expect(out.weapon(VOLT).node('AVATAR_ADD_PARKOUR_VELOCITY').final).toBeCloseTo(115, 5);
    expect(out.weapon(VOLT).node('AVATAR_ADD_MOVEMENT_SPEED').final).toBeCloseTo(1.75, 5);
  });
});

// ─── Aim Glide / Wall Latch — el segundo stat que traen los mismos 12 mods ──────────
//
// `AVATAR_ADD_AIM_GLIDE_DURATION` es el otro carril que Mobilize y sus 11 hermanos declaran.
// Dos cosas lo separan de todo lo de arriba:
//   1. su base **no es sintética**: son 3 segundos, dato de `maneuvers §Aim Glide`. El nodo lee en
//      su unidad real, no en "porcentaje de sí mismo";
//   2. el SUFFIX `DURATION` declara esa naturaleza — es tiempo, no desplazamiento.
// El token nombra sólo el Aim Glide aunque el Wall Latch comparta su timer, por la misma
// convención que hace que MOVEMENT_SPEED cubra walk+aim-walk+crouch sin decirlo en el nombre.

describe('Volt — Aim Glide/Wall Latch duration (base real, no sintética)', () => {
  const glideOf = (intention: ReturnType<typeof volt>) =>
    consume(intention, { flags: {} }).weapon(VOLT).node('AVATAR_ADD_AIM_GLIDE_DURATION');

  it('baseline: 3 segundos, el número del juego', () => {
    const glide = glideOf(volt());
    expect(glide.base).toBe(3);
    expect(glide.final).toBe(3);
  });

  it('un mismo +20% da 120 en parkour y 3.6s en glide — la unidad la fija la base, no el mod', () => {
    const out = consume(voltMobilize(), { flags: {} });
    const parkour = out.weapon(VOLT).node('AVATAR_ADD_PARKOUR_VELOCITY');
    const glide   = out.weapon(VOLT).node('AVATAR_ADD_AIM_GLIDE_DURATION');

    expect(parkour.mods_add_pct).toBeCloseTo(20, 5);
    expect(glide.mods_add_pct).toBeCloseTo(20, 5);
    expect(parkour.final).toBeCloseTo(120, 5);    // base sintética 100
    expect(glide.final).toBeCloseTo(3.6, 5);      // base real 3s
  });

  // Mobilize declara los dos stats en el MISMO mod: si el segundo no aterrizara, el mod computaría
  // la mitad de lo que dice y nada lo delataría (el tripwire de `unlanded-modifiers.test.ts` es lo
  // que hoy convierte ese silencio en un aviso).
  it('el mod entrega sus dos stats, no uno', () => {
    const out = consume(voltMobilize(), { flags: {} });
    expect(out.weapon(VOLT).node('AVATAR_ADD_PARKOUR_VELOCITY').final).toBeGreaterThan(100);
    expect(out.weapon(VOLT).node('AVATAR_ADD_AIM_GLIDE_DURATION').final).toBeGreaterThan(3);
  });
});

// ─── Sprint Speed — el carril que llega por DOS puertas ─────────────────────────────
//
// Cuarto stat de movimiento y el único cuyo corpus se equipa fuera del warframe: de sus 9 mods,
// uno vive en un rifle (Amalgam Serration). Base sintética 100 porque el sprint no tiene valor
// nato propio — se deriva del walk (`sprint = walk × 1.25 × (1 + Σ bonos)`), así que el nodo
// acumula el `Σ bonos` y los m/s son una derivación cross-stat que nadie pide todavía.

describe('Volt — Sprint Speed (mods del warframe y de un arma, al mismo nodo)', () => {
  const RUSH    = '/Lotus/Upgrades/Mods/Warframe/AvatarSprintSpeedMod';
  const AMALGAM = '/Lotus/Upgrades/Mods/DualSource/Rifle/SerratedRushMod';
  /** Volt + los mods declarados por portador. El rifle se declara sólo si algo se le monta. */
  const sprintCon = (mods: { warframe?: SlotMap<ModIntent>; primary?: SlotMap<ModIntent> }) => {
    let p = player(volt());
    if (mods.warframe) p = withMods(p, 'warframe', mods.warframe);
    if (mods.primary) {
      p = withBearer(p, 'primary', { uniqueName: TIBERON_PRIME, rank: 30 });
      p = withMods(p, 'primary', mods.primary);
    }
    return consume(scene(p), { flags: {} }).weapon(VOLT).node('AVATAR_ADD_SPRINT_SPEED');
  };

  it('baseline: 100 = sin mods', () => {
    expect(sprintCon({}).final).toBe(100);
  });

  it('Rush r5 (mod de warframe): +30%', () => {
    expect(sprintCon({ warframe: { 0: { uniqueName: RUSH, level: 5 } } }).final).toBeCloseTo(130, 5);
  });

  // Éste es el que no funcionaba: el mod está en el RIFLE y su stat pertenece al warframe.
  it('Amalgam Serration r10 (mod de rifle): +25% al warframe, no al rifle', () => {
    expect(sprintCon({ primary: { 0: { uniqueName: AMALGAM, level: 10 } } }).final).toBeCloseTo(125, 5);
  });

  it('los dos suman ADITIVO: +55% — "most sources stack additively" [movement-speed.md]', () => {
    const spd = sprintCon({
      warframe: { 0: { uniqueName: RUSH, level: 5 } },
      primary:  { 0: { uniqueName: AMALGAM, level: 10 } },
    });
    expect(spd.mods_add_pct).toBeCloseTo(55, 5);
    expect(spd.final).toBeCloseTo(155, 5);
  });
});

// ─── Borde — lo que Speed NO modela todavía (it.todo) ──────────────────────────────

describe('Volt Speed — borde', () => {
  // Cap asimétrico (wiki): el movement speed capea a 150% para ALIADOS y no capea para
  // el propio Volt. Depende de quién recibe, no de la fuente — eje distinto a los caps
  // por-fuente (Icy Avalanche, Recompense). El modelo no tiene aliados como entidad.
  it.todo('cap de movement speed 150% sólo para aliados (no para el caster) [OQ-ENGINE-31]');
  // Los aliados pueden hacer backflip para quitarse el buff: opt-out por entidad receptora,
  // no modelable en C1 estático (la ability es asumida-activa, arch §15).
  it.todo('opt-out del buff por backflip del aliado — requiere source-state vivo (gate G-a) [OQ-ENGINE-31]');
  // AVATAR_ADD_SPRINT_SPEED sigue siendo token sin nodo: es un stat DISTINTO de movement speed
  // (movement-speed.md — Rush no afecta el walk) y su consumidor no está mapeado en el dataset.
  it.todo('AVATAR_ADD_SPRINT_SPEED — materializar cuando llegue Rush (¿display-only?)');
  // Lo que sigue afuera de los mods de esta familia es su TERCER stat: `AVATAR_PARKOUR_DAMAGE_ADDED`
  // ("+X% Puncture on Bullet Jump" y sus 6 hermanos elementales, con el tipo SÓLO en el label).
  // No es movilidad — el bullet jump ya emite 100 de Blast con proc garantizado en 3m, o sea es una
  // FUENTE que emite instancia de daño, hermana del heavy slam: consecuencia de una maniobra, no
  // stat de una. Va con el modelo de nodo-source (arch §15).
  //
  // DIFERIDO POR DECISIÓN, no por dificultad: elegir la forma (7 tokens tipados vs 1 token + tipo
  // estructurado) antes de saber cómo el nodo-source representa "fuente que emite instancia" es
  // decidir sin conocer al consumidor — el mismo motivo por el que `co_ratio` sigue diferido.
  it.todo('AVATAR_PARKOUR_DAMAGE_ADDED — daño del bullet jump: 1 token para 7 tipos [arch §15]');
});
