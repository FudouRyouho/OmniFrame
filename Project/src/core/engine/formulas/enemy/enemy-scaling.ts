/**
 * @domain Engine / Formulas / Enemy / Scaling
 * @SSoT docs/domains/engine/formula-overview.md
 *
 * Ley de escalado de enemigos por nivel (curva-S post Update 27.2). Matemática pura: números→números,
 * sin acoplamiento a tipos de dominio (`EnemyDNA`/`ScaledEnemy`). La composición vs. la entidad (leer
 * `dna`, ensamblar `ScaledEnemy`) es responsabilidad del orquestador `EnemyRepository.scale`.
 *
 * Los coeficientes son **parámetros intrínsecos de la ley** (de references/wiki/mechanics/
 * enemy-level-scaling.md), NO datos de un dominio externo → co-locados con la fórmula (precedente:
 * `common/status-base.ts` co-loca `ELEMENT_COMBINATIONS`).
 */

// ─── Curva-S de escalado (post Update 27.2) ────────────────────────────────────────
// Cada región (`below` Δnivel<70 rápido / `above` Δnivel>80 lento) = { c: coef, e: exponente }.
type SCoef = { below: { c: number; e: number }; above: { c: number; e: number } };

// Coeficientes de HEALTH por facción.
const HEALTH_COEF: Record<string, SCoef> = {
  Grineer:   { below: { c: 0.015,  e: 2.12 }, above: { c: 10.7332, e: 0.72  } },
  Scaldra:   { below: { c: 0.015,  e: 2.12 }, above: { c: 10.7332, e: 0.72  } },
  Corpus:    { below: { c: 0.015,  e: 2.12 }, above: { c: 13.4165, e: 0.55  } },
  Infested:  { below: { c: 0.0225, e: 2.12 }, above: { c: 16.1,    e: 0.72  } },
  Orokin:    { below: { c: 0.015,  e: 2.1  }, above: { c: 10.7332, e: 0.685 } },
  Sentient:  { below: { c: 0.015,  e: 2.0  }, above: { c: 10.7332, e: 0.5   } },
  Techrot:   { below: { c: 0.02,   e: 2.12 }, above: { c: 15.1,    e: 0.7   } },
};

// Armadura: fórmula ÚNICA para todas las facciones (no depende de faction ni de armor_type).
const ARMOR_COEF: SCoef = { below: { c: 0.005, e: 1.75 }, above: { c: 0.4, e: 0.75 } };

const ARMOR_CAP = 2700;   // tope duro (√(3·2700)/100 = 90% DR).
const ARMOR_FLOOR = 200;  // piso para unidades CON armadura (armor>0), tras escalar. Wiki gadget.

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

/** HEALTH escalada por facción (fallback Grineer si la facción no está tabulada). `dx` = Δnivel ≥ 0. */
export function scaleHealth(base: number, faction: string, dx: number): number {
  const healthCoef = HEALTH_COEF[faction] ?? HEALTH_COEF.Grineer;
  return base * scaleMult(healthCoef, dx);
}

/**
 * ARMOR escalada: escala → floor a entero → clamp [200, 2700] SOLO si la unidad tiene armadura
 * (armor>0). El floor min-200 es lo que hace que Arid Butcher (116.9 escalado) muestre 200 en el
 * calculador. `dx` = Δnivel ≥ 0.
 */
export function scaleArmor(base: number, dx: number): number {
  let armor = Math.floor(base * scaleMult(ARMOR_COEF, dx));
  if (armor > 0) {
    armor = Math.min(ARMOR_CAP, armor);
    armor = Math.max(ARMOR_FLOOR, armor);
  }
  return armor;
}
