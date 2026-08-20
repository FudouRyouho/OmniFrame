import type { MutatedDNA } from "../../contracts";
import type {
  Scene, PlayerIntent, HostileIntent, Bearer, WeaponIntent, CompanionIntent, WarframeIntent,
  SlotMap, ModIntent, ArcaneIntent, ShardIntent, AbilityIntent,
} from "@shared/types/scene";

/**
 * EL ESPACIO — quiénes participan de una simulación, antes de hidratar a ninguno.
 *
 * POR QUÉ EXISTE. El conjunto de participantes se construía inline dentro de `StaticHydrator.hydrate`
 * con cuatro `push`, y eso ataba dos cosas que no son la misma: **qué existe** en la simulación y
 * **cómo se hidrata** cada cosa. Con el conjunto adentro del hidratador, el loadout no era *una*
 * fuente de participantes — era la única posible, y nada que no fuera warframe o arma podía existir
 * aunque el motor supiera resolverlo.
 *
 * POR QUÉ LEE LA `Scene` Y NO UNA FORMA INTERMEDIA. Hubo una: `Ensemble`, que B construía a partir de
 * A y que este módulo consumía. Medido campo por campo, **no computaba nada** — `uniqueName`→`id`,
 * `mods`→`slots`, `activeProfile`→`active_profile_id`, `{uniqueName,effectId,isTauforged}`→
 * `{type,stat,is_tau}`. Ni un solo valor derivado, más cuatro campos que nadie leía (`warframe.rank`
 * con un `?? 30` inventado, `abilities[].rank`, `helminth`, `focus`). Era un diccionario de sinónimos
 * de ~76 líneas entre dos formas de lo mismo, y su costo real no era el código: **hacía pasar por
 * *"el engine no lo modela"* cosas que el engine sí modelaba**. El arma de compañero está en los
 * datasets cargados y hoy se puebla; el archgun está en `public/data/archwing-weapons.json` y lo
 * único que le falta es que `DataLoader` lo lea. Ninguno de los dos era un hueco del motor: eran dos
 * cosas sin dónde ponerse en la forma del medio.
 *
 * Lo que este módulo NO hace: no hidrata, no resuelve, no conoce nodos ni modifiers, no toca un
 * repositorio. Sólo dice quién está y con qué viene.
 */
