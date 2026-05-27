/**
 * @domain Simulation-v2 / Logic / Simulator
 */
import type { SimulationEntity, SimulationContext } from "../contracts";
import { BASELINE_GAME_LAWS } from "../contracts";
import { CombatCalculator } from "./CombatCalculator";
import { CombatSimulator } from "./CombatSimulator";
import { EnemyState } from "../enemies/EnemyState";
import type { ScaledEnemy } from "../enemies/EnemyRepository";
import { isWeaponDamageToken, DAMAGE_ATTR_TO_PROC_KEY } from "../contracts/damage-logic";

export interface TimelineEvent {
  time: number;
  damage: number;
  cumulative_damage: number;
  enemy_health: number;
  enemy_armor: number;
  stacks: Record<string, number>;
}

export interface SimulationResult {
  events: TimelineEvent[];
  ttk: number | null; // Time to Kill en segundos
  total_damage: number;
}

/**
 * TimelineSimulator - Proyecta el combate como una serie temporal de eventos.
 */
export class TimelineSimulator {
  /**
   * Simula una ráfaga y luego observa el sangrado post-disparo.
   */
  public static simulateBurst(
    weapon: SimulationEntity,
    target: ScaledEnemy,
    simDuration: number,
    burstDuration: number = simDuration,
    context?: Partial<SimulationContext>
  ): SimulationResult {
    const fullContext: SimulationContext = { 
      active_profile_id: context?.active_profile_id || "base",
      flags: context?.flags || {}, 
      variables: context?.variables || {}, 
      laws: context?.laws || { ...BASELINE_GAME_LAWS }
    };

    const metrics = CombatCalculator.project(weapon, fullContext);
    const state = new EnemyState(target, fullContext.laws);
    const events: TimelineEvent[] = [];
    
    const fireRate = weapon.attributes["WEAPON_ADD_FIRE_RATE"]?.final || 1;
    const timeStep = 1 / fireRate;
    let currentTime = 0;
    let totalDamage = 0;
    let ttk: number | null = null;

    const damageMap: Record<string, number> = {};
    Object.entries(weapon.attributes).forEach(([id, node]) => {
      if (isWeaponDamageToken(id)) damageMap[id] = node.final;
    });

    // Bucle Temporal
    const step = 0.1; 
    while (currentTime <= simDuration + 0.001 && !state.isDead()) {
      // 1. Procesar DoTs del intervalo previo
      state.processDots(step);

      // 2. ¿Hay disparo en este momento? 
      // Calculado como: ¿El tiempo actual coincide con un múltiplo del intervalo de disparo?
      const isFiring = currentTime <= burstDuration && 
                      (currentTime === 0 || Math.abs((currentTime % timeStep)) < 0.01 || Math.abs((currentTime % timeStep) - timeStep) < 0.01);
      
      if (isFiring) {
        const resolution = CombatSimulator.resolveHit(damageMap, state, currentTime);
        const pellets = weapon.attributes["multishot"]?.final || 1;
        const multiplier = pellets * metrics.average_crit_multiplier;

        const hitShieldDamage = resolution.shield_damage * multiplier;
        const hitHealthDamage = resolution.health_damage * multiplier;
        
        // Aplicar daño a escudos (con desbordamiento simple a salud si se agotan)
        // Nota: En Warframe el desbordamiento es más complejo, pero esto es v2.8 fidelidad media-alta
        let remainingShieldDamage = hitShieldDamage;
        if (state.current_shields > 0) {
          const appliedToShields = Math.min(state.current_shields, remainingShieldDamage);
          state.current_shields -= appliedToShields;
          remainingShieldDamage -= appliedToShields;
        }
        
        // El daño que sobrepasa escudos + el daño directo a salud (Toxin/Armor-hit)
        state.current_health -= (hitHealthDamage + remainingShieldDamage);
        
        totalDamage += (hitShieldDamage + hitHealthDamage);

        // Aplicar Stacks y Potencia DoT
        Object.entries(metrics.status_map).forEach(([attrType, prob]) => {
          const procType = DAMAGE_ATTR_TO_PROC_KEY[attrType];
          if (!procType) return;
          const amount = prob * pellets;
          const projection = metrics.status_projections.find(p => p.type === procType);
          const dotPower = projection ? projection.damage_per_tick : 0;
          state.addStacks(procType, amount, currentTime, dotPower);
        });
      }

      // 3. Registrar Evento
      events.push({
        time: currentTime,
        damage: isFiring ? totalDamage : 0,
        cumulative_damage: totalDamage,
        enemy_health: Math.max(0, state.current_health),
        enemy_armor: state.getEffectiveArmor(currentTime),
        stacks: { ...state.stacks }
      });

      if (state.isDead() && ttk === null) ttk = currentTime;
      
      // Avanzar el reloj
      currentTime += step;
    }

    return {
      events,
      ttk,
      total_damage: totalDamage
    };
  }
}
