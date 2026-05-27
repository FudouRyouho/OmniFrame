/**
 * @domain Simulation-v2 / Logic / Combat
 * @status en-desarrollo
 */
import type { SimulationEntity } from "../contracts";
import type { EnemyState } from "../enemies/EnemyState";
import { DAMAGE_EFFICIENCY } from "../contracts/damage-multipliers";
import { AtomicSimulator, type AtomicRoll } from "./AtomicSimulator";
import { RngProvider } from "./RngProvider";
import { isWeaponDamageToken } from "../contracts/damage-logic";

export interface HitResolution {
  total_damage: number;
  shield_damage: number;
  health_damage: number;
  breakdown: Record<string, number>;
}

/**
 * CombatSimulator - Resuelve la interacción física entre Daño y Resistencia del Objetivo.
 */
export class CombatSimulator {
  /**
   * Simula un ataque completo (incluyendo Multishot) contra un objetivo.
   * Utiliza el Modo Híbrido (Atómico vs Bulk) basado en la densidad de perdigones.
   */
  public static simulateAttack(entity: SimulationEntity, targetState: EnemyState, currentTime: number = 0, rng: RngProvider = new RngProvider()): HitResolution {
    const attrs = entity.attributes;
    const multishot  = attrs["WEAPON_ADD_MULTISHOT"]?.final || 1.0;
    const critChance = attrs["WEAPON_ADD_CRIT_CHANCE"]?.final || 0;
    const critMult   = attrs["WEAPON_ADD_CRIT_MULT"]?.final || 1.0;

    // 1. Obtener Mapa de Daño Base (por proyectil)
    const baseDamageMap: Record<string, number> = {};
    Object.entries(attrs)
      .filter(([id]) => isWeaponDamageToken(id))
      .forEach(([id, node]: [string, any]) => {
        baseDamageMap[id] = node.final;
      });

    // 2. ¿Modo Atómico o Modo Bulk?
    if (multishot <= AtomicSimulator.HYBRID_THRESHOLD) {
      // Modo Atómico: Cada perdigón es independiente
      const pellets = AtomicSimulator.rollPellets(multishot, critChance, rng);
      
      const aggregated: HitResolution = { total_damage: 0, shield_damage: 0, health_damage: 0, breakdown: {} };

      pellets.forEach((p: AtomicRoll) => {
        const pCritMult = 1 + p.tier * (critMult - 1);
        const pDamageMap: Record<string, number> = {};
        Object.entries(baseDamageMap).forEach(([type, dmg]) => {
          pDamageMap[type] = dmg * pCritMult;
        });

        const res = this.resolveHit(pDamageMap, targetState, currentTime);
        aggregated.total_damage += res.total_damage;
        aggregated.shield_damage += res.shield_damage;
        aggregated.health_damage += res.health_damage;
        
        Object.entries(res.breakdown).forEach(([type, dmg]) => {
          aggregated.breakdown[type] = (aggregated.breakdown[type] || 0) + dmg;
        });
      });

      return aggregated;
    } else {
      // Modo Bulk: Usar Valor Esperado (EV)
      const avgCrit = AtomicSimulator.calculateAverageMultiplier(critChance, critMult);
      const bulkDamageMap: Record<string, number> = {};
      Object.entries(baseDamageMap).forEach(([type, dmg]) => {
        bulkDamageMap[type] = dmg * avgCrit * multishot;
      });

      return this.resolveHit(bulkDamageMap, targetState, currentTime);
    }
  }

  /**
   * Resuelve un único impacto contra el estado actual de un enemigo.
   */
  public static resolveHit(damageMap: Record<string, number>, targetState: EnemyState, currentTime: number = 0): HitResolution {
    const breakdown: Record<string, number> = {};
    let totalShieldDamage = 0;
    let totalHealthDamage = 0;

    const armorType = targetState.base.dna.armor_type;
    const healthType = targetState.base.dna.health_type;
    const shieldType = targetState.base.dna.shield_type === "None" ? "Shield" : targetState.base.dna.shield_type;
    const effectiveArmor = targetState.getEffectiveArmor(currentTime);
    const hasShields = targetState.current_shields > 0;

    Object.entries(damageMap).forEach(([type, damage]) => {
      const stateMultiplier = targetState.getDamageMultiplier(type);
      
      // 1. ¿A qué capa golpea este tipo de daño?
      const isBypassingShields = type === 'WEAPON_ADD_TOXIN_DAMAGE';
      const hitsShields = hasShields && !isBypassingShields;

      // 2. Obtener Eficiencias según la capa
      let layerEfficiency = 0;
      if (hitsShields) {
        layerEfficiency = DAMAGE_EFFICIENCY[type]?.[shieldType] || 0;
      } else {
        const healthEfficiency = DAMAGE_EFFICIENCY[type]?.[healthType] || 0;
        const armorEfficiency = (armorType !== "None") ? (DAMAGE_EFFICIENCY[type]?.[armorType] || 0) : 0;
        layerEfficiency = healthEfficiency + armorEfficiency;
      }

      // 3. Calcular Multiplicador de Tipo
      const typeMultiplier = 1 + layerEfficiency;

      // 4. Calcular Mitigación (Armadura solo afecta a Salud, no a Escudos)
      let dr = 0;
      if (!hitsShields && effectiveArmor > 0) {
        // En Warframe, si el elemento es fuerte contra la armadura, ignora parte de ella
        const armorMultiplier = (armorType !== "None") ? (DAMAGE_EFFICIENCY[type]?.[armorType] || 0) : 0;
        const armorBypass = armorMultiplier > 0 ? armorMultiplier : 0;
        const netArmor = Math.max(0, effectiveArmor * (1 - armorBypass));
        dr = netArmor / (netArmor + 300);
      }

      const finalDamage = damage * stateMultiplier * typeMultiplier * (1 - dr);
      
      if (hitsShields) {
        totalShieldDamage += finalDamage;
      } else {
        totalHealthDamage += finalDamage;
      }

      breakdown[type] = finalDamage;
    });

    return { 
      total_damage: totalShieldDamage + totalHealthDamage, 
      shield_damage: totalShieldDamage,
      health_damage: totalHealthDamage,
      breakdown 
    };
  }
}
