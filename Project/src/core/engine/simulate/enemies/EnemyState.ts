import type { ScaledEnemy } from "./EnemyRepository";
import type { EnemyStatusState, GameLaws } from "../../contracts";
import {
  stackDebuffValue,
  infectionLaw,
  disruptionLaw,
  corrosionLaw,
  EFFECT_BY_DOT_KEY,
} from "../../formulas/status/stack-debuff";

/**
 * EnemyState - Gestiona el estado dinámico de un enemigo durante una simulación temporal.
 *
 * DEUDA DE NORTE (O1, damage-flow-model §8 / decision-frontier.md): el ESTADO de status
 * (`stacks`) es portado-por-entidad — cualquier entidad instancia Y recibe daño (jugador con
 * self-status, companion). El contenedor debería ser entidad-neutral eventualmente. NO se
 * generaliza hoy: único consumidor real (enemigo). Gate = primera entidad no-enemigo que porte
 * status. La LEY (formulas/status/) YA es agnóstica a source/target; lo que falta relocalizar es
 * solo este contenedor, cuando el gate se abra.
 */
export class EnemyState {
  public current_health: number;
  public current_armor: number;
  public current_shields: number;
  public stacks: EnemyStatusState;
  public dot_pools: Record<string, number>; 
  private heat_first_proc_time: number | null = null;

  public base: ScaledEnemy;
  public laws: GameLaws;

  constructor(base: ScaledEnemy, laws: GameLaws) {
    this.base = base;
    this.laws = laws;
    this.current_health = base.current_health;
    this.current_armor = base.current_armor;
    this.current_shields = base.current_shields;
    this.stacks = {
      corrosion: 0,
      infection: 0,
      ignite: 0,
      disruption: 0
    };
    this.dot_pools = {
      damage_slash_dot: 0,
      damage_heat_dot: 0,
      damage_toxin_dot: 0
    };
  }

  public addStacks(type: string, amount: number, currentTime: number = 0, dotPower: number = 0) {
    // El dot_pool sigue keyeado por tipo (`damage_*_dot`, Familia C); el ESTADO de stacks se
    // keyea por EFECTO. EFFECT_BY_DOT_KEY traduce (Arista 1). Slash/Toxin no tienen efecto de
    // stack → no caen en `stacks`, solo en `dot_pools`.
    const effect = EFFECT_BY_DOT_KEY[type];
    if (effect) {
      if (effect === 'ignite' && this.stacks.ignite === 0 && amount > 0) {
        this.heat_first_proc_time = currentTime;
      }

      // Aplicar límites dinámicos por Ley
      const maxStacks = effect === 'corrosion'
        ? this.laws.corrosive_max_stacks
        : (effect === 'ignite' ? 999 : this.laws.status_max_stacks);

      this.stacks[effect] = Math.min(maxStacks, this.stacks[effect] + amount);
    }

    if (type in this.dot_pools) {
      this.dot_pools[type] += dotPower * amount;
    }
  }

  public processDots(dt: number) {
    const duration = 6.0; 
    Object.entries(this.dot_pools).forEach(([type, dps]) => {
      if (dps <= 0) return;
      let damageDealt = dps * dt;

      if (type === 'damage_toxin_dot') {
        this.current_health -= damageDealt;
      } else {
        if (this.current_shields > 0) {
          const toShields = Math.min(this.current_shields, damageDealt);
          this.current_shields -= toShields;
          damageDealt -= toShields;
        }
        this.current_health -= damageDealt;
      }
      this.dot_pools[type] -= (dps / duration) * dt;
    });

    Object.keys(this.stacks).forEach(key => {
      const k = key as keyof EnemyStatusState;
      if (this.stacks[k] > 0) {
        this.stacks[k] -= (this.stacks[k] / duration) * dt;
      }
    });

    if (this.current_health < 0) this.current_health = 0;
  }

  public getActiveStatusCount(): number {
    return Object.values(this.stacks).filter(s => (s as number) > 0).length;
  }

  /**
   * Multiplicador de daño por stacks de status en la capa golpeada. Disruption (Magnetic)
   * multiplica shields (y Overguard); Infection (Viral) multiplica salud (health layer
   * únicamente, no shields) — a TODO el daño de esa capa, no solo al del mismo tipo elemental.
   * Ver references/wiki/mechanics/status-effects.md §Infection/Disruption.
   */
  public getDamageMultiplier(hitsShields: boolean): number {
    // Disruption (Magnetic) multiplica la capa shields/Overguard; Infection (Viral) la capa salud.
    // La LEY (Familia A) vive en formulas/status; acá solo se lee el estado y se orquesta.
    const currentStacks = hitsShields ? this.stacks.disruption : this.stacks.infection;
    if (currentStacks <= 0) return 1.0;

    const law = hitsShields
      ? disruptionLaw(this.laws.status_initial_bonus, this.laws.status_stack_bonus)
      : infectionLaw(this.laws.status_initial_bonus, this.laws.status_stack_bonus);
    return stackDebuffValue(law, currentStacks);
  }

  public getEffectiveArmor(currentTime: number): number {
    let armor = this.base.current_armor;

    // 1. Corrosion (Corrosive) — armor strip por stack (Familia A, LEY en formulas/status).
    if (this.stacks.corrosion > 0) {
      const strip = stackDebuffValue(
        corrosionLaw(this.laws.corrosive_initial_strip, this.laws.corrosive_stack_strip),
        this.stacks.corrosion,
      );
      armor *= (1 - strip);
    }

    // 2. Ignite (Heat) — armor strip por TIEMPO transcurrido (rampa de 2s). NO es Familia A
    // (no escala por stacks) — excepción documentada, se queda inline como orquestación temporal.
    if (this.stacks.ignite > 0 && this.heat_first_proc_time !== null) {
      const elapsed = currentTime - this.heat_first_proc_time;
      if (elapsed > 0.5) {
        const rampProgress = Math.min(1.0, (elapsed - 0.5) / 1.5);
        const heatReduction = 0.5 * rampProgress; 
        armor *= (1 - heatReduction);
      }
    }

    return Math.max(0, armor);
  }

  public isDead(): boolean {
    return this.current_health <= 0;
  }

  public clone(): EnemyState {
    const newState = new EnemyState(this.base, this.laws);
    newState.current_health = this.current_health;
    newState.current_armor = this.current_armor;
    newState.current_shields = this.current_shields;
    newState.stacks = { ...this.stacks };
    return newState;
  }
}
