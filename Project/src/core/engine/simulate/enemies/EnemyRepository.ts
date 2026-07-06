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

// ─── Curva-S de escalado (post Update 27.2) ────────────────────────────────────────
// Coeficientes de HEALTH por facción, de references/wiki/mechanics/enemy-level-scaling.md.
// Cada región (`below` nivel<70 rápido / `above` nivel>80 lento) = { c: coef, e: exponente }.
type SCoef = { below: { c: number; e: number }; above: { c: number; e: number } };

const HEALTH_COEF: Record<string, SCoef> = {
  Grineer:   { below: { c: 0.015,  e: 2.12 }, above: { c: 10.7332, e: 0.72  } },
  Scaldra:   { below: { c: 0.015,  e: 2.12 }, above: { c: 10.7332, e: 0.72  } },
  Corpus:    { below: { c: 0.015,  e: 2.12 }, above: { c: 13.4165, e: 0.55  } },
  Infested:  { below: { c: 0.0225, e: 2.12 }, above: { c: 16.1,    e: 0.72  } },
  Corrupted: { below: { c: 0.015,  e: 2.1  }, above: { c: 10.7332, e: 0.685 } },
  Sentient:  { below: { c: 0.015,  e: 2.0  }, above: { c: 10.7332, e: 0.5   } },
  Techrot:   { below: { c: 0.02,   e: 2.12 }, above: { c: 15.1,    e: 0.7   } },
};

// Armadura: fórmula ÚNICA para todas las facciones (no depende de faction ni de armor_type).
const ARMOR_COEF: SCoef = { below: { c: 0.005, e: 1.75 }, above: { c: 0.4, e: 0.75 } };

const ARMOR_CAP = 2700;   // tope duro (√(3·2700)/100 = 90% DR).
const ARMOR_FLOOR = 200;  // piso para unidades CON armadura (armor>0), tras escalar. Wiki gadget.

/**
 * Damage Reduction desde armor: `DR = √(3·armor)/100` (capado 90% vía ARMOR_CAP). Fórmula del
 * calculador del wiki (`ext.gadget.enemyinfoboxslider`) — la fuente más honesta hoy (la que usa la
 * wiki + la comunidad). **PROVISIONAL — `OQ-ENGINE-15`**: conflicto de 3 vías en la wiki (esta vs
 * `0.9·AR/2700` lineal vs `AR/(AR+300)` viejo); se confirma/tira contra un popup real en el contraste #1.
 */
export function damageReductionFromArmor(armor: number): number {
  return Math.sqrt(3 * armor) / 100;
}

/**
 * Multiplicador piecewise de la curva-S. La región se elige por **Δx (diferencia de nivel)**, NO por
 * nivel absoluto: Δx<70 crece rápido, Δx>80 lento. 70-80 = **smoothstep** `S = 3T²−2T³` con
 * `T = (Δx−70)/10` (wiki, no lineal). Ver references/wiki/mechanics/enemy-level-scaling.md.
 */
function scaleMult(coef: SCoef, dx: number): number {
  if (dx <= 0) return 1;
  const below = 1 + coef.below.c * Math.pow(dx, coef.below.e);
  const above = 1 + coef.above.c * Math.pow(dx, coef.above.e);
  if (dx < 70) return below;
  if (dx > 80) return above;
  const t = (dx - 70) / 10;
  const s = 3 * t * t - 2 * t * t * t;
  return below + (above - below) * s;
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
   * Escala un enemigo por la curva-S real (post Update 27.2, `enemy-level-scaling.md`). Reemplaza
   * el stub cuadrático previo (`B×(1+Δx²·0.015)` para todo nivel — sobre-estimaba ~34% @215).
   * Health = por facción; armor = fórmula única (cap 2700). ⚠️ Gaps flagueados: escalado de SHIELDS
   * aún no poblado (los enemigos con escudo escalan mal); interpolación 70-80 aproximada; min-200 de
   * armor no aplicado. Nuestro primer target (Arid Butcher @215) no ejercita ninguno.
   */
  public static scale(dna: EnemyDNA, level: number): ScaledEnemy {
    const dx = Math.max(0, level - dna.base_level);
    const healthCoef = HEALTH_COEF[dna.faction] ?? HEALTH_COEF.Grineer;

    const current_health = dna.health * scaleMult(healthCoef, dx);

    // Armor: escala → floor a entero → clamp [200, 2700] SOLO si la unidad tiene armadura (armor>0).
    // El floor min-200 es lo que hacía que Arid Butcher (116.9 escalado) mostrara 200 en el calculador.
    let current_armor = Math.floor(dna.armor * scaleMult(ARMOR_COEF, dx));
    if (current_armor > 0) {
      current_armor = Math.min(ARMOR_CAP, current_armor);
      current_armor = Math.max(ARMOR_FLOOR, current_armor);
    }

    return {
      dna,
      current_level: level,
      current_health,
      current_armor,
      current_shields: dna.shields, // ⚠️ sin escalar aún — gap (Arid Butcher = 0 shields)
    };
  }
}
