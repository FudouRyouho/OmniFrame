/**
 * EL CANAL DEL RECEPTOR — los dos últimos eslabones de `arch-decisions §17`.
 *
 * El de arriba (`stack-cap-ownership.test.ts`) mide **la ley**: qué número sale cuando un acólito
 * recibe un proc. Éste mide **el canal**: que la clase exista en el dato, que sobreviva el camino de
 * `enemies.json` a la entidad simulada, y que la tabla sea una tabla y no un cap disfrazado.
 *
 * ─── POR QUÉ SON DOS ARCHIVOS ─────────────────────────────────────────────────────────────────────
 *
 * Son dos poblaciones con vidas distintas. La ley se ejerce contra un target **sintético** —números a
 * mano, sin catálogo— porque *"un test de ley que dependiera del dato del juego se rompería cuando ese
 * dato cambie"* (`hostile-entity.ts`). El canal es exactamente lo contrario: no tiene nada que probar
 * si no pasa por el dato real.
 *
 * ─── LO QUE ESTE ARCHIVO SOSTIENE Y TODAVÍA NO EXISTE ─────────────────────────────────────────────
 *
 * `ReceiverContext` llega hasta `applyProc` y **no** hasta `resolutionModifier`/`critModifier`. Es
 * deliberado —ningún desvío conocido del receptor entra por ahí— y tiene consumidor nombrado: el cap de
 * Cold a 4 stacks en Overguard (`OQ-ENGINE-12`), que no es clase sino **capa presente en `t`**. Va como
 * `todo` en vez de como parámetro construido de antemano.
 */
import { describe, it, expect } from 'vitest';
import { hostileEntity } from '../hostile-entity';
import { EntityState } from '../../simulate/EntityState';
import { curateEnemies } from '../../simulate/enemies/EnemyRepository';
import { RECEIVER_MAX_STACKS, receiverMaxStacks } from '../../formulas/status/stack-debuff';
import { UNIT_CLASSES } from '../../contracts/unit-class';
import { loadEngineData } from '../../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';

await loadEngineData(new NodeAdapter());

/** El dato crudo, leído aparte del engine: el tripwire compara la fuente contra la curación. */
const source = new NodeAdapter();
const enemies = (await source.read('enemies')) as Array<{ unique_name: string; name?: string }>;
const overrides = (await source.read('enemy-stats.override')) as Record<string, { unit_class?: string[] }>;

const ACOLYTE_PATH = '/Lotus/Types/Enemies/Acolytes/';

describe('La clase de unidad llega al receptor — el canal, no la ley', () => {
  /**
   * EL CAMINO ENTERO, DE LA FILA DEL OVERRIDE AL CONTADOR.
   *
   * La curación se aplica **una vez, antes del reparto**, porque las dos ramas que consumen
   * `enemies.json` tienen que leer lo mismo: `EnemyRepository` resuelve nombres y `ItemRepository`
   * hidrata al participante que se simula. Mientras el override entraba dentro de `load()`, sólo la
   * primera lo veía — y con el archivo en `{}` eso no movía ningún número. Este caso es lo que impide
   * que vuelva a pasar sin ruido: mide la punta que **no** recibía la curación.
   */
  it('un acólito del catálogo llega a la entidad simulada con su clase', () => {
    const entity = hostileEntity('Violence', 100);
    expect(entity.unit_class).toEqual(['acolyte']);
    // Y el canal sigue siendo `enemy`: la clase NO lo reemplaza. Sin esto el acólito perdería sus
    // vitales, que es lo que hace que refinar el canal no fuera una opción.
    expect(entity.channel ?? 'enemy').toBe('enemy');
    expect(new EntityState(entity).receiverContext().unit_class).toEqual(['acolyte']);
  });

  /** Un hostil cualquiera **calla** — ausente, no lista vacía (`vocabulary.md §6`). */
  it('un hostil sin regla propia no declara clase', () => {
    expect(hostileEntity('Arid Butcher', 100).unit_class).toBeUndefined();
  });

  /**
   * ⚠️ TRIPWIRE — el path es **verificación, no fuente**.
   *
   * La clase se escribe a mano en `enemy-stats.override.json` (la única fuente: el wiki declara la
   * regla en su página de mecánica, no en la fila del enemigo). Derivarla parseando el `unique_name`
   * se descartó — es la clase de inferencia que `OQ-ENGINE-31` ya midió fallar, con 12 desacuerdos
   * sobre 26 en el único tramo verificable de los precepts.
   *
   * Pero acá el path **sí** parte limpio, y desperdiciarlo sería tonto: usarlo al revés convierte la
   * fragilidad en señal. El día que DE agregue un acólito, este caso lo dice en vez de que el dato se
   * desincronice callado.
   */
  it('los acólitos del override son exactamente los del path — ni uno de más, ni de menos', () => {
    const porPath = enemies.filter((e) => e.unique_name.startsWith(ACOLYTE_PATH)).map((e) => e.unique_name);
    const porOverride = Object.entries(overrides)
      .filter(([, o]) => o.unit_class?.includes('acolyte'))
      .map(([k]) => k);
    expect(porPath.length).toBe(6);
    expect([...porOverride].sort()).toEqual([...porPath].sort());
  });

  /** Y son los seis que `arch-decisions §22` nombra al declarar la familia cerrada. */
  it('y son los seis nombrados: Angst · Malice · Mania · Misery · Torment · Violence', () => {
    const nombres = enemies
      .filter((e) => e.unique_name.startsWith(ACOLYTE_PATH))
      .map((e) => e.name)
      .sort();
    expect(nombres).toEqual(['Angst', 'Malice', 'Mania', 'Misery', 'Torment', 'Violence']);
  });

  /**
   * 🔴 UNA CLASE DESCONOCIDA TIRA — y el motivo es el modo de falla, no el rigor.
   *
   * Un valor que ningún `RECEIVER_*` reconoce no rendiría nada: el enemigo pelearía con las leyes
   * default y el número sería **creíble y falso**. Es el mismo criterio que el `throw` de dos
   * `replace` en `applyDeviations` — morir gritando cuando la alternativa es componer mal en silencio.
   */
  it('una clase que no existe en el vocabulario no se traga: tira al curar', () => {
    expect(() =>
      curateEnemies(
        [{ unique_name: 'x', base_level: 1, health: 1, armor: 0, shields: 0, faction: 'Grineer' }],
        { x: { unit_class: ['boss' as never] } },
      ),
    ).toThrow(/no existe/);
  });
});

