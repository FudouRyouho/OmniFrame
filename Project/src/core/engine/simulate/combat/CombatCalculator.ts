/**
 * @domain Simulation-v2 / Logic / Projector
 * @status en-desarrollo
 */
import { AtomicSimulator } from "./AtomicSimulator";
import type { SimulationEntity, SimulationContext } from "../../contracts";
import { deriveInstance } from "./damage-instance";
import { expectedProcEvents } from "../../formulas/status/proc-population";
import { averageShot, weaponDps, finalReloadTime } from "../../formulas/weapon/dps";

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
    // La Instancia (①②): C2 consume el potencial que C1 compuso, no re-extrae. Falloff (②contextual),
    // cadencia/mag/reload (Schedule) NO son de la Instancia — se leen aparte (§2.0.1).
    const instance = deriveInstance(entity);

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

    // 1. Daño total = potencial de la Instancia × falloff
    const total_base_damage = instance.moddedBase * falloffMult;

    // 2. Lógica de Críticos Atómica (spec de crit de la Instancia; el EV es realización de C2)
    const crit_distribution = AtomicSimulator.calculateCritDistribution(instance.critChance);
    const avg_crit_mult = AtomicSimulator.calculateAverageMultiplier(instance.critChance, instance.critMult);

    // 4. Lógica de Estado (Probability Weighting): peso = daño del tipo / daño total.
    // Consume la ÚNICA ley `expectedProcEvents` (chance×peso), alimentada por la Instancia —
    // misma función que `TimelineSimulator` (seam C1→C2), en vez de reinventar `dmg/total` inline.
    // El peso es falloff-independiente (falloff escala daño, no la chance de proc) → se deriva de
    // `damageByType` crudo, no de `total_base_damage` (que sí lleva falloff). Keyed por `DamageType`.
    const status_map: Record<string, number> = {};
    for (const ev of expectedProcEvents(instance.damageByType, instance.statusChance, 0)) {
      status_map[ev.type] = ev.expected;
    }

    // 5. Lógica de DPS y Multishot (multishot de la Instancia; cadencia/mag = Schedule)
    const fire_rate = attrs["WEAPON_ADD_FIRE_RATE"]?.final || 1.0;
    const multishot = instance.multishot;
    const mag_size  = attrs["WEAPON_ADD_MAGAZINE_MAX"]?.final || 1.0;

    // Ley de Recarga: TiempoFinal = Base / (ReloadTotal / 100) — reload_bonus es el TOTAL ya sumado
    // (`.final`, default 100 = sin bonus), no el delta; sin `1 +` (double-contaría).
    // reload_time es dato puro del arma — vive en innate_dna, no en AttributeNode.
    const base_reload = entity.innate_dna?.profiles?.[context.active_profile_id]?.['reload_time']
      ?? entity.innate_dna?.profiles?.['base']?.['reload_time']
      ?? 1.0;
    const reload_bonus = attrs["WEAPON_ADD_RELOAD_SPEED"]?.final ?? 100;
    const final_reload_time = finalReloadTime(base_reload, reload_bonus);

    // DPS del Arsenal (primitivas `formulas/weapon/dps.ts`, P4).
    const damage_per_shot = averageShot(total_base_damage, avg_crit_mult, multishot);
    const { burst: burst_dps, sustained: sustained_dps } = weaponDps({
      damagePerShot: damage_per_shot, fireRate: fire_rate, magSize: mag_size, multishot, reloadTime: final_reload_time,
    });

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
