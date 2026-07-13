/**
 * @domain Simulation-v2 / Logic / Projector
 * @status en-desarrollo
 */
import { AtomicSimulator } from "./AtomicSimulator";
import type { SimulationEntity, SimulationContext } from "../../contracts";
import { isWeaponDamageToken } from "../../contracts/damage-logic";

export interface CombatMetrics {
  average_crit_multiplier: number;
  burst_dps: number;
  sustained_dps: number;
  status_map: Record<string, number>;
  crit_distribution: Record<number, number>;
  pellet_count: number;
  falloff_multiplier: number;
}

export class CombatCalculator {
  public static project(entity: SimulationEntity, context: SimulationContext): CombatMetrics {
    const attrs = entity.attributes;
    
    // 0. Cálculo de Falloff (Distancia)
    const dist = context.variables["distance"] || 0;
    const fStart = attrs["falloff_start"]?.final || 1000; // Por defecto sin falloff
    const fEnd = attrs["falloff_end"]?.final || 1000;
    const fMinPct = attrs["falloff_min_pct"]?.final || 100;
    
    let falloffMult = 1.0;
    if (dist > fStart) {
      const range = Math.max(0.1, fEnd - fStart);
      const ratio = Math.min(1.0, (dist - fStart) / range);
      const minMult = fMinPct / 100;
      falloffMult = 1.0 - (ratio * (1.0 - minMult));
    }

    // 1. Resolver Daño Total Base (Afectado por Falloff)
    const total_base_damage = Object.entries(attrs)
      .filter(([id]) => isWeaponDamageToken(id))
      .reduce((acc, [_, node]) => acc + node.final, 0) * falloffMult;

    // 2. Lógica de Críticos Atómica (Distribución de Tiers)
    const crit_chance = (attrs["WEAPON_ADD_CRIT_CHANCE"]?.final || 0);
    const crit_mult = attrs["WEAPON_ADD_CRIT_MULT"]?.final || 1.0;
    
    const crit_distribution = AtomicSimulator.calculateCritDistribution(crit_chance);
    const avg_crit_mult = AtomicSimulator.calculateAverageMultiplier(crit_chance, crit_mult);

    // 4. Lógica de Estado (Probability Weighting)
    const status_chance = (attrs["WEAPON_ADD_STATUS_CHANCE"]?.final || 0) / 100;
    const status_map: Record<string, number> = {};
    
    if (total_base_damage > 0) {
      Object.entries(attrs)
        .filter(([id]) => isWeaponDamageToken(id))
        .forEach(([id, node]) => {
          // Probabilidad = StatusChance * (Weight del elemento / Daño Total)
          const weight = node.final / total_base_damage;
          status_map[id] = status_chance * weight;
        });
    }

    // 5. Lógica de DPS y Multishot
    const fire_rate = attrs["WEAPON_ADD_FIRE_RATE"]?.final || 1.0;
    const multishot = attrs["WEAPON_ADD_MULTISHOT"]?.final || 1.0;
    const mag_size  = attrs["WEAPON_ADD_MAGAZINE_MAX"]?.final || 1.0;

    // Ley de Recarga: TiempoFinal = Base / (1 + ReloadSpeedBonus / 100)
    // reload_time es dato puro del arma — vive en innate_dna, no en AttributeNode.
    const base_reload = entity.innate_dna?.profiles?.[context.active_profile_id]?.['reload_time']
      ?? entity.innate_dna?.profiles?.['base']?.['reload_time']
      ?? 1.0;
    const reload_bonus = attrs["WEAPON_ADD_RELOAD_SPEED"]?.final ?? 100;
    const final_reload_time = base_reload / (reload_bonus / 100);

    const damage_per_shot = total_base_damage * avg_crit_mult * multishot;
    const burst_dps = damage_per_shot * fire_rate;

    // Sustained = TotalMagDamage / (Time_to_empty + Reload)
    const shots_in_mag = mag_size / multishot;
    const time_to_empty = shots_in_mag / fire_rate;
    const sustained_dps = (damage_per_shot * shots_in_mag) / (time_to_empty + final_reload_time);

    return {
      average_crit_multiplier: avg_crit_mult,
      burst_dps,
      sustained_dps,
      status_map,
      crit_distribution,
      pellet_count: multishot,
      falloff_multiplier: falloffMult
    };
  }
}
