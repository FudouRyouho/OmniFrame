/**
 * @domain Shared / Capa A — el escenario
 * @SSoT docs/domains/engine/design/simulation-architecture.md
 *
 * **A ES el escenario**, no un campo adentro de una intención. Contiene los dos grupos
 * (`Squad` ⊥ `Hostil`) y nada más: sacá los participantes y no queda nada que declarar.
 *
 * Reemplaza a `EnsembleIntention`, cuya forma —diez canales planos + tablas paralelas de mods y
 * arcanos keyed por ese canal— hacía representable lo que no existe: `mods.primary` con
 * `items.primary.itemId === null`, un arma de compañero sin compañero, un `archgun` declarado que
 * ninguna capa leía. Lo que las ata acá es la ESTRUCTURA, no una convención.
 *
 * **Y es la única forma en el camino.** Hubo una segunda —el `Ensemble` que B construía a partir de
 * esto y le pasaba a C— y no computaba nada: era un diccionario de sinónimos (`uniqueName`→`id`,
 * `mods`→`slots`, `{uniqueName,effectId,isTauforged}`→`{type,stat,is_tau}`) con cuatro campos que
 * nadie leía. Su costo real no era el código sino lo que ocultaba: **hacía pasar por *"el engine no
 * lo modela"* cosas que el engine sí modelaba** — el arma de compañero, que hoy se puebla, y el
 * archgun, al que sólo le falta que se cargue un `.json` que ya está en `public/data/`. Lo que se
 * declara acá es lo que el motor lee.
 */

// ════════════════════════════════════════════════════════════════════════════════════════
//  EL CRITERIO QUE PARTE TODO — declarado ⊥ derivado ⊥ preguntado
// ════════════════════════════════════════════════════════════════════════════════════════
//
//  La pregunta que lo destapó: "si guardo una build, ¿guardo toda la simulación?".
//
//    DECLARADO   lo que el usuario decide      → qué tengo · contra qué comparo   → SE GUARDA
//    DERIVADO    lo que sale de lo declarado   → flags default · laws             → se recalcula
//    PREGUNTADO  lo que es de la consulta      → duración · lente · "probá a 200" → muere con ella
//
//  De ahí salen DOS objetos y no uno: la Escena (declarada, persistible) y la Consulta (preguntada,
//  efímera). Lo derivado no se declara en ninguno: lo computa el motor.

/**
 * El escenario. Es lo único que se guarda cuando alguien guarda una build.
 */
export interface Scene {
  /**
   * LA IDENTIDAD DE UN PARTICIPANTE ES SU POSICIÓN, y sale de la estructura: nadie la declara.
   *
   * `4` es LEY DEL JUEGO, no una capacidad arbitraria — un squad tiene cuatro puestos. Por eso es
   * tupla y no lista: el tamaño lo fija el dominio. El `0` es obligatorio por tipo, así que
   * `squad[0]` ES "vos" sin un campo aparte que lo señale (ese campo podría apuntar a un puesto
   * vacío; acá el estado no se puede escribir).
   *
   * LOS HUECOS SE PRESERVAN. Borrar al aliado 1 es ponerlo en `undefined`, NUNCA `splice`: un splice
   * corre al 2 al lugar del 1 y le cambia la identidad a un participante que nadie tocó.
   *
   * Para el ruteo no cambia nada: `arch-decisions §18` dice "aliado = el squad y todo lo que lo
   * compone".
   */
  squad: [PlayerIntent, PlayerIntent?, PlayerIntent?, PlayerIntent?];

  /**
   * Misma regla de identidad —la posición— SIN el tope: *"uno o más enemigos de uno o más tipos"* no
   * tiene un número que el juego fije. Que no haya techo no cambia de dónde sale el id.
   *
   * Lista vacía = sin objetivo declarado, y es una DECISIÓN ("esta build no declara contra qué
   * comparo"), no un descuido.
   */
  hostile: HostileIntent[];

  // NO va:
  //   laws    — §17: "el default vive con la fórmula, el desvío en el portador". `GameLaws` como
  //             tabla global no sobrevivió: un valor plano no tiene dónde poner su procedencia. La
  //             Escena lo excluyó primero; el resto de la cadena se retiró después (§17, acta).
  //   timeSet — el t=0 es del escenario, pero nadie lo consume hasta que algo del lado Squad tenga
  //             duración. Campo sin lector.
  //   plano   — dónde está cada uno. `OQ-ENGINE-35`.
  //   focus   — no hay dataset, no hay consumidor, y el único que lo escribía era el bridge con un
  //             `{ school_id: "zenurik" }` hardcodeado. No había nada postergado, había algo
  //             fabricado. La ausencia queda registrada en `OQ-DATA-17`.
}

