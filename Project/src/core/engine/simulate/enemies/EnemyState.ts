import type { GameLaws, SimulationEntity } from "../../contracts";
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
 * EL ESTADO NACE DE LA FOTO DE t=0 (`simulation-architecture.md` §El escenario consolidado): recibe la
 * **entidad resuelta de C1**, no un objeto paralelo. Antes recibía un `ScaledEnemy` que C1 nunca vio, y
 * eso era medible — un debuff `ENEMY_*` compuesto en el escenario no llegaba al daño: C1 resolvía un
 * Bombard con armadura 2214 (Corrosive Projection) mientras C2 medía contra el enemigo del `--vs`.
 *
 * DEUDA DE NORTE (O1, decision-frontier.md) — CERRADA POR CONSECUENCIA: el ESTADO era portado-por-entidad
 * mientras la LEY (`formulas/status/`) ya era agnóstica a source/target. Lo que amarraba este contenedor
 * a "enemigo" era `base: ScaledEnemy`; de sus cuatro únicos usos (health/shields/armor + facción) los
 * cuatro estaban ya en la entidad resuelta. Al leerlos de ahí, lo único que queda de "enemigo" en la
 * clase es el nombre: cualquier participante con esos nodos puede portar estado. El rename espera a que
 * haya un segundo portador real (`OQ-ENGINE-8`) — hoy sería vocabulario sin caso.
 */
/** Valor resuelto de un nodo, o 0 si el participante no lo tiene (sin shields, sin armadura). */
const nodeFinal = (entity: SimulationEntity, id: string): number => entity.attributes[id]?.final ?? 0;

/**
 * Los tres vitales de un participante, tal como el escenario los consolidó. SSoT de **qué nodos son
 * los vitales**: el estado los lee para arrancar y la salida los lee para presentar, y si cada uno
 * nombrara los suyos podrían divergir sin que nada lo note.
 */
export function hostileVitals(entity: SimulationEntity): { health: number; armor: number; shields: number } {
  return {
    health:  nodeFinal(entity, "ENEMY_ADD_HEALTH_MAX"),
    armor:   nodeFinal(entity, "ENEMY_ADD_ARMOUR"),
    shields: nodeFinal(entity, "ENEMY_ADD_SHIELD_MAX"),
  };
}

export class EnemyState {
  public current_health: number;
  public current_shields: number;
  /** Estado de proc por efecto — opaco a core (cada behavior modela su `S` distinto). */
  public effectStates: Map<StatusEffect, unknown>;

  /** El participante tal como el escenario lo consolidó. Reemplaza al `ScaledEnemy` paralelo. */
  public entity: SimulationEntity;
  public laws: GameLaws;

  /**
   * Armadura de la foto de t=0 — el piso sobre el que los efectos aplican su `armorMult`. Se congela
   * en el constructor y NO se relee: lo que compuso el escenario (mods, auras) es frame-0, y lo que
   * pasa DURANTE es de los efectos. Es la misma línea que `arch-decisions §19` traza entre las dos.
   */
  private readonly base_armor: number;

  constructor(entity: SimulationEntity, laws: GameLaws) {
    this.entity = entity;
    this.laws = laws;
    const vitals = hostileVitals(entity);
    this.current_health  = vitals.health;
    this.current_shields = vitals.shields;
    this.base_armor      = vitals.armor;
    this.effectStates = new Map();
  }

  /**
   * Facción canónica del portador, para la matriz ③. Sale del campo de la entidad y no de `tags`:
   * ver `SimulationEntity.faction`. Vacía = sin bonus (`targetFactionMult` devuelve 1).
   */
  public get faction(): string {
    return this.entity.faction ?? "";
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
    let armor = this.base_armor;
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
    const c = new EnemyState(this.entity, this.laws);
    c.current_health = this.current_health;
    c.current_shields = this.current_shields;
    // Los estados son inmutables (copy-on-write en applyProc/advance) → copiar el Map alcanza.
    c.effectStates = new Map(this.effectStates);
    return c;
  }
}
