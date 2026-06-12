/**
 * @domain Simulation-v2 / Logic / Combat
 * @status en-desarrollo
 */

export type HealthType = "Health" | "Flesh" | "ClonedFlesh" | "Fossilized" | "Robotic" | "Infested" | "InfestedFlesh" | "InfestedSinew" | "Machinery";
export type ArmorType = "None" | "FerriteArmor" | "AlloyArmor";
export type ShieldType = "None" | "Shields" | "ProtoShield";

/**
 * ADN de un Enemigo básico.
 */
export interface EnemyDNA {
  unique_name: string;
  base_level: number;
  health: number;
  health_type: HealthType;
  armor: number;
  armor_type: ArmorType;
  shields: number;
  shield_type: ShieldType;
  faction: string;
}

/**
 * Estado escalado de un enemigo en un nivel específico.
 */
export interface ScaledEnemy {
  dna: EnemyDNA;
  current_level: number;
  current_health: number;
  current_armor: number;
  current_shields: number;
}

/**
 * Repositorio de Enemigos Estáticos (Similares a warframe-items).
 */
export class EnemyRepository {
  private static registry: Map<string, EnemyDNA> = new Map();

  public static register(dna: EnemyDNA) {
    this.registry.set(dna.unique_name, dna);
  }

  public static find(name: string): EnemyDNA | null {
    return this.registry.get(name) || null;
  }

  /**
   * Escala un enemigo según las fórmulas de Warframe v3.0 (Post-Rework de Salud/Armadura).
   */
  public static scale(dna: EnemyDNA, level: number): ScaledEnemy {
    // Fórmulas simplificadas de escalado (Placeholder para la Fase 3)
    const levelDiff = Math.max(0, level - dna.base_level);
    
    // Escalado de Salud (S = B * (1 + L^2 * 0.015))
    const scaledHealth = dna.health * (1 + Math.pow(levelDiff, 2) * 0.015);
    
    // Escalado de Armadura (A = B * (1 + L^1.75 * 0.005))
    const scaledArmor = dna.armor * (1 + Math.pow(levelDiff, 1.75) * 0.005);

    return {
      dna,
      current_level: level,
      current_health: scaledHealth,
      current_armor: scaledArmor,
      current_shields: dna.shields
    };
  }
}
