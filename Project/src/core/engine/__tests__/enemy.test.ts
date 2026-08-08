/**
 * El enemigo como PARTICIPANTE de C1 — la mitad de "C1 compone, C2 realiza" que nunca se construyó.
 *
 * Hasta acá el objetivo existía sólo en C2 (`EnemyState`, `ScaledEnemy`) y en A2 como parámetros
 * sueltos (`targetLevel`/`targetFaction`). No era una entidad: no tenía nodos, así que **ninguna
 * fuente declarada podía componer sobre él**. Un armor strip de habilidad (Abating Link −60%,
 * Plunder) no tenía dónde aterrizar, y por eso la pregunta *"¿cómo compone un strip declarado con
 * N stacks de Corrosive?"* no tenía respuesta posible — faltaba el frame-0.
 *
 * Lo que estos tests fijan es el frame-0: el objetivo entra al espacio por `hostile` (A2, el grupo
 * Hostil), materializa sus tres stats vitales bajo la familia `ENEMY_*` **ya escalados por su nivel**,
 * y **no recibe lo que no le corresponde**. La evolución temporal sigue siendo de C2 y no se toca acá:
 * la frontera está en `docs/domains/engine/design/arch-decisions.md` §19 — *el nodo lleva el frame-0,
 * la ley lleva el tiempo*. El nivel cae del lado del nodo: un enemigo de nivel 215 tiene el mismo EHP
 * en `t=0` y en `t=100`.
 *
 * Valores verificados con `npm run oracle -- nodes <build>` ANTES de asertar.
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { computeCombatMetrics } from '../output/combat-metrics';
import { BASELINE_GAME_LAWS } from '../contracts';
import type { SimulationContext } from '../contracts';
import type { Scene } from '@shared/types/scene';
import {
  valkyrWarcryTarget, valkyrWarcryCompanion, corrosiveProjectionTarget, rhinoRoarTarget,
  BOMBARD, VALKYR,
} from '../fixtures/builds';

await loadEngineData(new NodeAdapter());

const BASE_CONTEXT: SimulationContext = {
  active_profile_id: 'base', flags: {}, variables: {}, laws: { ...BASELINE_GAME_LAWS },
};

const target = (b = valkyrWarcryTarget()) => consume(b, { flags: {} }).weapon(BOMBARD);

// ─── El objetivo existe ────────────────────────────────────────────────────────────

describe('Enemigo — la entidad', () => {
  it('entra al espacio declarado en `hostile`, no equipado en `items`', () => {
    expect(consume(valkyrWarcryCompanion(), { flags: {} }).snapshot()).toHaveLength(3);
    expect(consume(valkyrWarcryTarget(),    { flags: {} }).snapshot()).toHaveLength(4);
  });

  /**
   * NACER ES ESTAR COMPUESTO — el `base` del nodo ya trae el nivel adentro.
   *
   * El fixture declara `{ itemId: BOMBARD, level: 100 }` y el catálogo dice `health 300 · armor 500`
   * a `base_level 4`. Lo que se materializa NO son esos valores: son los de la curva-S a nivel 100.
   * Un enemigo no existe primero y se escala después, igual que un warframe no nace desnudo para que
   * le pongan los mods encima (`simulation-architecture.md` §Los dos pobladores no son espejos).
   *
   * Estos números salieron de un orquestador paralelo (`EnemyRepository.scale`) que ya no existe: al
   * moverse al frame-0 coincidieron AL DECIMAL con los de acá, y esa coincidencia fue la prueba de
   * que el escalado cambió de capa sin que la ley se moviera. Lo que ese camino no tenía —y por eso
   * murió— es lo de más abajo: los modifiers del escenario.
   */
  it('materializa sus stats vitales ESCALADOS: el nivel es frame-0, no una capa posterior', () => {
    expect(target().node('ENEMY_ADD_HEALTH_MAX').base).toBeCloseTo(86416.38, 2);  // 300 @ lvl 4 → 100
    expect(target().node('ENEMY_ADD_ARMOUR').base).toBe(2700);                    // 500, capeado
    expect(target().node('ENEMY_ADD_SHIELD_MAX').base).toBe(0);                   // sin escudo: 0 escala a 0
  });

  /**
   * El canal lo estampa el ESPACIO y nadie lo vuelve a escribir. Lo fija acá porque el objetivo es
   * el único participante que no entra por el loadout, así que es el único que detecta una segunda
   * escritura armada desde `intention.items[…]`: al bridge le daba `undefined` y lo ponía encima.
   * El resto del espacio sobrevivía a ese pisado por casualidad —sus ids sí están en `items`—, que
   * es por qué el drift aguantó sin que ningún test lo notara.
   */
  it('conserva el canal que le estampó el espacio — nadie lo re-escribe post-resolve', () => {
    const espacio = consume(valkyrWarcryTarget(), { flags: {} }).snapshot();
    expect(espacio.find(e => e.id === BOMBARD)!.channel).toBe('enemy');
    // Y los del loadout siguen con el suyo: el arreglo no cambia lo que ya funcionaba.
    expect(espacio.find(e => e.id === VALKYR)!.channel).toBe('warframe');
    expect(espacio.every(e => e.channel !== undefined)).toBe(true);
  });

  it('no porta taxonomía de arsenal — un enemigo no es un ítem que se equipa', () => {
    const enemy = consume(valkyrWarcryTarget(), { flags: {} })
      .snapshot().find(e => e.id === BOMBARD)!;
    expect(enemy.domain).toBeUndefined();
    expect(enemy.kind).toBeUndefined();
    expect(enemy.tags).toContain('enemy');
  });
});

