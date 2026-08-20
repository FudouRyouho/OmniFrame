/**
 * @domain Engine / Formulas / Status / EffectBehavior
 * @SSoT docs/domains/engine/design/damage-status-model.md §Modelo unificado de proc
 *
 * La interfaz del modelo unificado de proc: un contenedor de instancias de proc en el target + una
 * fórmula-estrategia por efecto. `EntityState` itera las fórmulas (registro `EFFECT_BEHAVIORS`); cada
 * efecto posee su acumulación, su ciclo de vida y su contribución. Ver el doc para la ontología
 * (instancia/resolución/proc/tick) y el corte «el proc fija la base, el tick evalúa al emitir».
 */

import type { DamageType, StatusEffect } from "@shared/types";

// La pila de capas y la tabla de quién la atraviesa son contrato del PORTADOR, no de una fórmula de
// status: viven en `contracts/layers.ts`. Acá sólo se re-exporta el tipo para los `layerMult`.
import type { Layer } from "../../contracts/layers";
export type { Layer };

import type { EmitterDeviations } from "../../contracts/law-params";

/**
 * El contexto FROZEN de la instancia que generó el proc (source-side, compute-once). El efecto
 * computa su snapshot de acá al aplicar. La re-aplicación LIVE del source (faction², pool②) NO va
 * acá — es `OQ-ENGINE-20`, entraría como ref-live en el tick.
 */
export interface HitContext {
  /** Daño modded TOTAL de la instancia (sin faction, sin falloff). */
  moddedBase: number;
  /** Bonus de `WEAPON_ADD_STATUS_DAMAGE` (%). */
  statusDamageBonusPct: number;
  /** Bonus del propio elemento por tipo (%) — ej. +Toxin% amplifica el tick de Toxin. */
  elementBonusPct: Partial<Record<DamageType, number>>;
  /**
   * Los **desvíos de ley del emisor**, si declara alguno. Los tres campos de arriba son su *output*;
   * éste no — es lo que `arch-decisions §17` pedía para que los primeros eslabones de la cadena
   * tuvieran por dónde entrar.
   *
   * ⚠️ **Es un argumento, no persistencia.** El estado del receptor sigue sin recordar quién puso cada
   * stack: el contador es uno y no lleva procedencia (`status-stack-caps.md`, *"nada en el estado
   * recuerda quién puso cada stack — no hace falta"*). Lo que viaja acá muere con la aplicación del
   * proc, que es exactamente la distinción que `time-model.md` marca al acotar el descarte de `stamp`.
   */
  lawDeviations?: EmitterDeviations;
}

/**
 * Lo que el **receptor** aporta a la aplicación de un proc — el otro lado de `HitContext`.
 *
 * `arch-decisions §17` da la cadena de cuatro eslabones y los dos últimos son suyos (*"¿el RECEPTOR
 * modifica la entrada? ¿el RECEPTOR fuerza?"*). Hasta acá no tenía por dónde entrar: el behavior
 * recibía el estado del efecto y el contexto del hit, y el receptor —que es literalmente quien
 * invoca— no se pasaba a sí mismo.
 *
 * **Lleva identidad, no desvíos ya resueltos**, y esa es la decisión de diseño. El emisor declara por
 * parámetro de ley (`corrosive.maxStacks`); el Acolyte declara por status (*"4 de cualquiera, salvo
 * Impact que 3"*). Son ejes distintos y **el punto donde se encuentran es el behavior**, que ya conoce
 * su efecto y su default — preguntarle a cada lado en su propio idioma es simétrico con eso.
 * Resolverlos afuera obligaría al contenedor a conocer las leyes, que es lo que §17 le saca.
 *
 * ⚠️ **Se computa al aplicar, no se congela** (`arch-decisions §20`, `f(estado en t)`). `unit_class` no
 * cambia en `t`, pero los otros dos sí — una marca se adquiere en mitad del combate y una capa se
 * agota—, así que congelar este objeto daría un contexto viejo.
 *
 * ─── LOS TRES CAMPOS SON EL TEST DE TRES VÍAS DE §22, HECHO ESTRUCTURA ────────────────────────────
 *
 * §22 clasifica **toda** propiedad de una entidad con una sola pregunta, y declara las tres respuestas
 * excluyentes. Los tres pobladores de este contexto son exactamente esas tres, y no se llegó por
 * diseño sino por casos:
 *
 * ```
 * ¿está en la fila del dato de la unidad?  → clase   unit_class      Acolyte, cap de status 4
 * ¿es condición temporal?                  → estado  marks           marca de Hydroid (#8)
 * ¿tiene cantidad que se agota?            → capa    layers_present  Overguard, cap Cold 4 (#11)
 * ```
 *
 * **La terna está cerrada por §22, no por conveniencia:** *"las tres son excluyentes y ninguna
 * propiedad conocida entra en dos"*. Un cuarto poblador acá significaría que el test de tres vías
 * encontró un cuarto registro — que es una revisión de §22, no un campo más.
 */
