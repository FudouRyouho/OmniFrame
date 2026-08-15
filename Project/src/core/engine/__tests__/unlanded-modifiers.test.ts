/**
 * Tripwire de modifiers sin aterrizar — el reporte del estado "acuñado sin nodo".
 *
 * Un token puede estar en `UPGRADES` y no tener nodo en ninguna entidad
 * (`semantic/upgrade-tokens.md §Acuñado sin nodo`). Ese estado es DELIBERADO: acuñar da lenguaje,
 * materializar compromete un modelo. El problema es que `SimulationEngine.resolveNode` hace
 * `if (!node) return` — sin este reporte, "conocido y no modelado" se ve igual que un bug.
 *
 * Lo que estos tests fijan NO es que el engine sepa qué hace un slide: es que **diga en voz alta
 * lo que NO está haciendo**. El motor no infiere ni inventa el nodo faltante; sólo devuelve el
 * feedback del token que le llegó.
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { scene, onPlayer, withBearer, withMods } from '@shared/types/scene-compose';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { consume } from '../output/consume';
import {
  volt, voltSpeed, TIBERON_PRIME, voltChannelArcanes, rhinoRoar, ADARZA_KAVAT, DECONSTRUCTOR_PRIME,
  RHINO, AMALGAM_SERRATION, STEEL_CHARGE, PISTOL_AMP, RIFLE_AMP, ARCANE_FURY, ARCANE_STRIKE,
  BOLTOR_PRIME, LAETUM, NIKANA_PRIME, PROVOKED, ARCANE_RAGE,
} from '../fixtures/builds';

await loadEngineData(new NodeAdapter());

const MAGLEV = '/Lotus/Upgrades/Mods/Warframe/AvatarSlideBoostMod';

/** Corre una build capturando lo que la hidratación reporta por consola. */
const warningsOf = (intention: ReturnType<typeof volt>): string[] => {
  const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  consume(intention, { flags: {} });
  const out = spy.mock.calls.map(c => String(c[0]));
  spy.mockRestore();
  return out;
};

const unlanded = (intention: ReturnType<typeof volt>) =>
  warningsOf(intention).filter(w => w.includes('Token conocido sin nodo'));

afterEach(() => vi.restoreAllMocks());

describe('Modifiers sin aterrizar — el engine declara lo que no modela', () => {
  it('una build sin huecos no reporta nada (el tripwire no es ruido de fondo)', () => {
    expect(unlanded(volt())).toEqual([]);
  });

  it('Maglev reporta sus DOS facetas por separado — el par SLIDE está acuñado, no modelado', () => {
    const build = onPlayer(volt(), p => withMods(p, 'warframe', { 0: { uniqueName: MAGLEV, level: 5 } }));
    const avisos = unlanded(build);

    expect(avisos).toHaveLength(2);
    expect(avisos.some(w => w.includes('AVATAR_ADD_SLIDE_SPEED'))).toBe(true);
    expect(avisos.some(w => w.includes('AVATAR_ADD_SLIDE_FRICTION'))).toBe(true);
    // El reporte nombra la fuente: sin eso el aviso no es accionable.
    expect(avisos.every(w => w.includes(MAGLEV))).toBe(true);
  });

  // ─── El caso que puede romperlo ───────────────────────────────────────────────
  //
  // Un buff cross-entity nace en el warframe apuntando a un nodo que el warframe NO tiene
  // (`WEAPON_ADD_DAMAGE`), y sólo el ruteo por canal lo redirige al arma. Si el tripwire corriera
  // antes de esa pasada, gritaría sobre el caso legítimo — que es justamente el que el motor sí
  // resuelve bien. Estos dos tests son la razón de que el reporte viva al final de `hydrate()`.

  it('Roar no dispara el tripwire: el ruteo por canal ya lo aterrizó', () => {
    expect(unlanded(rhinoRoar())).toEqual([]);
  });

  it('los arcanos con canal cruzado tampoco lo disparan', () => {
    expect(unlanded(voltChannelArcanes())).toEqual([]);
  });

  // Fan-out PARCIAL: el reload de Volt Speed es ALL-scope y alcanza rifle + melee. La melee no
  // tiene nodo de recarga porque no recarga — el buff igual rindió donde correspondía. Reportarlo
  // sería confundir "el fan-out cubrió más de lo aplicable" con "esto no se modela".
  //
  // La instancia se identifica por `source + atributo` y no por el id justamente para que esto
  // funcione: hay DOS mecanismos de fan-out (`StaticHydrator` sufija `@entidad`,
  // `AbilityRepository` sufija `:targetId`) y parsear el id ataría el chequeo a uno de los dos.
  it('un fan-out que aterrizó en UNA entidad no se reporta por las que no aplicaban', () => {
    const conMelee = voltSpeed({ melee: true });
    expect(unlanded(conMelee)).toEqual([]);
    // …y el buff sí rindió donde correspondía:
    const out = consume(conMelee, { flags: {} });
    expect(out.weapon(TIBERON_PRIME).node('WEAPON_ADD_RELOAD_SPEED').final).toBeCloseTo(125, 5);
  });
});

