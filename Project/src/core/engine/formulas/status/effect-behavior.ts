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
 * ⚠️ **Se computa al aplicar, no se congela** (`arch-decisions §20`, `f(estado en t)`). Hoy sólo lleva
 * clase —que no cambia en `t`— pero el próximo campo sí: el cap de Cold a 4 stacks depende de que el
 * Overguard esté **presente en ese instante**, no de qué es la unidad — #11.
 */
export interface ReceiverContext {
  /** Qué unidad es (`contracts/unit-class.ts`). Ausente = sin regla propia. */
  unit_class?: readonly string[];
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
   * ⚠️ **No recibe el `ReceiverContext`, y va a necesitarlo.** No se le pasó por anticipado porque
   * ningún desvío conocido del receptor entra por acá; el primero que lo haga (#11) lo agrega — el
   * contexto ya existe y llega hasta el contenedor, así que es un argumento más, no una forma nueva.
   * Anclado en `__tests__/status/receiver-law.test.ts`.
   */
  resolutionModifier?(state: S, t: number): ResolutionModifier;
  /** Modificador de crit del atacante (Weakened/Freeze, `DC-OQ-ENGINE-12`). Ausente = no toca el crit. */
  critModifier?(state: S, t: number): CritModifier;
}
