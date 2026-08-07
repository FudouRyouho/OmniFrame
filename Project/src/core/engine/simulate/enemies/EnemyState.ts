import type { ScaledEnemy } from "./EnemyRepository";
import type { GameLaws } from "../../contracts";
import type { StatusEffect } from "@shared/types";
import { EFFECT_BEHAVIORS } from "../../formulas/status/behaviors";
import type { EffectBehavior, HitContext, Layer, Resolucion } from "../../formulas/status/effect-behavior";
import { CombatSimulator } from "../combat/CombatSimulator";
import { damageTokenFromType } from "../../contracts/damage-logic";

/**
 * EnemyState — estado dinámico de un enemigo durante la simulación temporal. **Modelo unificado de
 * proc** (`damage-status-model.md §Modelo unificado de proc`): un contenedor único `effectStates`
 * (Map por efecto, OPACO a core) + iteración sobre el registro `EFFECT_BEHAVIORS`. Core no conoce el
 * comportamiento de cada efecto — lo delega a su fórmula; solo itera, y resuelve las emisiones (ticks)
 * por el mismo camino que un hit directo (`resolveDamageEvent`).
 *
 * DEUDA DE NORTE (O1, decision-frontier.md): el ESTADO es portado-por-entidad. La LEY
 * (`formulas/status/`) YA es agnóstica a source/target — cada behavior modela su `S` sin saber quién lo
 * porta. Lo que amarra este contenedor a "enemigo" es `base: ScaledEnemy`, y de ahí salen sus cuatro
 * únicos usos (health/shields/armor actuales + faction), **los cuatro ya presentes en la entidad
 * resuelta de C1**.
 *
 * Por eso no es "relocalizar cuando una entidad no-enemigo porte status": la neutralidad cae por
 * consecuencia de que el estado nazca del escenario consolidado en vez de un `ScaledEnemy` que C1 nunca
 * vio (`simulation-architecture.md` §El escenario consolidado). Hoy nace del segundo, y eso es medible:
 * un debuff `ENEMY_*` compuesto en C1 no llega al daño.
 */
export class EnemyState {
  public current_health: number;
  public current_shields: number;
  /** Estado de proc por efecto — opaco a core (cada behavior modela su `S` distinto). */
  public effectStates: Map<StatusEffect, unknown>;

  public base: ScaledEnemy;
  public laws: GameLaws;

  constructor(base: ScaledEnemy, laws: GameLaws) {
    this.base = base;
    this.laws = laws;
    this.current_health = base.current_health;
    this.current_shields = base.current_shields;
    this.effectStates = new Map();
  }

  /** Aplica un proc de un efecto (o `amount` fraccional, EV). Rutea a su behavior; efecto sin modelar = no-op. */
  public applyProc(effect: StatusEffect, hit: HitContext, amount: number, currentTime: number = 0) {
    const behavior = EFFECT_BEHAVIORS[effect];
    if (!behavior) return;
    this.effectStates.set(effect, behavior.applyProc(this.effectStates.get(effect), hit, amount, currentTime, this.laws));
  }

  /** Avanza el estado en `[currentTime, +dt)`: cada behavior decae/expira y EMITE; core resuelve. */
  public processDots(currentTime: number, dt: number) {
    for (const [effect, behavior] of this.activeBehaviors()) {
      const { state, damage } = behavior.advance(this.effectStates.get(effect), currentTime, dt);
      this.effectStates.set(effect, state);
      for (const res of damage) this.applyResolucion(res, currentTime);
    }
    if (this.current_health < 0) this.current_health = 0;
  }

  /** Resuelve una emisión de proc (tick) por el MISMO camino que un hit directo, y la aplica a las capas. */
  private applyResolucion(res: Resolucion, currentTime: number) {
    const { hitsShields, finalDamage } = CombatSimulator.resolveDamageEvent(
      damageTokenFromType(res.as), res.value, this, currentTime,
    );
    if (hitsShields) {
      const toShields = Math.min(this.current_shields, finalDamage);
      this.current_shields -= toShields;
      this.current_health -= (finalDamage - toShields);
    } else {
      this.current_health -= finalDamage;
    }
  }

  /** Multiplicador de la capa golpeada = producto de los `layerMult` de los efectos activos (Viral/Magnetic). */
  public getDamageMultiplier(hitsShields: boolean, currentTime: number = 0): number {
    const layer: Layer = hitsShields ? "shields" : "health";
    let mult = 1.0;
    for (const [effect, behavior] of this.activeBehaviors()) {
      const m = behavior.resolutionModifier?.(this.effectStates.get(effect), currentTime, this.laws).layerMult?.[layer];
      if (m !== undefined) mult *= m;
    }
    return mult;
  }

  /**
   * Bonos al crit del ATACANTE según los efectos presentes en este target (`OQ-ENGINE-12`).
   * Suma los `critModifier` de los efectos activos: Weakened (Puncture) → +crit chance (%),
   * Freeze (Cold) → +crit damage (×). Se lee LIVE por hit en `simulateAttack`.
   */
  public getCritBonuses(currentTime: number = 0): { critChanceAdd: number; critMultAdd: number } {
    let critChanceAdd = 0;
    let critMultAdd = 0;
    for (const [effect, behavior] of this.activeBehaviors()) {
      const c = behavior.critModifier?.(this.effectStates.get(effect), currentTime, this.laws);
      if (c?.critChanceAdd) critChanceAdd += c.critChanceAdd;
      if (c?.critMultAdd) critMultAdd += c.critMultAdd;
    }
    return { critChanceAdd, critMultAdd };
  }

  /** Armor efectivo = base × producto de los `armorMult` de los efectos activos (Corrosion, Heat-ramp). */
  public getEffectiveArmor(currentTime: number): number {
    let armor = this.base.current_armor;
    for (const [effect, behavior] of this.activeBehaviors()) {
      const m = behavior.resolutionModifier?.(this.effectStates.get(effect), currentTime, this.laws).armorMult;
      if (m !== undefined) armor *= m;
    }
    return Math.max(0, armor);
  }

  /** Efectos con estado presente (algún proc aplicado). */
  public activeEffects(): StatusEffect[] {
    return [...this.effectStates.keys()];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private *activeBehaviors(): Generator<[StatusEffect, EffectBehavior<any>]> {
    for (const [effect, state] of this.effectStates) {
      const behavior = EFFECT_BEHAVIORS[effect];
      if (behavior && state !== undefined) yield [effect, behavior];
    }
  }

  public isDead(): boolean {
    return this.current_health <= 0;
  }

  public clone(): EnemyState {
    const c = new EnemyState(this.base, this.laws);
    c.current_health = this.current_health;
    c.current_shields = this.current_shields;
    // Los estados son inmutables (copy-on-write en applyProc/advance) → copiar el Map alcanza.
    c.effectStates = new Map(this.effectStates);
    return c;
  }
}
