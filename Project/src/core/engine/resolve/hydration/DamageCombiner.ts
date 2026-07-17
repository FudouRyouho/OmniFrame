/**
 * @domain Simulation-v2 / Logic / Damage
 * @status en-desarrollo
 */

import { damageTypeFromToken, damageTokenFromType } from "../../contracts/damage-logic";
import { PRIMARY_ELEMENTS, resolveElementalCombination } from "../../formulas/common/status-base";

export interface ElementalMod {
  type: string; // AttributeId / token D-6 (e.g. "WEAPON_ADD_HEAT_DAMAGE")
  percentage: number; // e.g. 90 for +90%
  index: number;
}

export const PHYSICAL_TYPES = ["WEAPON_ADD_IMPACT_DAMAGE", "WEAPON_ADD_PUNCTURE_DAMAGE", "WEAPON_ADD_SLASH_DAMAGE"];

/** Adaptadores token↔type sobre la ley SSoT (`formulas/common/status-base`). */
function isPrimaryElement(token: string): boolean {
  const type = damageTypeFromToken(token);
  return type !== null && PRIMARY_ELEMENTS.has(type);
}

function combineElementTokens(tokenA: string, tokenB: string): string | null {
  const a = damageTypeFromToken(tokenA);
  const b = damageTypeFromToken(tokenB);
  if (!a || !b) return null;
  const result = resolveElementalCombination(new Set([a, b]));
  return result ? damageTokenFromType(result) : null;
}

export class DamageCombiner {
  /**
   * Combina elementos primarios basándose en la jerarquía de slots de Warframe.
   */
  public static combine(
    innateDamage: Record<string, number>,
    mods: ElementalMod[]
  ): Record<string, number> {
    const finalDamage: Record<string, number> = {};
    const innateCopy = { ...innateDamage };
    
    // Calcular el daño base total para escalar los mods elementales
    const totalBaseDamage = Object.values(innateDamage).reduce((acc, val) => acc + val, 0);

    // 1. Clasificar mods por índice
    const sortedMods = [...mods].sort((a, b) => a.index - b.index);
    
    // 2. Cola de elementos primarios para combinación
    const primaryQueue: { type: string; value: number }[] = [];
    
    sortedMods.forEach(mod => {
      // -- LEY FÍSICA --
      if (PHYSICAL_TYPES.includes(mod.type)) {
        // Los mods físicos solo escalan su tipo innato: Innate_Type * (Percentage / 100)
        const innateVal = innateDamage[mod.type] || 0;
        finalDamage[mod.type] = (finalDamage[mod.type] || 0) + (innateVal * mod.percentage) / 100;
        return;
      }

      // -- LEY ELEMENTAL --
      if (isPrimaryElement(mod.type)) {
        let valueToAdd = (totalBaseDamage * mod.percentage) / 100;
        
        // Si el arma tiene el mismo tipo innato, se "fusiona" en este slot
        if (innateCopy[mod.type] !== undefined) {
          valueToAdd += innateCopy[mod.type]!;
          delete innateCopy[mod.type];
        }
        primaryQueue.push({ type: mod.type, value: valueToAdd });
      } else {
        // Elementos ya combinados escalan del daño base total
        finalDamage[mod.type] = (finalDamage[mod.type] || 0) + (totalBaseDamage * mod.percentage) / 100;
      }
    });

    // 3. Consolidar elementos duplicados (Ej. dos mods de Toxina se suman antes de combinar)
    const consolidatedQueue: { type: string; value: number }[] = [];
    const tempMap: Record<string, number> = {};
    
    primaryQueue.forEach(p => {
      tempMap[p.type] = (tempMap[p.type] || 0) + p.value;
    });

    // Mantener el orden original de aparición para la combinación
    const seen = new Set<string>();
    primaryQueue.forEach(p => {
      if (!seen.has(p.type)) {
        consolidatedQueue.push({ type: p.type, value: tempMap[p.type] });
        seen.add(p.type);
      }
    });

    // Añadir el daño innato al final si no fue absorbido
    Object.entries(innateCopy).forEach(([type, value]) => {
      if (isPrimaryElement(type)) {
        consolidatedQueue.push({ type, value: value! });
      } else {
        finalDamage[type] = (finalDamage[type] || 0) + value!;
      }
    });

    // 4. Algoritmo de Combinación de Pares
    let i = 0;
    while (i < consolidatedQueue.length) {
      const first = consolidatedQueue[i];
      const second = consolidatedQueue[i + 1];

      if (second) {
        const resultType = combineElementTokens(first.type, second.type);

        if (resultType) {
          finalDamage[resultType] = (finalDamage[resultType] || 0) + first.value + second.value;
          i += 2;
          continue;
        }
      }
      
      finalDamage[first.type] = (finalDamage[first.type] || 0) + first.value;
      i++;
    }

    return finalDamage;
  }
}