export interface ReceiverContext {
  /** Qué unidad **es** — clase (§22). `contracts/unit-class.ts`. Ausente = sin regla propia. */
  unit_class?: string;
  /**
   * Qué le **pasó** — las marcas que el target adquirió, contra `unit_class` que dice qué **es**
   * (`arch-decisions §17`: *"marca portada por el target"*). Hoy sólo la de Hydroid, que sube el strip
   * inicial de Corrosive a 50% — #8.
   *
   * **Es la otra cara de la misma moneda que el desvío del emisor**, no un mecanismo aparte: los dos
   * son `ParamDeviation` sobre un parámetro de la misma ley, y `resolveParam` los recibe por sus dos
   * campos. Lo que cambia con el dueño es el **alcance**: el del emisor lo cobran sólo sus propios
   * procs (dos jugadores, caps 19 y 10 sobre un contador — `status-stack-caps.md`), el del receptor lo
   * cobra cualquiera que golpee —que es literal lo que la fuente de Hydroid declara: *"can be applied
   * from **any source**, not just from Hydroid's weapons or abilities"*.
   */
  marks?: readonly string[];
  /**
   * Qué **capas porta en `t`** — el tercer registro de §22, y el que cierra la terna. `Overguard` topea
   * los procs de Cold en `4` mientras está activo: *"On enemies… can normally only receive a maximum of
   * 4 Cold procs"* (`overguard.wikitext:37`), *"**Bosses, as well as enemies with active Overguard**,
   * can receive a maximum of 4 Cold stacks"* (`damage-cold-damage.wikitext:26`) — #11.
   *
   * **Presencia, no cantidad, y la asimetría es del consumidor.** §22 define la capa por su cantidad
   * (*"¿tiene cantidad que se agota?"*), pero ninguna ley conocida lee ese número por este canal: la
   * pregunta que `resolveParam` necesita contestar es si la fila **habla**. La cantidad ya vive donde
   * se consume —`EntityState.current_overguard`, que las capas descuentan—, y traerla acá sería
   * guardar el mismo dato dos veces para un consumidor que no existe.
   *
   * ⚠️ **Se computa en `t` y por eso no es marca.** Una marca es permanente (*"permanently more
   * vulnerable"*); una capa se agota, y al agotarse el cap vuelve al default del concepto **en el
   * mismo instante**. Modelarla como marca haría que el enemigo siguiera topado en `4` después de
   * romperle el Overguard.
   *
   * ⚠️ **"Bosses" queda afuera y no es un olvido:** la misma frase de la fuente lo nombra al lado del
   * Overguard, pero `arch-decisions §22` veta la clase `Boss` — mezcla cuatro registros y no pasa el
   * test de tres vías. Se modela la mitad que el test resuelve.
   */
  layers_present?: readonly Layer[];
}

/**
 * El contexto completo de una aplicación de proc: **los dos dueños de `arch-decisions §17`, cada uno
 * en su campo**.
 *
 * Reemplaza al `hit` suelto que la firma llevaba. Sumar un parámetro más habría alcanzado para el
 * único consumidor de hoy, y es lo que se descartó: el receptor va a entrar también en
 * `resolutionModifier` y en `critModifier` —el cap de Cold en Overguard es ese caso, #11—, y la
 * forma que sostiene tres sitios es un contexto, no tres parámetros sueltos.
 * Meterlo dentro de `HitContext` no era opción: ese tipo se declara *source-side*, y colapsar los dos
 * dueños en un objeto es exactamente lo que §17 le reprocha a `GameLaws`.
 */