/**
 * Lo PREGUNTADO. No se guarda con la build: es la pregunta que se le hace a una escena.
 *
 * ⚠️ Nombre provisional — `OracleQuery` del CLI es su primo (lente + sujeto + a2). Puede que sean el
 * mismo objeto y haya que unificar.
 */
export interface SceneQuery {
  /**
   * Condiciones forzadas a mano ("mostrame con `on_headshot` activo"). AUSENTE ≠ false: ausente =
   * "derivá el default", que hoy es "todas las del equipamiento en true".
   *
   * ⚠️ Es un `Record` plano y global, pero una condición TIENE SUJETO (`on_headshot` es del ataque,
   * `while_enemy_below_half_health` es del objetivo — el eje sujeto de §8). Funciona con un objetivo
   * y se rompe con dos, y el caso ya es alcanzable porque `hostile` es lista. Diferido a propósito:
   * se resuelve cuando se trabaje ese campo, no de paso.
   */
  flags?: Record<string, boolean>;

  /** Stacks declarados a mano. Mismo problema de sujeto que `flags`. */
  variables?: Record<string, number>;

  /** Ventana de simulación. Es de la pregunta, nunca de la build. */
  duration?: number;

  /**
   * Override del nivel declarado en la escena ("probemos esta build contra un 200"). Acá queda
   * nombrado lo que el `--lvl` del CLI hacía sin declararlo: la consulta PUEDE pisar lo declarado, y
   * por eso el nivel vive en la escena y no acá.
   */
  hostileLevel?: number;
}

// ─── GRUPO HOSTIL ───────────────────────────────────────────────────────────────────────

/**
 * Un participante del grupo Hostil. NO es el espejo de un `PlayerIntent`: el Squad declara un
 * loadout, el Hostil declara qué enemigo y a qué nivel. Ninguno declara menos — declaran cosas
 * distintas, y forzar la simetría es de donde salen los `if`.
 */
export interface HostileIntent {
  /** `unique_name` del enemigo en el catálogo. */
  uniqueName: string;
  /** Nivel al que se enfrenta. Compone su frame-0 (curva-S), no lo modifica después. */
  level: number;

  // NO va todavía:
  //   isSteelPath — decidido que es de acá; 0 de 638 enemigos traen el bonus en el dataset, y un
  //                 campo sin dato es el campo mudo que esta partición vino a eliminar.
  //   count       — "3 de este tipo". Con identidad posicional, declarar 3 ya es escribir 3 entradas;
  //                 lo que `OQ-ENGINE-35` resuelve es DÓNDE está cada uno. Azúcar, no estructura.
}

// ─── GRUPO SQUAD ────────────────────────────────────────────────────────────────────────