// ─── Lo que el objetivo NO recibe ──────────────────────────────────────────────────

describe('Enemigo — el buff del jugador no se filtra', () => {
  it('Warcry sube la armadura del warframe y no toca la del enemigo', () => {
    const wf = consume(valkyrWarcryTarget(), { flags: {} }).weapon(VALKYR);
    expect(wf.node('AVATAR_ADD_ARMOUR').final).toBe(1282.5);    // 855 × 1.5
    expect(target().node('ENEMY_ADD_ARMOUR').final).toBe(2700); // intacta: su frame-0, sin buff ajeno
  });

  /**
   * El caso que prueba que la MARCA es lo que separa, no la ausencia de nodo.
   *
   * `createBaseEntity` siembra los pools de daño global en toda entidad que no sea warframe
   * (`!isWarframe`), así que el enemigo materializa `GAMEPLAY_MULT_FACTION_DAMAGE` igual que un arma
   * — un nodo que no le corresponde. Roar buffea ese pool con ALL-scope y aun así no lo alcanza,
   * porque `FAMILY_ROUTE['GAMEPLAY']` pide la marca `weapon` y el enemigo entra con `enemy`.
   *
   * O sea: hoy el nodo falso está **desactivado por el ruteo**, no ausente. Es exactamente el "ruteo
   * por ausencia" contra el que advierte `channel-routing.ts` — dos entidades materializando el mismo
   * token — sólo que resuelto del lado correcto por accidente afortunado.
   */
  it('Roar no alcanza el pool de daño del enemigo, aunque el enemigo materialice ese nodo', () => {
    const enemy = consume(rhinoRoarTarget(), { flags: {} }).weapon(BOMBARD);
    expect(enemy.node('GAMEPLAY_MULT_FACTION_DAMAGE').multiplicative).toBe(1);
  });

  it.todo('el enemigo no debería materializar WEAPON_ADD_DAMAGE ni el pool de facción');
});

// ─── Dos participantes del mismo ítem: el segundo pisa al primero ──────────────────

/**
 * BUG MEDIDO, no hipotético — alcanzable desde que el grupo Hostil es una lista.
 *
 * `hydrateDnas` indexa por `dnas[intent.entity_id]`, y el `entity_id` **es el `uniqueName`**
 * (`space.ts`). Dos participantes del mismo ítem escriben la misma clave: la segunda DNA pisa
 * a la primera y **las dos entidades se construyen desde ella**. `SimulationEngine.entities`
 * es un `Map<EntityId, …>` y colapsaría igual, pero el daño ya está hecho antes.
 *
 * Reproducido con el oráculo declarando dos Bombards a niveles distintos:
 *
 *     corresponde:  lvl 100 → ENEMY_ADD_HEALTH_MAX  86416.38
 *                   lvl 200 → ENEMY_ADD_HEALTH_MAX 144270.94
 *     sale:         los DOS → 144270.94
 *
 * El arreglo NO es el sufijo condicional del ruteo cross-banda de `StaticHydrator`
 * (`targets.length > 1 ? `${m.id}@${id}` : m.id`): esa clave cambia de forma según cuántos haya, y es
 * deuda propia registrada en `OQ-ENGINE-36`, no autoridad a imitar. Lo que corresponde es que el
 * `entity_id` deje de ser el molde y pase a ser la coordenada del participante en la escena.
 */
it.todo('dos hostiles del mismo tipo a niveles distintos resuelven cada uno el suyo');

// ─── El debuff cross-entity: hasta dónde llega hoy ─────────────────────────────────

