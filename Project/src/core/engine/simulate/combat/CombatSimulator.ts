/**
 * @domain Simulation-v2 / Logic / Combat
 * @status en-desarrollo
 */
import type { EnemyState } from "../enemies/EnemyState";
import type { DamageInstance } from "./damage-instance";
import { targetFactionMult } from "../../contracts/damage-multipliers";
import { damageReductionFromArmor } from "../../formulas/enemy/armor-mitigation";
import { tennoDamageReductionFromArmor } from "../../formulas/warframe/armor-mitigation";
import { AtomicSimulator, type AtomicRoll } from "./AtomicSimulator";
import { RngProvider } from "./RngProvider";
import { bypassesArmorAndMatrix } from "../../contracts/damage-logic";
import { layerFor, type Layer } from "../../contracts/layers";

/**
 * La ley de mitigación por armadura **por clase de portador**. Las dos fórmulas conviven publicadas
 * en `references/wiki/mechanics/armor.md` y no comparten forma algebraica, así que esto es una
 * selección, no un parámetro. La familia la resuelve la **marca de ruteo** del participante — el
 * mismo mecanismo con el que `vitalsOf` resuelve con qué nombres leer sus vitales (`§18` en
 * dirección inversa).
 */
const ARMOR_MITIGATION_BY_FAMILY: Record<string, (armor: number) => number> = {
  enemy:  damageReductionFromArmor,          // `0.9·√(a/2700)` ≡ `√(3a)/100` — provisional, `OQ-ENGINE-15`
  avatar: tennoDamageReductionFromArmor,     // `a/(a+300)`
};

/**
 * Elige la ley de mitigación del portador. Una familia sin entrada **tira**: mitigar con la ley
 * equivocada devuelve un número creíble y falso —exactamente el modo de falla que ya costó una
 * medición— y un participante que llega hasta acá sin declarar su clase es un bug que tiene que sonar.
 */
function armorMitigationFor(target: EnemyState): (armor: number) => number {
  const family = target.entity.routes?.find((r) => r in ARMOR_MITIGATION_BY_FAMILY);
  if (!family) {
    throw new Error(
      `[resolución] el participante "${target.entity.id}" no declara ninguna familia con ley de ` +
        `mitigación — marcas: [${target.entity.routes?.join(", ") ?? "ninguna"}]. ` +
        `Familias conocidas: ${Object.keys(ARMOR_MITIGATION_BY_FAMILY).join(", ")}.`,
    );
  }
  return ARMOR_MITIGATION_BY_FAMILY[family];
}

export interface HitResolution {
  total_damage: number;
  /** Daño por capa de la pila — la partición completa (`contracts/layers.ts`). */
  by_layer: Partial<Record<Layer, number>>;
  /** Atajos de las dos capas con origen modelado. Derivados de `by_layer`, no fuentes propias. */
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
  public static simulateAttack(instance: DamageInstance, targetState: EnemyState, currentTime: number = 0, rng: RngProvider = new RngProvider()): HitResolution {
    // La Instancia (①②) ya trae el potencial modded por tipo + crit spec + multishot — C2 la CONSUME,
    // no re-extrae de `attributes` (seam C1→C2, `damage-instance.ts`). Multishot/crit se ejecutan acá (Hit).
    const { multishot, critChance: baseCritChance, critMult: baseCritMult, damageByToken: baseDamageMap } = instance;

    // Gancho OQ-ENGINE-12: el target debilitado buffea el crit del atacante — Weakened (Puncture) → +crit
    // chance, Freeze (Cold) → +crit damage. Leído LIVE del estado del target; ambos modos lo heredan.
    const critBonus = targetState.getCritBonuses(currentTime);
    const critChance = baseCritChance + critBonus.critChanceAdd;
    const critMult = baseCritMult + critBonus.critMultAdd;

    // 2. ¿Modo Atómico o Modo Bulk?
    if (multishot <= AtomicSimulator.HYBRID_THRESHOLD) {
      // Modo Atómico: Cada perdigón es independiente
      const pellets = AtomicSimulator.rollPellets(multishot, critChance, rng);
      
      const aggregated: HitResolution = { total_damage: 0, by_layer: {}, shield_damage: 0, health_damage: 0, breakdown: {} };

      pellets.forEach((p: AtomicRoll) => {
        const pCritMult = 1 + p.tier * (critMult - 1);
        const pDamageMap: Record<string, number> = {};
        Object.entries(baseDamageMap).forEach(([type, dmg]) => {
          pDamageMap[type] = dmg * pCritMult;
        });

        const res = this.resolveHit(pDamageMap, targetState, currentTime);
        aggregated.total_damage += res.total_damage;
        for (const [layer, dmg] of Object.entries(res.by_layer) as Array<[Layer, number]>) {
          aggregated.by_layer[layer] = (aggregated.by_layer[layer] ?? 0) + dmg;
        }
        aggregated.shield_damage = aggregated.by_layer.shield ?? 0;
        aggregated.health_damage = aggregated.by_layer.health ?? 0;

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
   * GAP deliberado: NO se modela la **cuantización** (`escala = base/32`, redondeo pre-multiplicadores;
   * `enemy-resistances.md §Orden de composición`) — error < 1 dígito %, no vale la complejidad hoy.
   */
  public static resolveDamageEvent(
    damageToken: string,
    damage: number,
    targetState: EnemyState,
    currentTime: number = 0,
  ): { layer: Layer; finalDamage: number } {
    const effectiveArmor = targetState.getEffectiveArmor(currentTime);
    // True (ej. el token `WEAPON_ADD_TRUE_DAMAGE` del bleed): bypasea armor/matriz③, NO el layer-mult.
    const bypassArmorMatrix = bypassesArmorAndMatrix(damageToken);

    // La capa la elige la PILA, preguntándole a cada una si deja pasar este daño — no el token
    // declarando qué saltea (`contracts/layers.ts`: la tabla es de la capa).
    const layer = layerFor(damageToken, targetState.layerAmounts);
    const stateMultiplier = targetState.getDamageMultiplier(layer, currentTime);
    const typeMultiplier = bypassArmorMatrix ? 1 : targetFactionMult(damageToken, targetState.faction);
    // El armor sólo mitiga la salud: no toca shields (`damage-calculation.md`) ni Overguard, al que
    // *"no le aplica la DR del armor"* (`overguard.md §Qué reducción de daño le aplica — y cuál no`).
    const dr = (!bypassArmorMatrix && layer === "health" && effectiveArmor > 0)
      ? armorMitigationFor(targetState)(effectiveArmor)
      : 0;

    return { layer, finalDamage: damage * stateMultiplier * typeMultiplier * (1 - dr) };
  }

  /**
   * Resuelve un único impacto (todos los tipos de daño de un hit) contra el estado actual de un
   * enemigo. Delega la resolución por-tipo a `resolveDamageEvent`.
   */
  public static resolveHit(damageMap: Record<string, number>, targetState: EnemyState, currentTime: number = 0): HitResolution {
    const breakdown: Record<string, number> = {};
    const by_layer: Partial<Record<Layer, number>> = {};
    let total = 0;

    Object.entries(damageMap).forEach(([type, damage]) => {
      const { layer, finalDamage } = this.resolveDamageEvent(type, damage, targetState, currentTime);
      by_layer[layer] = (by_layer[layer] ?? 0) + finalDamage;
      total += finalDamage;
      breakdown[type] = finalDamage;
    });

    return {
      total_damage: total,
      by_layer,
      shield_damage: by_layer.shield ?? 0,
      health_damage: by_layer.health ?? 0,
      breakdown
    };
  }
}