/**
 * El nodo `Jugador` que `arch-decisions §18` nombra y el tipo nunca tuvo.
 *
 * El árbol es `Jugador → { warframe · compañeros · armas } → instancias`. El warframe NO es padre del
 * compañero: cuelgan del mismo nodo.
 *
 * TODO OPCIONAL adentro de cada variante, y no por comodidad: **A no discrimina qué es una build
 * válida**. "Este mod va en este tipo de arma", "un jugador necesita warframe" son reglas de
 * FORMULARIO y viven en la UI. A declara, C compone por resolución. Medir un arma aislada es caso
 * real del CLI: diez fixtures dependen de eso.
 *
 * UNIÓN DISCRIMINADA y no un campo `context` en la escena, por dos razones:
 *
 *   1. Hace el estado imposible IRREPRESENTABLE. No se puede escribir `kind: 'archwing'` sin las
 *      piezas de archwing, ni meter un warframe adentro.
 *   2. El loadout es DEL JUGADOR, no del escenario — dos jugadores pueden estar en loadouts distintos
 *      a la vez. Lo que sí sería del escenario es el contexto de misión (railjack ⊥ normal), que no
 *      tiene dato ni consumidor.
 *
 * ⚠️ **EL WARRANT MEDIDO**: `EnsembleIntention` declaraba diez canales y el bridge leía cinco.
 * `companion_weapon`, `archwing`, `archgun`, `archmelee` y `necramech` no se leían — un archgun que
 * SÍ existe en `archwing-weapons.json` desaparecía sin dejar rastro y ninguna guarda podía agarrarlo,
 * porque el canal ni se miraba. **Una tabla de diez claves se puede recorrer a medias; una variante
 * no.** Eso, y no la elegancia, es lo que la unión discriminada arregla.
 *
 * ⚠️ **Y hasta dónde llega, medido: cuatro de los cinco.** `archwing`/`archgun`/`archmelee`/`necramech`
 * son variantes y el `switch` exhaustivo del poblador los agarra — agregar una sin caso no compila.
 * `companion_weapon` NO lo era: es un campo adentro de una variante que sí se lee, y siguió
 * evaporándose después de que el resto dejara de hacerlo. **La unión discriminada protege variantes,
 * no campos:** adentro de un caso, quien construye nombra los campos que quiere, y una propiedad sin
 * leer en el origen no le da a TypeScript de qué quejarse (el *excess property check* sólo mira
 * propiedades de más en el literal). Los dos ejes son distintos y conviene no confundirlos al agregar
 * campos: uno lo cierra el tipo, el otro pide un test o una guarda.
 *
 * Hoy los cinco están cerrados y **por caminos distintos**: los cuatro vehículos entran al espacio y
 * mueren en la hidratación nombrando su dataset (`archwing-weapons.json` y `vehicles.json` existen y
 * no se cargan — el bloqueante es esa carga, no el modelo); el arma de compañero **se puebla**, con
 * canal propio, porque su dato siempre estuvo completo.
 *
 * Las variantes sin dataset se declaran igual, y NO es lo mismo que un campo mudo:
 *   · campo mudo (`isSteelPath`, `focus`) → se declara, se llena, y MIENTE en silencio
 *   · variante sin catálogo               → se declara y NO SE PUEDE LLENAR: no hay `uniqueName`
 *                                            válido, y la hidratación tiene que gritar
 * La estructura es lo que crea la demanda del dato. Una nota que diga "falta poblar archwing" sin
 * nada que lo pida es backlog que nadie prioriza.
 */
export type PlayerIntent =
  | { kind: 'onfoot';    warframe?: WarframeIntent; weapons?: WeaponsIntent; companion?: CompanionIntent }
  | { kind: 'archwing';  archwing?: Bearer; archgun?: WeaponIntent; archmelee?: WeaponIntent }
  | { kind: 'necramech'; necramech?: Bearer; archgun?: WeaponIntent };

export interface WeaponsIntent {
  primary?: WeaponIntent;
  secondary?: WeaponIntent;
  melee?: WeaponIntent;
}

// ─── LAS PIEZAS ─────────────────────────────────────────────────────────────────────────

/**
 * `Bearer` = portador. El vocablo es del proyecto (§18: *"el destino se decide relativo al
 * portador"*) y describe QUÉ HACE en el modelo, no cómo se adquiere.
 *
 * Los mods y arcanos viven ADENTRO. Antes eran tablas paralelas keyed por canal, y por eso
 * `mods.primary` podía existir con `items.primary.itemId === null`: nada las ataba.
 */
export interface Bearer {
  /**
   * `uniqueName` y no `itemId`: el dataset trae AMBOS `id` ("excalibur") y `unique_name`
   * ("/Lotus/Powersuits/…"), y esto guarda el segundo. Llamarlo igual que la columna hace visible el
   * mismatch id-display / clave-canónica en vez de dejarlo fallar en silencio.
   */
  uniqueName: string;
  rank?: number;
  mods?: SlotMap<ModIntent>;
  arcanes?: SlotMap<ArcaneIntent>;
}

export interface WarframeIntent extends Bearer {
  shards?: ShardIntent[];
  /**
   * Habilidades activas. Asumida-activa: proyección estática del source-state (§15). `rank` no se
   * consume todavía — se reserva para cuando el source-state vivo formalice rank/duración (gate G-a).
   */
  abilities?: AbilityIntent[];
}

export interface WeaponIntent extends Bearer {
  /** `'base' | 'incarnon_form' | …` — el perfil de ataque activo. */
  activeProfile?: string;
  /** Incarnon: tier → perk id. */
  evolutionPerks?: SlotMap<string>;
}