// ════════════════════════════════════════════════════════════════════════════════════════
//  EL OTRO SILENCIO — los slots que se comían solos
// ════════════════════════════════════════════════════════════════════════════════════════
//
// Mismo eje que todo lo de arriba —"que diga en voz alta lo que no está haciendo"— pero al revés:
// acá el motor no dejaba de modelar algo, PERDÍA lo que ya estaba declarado.
//
// `Record<number, …>` no existe en runtime: JS pasa toda clave de objeto a string y JSON no tiene
// cómo escribir otra cosa. Con una clave no entera, `result[parseInt(k)]` → `result[NaN]`, y TODOS
// los slots escriben la misma propiedad. Medido con el oráculo ANTES de la guarda, sobre un `.json`
// parcial con los cuatro elementales de rifle (Hellfire · Cryo Rounds · Infected Clip · Stormbringer):
//
//   claves "0".."3"       → BLAST + CORROSIVE            ✓ correcto
//   claves "s0".."s3"     → ELECTRICITY                  ← 3 de 4 mods desaparecidos
//   las mismas al revés   → HEAT                         ← gana el último escrito
//
// Sin error, sin warning, y con un resultado de cara perfectamente válida. Eso último es lo grave:
// el oráculo es el instrumento con el que se valida el motor contra el juego, así que un número
// plausible y falso no corrompe código — corrompe una medición.

// ════════════════════════════════════════════════════════════════════════════════════════
//  LO QUE NACE EN EL WARFRAME Y BAJA AL ARMA — el ruteo en sus dos direcciones
// ════════════════════════════════════════════════════════════════════════════════════════
//
// El ruteo cruza en ambas direcciones, y cada una tiene su propia guarda:
//
//   arma → warframe   `holder.domain === 'weapon'` + `AVATAR_*` ⇒ sube por familia
//   warframe → arma   el portador no porta la marca de la familia ⇒ baja por familia, ACOTADO
//                     a las entidades del mismo `owner`
//
// Son dos `if` y no una regla sola **a propósito**: unificarlos es elegir *dentro* del bando por
// familia, y eso rompe la contención de `Vitality` —el compañero porta la misma marca `avatar` que
// el warframe—. Ese eje sigue sin forcing-case (`OQ-ENGINE-31`); el de acá sí lo tenía.
//
// POR QUÉ EL HUECO ERA INVISIBLE, que es lo que lo hacía confuso: `AbilityRepository` resuelve el
// destino **él mismo** (`resolveFamilyEntities` con la familia del token) y emite el modifier ya
// apuntando al arma. Roar bajaba porque su repositorio lo bajaba, no porque el ruteo supiera bajar.
// `Mod` y `Arcane` estampan al portador y delegan — y por ese camino `FAMILY_ROUTE` se consultaba
// con dos constantes (`'ENEMY'`, `'AVATAR'`), así que `MELEE`, `WEAPON` y `GAMEPLAY` eran letra
// muerta.
//
// ALCANCE MEDIDO — 15 fuentes vivas montadas en el warframe con token de arma, partidas en TRES por
// su destino real, que lo declara el `label` de cada una (dato, no lectura nuestra):
//
//   (a) TODAS las armas — Arcane Avenger, Crepuscular, Hot Shot, Theorem Demulcent, Provoked.
//       ✅ **las baja la regla espejo**, acotada por `owner`: sin ese eje, `Provoked` —alcance
//       propio— aterriza en el arma del compañero, que porta la misma marca `weapon` y tiene que
//       portarla (Roar la alcanza).
//   (b) UNA clase que ES un slot — Arcane Fury, Ready Steel, Steel Charge, Reflex Guard (melee) ·
//       Arcane Pistoleer, Pistol Amp (secundaria). ✅ **las baja el dato**: el token declara la
//       sub-familia y el ruteo por canal que ya existía las aterriza. D-6 aplicado.
//   (c) UNA clase que NO es un slot — Rifle Amp (rifle ⊊ primaria: `Shotgun Amp` existe aparte),
//       Dead Eye (sniper ⊊ rifle), Arcane Arachne y Vigorous Swap (primaria **+** secundaria).
//       ⏸️ **`upgrade_type: null` — gap declarado.** Con la regla espejo activa, un token liso las
//       bajaría a las TRES armas: Rifle Amp entraría en la secundaria y la melee. Medir de más es
//       peor que no medir, porque un número plausible y falso no corrompe código sino una medición.
//       El eje que las resolvería es la clase de compatibilidad, y no existe sano en el schema —
//       `compat_name` trae 236 valores mezclando clase (`Rifle`, `Assault Rifle`, `Bow`), entidad
//       (`WARFRAME`, `AURA`) y warframe individual. Se reabre con `OQ-DATA-16`.
//
// ⚠️ Arcane Strike no era ninguno de los tres: **le faltaba el token**. Su efecto es
// `MELEE_ADD_ATTACK_SPEED` —el nodo que la melee sí materializa— y estaba acuñado
// `WEAPON_ADD_FIRE_RATE`, que la melee no tiene. Un token mal acuñado se ve igual que un hueco de
// ruteo desde el tripwire; sólo el `label` de la fuente los distingue.
//
// ⚠️ Y llegar no es aterrizar: Ready Steel, Reflex Guard y Arcane Pistoleer alcanzan el arma
// correcta y mueren ahí, porque combo y ammo efficiency no tienen nodo. El tripwire los reporta en
// la melee y la secundaria — antes los reportaba en el warframe, donde el nodo nunca podía estar.

