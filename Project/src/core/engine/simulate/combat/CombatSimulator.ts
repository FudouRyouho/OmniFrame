/**
 * @domain Simulation-v2 / Logic / Combat
 * @status en-desarrollo
 */
import type { SimulationEntity } from "../../contracts";
import type { EnemyState } from "../enemies/EnemyState";
import { targetFactionMult } from "../../contracts/damage-multipliers";
import { damageReductionFromArmor } from "../../formulas/enemy/armor-mitigation";
import { AtomicSimulator, type AtomicRoll } from "./AtomicSimulator";
import { RngProvider } from "./RngProvider";
import { isWeaponDamageToken, bypassesShields, bypassesArmorAndMatrix } from "../../contracts/damage-logic";

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
   * Resuelve UN evento de daño (un token D-6) contra el estado actual de un enemigo — el átomo de
   * RESOLUCIÓN, **AGNÓSTICO AL ORIGEN**: lo comparten el hit directo (`resolveHit`, una vez por tipo)
   * y el tick de un proc DoT (`EnemyState`, que emite `Resolucion{value, as}` → token). Todas las
   * reglas se derivan del CANÓNICO keyeadas por el token: bypass de shields (Toxin), bypass de
   * armor/matriz③ de True (`as:'true'` del bleed), DR, y el multiplicador de capa (Viral/Magnetic).
   * La emisión declara CON QUÉ tipo resuelve — sin opt ad-hoc. Ver `contracts/damage-logic.ts`.
   */
  public static resolveDamageEvent(
    damageToken: string,
    damage: number,
    targetState: EnemyState,
    currentTime: number = 0,
  ): { hitsShields: boolean; finalDamage: number } {
    const effectiveArmor = targetState.getEffectiveArmor(currentTime);
    const hasShields = targetState.current_shields > 0;
    // True (ej. el token `WEAPON_ADD_TRUE_DAMAGE` del bleed): bypasea armor/matriz③, NO el layer-mult.
    const bypassArmorMatrix = bypassesArmorAndMatrix(damageToken);

    const hitsShields = hasShields && !bypassesShields(damageToken);            // Toxin bypasea shields
    const stateMultiplier = targetState.getDamageMultiplier(hitsShields, currentTime);
    const typeMultiplier = bypassArmorMatrix ? 1 : targetFactionMult(damageToken, targetState.base.dna.faction);
    const dr = (!bypassArmorMatrix && !hitsShields && effectiveArmor > 0) ? damageReductionFromArmor(effectiveArmor) : 0;

    return { hitsShields, finalDamage: damage * stateMultiplier * typeMultiplier * (1 - dr) };
  }

  /**
   * Resuelve un único impacto (todos los tipos de daño de un hit) contra el estado actual de un
   * enemigo. Delega la resolución por-tipo a `resolveDamageEvent`.
   */
  public static resolveHit(damageMap: Record<string, number>, targetState: EnemyState, currentTime: number = 0): HitResolution {
    const breakdown: Record<string, number> = {};
    let totalShieldDamage = 0;
    let totalHealthDamage = 0;

    Object.entries(damageMap).forEach(([type, damage]) => {
      const { hitsShields, finalDamage } = this.resolveDamageEvent(type, damage, targetState, currentTime);

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