export interface EntityIntent {
  /**
   * **QUIÉN ES** este participante: su coordenada en la escena (`squad.0.primary`, `hostile.1`).
   *
   * La acuña el poblador, que es el único que sabe dónde está parado. No la declara nadie y no sale
   * del catálogo: la estructura de la `Scene` ya la contiene —tupla de cuatro puestos para el squad,
   * lista para el hostil— y hasta acá se descartaba al aplanar.
   *
   * POR QUÉ NO PUEDE SER EL `uniqueName`. Un `unique_name` dice **qué es** un participante, no quién:
   * dos Bombards declarados a niveles distintos son "el Bombard", y toda estructura que los indexe
   * por ahí los colapsa —`SimulationEngine.entities` es un `Map<EntityId, …>`, así que el segundo
   * pisaba al primero y los dos recibían los stats del sobreviviente. Es la conflación
   * molde/instancia metida en la clave (`OQ-ENGINE-36`).
   *
   * ⚠️ La coordenada **no cambia de forma según cuántos haya**. Un participante único se nombra igual
   * que uno de varios; el caso de uno y el de N se leen igual. Es lo contrario del sufijo condicional
   * del ruteo cross-banda (`targets.length > 1 ? id@entidad : id`), que es deuda propia y no
   * autoridad a imitar.
   *
   * ⚠️ Su límite, anotado y no construido: si algún día una escena persistida llevara referencias
   * entre participantes ("este debuff va sobre `hostile.2`") y se insertara uno en el medio, las
   * referencias se correrían. Hoy nada apunta a un participante individual, y la `Scene` ya prohíbe
   * el `splice` que lo provocaría (los huecos se preservan como `undefined`). Cuando aparezca el
   * primer consumidor de esas referencias, es ESE consumidor el que decide si hace falta un id
   * declarado.
   */
  entity_id: string;
  /**
   * **QUÉ ES**: el puntero al catálogo, tal como lo declaró la `Scene`. Es lo que B dereferencia para
   * traer el molde (`attachMolds`), y lo que sobrevive en la entidad como `unique_name`.
   *
   * Viaja separado de `entity_id` porque son dos preguntas distintas que hasta acá compartían campo.
   */
  unique_name: string;
  /**
   * Canal del participante ('warframe' | 'primary' | 'secondary' | 'melee' | 'companion' | 'enemy' |
   * 'archwing' | 'archgun' | 'archmelee' | 'necramech'). Se estampa en la entidad acá y **no se
   * vuelve a escribir**: es lo que consulta el ruteo por canal (`channel-routing.ts`) antes de
   * resolver, y lo que llega a la salida.
   *
   * Es `string` abierto a propósito: el vocabulario del espacio es más ancho que el del arsenal —
   * un enemigo participa y no se equipa.
   */
  channel: string;
  /**
   * Marcas de ruteo con las que este participante entra al espacio. Viven en el intent y no en el
   * DNA porque son una propiedad de **participar**, no de ser un ítem: un enemigo no tiene DNA de
   * arsenal del cual derivarlas, y el mismo ítem puede entrar con marcas distintas según el rol.
   */
  routes: string[];
  /**
   * **De quién cuelga este participante** — el árbol de propiedad de `arch-decisions §18`
   * (`Jugador → {warframe · compañeros · armas} → instancias`).
   *
   * Ausente = cuelga del Jugador, que es la raíz y **no se materializa como entidad**: no tiene
   * stats, no recibe modifiers, no hay nada que resolver en él. Lo declaran sólo los participantes
   * que cuelgan de otro participante — hoy, el arma de compañero.
   *
   * POR QUÉ HACE FALTA. El ruteo baja un buff del warframe a "sus armas", y sin este eje "sus"
   * no significa nada: el arma de compañero porta la misma marca `weapon` (warrant: Roar la
   * alcanza), así que un fan-out por familia le entrega también los mods de alcance propio del
   * warframe. §18 ya lo decía —*"la propiedad se deriva del poblador, que ya la conoce y hoy la
   * descarta"*— y era literal: `companionIntents` construye el arma **adentro** del compañero y esa
   * relación se perdía en el camino.
   */
  owner?: string;
  /** Lo montado, con los nombres de la `Scene`. Sin re-indexar: ver `assertSlotKeys`. */
  mods: SlotMap<ModIntent>;
  profile_id: string;
  evolutionPerks?: SlotMap<string>;
  arcanes?: SlotMap<ArcaneIntent>;
  /**
   * Shards y habilidades activas. Viajan en el intent como todo lo demás — antes se leían del
   * `Ensemble` dentro del hidratador, y eran la **única** razón por la que éste recibía un `Ensemble`.
   * Sólo el warframe los declara (`WarframeIntent`), pero el hidratador no lo asume: recorre los
   * intents y emite los que traigan.
   */
  shards?: ShardIntent[];
  abilities?: AbilityIntent[];
  /**
   * Nivel del participante, cuando su grupo lo declara. Viaja por el mismo canal que `mods` y
   * `profile_id` —la intención que compone al participante— porque es lo mismo: entra a la
   * composición de su frame-0, no la modifica después.
   *
   * Sólo lo declara el grupo Hostil. Un arma no tiene nivel y no se le inventa uno.
   */
  level?: number;
  /**
   * ¿Spawnea como Eximus? Mismo canal que `level` — entra a la composición del frame-0 (§22: se
   * decide al instanciar, no es identidad del catálogo). Sólo lo declara el grupo Hostil.
   */
  isEximus?: boolean;
}

/**
 * El mismo intent del espacio, **con su molde puesto**.
 *
 * POR QUÉ EXISTE. El espacio dice quién participa; el molde (`MutatedDNA`) es lo que ese participante
 * ES antes de que nadie le monte nada. Eran dos pasadas separadas sobre el mismo escenario: el bridge
 * recorría el espacio para dereferenciar los moldes y los dejaba en un `Record<string, MutatedDNA>`, y
 * el hidratador **volvía a recorrer el espacio** para leer ese mapa. Mismo input, mismo recorrido, dos
 * veces — y el mapa existía sólo para cruzar de una pasada a la otra.
 *
 * Ese mapa era una de las apariciones del patrón de `OQ-ENGINE-36`: una clave derivada
 * (`dnas[intent.entity_id]`) que dos participantes del mismo ítem escriben sin que nadie chequee. No
 * era un defecto de la clave — era el precio de computar el espacio dos veces.
 *
 * El molde y la identidad viajan juntos y **son cosas distintas**: `dna` es qué es el participante,
 * `entity_id` es quién es. Mientras el `id` de la entidad salía del `dna`, dos participantes del
 * mismo ítem nacían con la misma identidad y el `Map<EntityId, …>` del motor los colapsaba.
 *
 * Declarar el tipo acá no es dereferenciar acá: los pobladores siguen sin tocar un repositorio.
 * Quien pone el molde es B (`MutatorBridge.attachMolds`), que es el que sabe buscarlo.
 */
