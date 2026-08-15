/**
 * @domain Engine / Contracts — la clase de unidad, llave de las leyes físicas
 *
 * **El problema que cierra:** `routes` era una llave que hacía dos trabajos incompatibles
 * (`arch-decisions §18`, *una llave, dos trabajos*). Su propio contrato dice que declara
 * *"a qué destinos responde la entidad, **no qué es**"* — y sin embargo tres tablas de LEY la
 * consultaban para preguntar exactamente *qué es*:
 *
 * ```
 * routes  →  ruteo de modifiers   ¿este token aterriza acá?   channel-routing · StaticHydrator
 * routes  →  selección de ley     ¿qué física se le aplica?   vitalsOf · armorMitigationFor · gateLawFor
 * ```
 *
 * **El compañero es donde divergen**, y por eso parecía una contradicción semántica. Porta `avatar` y
 * **debe** portarlo para el primer trabajo —`Enhanced Vitality` (`AVATAR_ADD_HEALTH_MAX`) es vida del
 * sentinel y aterriza bien—, pero para el segundo la fuente lo excluye por nombre:
 * `references/wiki/mechanics/shield.md` da el 50 % de DR a *"Warframes · Operators · Archwings ·
 * Railjacks · Necramechs"* y **no** a *"Companions"*, mientras el shield gate sí lo alcanza.
 * **Las dos listas de la fuente no coinciden**, así que ninguna marca única puede contestar las dos.
 *
 * **La llave es el `channel`, y no hace falta un campo nuevo.** El espacio ya lo declara por
 * participante (`space.ts`, `bearerIntent`) y ya distingue las cinco clases que las leyes necesitan.
 * Declarar la clase otra vez en un campo propio sería guardar el mismo dato dos veces — lo mismo que
 * §18 rechaza para el cruce de bando.
 *
 * ⚠️ **El canal mezcla slot con clase** (`primary`, `melee` son slots, no clases de unidad) y eso es
 * deuda real del vocabulario — la misma que `semantic/upgrade-tokens.md` documenta para `Rifle Amp`.
 * **No la toca este uso:** las tres tablas se consultan sólo sobre `EntityState`, que sólo se construye
 * para participantes con vitales (`TimelineSimulator`). Un arma nunca llega a preguntar por su ley.
 *
 * **Por qué no hay una constante "todo el lado jugador":** porque no existe. Cada ley agrupa distinto
 * —el compañero comparte vitales y gate con el warframe, y no comparte el DR de shield—, y ése es el
 * hecho que este módulo tiene que dejar visible en vez de esconder detrás de un alias.
 *
 * ─── DOS GRANOS DE LA MISMA PREGUNTA ──────────────────────────────────────────────────────────────
 *
 * Lo de arriba vale y **no alcanza**. El Acolyte lo mide: lleva `channel: 'enemy'` como cualquier
 * Lancer y **recibe otra ley de status** (*"can only receive up to 4 stacks of any Status Effect"*,
 * [`acolytes.wikitext:17`](../../../../../references/wiki/mechanics/acolytes.wikitext)). El canal no
 * miente — es que contesta la pregunta gruesa:
 *
 * ```
 * channel      →  qué FÍSICA BASE le toca      5 valores · toda entidad lo tiene   vitales · mitigación · gate
 * unit_class   →  qué UNIDAD ES                poblada sólo donde hay regla propia  desvíos de parámetro del receptor
 * ```
 *
 * Refinar el canal a `'acolyte'` no era una opción: `VITAL_TOKENS['enemy']` dejaría de resolver y el
 * acólito nacería sin vitales. Son **dos campos porque son dos preguntas**, igual que `routes` y
 * `channel` lo fueron por el mismo motivo un nivel más arriba (`arch-decisions §18`).
 *
 * `arch-decisions §22` las lista en una casilla —*"¿está en la fila del dato de la unidad? → clase /
 * identidad | eximus · acolyte · warframe · compañero"*— y es correcto: su test separa **clase de capa
 * y de estado**, no promete que la clase quepa en un campo.
 */

/**
 * Qué unidad es, cuando eso cambia qué ley recibe. **Vocabulario cerrado y chico a propósito**: un
 * miembro por clase con regla propia *y* con entrada instanciable en el catálogo. Crece por caso
 * medido, nunca por anticipación — es la misma doctrina que `LawParam`.
 *
 * **Sólo `acolyte` hoy, y no es una elección de alcance: es el corpus.** Medido sobre `enemies.json`
 * (638 entradas): Kuva Lich `0` · Sister `0` · Hound `0` · Necramech enemigo `0`. Los otros receptores
 * con tabla propia que la fuente declara **no se pueden instanciar**, así que declararlos acá sería
 * vocabulario sin portador. `Boss` además está vetado por `arch-decisions §22` — mezcla cuatro
 * registros y no pasa el test de tres vías.
 */
export type UnitClass = "acolyte";

/** Las clases conocidas, para validar el dato en la frontera. Un valor fuera de acá **tira**. */
export const UNIT_CLASSES: readonly UnitClass[] = ["acolyte"] as const;

/** ¿Esta entidad es de esta clase? Ausente = no lo es (callar no es una tercera respuesta acá). */
export function isUnitClass(unitClass: readonly string[] | undefined, cls: UnitClass): boolean {
  return unitClass?.includes(cls) ?? false;
}

/**
 * Los canales que portan **toda** la física del Tenno. El compañero **no está**, y su ausencia es la
 * decisión: entra caso por caso, donde la fuente lo incluya.
 */
export const TENNO_CHANNELS = ["warframe", "archwing", "necramech"] as const;

/** Los canales del lado jugador que **portan vitales** — el Tenno más el compañero. */
export const PLAYER_VITAL_CHANNELS = [...TENNO_CHANNELS, "companion"] as const;

/**
 * Resuelve una tabla keyed-por-canal, o `undefined` si ese canal no tiene entrada.
 *
 * Devolver `undefined` en vez de tirar es deliberado y la decisión es de cada llamador: para el gate,
 * *"no gatea"* es una respuesta legítima; para los vitales y la mitigación, la ausencia significa
 * *"no sé"* y produce un número falso, así que **esos tiran**.
 */
export function byChannel<T>(table: Readonly<Record<string, T>>, channel: string | undefined): T | undefined {
  return channel ? table[channel] : undefined;
}

/** Construye una tabla asignando el mismo valor a varios canales — evita repetir la enumeración. */
export function forChannels<T>(channels: readonly string[], value: T): Record<string, T> {
  return Object.fromEntries(channels.map((c) => [c, value]));
}