const ARCANE_ARACHNE = '/Lotus/Upgrades/CosmeticEnhancers/Utility/GolemArcaneBonusDamageOnWallLatch';

describe('Ruteo warframe → arma — la baja, su acotación y lo que queda sin vía', () => {
  const conArachne = () => scene({
    kind: 'onfoot',
    warframe: { uniqueName: RHINO, rank: 30, arcanes: { 0: { uniqueName: ARCANE_ARACHNE, rank: 5 } } },
    weapons: { primary: { uniqueName: TIBERON_PRIME, rank: 30 } },
  });

  // Caso (c): Arachne apunta a DOS slots ("Primary and Secondary") y un `target_channel` no expresa
  // dos. La regla espejo lo bajaría a las TRES armas — acertaría dos y regalaría la melee. Por eso
  // su `upgrade_type` es `null`: **gap declarado**, no olvido. Medir de más es peor que no medir,
  // porque un número plausible y falso no corrompe código sino una medición.
  it('un destino que el token no puede expresar no emite — y el dato dice por qué', () => {
    const out = consume(conArachne(), { flags: { on_wall_latch: true } });
    expect(out.weapon(TIBERON_PRIME).node('WEAPON_ADD_DAMAGE').mods_add_pct).toBe(0);
  });

  // ─── Caso (b): la sub-familia baja el efecto, y el canal lo CONTIENE ──────────────────
  //
  // Las dos mitades importan igual. Que Steel Charge llegue a la melee prueba que el ruteo baja;
  // que NO llegue a la primaria ni a la secundaria prueba que baja *al lugar correcto* — un
  // fan-out por familia también haría pasar la primera mitad.
  const conAuras = () => scene({
    kind: 'onfoot',
    warframe: {
      uniqueName: RHINO, rank: 30,
      mods: { 0: { uniqueName: STEEL_CHARGE, level: 5 }, 1: { uniqueName: PISTOL_AMP, level: 5 } },
    },
    weapons: {
      primary:   { uniqueName: BOLTOR_PRIME, rank: 30 },
      secondary: { uniqueName: LAETUM, rank: 30 },
      melee:     { uniqueName: NIKANA_PRIME, rank: 30 },
    },
  });

  it('un aura de melee montada en el warframe aterriza en la melee — y sólo en ella', () => {
    const out = consume(conAuras(), { flags: {} });
    // Steel Charge rank 5 = +60%. Nikana Prime base 198 → 316.8.
    expect(out.weapon(NIKANA_PRIME).node('WEAPON_ADD_DAMAGE').mods_add_pct).toBe(60);
    expect(out.weapon(BOLTOR_PRIME).node('WEAPON_ADD_DAMAGE').mods_add_pct).toBe(0);
  });

  it('un aura de pistola aterriza en la secundaria — y no cruza a la melee', () => {
    const out = consume(conAuras(), { flags: {} });
    // Pistol Amp rank 5 = +27%. Laetum base 160 → 203.2.
    expect(out.weapon(LAETUM).node('WEAPON_ADD_DAMAGE').mods_add_pct).toBe(27);
    expect(out.weapon(NIKANA_PRIME).node('WEAPON_ADD_DAMAGE').mods_add_pct).toBe(60);
  });

  it('un arcano de warframe con destino de melee baja por sub-familia', () => {
    const build = scene({
      kind: 'onfoot',
      warframe: { uniqueName: RHINO, rank: 30, arcanes: { 0: { uniqueName: ARCANE_FURY, rank: 5 } } },
      weapons: { primary: { uniqueName: BOLTOR_PRIME, rank: 30 }, melee: { uniqueName: NIKANA_PRIME, rank: 30 } },
    });
    const out = consume(build, { flags: { on_critical_hit: true } });
    // Arcane Fury rank 5 = +180%.
    expect(out.weapon(NIKANA_PRIME).node('WEAPON_ADD_DAMAGE').mods_add_pct).toBe(180);
    expect(out.weapon(BOLTOR_PRIME).node('WEAPON_ADD_DAMAGE').mods_add_pct).toBe(0);
  });

  // Arcane Strike tenía DOS defectos, no uno, y el segundo sólo se vio una vez corregido el primero:
  // con `MELEE_ADD_ATTACK_SPEED` el token ya nombraba el nodo correcto **y seguía sin llegar**,
  // porque el ruteo no consultaba la familia. Este test es el ejercicio de la familia `MELEE`, que
  // por ese camino era letra muerta: no lleva sub-familia ni la necesita.
  it('un token de familia MELEE llega al arma sin sub-familia ninguna', () => {
    const build = scene({
      kind: 'onfoot',
      warframe: { uniqueName: RHINO, rank: 30, arcanes: { 0: { uniqueName: ARCANE_STRIKE, rank: 5 } } },
      weapons: { melee: { uniqueName: NIKANA_PRIME, rank: 30 } },
    });
    // Arcane Strike rank 5 = +60% attack speed.
    expect(consume(build, { flags: { on_hit: true } }).weapon(NIKANA_PRIME).node('MELEE_ADD_ATTACK_SPEED').mods_add_pct).toBe(60);
  });

  // ─── Caso (a): la regla espejo, y su acotación ────────────────────────────────────────
  //
  // Provoked es el ejercicio limpio de la regla: token de arma **liso** —sin sub-familia— montado en
  // el warframe, destino "todas las armas". Antes moría en el portador; ahora baja por la familia
  // del token, que es lo que `arch-decisions §18` prescribía.
  const conProvoked = () => scene({
    kind: 'onfoot',
    warframe: { uniqueName: RHINO, rank: 30, mods: { 0: { uniqueName: PROVOKED, level: 10 } } },
    weapons: {
      primary: { uniqueName: BOLTOR_PRIME, rank: 30 },
      melee:   { uniqueName: NIKANA_PRIME, rank: 30 },
    },
    companion: {
      uniqueName: ADARZA_KAVAT, rank: 30,
      weapon: { uniqueName: DECONSTRUCTOR_PRIME, rank: 30 },
    },
  });

  it('un token de arma liso montado en el warframe baja a TODAS sus armas', () => {
    const out = consume(conProvoked(), { flags: {} });
    // Provoked lvl 10 = +110%.
    expect(out.weapon(BOLTOR_PRIME).node('WEAPON_ADD_DAMAGE').mods_add_pct).toBe(110);
    expect(out.weapon(NIKANA_PRIME).node('WEAPON_ADD_DAMAGE').mods_add_pct).toBe(110);
  });

  // ⚠️ La mitad que hace que la regla no sea un fan-out bruto. El arma de compañero porta la misma
  // marca `weapon` que las del jugador —y tiene que portarla, porque Roar la alcanza—, así que sin
  // el eje de propiedad un mod de alcance PROPIO del warframe aterrizaría en el Deconstructor.
  it('…y NO cruza al arma del compañero, que tiene otro dueño', () => {
    const out = consume(conProvoked(), { flags: {} });
    expect(out.weapon(DECONSTRUCTOR_PRIME).node('WEAPON_ADD_DAMAGE').mods_add_pct).toBe(0);
  });

  /**
   * El caso que estresa identidad y propiedad a la vez: **el mismo molde en dos dueños distintos**.
   * El Deconstructor entra como primaria del jugador Y como arma del compañero — dos participantes,
   * un solo `unique_name`. Mientras la identidad fue el molde, esto colapsaba a una sola entidad y
   * la pregunta ni se podía formular.
   */
  it('el mismo molde con dos dueños son dos participantes, y sólo el propio recibe el buff', () => {
    const build = scene({
      kind: 'onfoot',
      warframe: { uniqueName: RHINO, rank: 30, mods: { 0: { uniqueName: PROVOKED, level: 10 } } },
      weapons: { primary: { uniqueName: DECONSTRUCTOR_PRIME, rank: 30 } },
      companion: {
        uniqueName: ADARZA_KAVAT, rank: 30,
        weapon: { uniqueName: DECONSTRUCTOR_PRIME, rank: 30 },
      },
    });
    const out = consume(build, { flags: {} });

    expect(out.at('squad.0.primary').node('WEAPON_ADD_DAMAGE').mods_add_pct).toBe(110);
    expect(out.at('squad.0.companion_weapon').node('WEAPON_ADD_DAMAGE').mods_add_pct).toBe(0);
    // Y el molde sigue siendo el mismo en las dos: lo que cambia es quién es cada una.
    const iguales = out.snapshot().filter(e => e.unique_name === DECONSTRUCTOR_PRIME);
    expect(iguales.map(e => e.id)).toEqual(['squad.0.primary', 'squad.0.companion_weapon']);
  });

  // ─── Caso (c): el dato declara el gap en vez de dejar que la regla mida de más ────────
  //
  // Rifle Amp es el que prueba por qué (c) no se puede "aproximar al slot": con la regla espejo
  // activa y `WEAPON_ADD_DAMAGE`, un aura de rifle aterriza también en la secundaria y en la melee.
  // Pasa de morir gritando a componer mal en silencio, que es estrictamente peor.
  it('un aura de clase no emite mientras el eje de clase no exista', () => {
    const build = scene({
      kind: 'onfoot',
      warframe: { uniqueName: RHINO, rank: 30, mods: { 0: { uniqueName: RIFLE_AMP, level: 5 } } },
      weapons: {
        primary: { uniqueName: BOLTOR_PRIME, rank: 30 },
        melee:   { uniqueName: NIKANA_PRIME, rank: 30 },
      },
    });
    const out = consume(build, { flags: {} });
    expect(out.weapon(BOLTOR_PRIME).node('WEAPON_ADD_DAMAGE').mods_add_pct).toBe(0);
    expect(out.weapon(NIKANA_PRIME).node('WEAPON_ADD_DAMAGE').mods_add_pct).toBe(0);
  });

  // La contracara, que SÍ funciona y por eso el hueco es fácil de no ver: la dirección inversa tiene
  // su regla, y la ejerce un mod real (Amalgam Serration → `AVATAR_ADD_SPRINT_SPEED` desde un rifle).
  it('la dirección inversa (arma → warframe) sí compone', () => {
    const build = scene({
      kind: 'onfoot',
      warframe: { uniqueName: RHINO, rank: 30 },
      weapons: { primary: { uniqueName: TIBERON_PRIME, rank: 30, mods: { 0: { uniqueName: AMALGAM_SERRATION, level: 10 } } } },
    });
    expect(consume(build, { flags: {} }).weapon(RHINO).node('AVATAR_ADD_SPRINT_SPEED').mods_add_pct).toBe(25);
  });

  // ─── Descartar Y reportar — los cuatro caminos, un solo mensaje ───────────────────────
  //
  // §18 lo pide para todos y el código lo hacía para uno: el cruce de bando gritaba, y el salto
  // `AVATAR_*` sin avatar, el canal vacío y la baja sin armas se llevaban el modifier sin dejar
  // rastro. Medir un arma sola es caso soportado del CLI, así que ninguno es hipotético.
  it('un `AVATAR_*` de arma sin warframe declarado se reporta en vez de evaporarse', () => {
    const build = scene({
      kind: 'onfoot',
      weapons: { primary: { uniqueName: TIBERON_PRIME, rank: 30, mods: { 0: { uniqueName: AMALGAM_SERRATION, level: 10 } } } },
    });
    const avisos = warningsOf(build).filter(w => w.includes('Alcance sin destino'));
    expect(avisos.some(w => w.includes('no hay avatar al que subir') && w.includes(AMALGAM_SERRATION))).toBe(true);
  });

  it('un buff del warframe sin armas equipadas se reporta en vez de evaporarse', () => {
    const build = scene({
      kind: 'onfoot',
      warframe: { uniqueName: RHINO, rank: 30, mods: { 0: { uniqueName: PROVOKED, level: 10 } } },
    });
    const avisos = warningsOf(build).filter(w => w.includes('Alcance sin destino'));
    expect(avisos.some(w => w.includes('armas propias') && w.includes(PROVOKED))).toBe(true);
  });

  it('un canal que no tiene participante se reporta en vez de evaporarse', () => {
    // Arcane Rage apunta a `primary` por sub-familia; el build no equipa primaria.
    const build = scene({
      kind: 'onfoot',
      warframe: { uniqueName: RHINO, rank: 30, arcanes: { 0: { uniqueName: ARCANE_RAGE, rank: 5 } } },
      weapons: { melee: { uniqueName: NIKANA_PRIME, rank: 30 } },
    });
    const avisos = warningsOf(build).filter(w => w.includes('Alcance sin destino'));
    expect(avisos.some(w => w.includes('`primary`') && w.includes(ARCANE_RAGE))).toBe(true);
  });
});