/**
 * El arma cuelga del compañero, y no es una decisión de ruteo: **un arma de compañero NO PUEDE
 * EXISTIR SIN COMPAÑERO**. Acá es imposible de escribir; como canal hermano de A era perfectamente
 * escribible y absurdo. Quién puede portar qué (sentinela ⊥ hound ⊥ kavat) NO es de A; "no hay arma
 * sin portador" sí, y es estructural.
 *
 * ⚠️ No confundir con el canal `companion_weapon` del ESPACIO. Colgar ⊥ participar: el arma se
 * DECLARA adentro del compañero (no existe sin él) y PARTICIPA como entidad propia (dispara, tiene
 * sus mods, y el fan-out ALL-scope de Roar la alcanza — `references/wiki/warframes/rhino/roar.md`).
 * Son dos preguntas distintas y cada capa contesta la suya.
 *
 * ⚠️ **`arcanes` sobra acá, heredado de `Bearer`: un compañero no tiene slots de arcano en el juego.**
 * El poblador lo rechaza con un throw, que es lo que hay mientras tanto — **la forma correcta es que
 * no se pueda escribir** (`extends Omit<Bearer, 'arcanes'>`). Sin cerrar porque la pregunta real es
 * más ancha que el compañero: *qué portadores admiten arcanos*, y `Bearer` se los da a los cuatro.
 */
export interface CompanionIntent extends Bearer {
  weapon?: WeaponIntent;
}

// ─── LO QUE SE MONTA EN UN PORTADOR ─────────────────────────────────────────────────────
//
// NO extienden `Bearer`. `ModIntention extends SlotIntention` arrastraba un `rank` que el propio
// código documentaba como "semánticamente vacío para mods". Un mod no es algo que se equipa: es algo
// que se monta en algo que se equipa.

export interface ModIntent    { uniqueName: string; level: number; }
/** `rank` SÍ es semántico acá: indexa la serie `base_value[rank]`. No asumir 0-5 — hay arcanos 0-3. */
export interface ArcaneIntent { uniqueName: string; rank: number; }
export interface AbilityIntent { uniqueName: string; rank?: number; }

/**
 * El shard sigue la misma convención que todo lo demás. El override de shards es NUESTRO (no viene
 * de DE), así que la clave canónica la elegimos.
 */
export interface ShardIntent { uniqueName: string; effectId: string; isTauforged: boolean; }

/**
 * ⏸️ GATED EN `OQ-ENGINE-36` — `Record<number, T>` MIENTE SOBRE SUS CLAVES, y la mentira es
 * PREEXISTENTE: JavaScript pasa toda clave de objeto a string y JSON no tiene cómo escribir otra
 * cosa. Se deja como está A PROPÓSITO: la forma correcta depende de decisiones que toma la mudanza
 * de la hidratación, y elegirla hoy es escribir con cuidado en código condenado. La guarda que lo
 * hace ruidoso (`assertSlotKeys`, en el poblador del espacio) ya existe — y sólo **valida**: la
 * versión que además re-indexaba (`result[parseInt(k)] = v`) era la que hacía desaparecer tres de
 * cuatro mods cuando la clave estaba rota, y murió con la forma intermedia.
 *
 * ⚠️ LO QUE NO SE TRASLADA DEL SQUAD: allá la posición ES la identidad (cuatro puestos, ley del
 * juego). Acá NO — el hueco absoluto ("acá van sólo exilus") es de la UI, y la cantidad varía con el
 * portador (Jade lleva dos auras y un exilus). Lo que el motor necesita del slot no es el hueco sino
 * el ORDEN: la grilla determina la combinación elemental
 * (`references/wiki/mechanics/damage-types.md` §Jerarquía de combinación).
 */
export type SlotMap<T> = Record<number, T>;

// ─── EL ESCENARIO VACÍO ─────────────────────────────────────────────────────────────────

/** Sin grupo Hostil declarado — el default de una build que sólo mide su propio lado. */
export const NO_HOSTILE: HostileIntent[] = [];

/** Escena inicial: un jugador a pie sin nada equipado, sin objetivo declarado. */
export const EMPTY_SCENE: Scene = {
  squad: [{ kind: 'onfoot' }],
  hostile: NO_HOSTILE,
};