describe('El portador trae una TABLA, no un cap', () => {
  /**
   * `Impact` ES LA PRUEBA, y por eso está acá aunque no tenga behavior.
   *
   * `arch-decisions §17` §*Un portador puede traer una tabla*: el mismo parámetro toma **tres** valores
   * —default `5`, Acolyte `3`, Lich `6`— y un `cap + desvío` no puede expresar eso. Sin este caso, el
   * comodín `'*' → 4` se leería como *"el acólito topea todo en 4"* y la excepción se perdería sin que
   * nada la contradiga: no tiene entrada en `EFFECT_BEHAVIORS`, así que ningún contador la ejerce.
   *
   * ⚠️ **Y se llama `stagger`, no `impact`:** el tipo de daño y el efecto que produce no comparten
   * nombre en `shared/types/damage.ts`. La fila se escribió con el nombre de la fuente y la atrapó el
   * compilador — el vocabulario cerrado hizo su trabajo.
   */
  it('el acólito dice 4 para cualquier status y 3 para Impact (`stagger`)', () => {
    expect(receiverMaxStacks({ unit_class: ['acolyte'] }, 'corrosion')).toEqual([{ verb: 'forces', value: 4 }]);
    expect(receiverMaxStacks({ unit_class: ['acolyte'] }, 'stagger')).toEqual([{ verb: 'forces', value: 3 }]);
  });

  /** Sin clase, el receptor **calla** — y callar es distinto de declarar un valor neutro. */
  it('un receptor sin clase no aporta ninguna fila', () => {
    expect(receiverMaxStacks(undefined, 'corrosion')).toEqual([]);
    expect(receiverMaxStacks({}, 'corrosion')).toEqual([]);
  });

  /**
   * El verbo es `forces` y no `modifies`, y sale de cómo lo dice la fuente: *"can **only receive up
   * to** 4 stacks"*. §17 correlaciona esa forma con forzar —un límite— y *"X **rather than** Y"* con
   * reemplazar. No se deduce de la aritmética, que daría cualquiera.
   */
  it('el verbo del acólito es `forces`: la fuente dice "can only receive up to"', () => {
    for (const d of Object.values(RECEIVER_MAX_STACKS.acolyte)) {
      expect(d?.verb).toBe('forces');
    }
  });

  /**
   * EL VOCABULARIO ES CHICO PORQUE EL CORPUS LO ES — no por alcance elegido.
   *
   * Medido sobre `enemies.json`: Kuva Lich `0` · Sister `0` · Hound `0` · Necramech enemigo `0`. Los
   * otros receptores con tabla propia que la fuente declara **no se pueden instanciar**, así que una
   * fila para ellos sería ley sin portador. Este caso se rompe cuando el catálogo los traiga, que es
   * exactamente cuando hay que volver a mirar la tabla.
   */
  it('sólo hay clase para lo que el catálogo puede instanciar', () => {
    expect(UNIT_CLASSES).toEqual(['acolyte']);
    for (const q of [/lich/i, /sister/i, /hound/i, /necramech/i]) {
      expect(enemies.filter((e) => q.test(e.unique_name) || q.test(e.name ?? ''))).toHaveLength(0);
    }
  });

  // El cap de Cold a 4 stacks en Overguard (`OQ-ENGINE-12`) es el próximo consumidor, y NO es clase:
  // depende de que la capa esté presente en `t`. Entra por `ReceiverContext` sin cambiarle la forma —
  // un campo más—, pero exige que el contexto llegue a los otros dos métodos del behavior.
  it.todo('`resolutionModifier` y `critModifier` reciben el `ReceiverContext` — hoy sólo `applyProc`');
  it.todo('el Overguard presente topea Cold en 4 — desvío del receptor que es CAPA, no clase');
  // §22: Eximus es clase (*"existen Eximus sin Overguard"*) pero **se decide al instanciar** — 283 de
  // 638 entradas traen `eximus_health`, o sea es variante del mismo registro y no fila propia. Es el
  // caso que justifica que `unit_class` sea conjunto, y el que lo pondría a prueba.
  it.todo('una clase que la elige el escenario y no el dato: Eximus sobre cualquier registro base');
});
