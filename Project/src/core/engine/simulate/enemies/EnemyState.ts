import type { ScaledEnemy } from "./EnemyRepository";
import type { EnemyStatusState, GameLaws } from "../../contracts";

/**
 * EnemyState - Gestiona el estado dinámico de un enemigo durante una simulación temporal.
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
      damage_corrosive: 0,
      damage_viral: 0,
      damage_heat: 0,
      damage_magnetic: 0
    };
    this.dot_pools = {
      damage_slash_proc: 0,
      damage_heat_proc: 0,
      damage_toxin_proc: 0
    };
  }

  public addStacks(type: string, amount: number, currentTime: number = 0, dotPower: number = 0) {
    const stackKey = type.replace('_proc', '') as keyof EnemyStatusState;
    if (stackKey in this.stacks) {
      if (stackKey === 'damage_heat' && this.stacks.damage_heat === 0 && amount > 0) {
        this.heat_first_proc_time = currentTime;
      }

      // Aplicar límites dinámicos por Ley
      const maxStacks = stackKey === 'damage_corrosive' 
        ? this.laws.corrosive_max_stacks 
        : (stackKey === 'damage_heat' ? 999 : this.laws.status_max_stacks);

      this.stacks[stackKey] = Math.min(maxStacks, this.stacks[stackKey] + amount);
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

      if (type === 'damage_toxin_proc') {
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

  public getDamageMultiplier(damageId: string): number {
    if (damageId === 'damage_viral' || damageId === 'damage_magnetic') return 1.0;

    const currentStacks = damageId === 'damage_magnetic' ? this.stacks.damage_magnetic : 
                         (damageId === 'damage_viral' ? this.stacks.damage_viral : 0);

    if (currentStacks > 0) {
      // Ley Dinámica: Bonus = Initial + (Stacks-1) * Stack_Bonus
      // Ejemplo Viral: 1 + (0.75 + (9 * 0.25)) = 1 + 3.0 = x4.0
      return 1 + (this.laws.status_initial_bonus / 100) + ((currentStacks - 1) * (this.laws.status_stack_bonus / 100));
    }

    return 1.0;
  }

  public getEffectiveArmor(currentTime: number): number {
    let armor = this.base.current_armor;

    // 1. Aplicar Corrosivo (Evolución por Ley)
    if (this.stacks.damage_corrosive > 0) {
      const initial = this.laws.corrosive_initial_strip / 100;
      const perStack = this.laws.corrosive_stack_strip / 100;
      const reduction = initial + ((this.stacks.damage_corrosive - 1) * perStack);
      armor *= (1 - Math.min(1.0, reduction)); // Nunca reducir más del 100%
    }

    // 2. Aplicar Calor (Rampa de 2 segundos)
    if (this.stacks.damage_heat > 0 && this.heat_first_proc_time !== null) {
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
