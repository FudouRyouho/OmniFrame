/**
 * @domain Simulation-v2 / Logic / Combat
 * @status en-desarrollo
 */
import type { SimulationEntity } from "../contracts";

export interface StatusEffectProjection {
  type: string;
  damage_per_tick: number;
  duration: number;
  ticks: number;
}

/**
 * StatusEngine - Responsable de proyectar el comportamiento de los efectos de estado.
 * Implementa las leyes físicas de los Procs (Slash, Toxin, Gas).
 */
export class StatusEngine {
  /**
   * Proyecta el daño de un tick de Cortante (Slash).
   * Ley: 35% del Daño Base Modificado por el multiplicador de crítico.
   * Nota: Ignora el daño elemental del arma.
   */
  public static projectSlashTick(weapon: SimulationEntity, avg_crit_mult: number): StatusEffectProjection {
    const attrs = weapon.attributes;
    const base_damage_node = attrs["WEAPON_DAMAGE"];
    const faction_node = attrs["FACTION_DAMAGE"];
    const innate_total = this.calculateInnateTotal(weapon);
    const faction_mult = faction_node ? (faction_node.final / 100) : 1.0;
    
    // Ley: 35% del daño base modificado
    const damage_per_tick = 0.35 * (innate_total * (base_damage_node.final / 100)) * avg_crit_mult * faction_mult;

    return { type: "damage_slash_proc", damage_per_tick, duration: 6, ticks: 7 };
  }

  public static projectHeatTick(weapon: SimulationEntity, avg_crit_mult: number): StatusEffectProjection {
    const attrs = weapon.attributes;
    const faction_node = attrs["FACTION_DAMAGE"];
    const element_node = attrs["damage_heat"];
    
    const innate_total = this.calculateInnateTotal(weapon);
    const faction_mult = faction_node ? (faction_node.final / 100) : 1.0;
    
    // Ley Calor: 50% * BaseModificado * (1 + Heat_Mods) * Crit * Faction^2
    // El element_node.final ya incluye (Base * BaseMod * HeatMod). 
    // Para obtener solo el escalado, usamos el nodo de calor directamente.
    const heat_power = (element_node?.final || 0) / (element_node?.base || 1);
    const damage_per_tick = 0.5 * innate_total * heat_power * avg_crit_mult * faction_mult;

    return { type: "damage_heat_proc", damage_per_tick, duration: 6, ticks: 7 };
  }

  public static projectToxinTick(weapon: SimulationEntity, avg_crit_mult: number): StatusEffectProjection {
    const attrs = weapon.attributes;
    const faction_node = attrs["FACTION_DAMAGE"];
    const element_node = attrs["damage_toxin"];
    
    const innate_total = this.calculateInnateTotal(weapon);
    const faction_mult = faction_node ? (faction_node.final / 100) : 1.0;
    
    // Ley Toxina: 50% * BaseModificado * (1 + Toxin_Mods) * Crit * Faction^2
    const toxin_power = (element_node?.final || 0) / (element_node?.base || 1);
    const damage_per_tick = 0.5 * innate_total * toxin_power * avg_crit_mult * faction_mult;

    return { type: "damage_toxin_proc", damage_per_tick, duration: 6, ticks: 7 };
  }

  private static calculateInnateTotal(entity: SimulationEntity): number {
    // IMPORTANTE: Extraemos el daño directamente del ADN innato (sin mods IPS).
    if (!entity.innate_dna || !entity.innate_dna.profiles) return 0;
    
    const base_attributes = entity.innate_dna.profiles.base || {};
    
    return Object.entries(base_attributes)
      .filter(([id]) => id === 'damage_impact' || id === 'damage_puncture' || id === 'damage_slash')
      .reduce((acc, [_, val]) => acc + (val ?? 0), 0);
  }
}