export interface ProcContext {
  /** Lo que trae el emisor: el output de la instancia + sus desvíos de ley. */
  hit: HitContext;
  /** Lo que trae el receptor. Ausente = no aporta nada, y entonces rige lo que el emisor declare. */
  receiver?: ReceiverContext;
}

/** Una emisión de daño de un proc: `value` crudo + `as` = el tipo con el que RESUELVE (bleed→'true'). */
export interface Resolucion {
  value: number;
  as: DamageType;
}

/** Cómo un efecto altera la resolución de daño contra el target (stage de resolución: armor + capa). */
export interface ResolutionModifier {
  /** Multiplica el armor efectivo (Corrosion strip, Heat-ramp). */
  armorMult?: number;
  /** Multiplica el daño entrante en una capa (Viral→health, Magnetic→shields). */
  layerMult?: Partial<Record<Layer, number>>;
}

/**
 * Cómo un efecto altera el CRIT del atacante según su presencia en el target (`DC-OQ-ENGINE-12`).
 * Stage ANTERIOR a la resolución de daño: se aplica en el cálculo de crit del hit (`simulateAttack`),
 * no en la mitigación por capa. Aditivo. Canal separado de `ResolutionModifier` a propósito — son
 * dos momentos distintos del pipeline (crit del hit vs mitigación del target).
 */
export interface CritModifier {
  /** Suma a la crit chance del jugador (%). Weakened (Puncture): +5×n, cap +25 a 5 stacks. */
  critChanceAdd?: number;
  /** Suma al crit damage multiplier del jugador (×). Freeze (Cold): +0.1+0.05(n−1), cap +0.5. */
  critMultAdd?: number;
}

/**
 * La fórmula-estrategia de un efecto. `S` = su estado interno, OPACO a core (cada efecto lo modela
 * como quiera: lista de pulsos, contador, pool). El comportamiento —acumulación, ciclo de vida,
 * contribución— vive en la fórmula, no en core (que solo itera y resuelve).
 */
/**
 * **Sin `laws` en las firmas.** Los coeficientes de cada ley viven con su fórmula
 * (`stack-debuff.ts`), que es lo que `arch-decisions §17` fija: el *default* es del concepto; sólo el
 * *desvío* es del portador, y un desvío no viaja como tabla plana — necesita decir de quién es. El
 * estado transportaba `GameLaws` hasta acá y ese pase era, en los seis casos, un default disfrazado
 * de configuración.
 */
export interface EffectBehavior<S> {
  readonly effect: StatusEffect;
  /** Aplica un proc (o `amount` fraccional, EV): computa snapshot + acumula. Generaliza `addStacks`. */
  applyProc(state: S | undefined, ctx: ProcContext, amount: number, t: number): S;
  /** Evoluciona el estado en `[t, t+dt)`: decae/expira, y EMITE las resoluciones de DoT del intervalo. */
  advance(state: S, t: number, dt: number): { state: S; damage: Resolucion[] };
  /**
   * Modificador de resolución actual (armor/capa). Ausente = no modifica.
   *
   * Recibe el `ReceiverContext` desde que existe el primer desvío del receptor que entra por acá: la
   * marca de Hydroid sobre el strip inicial de Corrosive (#8). Fue un argumento más y no una forma
   * nueva, como el comentario que ocupaba este lugar anticipaba — el contexto ya llegaba al contenedor.
   * Ausente = el caller no aporta receptor y rige el default del concepto.
   */
  resolutionModifier?(state: S, t: number, receiver?: ReceiverContext): ResolutionModifier;
  /**
   * Modificador de crit del atacante (Weakened/Freeze, `DC-OQ-ENGINE-12`). Ausente = no toca el crit.
   *
   * ⚠️ **Sigue sin recibir contexto, y el que va a necesitar no es el del receptor: es la identidad
   * del SOURCE.** La pasiva de Gyre (+10% de crit chance por stack de Electricity, sólo para ella) es
   * el caso, y no alcanza con este canal — la instancia se construye *"sin nada del emisor adentro:
   * ni su identidad"* (`damage-instance.ts`). No se anticipa acá: se agrega cuando ese caso se
   * construya — #33.
   */
  critModifier?(state: S, t: number): CritModifier;
}
