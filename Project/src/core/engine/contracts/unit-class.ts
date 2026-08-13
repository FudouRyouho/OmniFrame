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
 * **No la toca este uso:** las tres tablas se consultan sólo sobre `EnemyState`, que sólo se construye
 * para participantes con vitales (`TimelineSimulator`). Un arma nunca llega a preguntar por su ley.
 *
 * **Por qué no hay una constante "todo el lado jugador":** porque no existe. Cada ley agrupa distinto
 * —el compañero comparte vitales y gate con el warframe, y no comparte el DR de shield—, y ése es el
 * hecho que este módulo tiene que dejar visible en vez de esconder detrás de un alias.
 */

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
