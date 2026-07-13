/**
 * @domain Engine / Formulas / Status / EffectBehavior
 * @SSoT docs/domains/engine/design/damage-status-model.md §Modelo unificado de proc
 *
 * La interfaz del modelo unificado de proc: un contenedor de instancias de proc en el target + una
 * fórmula-estrategia por efecto. `EnemyState` itera las fórmulas (registro `EFFECT_BEHAVIORS`); cada
 * efecto posee su acumulación, su ciclo de vida y su contribución. Ver el doc para la ontología
 * (instancia/resolución/proc/tick) y la composición `snapshot × live`.
 */

import type { DamageType, StatusEffect } from "@shared/types";
import type { GameLaws } from "../../contracts";

/** Capa del target contra la que resuelve un daño. (overguard: futuro.) */
export type Layer = "health" | "shields";

/**
 * El contexto FROZEN de la instancia que generó el proc (source-side, compute-once). El efecto
 * computa su snapshot de acá al aplicar. La re-aplicación LIVE del source (faction², bucket②) NO va
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
 * La fórmula-estrategia de un efecto. `S` = su estado interno, OPACO a core (cada efecto lo modela
 * como quiera: lista de pulsos, contador, pool). El comportamiento —acumulación, ciclo de vida,
 * contribución— vive en la fórmula, no en core (que solo itera y resuelve).
 */
export interface EffectBehavior<S> {
  readonly effect: StatusEffect;
  /** Aplica un proc (o `amount` fraccional, EV): computa snapshot + acumula. Generaliza `addStacks`.
   *  `laws` = config de juego per-simulación (caps de stacks). */
  applyProc(state: S | undefined, hit: HitContext, amount: number, t: number, laws: GameLaws): S;
  /** Evoluciona el estado en `[t, t+dt)`: decae/expira, y EMITE las resoluciones de DoT del intervalo. */
  advance(state: S, t: number, dt: number): { state: S; damage: Resolucion[] };
  /** Modificador de resolución actual (armor/capa). Ausente = no modifica. `laws` = coeficientes de LEY. */
  resolutionModifier?(state: S, t: number, laws: GameLaws): ResolutionModifier;
}
