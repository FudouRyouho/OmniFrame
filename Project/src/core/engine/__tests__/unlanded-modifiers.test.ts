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
import { describe, it, expect, vi, afterEach } from 'vitest';
import { consume } from '../output/consume';
import { volt, voltSpeed, TIBERON_PRIME, voltChannelArcanes, rhinoRoar } from '../fixtures/builds';

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
    const build: any = volt();
    build.mods = { warframe: { 0: { itemId: MAGLEV, rank: 5, level: 5 } } };
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

describe('Slots — una clave que no es índice no se come los mods en silencio', () => {
  it('una clave de slot no entera falla ruidosamente y nombra el canal', () => {
    const build: any = volt();
    build.mods = { warframe: { s0: { itemId: MAGLEV, rank: 5, level: 5 } } };
    expect(() => consume(build, { flags: {} })).toThrow(/mods de "warframe".*"s0" no es un índice entero/s);
  });

  it('la guarda no le cobra peaje al caso normal', () => {
    const build: any = volt();
    build.mods = { warframe: { 0: { itemId: MAGLEV, rank: 5, level: 5 } } };
    expect(() => consume(build, { flags: {} })).not.toThrow();
  });

  // ─── Lo que la guarda NO arregla ──────────────────────────────────────────────
  //
  // Gritar es dejar de mentir, no resolver. El patrón es UNA CLAVE DERIVADA QUE PUEDE COLISIONAR
  // SIN NINGÚN CHEQUEO DE COLISIÓN, y tiene dos apariciones vivas en el motor, las dos silenciosas
  // y las dos con el último ganando:
  //
  //   dnas[intent.entity_id]     dos participantes del mismo ítem → misma clave  (`enemy.test.ts`)
  //   result[parseInt(index)]    cuatro mods con clave rota       → misma clave  (acá)
  //
  // No se arregla ahora a propósito: las dos viven en la traducción A→B, que es exactamente la capa
  // que cambia de dueño cuando `scene.draft` baje y la hidratación se mude de C a B. Arreglar la
  // forma hoy es escribir con cuidado en código condenado, y abrir los dos frentes a la vez es no
  // cerrar ninguno. El gate está declarado en `OQ-ENGINE-36`.
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
    const build: any = volt();
    build.items.primary = { itemId: '/Lotus/Weapons/Tenno/LongGuns/NoExisteEsteArma', rank: 30 };
    expect(() => consume(build, { flags: {} })).toThrow(/no tiene DNA en los datasets cargados/);
  });

  it('no declarar warframe NO inventa uno', () => {
    // El bridge rellenaba con `"warframe/excalibur"`, un id que no existe ni como `id` ni como
    // `unique_name` (el real es `/Lotus/Powersuits/Excalibur/Excalibur`). Se hidrataba a nada en
    // 157 corridas de esta suite y el descarte silencioso lo tapaba. Medir un arma sola es caso
    // real del CLI: el escenario tiene que quedarse con un participante, no con dos.
    const build: any = volt();
    build.items.warframe = { itemId: null, rank: 30, shards: [] };
    build.mods = {};
    const out = consume(build, { flags: {} });
    expect(out.snapshot().map((e: { id: string }) => e.id)).toEqual([TIBERON_PRIME]);
  });

  // ─── El silencio que NO tiene dónde gritar ────────────────────────────────────
  //
  // `EnsembleIntention` declara DIEZ canales y `MutatorBridge` traduce CINCO (warframe, primary,
  // secondary, melee, companion). Los otros cinco —companion_weapon, archwing, archgun, archmelee,
  // necramech— no se leen: el participante no llega ni a pedirse, así que la guarda de hidratación
  // no lo puede agarrar. Medido con `/Lotus/Weapons/Tenno/Archwing/Primary/NokkoArchGun/NokkoArchGun`,
  // que EXISTE en `archwing-weapons.json` (28 ítems, el pipeline los genera): la salida trae 1
  // entidad y CERO menciones del archgun.
  //
  // No se arregla con un throw porque no hay dónde ponerlo — hay que leer el canal. Es la unión
  // discriminada de la Capa A la que lo hace imposible: con `archgun` colgando de la variante en vez
  // de vivir en una tabla de diez claves, no queda nadie a quien "olvidársele" recorrerlo.
  it.todo('un canal declarado que el bridge no traduce no se evapora — archgun/archwing/archmelee/necramech/companion_weapon');
});
