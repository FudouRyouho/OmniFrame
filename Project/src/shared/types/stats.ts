import type { DamageMap, WeaponAttack } from './damage';

/**
 * Estadísticas de combate (para armas y ataques).
 */
export interface CombatStats {
  damage: DamageMap;
  total_damage: number;
  crit_chance: number;
  crit_mult: number;
  status_chance: number;
  
  fire_rate?: number;
  magazine_size?: number;
  reload_time?: number;
  multishot?: number;
  accuracy?: number;
  noise?: string;
  trigger?: string;
  disposition?: number;
  
  range?: number;
  attack_speed?: number;
  combo_duration?: number;
  follow_through?: number;
  blocking_angle?: number;
  
  attacks?: WeaponAttack[];
}

/**
 * Estadísticas de supervivencia (para Warframes, Compañeros, Vehículos).
 */
export interface LivingStats {
  health: number;
  shield: number;
  armor: number;
  energy?: number;
  sprint_speed?: number;
}

/**
 * Estadísticas de Mods.
 */
export interface ModStats {
  base_drain: number;
  rank: number;
  upgrade_types: string[];
  level_stats?: Array<{ stats?: string[] | null }>;
}