describe('Corrosive Projection — el debuff que sale del warframe hacia el enemigo', () => {
  /**
   * Lo que YA se corrigió y es un bug real de dato, no del motor.
   *
   * El raw de DE tokeniza Corrosive Projection como `AVATAR_ARMOUR` y el override lo copiaba como
   * `AVATAR_ADD_ARMOUR` — la única familia de armadura que existía. Efecto medido: con Warcry (+50%)
   * y el aura equipada, el warframe resolvía `mods_add_pct: 32` (50 − 18). **Un debuff al enemigo
   * le estaba restando armadura al jugador**, en silencio y por años, porque no había familia donde
   * ponerlo. Que el token exista es lo que permite escribirlo bien.
   */
  it('ya no le resta armadura al warframe que la porta', () => {
    const wf = consume(corrosiveProjectionTarget(), { flags: {} }).weapon(VALKYR);
    expect(wf.node('AVATAR_ADD_ARMOUR').mods_add_pct).toBe(50);  // sólo Warcry
    expect(wf.node('AVATAR_ADD_ARMOUR').final).toBe(1282.5);
  });

  /**
   * LA RUPTURA QUE ESTOS TESTS CIERRAN — el modifier se quedaba donde nació.
   *
   * `ModRepository.getModifiers(mod_id, dna.entity_id, ...)` hornea el portador como `target_entity`,
   * y la pasada de ruteo de `StaticHydrator` sólo lo movía bajo **una condición hardcodeada**:
   * `holder.domain === 'weapon' && token.startsWith('AVATAR_')` — el parche de Amalgam Serration y
   * Dispatch Overdrive. Corrosive Projection no matchea (portador warframe, token `ENEMY_*`), así
   * que caía al `routed.push(m)` y moría en el warframe, que no tiene ese nodo.
   *
   * El motor lo gritaba, que era lo correcto:
   *   `[Hydration] Token conocido sin nodo: ENEMY_ADD_ARMOUR en .../Berserker`
   *
   * Nunca fue un gap de modelado: el nodo destino EXISTE y el valor es conocido. Era que el ruteo
   * cross-entity estaba escrito como caso especial en vez de como regla.
   *
   * **Lo que lo cierra:** el cruce de bando lo declara la FAMILIA DEL TOKEN. Acuñar `ENEMY_*` sobre
   * el `AVATAR_ARMOUR` del raw de DE ya era esa declaración, así que no hace falta que el modifier
   * lleve un campo de alcance ni que la entidad lleve un bando (`arch-decisions §18`).
   */
  it('aterriza en el enemigo — el cruce de bando lo declara la familia del token', () => {
    expect(target(corrosiveProjectionTarget()).node('ENEMY_ADD_ARMOUR').mods_add_pct).toBe(-18);
  });

  // 2700 × (1 − 0.18) = 2214. Exige TRES cosas y ninguna lo pasa sola: que el nivel componga el
  // frame-0 (2700, no 500), que §18 lleve el token al enemigo, y que §19 lo componga como nodo.
  it('−18% de armadura al enemigo: 2700 → 2214', () => {
    expect(target(corrosiveProjectionTarget()).node('ENEMY_ADD_ARMOUR').final).toBeCloseTo(2214, 10);
  });

  /**
   * …Y ESE NÚMERO LLEGA AL DAÑO. Es el cierre del recorrido: el aura sale del squad, cruza de bando,
   * compone el nodo del enemigo, y el estado que C2 golpea nace de ESE nodo.
   *
   * Mientras `EnemyState` nacía de un `ScaledEnemy` paralelo, este test era imposible: las dos builds
   * daban EXACTAMENTE el mismo número (1716 las dos), porque C2 medía contra el enemigo del `--vs`
   * —un Arid Butcher que nunca vio el aura— en vez de contra el que el escenario declaró.
   *
   * Menos armadura ⇒ menos DR ⇒ MÁS daño. El sentido importa: un test que exigiera "menos daño"
   * pasaría con la armadura yendo para el lado equivocado.
   */
  it('el −18% llega al daño: la misma build con el aura pega MÁS fuerte', () => {
    const dmg = (b: Scene) => {
      const entities = consume(b, { flags: {} }).snapshot();
      const weapon = entities.find(e => e.domain === 'weapon')!;
      const enemy = entities.find(e => e.tags.includes('enemy'))!;
      return computeCombatMetrics(weapon, enemy, BASE_CONTEXT, 6).vs_target.total_damage;
    };
    expect(dmg(corrosiveProjectionTarget())).toBeGreaterThan(dmg(valkyrWarcryTarget()));
  });

  it('no se desvía al warframe que lo porta — el aura sale del squad, no se queda', () => {
    const wf = consume(corrosiveProjectionTarget(), { flags: {} }).weapon(VALKYR);
    expect(wf.node('AVATAR_ADD_ARMOUR').mods_add_pct).toBe(50);  // sólo Warcry, sin rastro del aura
  });
});
