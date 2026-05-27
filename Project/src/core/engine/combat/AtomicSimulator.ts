import { RngProvider } from "./RngProvider";
import { resolveCritTier, averageCritMultiplier } from "../formulas/common/crit-base";

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
    const { guaranteedTier, chanceToNextTier } = resolveCritTier(critChance / 100);
    const distribution: Record<number, number> = {};

    if (chanceToNextTier > 0) {
      distribution[guaranteedTier] = 1 - chanceToNextTier;
      distribution[guaranteedTier + 1] = chanceToNextTier;
    } else {
      distribution[guaranteedTier] = 1.0;
    }

    return distribution;
  }

  /**
   * Calcula el multiplicador de daño promedio para un disparo.
   */
  public static calculateAverageMultiplier(critChance: number, critMult: number): number {
    return averageCritMultiplier(critChance / 100, critMult);
  }

  public static readonly HYBRID_THRESHOLD = 20;

  /**
   * Generates a burst of individual pellets (Atomic Mode).
   */
  public static rollPellets(multishot: number, critChance: number, rng: RngProvider): AtomicRoll[] {
    const { base, extra_prob } = this.calculatePelletCount(multishot);
    const totalPellets = base + (rng.roll(extra_prob) ? 1 : 0);
    
    const rolls: AtomicRoll[] = [];
    const { guaranteedTier, chanceToNextTier } = resolveCritTier(critChance / 100);

    for (let i = 0; i < totalPellets; i++) {
      const tier = guaranteedTier + (rng.roll(chanceToNextTier) ? 1 : 0);
      rolls.push({ tier, multiplier: 0 });
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