describe('Slots — una clave que no es índice no se come los mods en silencio', () => {
  it('una clave de slot no entera falla ruidosamente', () => {
    // La clave rota se escribe a mano: el tipo `SlotMap` no la deja pasar, y de eso se trata —
    // lo que llega desde un `.json` NO pasa por el tipo, y es ahí donde la guarda hace falta.
    const build = onPlayer(volt(), p => withMods(p, 'warframe', { s0: { uniqueName: MAGLEV, level: 5 } } as never));
    expect(() => consume(build, { flags: {} })).toThrow(/"s0" no es un índice entero/);
  });

  it('la guarda no le cobra peaje al caso normal', () => {
    const build = onPlayer(volt(), p => withMods(p, 'warframe', { 0: { uniqueName: MAGLEV, level: 5 } }));
    expect(() => consume(build, { flags: {} })).not.toThrow();
  });

  // ─── Lo que la guarda NO arregla ──────────────────────────────────────────────
  //
  // Gritar es dejar de mentir, no resolver. El patrón es UNA CLAVE DERIVADA QUE PUEDE COLISIONAR
  // SIN NINGÚN CHEQUEO DE COLISIÓN, y sus apariciones son las dos silenciosas y las dos con el
  // último ganando:
  //
  //   result[parseInt(index)]         cuatro mods con clave rota → misma clave    (acá, con guarda)
  //   SimulationEngine.entities       dos participantes del mismo ítem → misma    (`enemy.test.ts`)
  //   Map<EntityId, SimulationEntity> entrada; el segundo pisa al primero
  //
  // Hubo una tercera —`dnas[intent.entity_id]`, el mapa con el que el bridge le pasaba los moldes al
  // hidratador— y **ya no existe**: no era un defecto de la clave sino el precio de recorrer el
  // espacio dos veces. Con una sola pasada el molde viaja sobre el intent y no hay nada que indexar.
  // Lo que quedó a la vista es que la identidad sigue siendo el `unique_name`.
  //
  // Lo que queda no se arregla ahora a propósito: vive en la identidad del participante, que es lo que
  // cambia cuando la hidratación termine de mudarse. Abrir los dos frentes a la vez es no cerrar
  // ninguno. El gate está declarado en `OQ-ENGINE-36`.
  it.todo('los slots se declaran por posición, sin clave derivada que pueda colisionar (OQ-ENGINE-36)');
});