export interface MoldedIntent extends EntityIntent {
  dna: MutatedDNA;
}

// ─── La guarda de claves ────────────────────────────────────────────────────────────────

/**
 * Una clave de slot que no es un índice entero **rompe cosas distintas según quién la lea**, y
 * ninguna de las dos es ruidosa por sí sola.
 *
 * `SlotMap<T> = Record<number, T>` no existe en runtime: JavaScript pasa toda clave de objeto a
 * string y un `.json` no tiene forma de escribir otra cosa. El tipo no atrapa nada de lo que entra
 * desde afuera, que es justo donde esto pasa.
 *
 *   · **mods** — el índice ordena la combinación elemental (`DamageCombiner` hace
 *     `sort((a,b) => a.index - b.index)`). Con `NaN` el comparador devuelve `NaN`, el sort no ordena,
 *     y el emparejamiento de elementos queda **arbitrario**: un número plausible y falso.
 *   · **evolutionPerks** — la clave **es el tier** (`entry.evolutions[tierStr]`). Una clave rota no
 *     matchea y el perk se omite en silencio.
 *
 * ⚠️ **Los arcanos NO se validan, y no es olvido:** el hidratador los lee con `Object.values`, así que
 * la clave no participa de nada y no hay dato que perder. Validarlos sería higiene de input, que es
 * otro trabajo (`OQ-ENGINE-36`) y no el de esta guarda.
 *
 * Esto **sólo valida**. La versión anterior vivía en el bridge y además re-indexaba
 * (`result[parseInt(k)] = v`) — y ese `parseInt` era el que hacía desaparecer tres de cuatro mods
 * cuando la clave estaba rota, porque todos escribían la propiedad `"NaN"`. Sin la re-indexación ese
 * modo de falla desaparece; quedan los dos de arriba, que son por qué la guarda sigue existiendo.
 */
function assertSlotKeys(map: SlotMap<unknown> | undefined, kind: string): void {
  if (!map) return;
  for (const key of Object.keys(map)) {
    if (!/^\d+$/.test(key)) {
      throw new Error(
        `[escena] ${kind}: la clave de slot ${JSON.stringify(key)} no es un índice entero. Los slots ` +
        `se declaran con claves numéricas ("0", "1", …); con una clave no entera el orden de ` +
        `combinación queda indefinido y los perks no matchean su tier.`
      );
    }
  }
}

// ─── Los dos pobladores ─────────────────────────────────────────────────────────────────

/**
 * Todos los participantes de una escena, en orden de dependencia.
 *
 * El orden importa y se conserva — el jugador primero, porque los buffs cross-entity que emite
 * necesitan que las armas ya existan cuando se resuelven (`AbilityRepository` recibe el array de
 * entidades completo).
 *
 * ⚠️ **Sólo puebla `squad[0]`.** Los aliados se pueden declarar y no entran: el motor no modela un
 * segundo loadout. Ya no es la identidad lo que lo impide —la coordenada distingue `squad.0.primary`
 * de `squad.1.primary` sin ambigüedad, y el prefijo del poblador está listo para recibir el índice—
 * sino que nadie definió qué hace un aliado en la simulación. Es el mismo alcance que tenía antes de
 * que `Scene` bajara; la estructura lo permite y el motor todavía no.
 */
export function populateFromScene(scene: Scene): EntityIntent[] {
  return [...populateFromSquad(scene.squad[0], 'squad.0'), ...populateFromHostile(scene.hostile)];
}

/**
 * El grupo Squad: el jugador y todo lo que porta.
 *
 * El `switch` es **exhaustivo por tipo**: agregar una variante a `PlayerIntent` sin caso acá no
 * compila. Eso es lo que la tabla de diez canales no podía hacer — de sus diez claves se leían cinco
 * y las otras cinco desaparecían sin que nada lo notara.
 *
 * ⚠️ Y hasta dónde llega: **el tipo protege variantes, no campos.** Adentro de un caso, lo que no se
 * nombra no se lee, y TypeScript no tiene de qué quejarse. Por eso el compañero necesita una guarda
 * escrita (abajo) y el archwing no.
 */
