import { RngProvider } from "./RngProvider";

export interface AtomicRoll {
  tier: number;
  multiplier: number;
}

/**
 * AtomicSimulator - Especialista en resolución estocástica y distribuciones.
 * Encargado de convertir atributos porcentuales en eventos discretos (Pellets, Crits).
 */
export class AtomicSimulator {
  /**
   * Calcula la distribución de Tiers de Crítico.
   * Basado en la ley de Warframe v3.0.
   */
  public static calculateCritDistribution(critChance: number): Record<number, number> {
    const cc = critChance / 100;
    const base_tier = Math.floor(cc);
    const extra_prob = cc - base_tier;
    
    const distribution: Record<number, number> = {};
    
    if (extra_prob > 0) {
      distribution[base_tier] = 1 - extra_prob;
      distribution[base_tier + 1] = extra_prob;
    } else {
      distribution[base_tier] = 1.0;
    }
    
    return distribution;
  }

  /**
   * Calcula el multiplicador de daño promedio para un disparo basado en su distribución.
   */
  public static calculateAverageMultiplier(critChance: number, critMult: number): number {
    const dist = this.calculateCritDistribution(critChance);
    let avg = 0;
    
    Object.entries(dist).forEach(([tier, prob]) => {
      // Ley: Damage = Base * (1 + Tier * (CD - 1))
      avg += prob * (1 + Number(tier) * (critMult - 1));
    });
    
    return avg;
  }

  public static readonly HYBRID_THRESHOLD = 20;

  /**
   * Generates a burst of individual pellets (Atomic Mode).
   */
  public static rollPellets(multishot: number, critChance: number, rng: RngProvider): AtomicRoll[] {
    const { base, extra_prob } = this.calculatePelletCount(multishot);
    const totalPellets = base + (rng.roll(extra_prob) ? 1 : 0);
    
    const rolls: AtomicRoll[] = [];
    const cc = critChance / 100;

    for (let i = 0; i < totalPellets; i++) {
      const tier = Math.floor(cc) + (rng.roll(cc % 1) ? 1 : 0);
      rolls.push({ tier, multiplier: 0 }); // Multiplier resolved during combat
    }

    return rolls;
  }

  /**
   * Determina la cantidad de perdigones proactivos para un disparo.
   */
  public static calculatePelletCount(multishot: number): { base: number, extra_prob: number } {
    return {
      base: Math.floor(multishot),
      extra_prob: multishot - Math.floor(multishot)
    };
  }
}
