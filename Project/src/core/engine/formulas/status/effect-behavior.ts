/**
 * @domain Engine / Formulas / Status / EffectBehavior
 * @SSoT docs/domains/engine/design/damage-status-model.md §Modelo unificado de proc
 *
 * La interfaz del modelo unificado de proc: un contenedor de instancias de proc en el target + una
 * fórmula-estrategia por efecto. `EnemyState` itera las fórmulas (registro `EFFECT_BEHAVIORS`); cada
 * efecto posee su acumulación, su ciclo de vida y su contribución. Ver el doc para la ontología
 * (instancia/resolución/proc/tick) y el corte «el proc fija la base, el tick evalúa al emitir».
 */

import type { DamageType, StatusEffect } from "@shared/types";

// La pila de capas y la tabla de quién la atraviesa son contrato del PORTADOR, no de una fórmula de
// status: viven en `contracts/layers.ts`. Acá sólo se re-exporta el tipo para los `layerMult`.
import type { Layer } from "../../contracts/layers";
export type { Layer };

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
 * Cómo un efecto altera el CRIT del atacante según su presencia en el target (`OQ-ENGINE-12`).
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
  applyProc(state: S | undefined, hit: HitContext, amount: number, t: number): S;
  /** Evoluciona el estado en `[t, t+dt)`: decae/expira, y EMITE las resoluciones de DoT del intervalo. */
  advance(state: S, t: number, dt: number): { state: S; damage: Resolucion[] };
  /** Modificador de resolución actual (armor/capa). Ausente = no modifica. */
  resolutionModifier?(state: S, t: number): ResolutionModifier;
  /** Modificador de crit del atacante (Weakened/Freeze, `OQ-ENGINE-12`). Ausente = no toca el crit. */
  critModifier?(state: S, t: number): CritModifier;
}