function populateFromSquad(player: PlayerIntent, at: string): EntityIntent[] {
  switch (player.kind) {
    case 'onfoot':
      return [
        ...(player.warframe ? [warframeIntent(player.warframe, at)] : []),
        ...weaponIntents(at, [
          ['primary',   player.weapons?.primary],
          ['secondary', player.weapons?.secondary],
          ['melee',     player.weapons?.melee],
        ]),
        ...(player.companion ? companionIntents(player.companion, at) : []),
      ];

    // Los vehículos pueblan como cualquier otro participante. NO se traducen a medias ni se
    // descartan: entran al espacio y, si su dataset no está cargado, mueren en `attachMolds` con
    // *"no tiene DNA en los datasets cargados"* — que es la verdad y nombra trabajo concreto.
    // `archwing-weapons.json` y `vehicles.json` EXISTEN en `public/data/` y `DataLoader` no los lee;
    // el bloqueante es esa carga, no el modelo. Antes esto tiraba diciendo que el engine no lo
    // modelaba, lo cual era falso: lo que no tenía dónde ponerlo era la forma intermedia.
    case 'archwing':
      return [
        ...(player.archwing  ? [bearerIntent(player.archwing,  'archwing',  ['avatar'], at)] : []),
        ...weaponIntents(at, [
          ['archgun',   player.archgun],
          ['archmelee', player.archmelee],
        ]),
      ];

    case 'necramech':
      return [
        ...(player.necramech ? [bearerIntent(player.necramech, 'necramech', ['avatar'], at)] : []),
        ...weaponIntents(at, [['archgun', player.archgun]]),
      ];

    default: {
      const _never: never = player;
      throw new Error(`[escena] variante de loadout no contemplada: ${JSON.stringify(_never)}`);
    }
  }
}

/**
 * El grupo Hostil. Entra por la misma lista que el Squad: son participantes más, no parámetros.
 *
 * Es lista porque el grupo es "uno o más enemigos de uno o más tipos", y **poblar varios ya
 * resuelve**: cada uno entra con su coordenada (`hostile.0`, `hostile.1`) y su propio frame-0. Lo que
 * sigue esperando es el plano (`OQ-ENGINE-35`) — dónde está cada uno, que es otra pregunta.
 */
function populateFromHostile(hostiles: HostileIntent[]): EntityIntent[] {
  return hostiles.map((h, i) => ({
    entity_id: `hostile.${i}`,
    unique_name: h.uniqueName,
    channel: "enemy",
    routes: ["enemy"],
    mods: {},
    profile_id: "base",
    level: h.level,
    ...(h.isEximus ? { isEximus: h.isEximus } : {}),
  }));
}

// ─── Constructores de intent, por naturaleza de portador ────────────────────────────────

/**
 * Base común: lo que todo portador aporta al espacio.
 *
 * `at` es dónde está parado el portador dentro de la escena; el canal completa la coordenada. Los dos
 * juntos son la identidad, y ninguno de los dos sale del catálogo.
 */
function bearerIntent(bearer: Bearer, channel: string, routes: string[], at: string): EntityIntent {
  assertSlotKeys(bearer.mods, `mods de "${channel}"`);
  return {
    entity_id: `${at}.${channel}`,
    unique_name: bearer.uniqueName,
    channel,
    routes,
    mods: bearer.mods ?? {},
    profile_id: "base",
    ...(bearer.arcanes ? { arcanes: bearer.arcanes } : {}),
  };
}

/** El warframe suma lo que sólo un avatar de jugador porta: shards y habilidades activas. */
function warframeIntent(warframe: WarframeIntent, at: string): EntityIntent {
  return {
    ...bearerIntent(warframe, "warframe", ["avatar"], at),
    ...(warframe.shards    ? { shards:    warframe.shards }    : {}),
    ...(warframe.abilities ? { abilities: warframe.abilities } : {}),
  };
}

/**
 * Las armas equipadas, en el orden en que se declaran los canales.
 *
 * `owner` es de quién son: ausente para las del jugador (cuelgan de la raíz), el compañero para la
 * suya. Es el único dato que separa "mis armas" de "el arma de mi sentinel" cuando un buff baja por
 * familia — las dos portan la marca `weapon`.
 */
