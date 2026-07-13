/**
 * @domain Simulation-v2 / Logic / Simulator
 */
import type { SimulationEntity, SimulationContext } from "../../contracts";
import { BASELINE_GAME_LAWS } from "../../contracts";
import { CombatCalculator } from "./CombatCalculator";
import { CombatSimulator } from "./CombatSimulator";
import { RngProvider } from "./RngProvider";
import { EnemyState } from "../enemies/EnemyState";
import type { ScaledEnemy } from "../enemies/EnemyRepository";
import { isWeaponDamageToken, damageTypeFromToken } from "../../contracts/damage-logic";
import { effectOfDamageType, type DamageType } from "@shared/types";
import { expectedProcEvents } from "../../formulas/status/proc-population";
import type { HitContext } from "../../formulas/status/effect-behavior";

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
    context?: Partial<SimulationContext>,
    rng: RngProvider = new RngProvider()
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

    // Contexto FROZEN de la instancia (source-side, estático por burst — no varía por disparo en este
    // modelo). Cada behavior computa su snapshot de acá al aplicar el proc (`HitContext`, modelo
    // unificado). `moddedBase` = daño modded TOTAL (sin faction/falloff). `elementBonusPct` por tipo se
    // reconstruye de `final/base` (fuente del own-element de dot-tick; frágil, marcado para mejorar).
    const moddedBase = Object.values(damageMap).reduce((sum, v) => sum + v, 0);
    const statusDamageBonusPct = weapon.attributes["WEAPON_ADD_STATUS_DAMAGE"]?.final ?? 0;
    const statusChance = (weapon.attributes["WEAPON_ADD_STATUS_CHANCE"]?.final || 0) / 100;
    const damageBreakdown: Partial<Record<DamageType, number>> = {};
    const elementBonusPct: Partial<Record<DamageType, number>> = {};
    Object.entries(weapon.attributes).forEach(([token, node]) => {
      if (!isWeaponDamageToken(token)) return;
      const type = damageTypeFromToken(token);
      if (!type) return;
      damageBreakdown[type] = node.final;
      if (node.base) elementBonusPct[type] = (node.final / node.base - 1) * 100;
    });
    const hitContext: HitContext = { moddedBase, statusDamageBonusPct, elementBonusPct };

    // Bucle Temporal
    const step = 0.1;
    while (currentTime <= simDuration + 0.001 && !state.isDead()) {
      // 1. Procesar DoTs del intervalo previo
      state.processDots(currentTime, step);

      // 2. ¿Hay disparo en este momento? 
      // Calculado como: ¿El tiempo actual coincide con un múltiplo del intervalo de disparo?
      const isFiring = currentTime <= burstDuration && 
                      (currentTime === 0 || Math.abs((currentTime % timeStep)) < 0.01 || Math.abs((currentTime % timeStep) - timeStep) < 0.01);
      
      if (isFiring) {
        // Resolución del ataque = MISMO camino que un hit directo (`CombatSimulator.simulateAttack`:
        // híbrido atómico/bulk, con multishot+crit YA adentro). `simulateBurst` ya no reimplementa la
        // resolución ni re-multiplica post-hoc — camino único (ver `status.md §C2`, nota "camino de
        // resolución unificado"). Con multishot ≤ HYBRID_THRESHOLD (casi toda arma real) el modo es
        // atómico → el timeline es estocástico pero reproducible por `rng` (seed fijo). `pellets`
        // (multishot EV) se conserva SOLO para la población de status (eje EV — proc-population), NO
        // para el daño.
        const resolution = CombatSimulator.simulateAttack(weapon, state, currentTime, rng);
        const pellets = metrics.pellet_count;

        const hitShieldDamage = resolution.shield_damage;
        const hitHealthDamage = resolution.health_damage;

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

        // Generación de procs UNIFICADA (colapsa las 3 ramas viejas): un solo loop para todos los
        // efectos modelados. `expectedProcEvents` da los procs esperados por tipo (chance×peso); el
        // tipo mapea a su efecto (`effectOfDamageType`, canónico) y `applyProc` rutea al behavior, que
        // computa su snapshot del `hitContext`. `expected × pellets` (cada pellet es un roll
        // independiente al SC nominal, sin dividir — post-27.2). Efecto sin modelar = no-op.
        const procEvents = expectedProcEvents(damageBreakdown, statusChance, currentTime);
        for (const ev of procEvents) {
          const effect = effectOfDamageType(ev.type);
          if (!effect) continue;
          state.applyProc(effect, hitContext, ev.expected * pellets, currentTime);
        }
      }

      // 3. Registrar Evento
      events.push({
        time: currentTime,
        damage: isFiring ? totalDamage : 0,
        cumulative_damage: totalDamage,
        enemy_health: Math.max(0, state.current_health),
        enemy_armor: state.getEffectiveArmor(currentTime),
        stacks: Object.fromEntries(state.activeEffects().map((e) => [e, 1])),
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