// ════════════════════════════════════════════════════════════════════════════════════════
//  PARTICIPANTES QUE SE EVAPORABAN — dos silencios, y sólo uno tiene dónde gritar
// ════════════════════════════════════════════════════════════════════════════════════════
//
// Medido con el oráculo sobre parciales `.json`, ANTES de las guardas:
//
//   1 arma buena                        → 1 entidad                      ✓
//   1 buena + 1 inexistente             → 1 entidad, la fantasma se evapora, exit 0
//   sólo la inexistente                 → «0 entidad(es)», exit 0        ← éxito reportado sobre nada
//   1 buena + 1 archgun QUE SÍ EXISTE   → 1 entidad, 0 menciones del archgun
//
// El tercero es el peor: un consumidor no tenía cómo distinguir "esta build no tiene nodos" de
// "el ítem que pediste no existe". El cuarto es de otra naturaleza — ver abajo.

describe('Participantes — lo declarado no se evapora', () => {
  it('un participante sin DNA revienta en vez de descartarse', () => {
    const build = onPlayer(volt(), p => withBearer(p, 'primary', { uniqueName: '/Lotus/Weapons/Tenno/LongGuns/NoExisteEsteArma', rank: 30 }));
    expect(() => consume(build, { flags: {} })).toThrow(/no tiene DNA en los datasets cargados/);
  });

  it('no declarar warframe NO inventa uno', () => {
    // El bridge rellenaba con `"warframe/excalibur"`, un id que no existe ni como `id` ni como
    // `unique_name` (el real es `/Lotus/Powersuits/Excalibur/Excalibur`). Se hidrataba a nada en
    // 157 corridas de esta suite y el descarte silencioso lo tapaba. Medir un arma sola es caso
    // real del CLI: el escenario tiene que quedarse con un participante, no con dos.
    // Sin warframe declarado: en la forma nueva no hay "slot vacío" que poner en null — se omite.
    const build = scene({ kind: 'onfoot', weapons: { primary: { uniqueName: TIBERON_PRIME, rank: 30 } } });
    const out = consume(build, { flags: {} });
    // El id es la COORDENADA: el arma quedó en el slot de primaria del jugador 0. El molde sigue
    // disponible como atributo, y es lo que la lente `weapon()` consulta.
    expect(out.snapshot().map((e: { id: string }) => e.id)).toEqual(['squad.0.primary']);
    expect(out.snapshot().map((e: { unique_name: string }) => e.unique_name)).toEqual([TIBERON_PRIME]);
  });

  // ─── El vehículo declarado: de "no lo modelamos" a "falta cargar el dataset" ──
  //
  // La forma vieja declaraba DIEZ canales y el bridge traducía CINCO; los otros cinco no se leían y
  // el participante no llegaba ni a pedirse. La unión discriminada cerró el silencio, pero el primer
  // arreglo tiró desde la TRADUCCIÓN diciendo *"el engine todavía no lo modela: `Ensemble` no tiene
  // dónde ponerlo"* — y eso era **falso sobre el engine y verdadero sólo sobre la forma intermedia**.
  //
  // Sin esa forma, el archgun entra al espacio como cualquier otro participante y muere donde
  // corresponde: en la hidratación, nombrando el dataset. Ese es el bloqueante real y es chico —
  // `archwing-weapons.json` (28 ítems) y `vehicles.json` existen en `public/data/` y `DataLoader` no
  // los lee.
  //
  // ⚠️ Este test se pone rojo el día que ese dataset se cargue. Es lo que se busca: el rojo es la
  // señal de que el hueco se cerró y hay que reescribir el examen, no de que algo se rompió.
  it('un archgun declarado llega a la hidratación y muere nombrando el dataset, no la forma', () => {
    const build = scene({
      kind: 'archwing',
      archgun: { uniqueName: '/Lotus/Weapons/Tenno/Archwing/Primary/NokkoArchGun/NokkoArchGun', rank: 30 },
    });
    expect(() => consume(build, { flags: {} })).toThrow(/squad\.0\.archgun.*no tiene DNA en los datasets cargados/s);
  });

  // ─── El campo que la variante no alcanza ──────────────────────────────────────
  //
  // `CompanionIntent` declara `weapon` y `arcanes`; el bridge traducía el compañero como
  // `{ id, slots }` y descartaba los dos sin decir nada. Medido con un Boltor Prime montado en un
  // Adarza Kavat: la salida traía UNA entidad (el kavat) y cero menciones del arma, aunque el arma
  // existe en los datasets.
  //
  // POR QUÉ HIZO FALTA UNA GUARDA ESCRITA, y al archgun no: **la unión discriminada protege
  // variantes, no campos**. Adentro de un caso, la traducción es un literal que nombra lo que quiere;
  // un campo sin nombrar no le da a TypeScript de qué quejarse (el excess property check mira
  // propiedades de más en el literal, nunca propiedades sin leer en el origen).
  //
  // YA NO GRITA: **es un participante propio**. Sin la forma intermedia que no tenía dónde ponerla,
  // el arma entra al espacio con canal propio y se hidrata como cualquier otra — el dato siempre
  // estuvo (`Deconstructor Prime` es `domain: weapon` con `unique_name` propio en `weapons.json`).

  it('el arma de un compañero entra al espacio como participante propio', () => {
    const build = scene({
      kind: 'onfoot',
      companion: { uniqueName: ADARZA_KAVAT, rank: 30, weapon: { uniqueName: DECONSTRUCTOR_PRIME, rank: 30 } },
    });
    const out = consume(build, { flags: {} });

    expect(out.snapshot().map((e: { id: string }) => e.id))
      .toEqual(['squad.0.companion', 'squad.0.companion_weapon']);
    expect(out.snapshot().map((e: { unique_name: string }) => e.unique_name))
      .toEqual([ADARZA_KAVAT, DECONSTRUCTOR_PRIME]);
    // …y no entra vacía: hidrata sus propios stats, no los del compañero que la porta.
    expect(out.weapon(DECONSTRUCTOR_PRIME).node('WEAPON_ADD_IMPACT_DAMAGE').base).toBe(160);
  });

  // El canal separa "el arma primaria del jugador" de "el arma del sentinel", y la marca `weapon` la
  // mete en el fan-out ALL-scope. Lo segundo lo decide la fuente, no la simetría: Roar *"applied to
  // Rhino, allied Warframes, **Companions**… increases the damage any ally deals from any source, so
  // weapon damage as well"* (`references/wiki/warframes/rhino/roar.md`).
  it('Roar alcanza el arma del sentinel igual que la primaria', () => {
    const build = onPlayer(rhinoRoar(), p =>
      withBearer(p, 'companion', { uniqueName: ADARZA_KAVAT, rank: 30, weapon: { uniqueName: DECONSTRUCTOR_PRIME, rank: 30 } }),
    );
    const pool = (id: string) => consume(build, { flags: {} }).weapon(id).node('GAMEPLAY_MULT_FACTION_DAMAGE').final;

    expect(pool(DECONSTRUCTOR_PRIME)).toBe(pool(TIBERON_PRIME));
    expect(pool(DECONSTRUCTOR_PRIME)).toBeGreaterThan(100);
  });

  // Un compañero NO tiene slots de arcano en el juego. El campo lo hereda de `Bearer` y sobra.
  // ⚠️ La forma correcta es que no se pueda escribir (`CompanionIntent` excluyendo `arcanes`); el
  // throw es lo que hay mientras tanto, y este test es lo que impide que vuelva a ignorarse.
  it('un compañero con arcanos se rechaza — no tiene ese slot', () => {
    const build = scene({
      kind: 'onfoot',
      companion: { uniqueName: ADARZA_KAVAT, rank: 30, arcanes: { 0: { uniqueName: 'arc:x', rank: 5 } } },
    });
    expect(() => consume(build, { flags: {} })).toThrow(/no tiene slots de arcano/);
  });

  // El `rank` NO entra en la guarda aunque también se declare y no se lea: ese eje es `OQ-ENGINE-23`
  // y su disposición es "se va a usar, pero no hoy". Lo declaran todos los fixtures — gritarlo sería
  // convertir una espera deliberada en un error.
  it('un compañero normal —con rank y mods— sigue pasando', () => {
    const build = scene({
      kind: 'onfoot',
      companion: { uniqueName: ADARZA_KAVAT, rank: 30, mods: { 0: { uniqueName: MAGLEV, level: 5 } } },
    });
    expect(() => consume(build, { flags: {} })).not.toThrow();
  });
});