function weaponIntents(
  at: string,
  slots: ReadonlyArray<readonly [string, WeaponIntent | undefined]>,
  owner?: string,
): EntityIntent[] {
  const intents: EntityIntent[] = [];
  for (const [channel, weapon] of slots) {
    if (!weapon) continue;
    assertSlotKeys(weapon.evolutionPerks, `perks de "${channel}"`);
    intents.push({
      // `MELEE_*` apunta al arma cuerpo a cuerpo *equipada*: es propiedad del slot, no del ítem.
      ...bearerIntent(weapon, channel, channel === 'melee' ? ['weapon', 'melee'] : ['weapon'], at),
      profile_id: weapon.activeProfile ?? "base",
      ...(weapon.evolutionPerks ? { evolutionPerks: weapon.evolutionPerks } : {}),
      ...(owner ? { owner } : {}),
    });
  }
  return intents;
}

/**
 * El compañero y su arma — DOS participantes, no uno.
 *
 * El compañero entra por la MISMA lista que el resto: es la prueba de que el espacio es el conjunto
 * de participantes y el loadout sólo uno de sus pobladores. Recibe `AVATAR_*` sin ser un warframe —
 * lo que el ruteo por `domain` no podía expresar y la fuente sí declara
 * (`references/wiki/warframes/valkyr/warcry.md`).
 *
 * **SU ARMA ES UN PARTICIPANTE PROPIO**, y el dato lo respalda sin ambigüedad: `Deconstructor`,
 * `Deconstructor Prime`, `Sweeper`, `Vulklok` y `Artax` viven en `weapons.json` con `domain: weapon`
 * y `unique_name` propio. Dispara, tiene sus propios slots de mod, y su daño lo computa el mismo
 * grafo que el de cualquier arma. Entra con canal propio (`companion_weapon`) y no como un cuarto
 * `weapons.*`, porque el canal es lo que separa "el arma primaria del jugador" de "el arma del
 * sentinel" cuando un modifier apunta a una de las dos.
 *
 * `routes: ['weapon']` — y eso lo decide la fuente, no la simetría: Roar *"applied to Rhino, allied
 * Warframes, **Companions**, Hostages, Shadows, Specters… increases the damage any ally deals from
 * any source, **so weapon damage as well***" (`references/wiki/warframes/rhino/roar.md`). El fan-out
 * ALL-scope tiene que alcanzarla, y con esta marca la alcanza sin tocar el ruteo.
 *
 * ⚠️ Su `kind` viene del pipeline y hoy es `primary` para todas; en el juego varía según el
 * compañero. Es normalización de la fuente, no del motor — no se corrige acá.
 */
function companionIntents(companion: CompanionIntent, at: string): EntityIntent[] {
  // Un compañero NO lleva arcanos. El campo lo hereda de `Bearer` y sobra: es un slot que el juego
  // no tiene. Se rechaza en vez de ignorarse —un campo que se declara, se llena y no hace nada es el
  // campo mudo que esta campaña viene eliminando— y la forma correcta es que no se pueda escribir:
  // ⚠️ deuda, `CompanionIntent` debería excluir `arcanes` de `Bearer` en vez de rechazarlo en runtime.
  if (companion.arcanes) {
    throw new Error(
      `[escena] el compañero declara arcanos y un compañero no tiene slots de arcano en el juego. ` +
      `El campo lo hereda de \`Bearer\` y no le corresponde; declararlo no monta nada.`
    );
  }

  return [
    bearerIntent(companion, "companion", ["avatar"], at),
    // El compañero es el dueño de su arma — colgar ⊥ participar: entra como participante propio y
    // sigue siendo suya. Sin esto, un buff de alcance propio del warframe (Provoked, "+daño durante
    // bleedout") aterriza también acá, porque la marca `weapon` no distingue de quién es el arma.
    //
    // El dueño se nombra por COORDENADA y no por su `uniqueName`, por la misma razón que el
    // participante: el molde no distingue instancias. Con dos jugadores llevando el mismo compañero,
    // un `owner` por molde vuelve a hacer que el buff propio de uno alcance el arma del otro — el
    // mismo bug que este campo vino a cerrar, un nivel más arriba.
    ...weaponIntents(at, [['companion_weapon', companion.weapon]], `${at}.companion`),
  ];
}
