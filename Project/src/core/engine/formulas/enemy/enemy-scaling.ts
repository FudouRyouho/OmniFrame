/**
 * @domain Engine / Formulas / Enemy / Scaling
 * @SSoT references/wiki/mechanics/enemy-level-scaling.md
 *
 * Ley de escalado de enemigos por nivel (curva-S post Update 27.2). Matemática pura: números→números,
 * sin acoplamiento a tipos de dominio. Leer el dato crudo y ensamblar el participante es del
 * orquestador, que es `ItemRepository.normalizeEnemy` — el **frame-0**: los tres vitales nacen ya
 * escalados y no se escalan después (`arch-decisions §19`).
 *
 * Los coeficientes son **parámetros intrínsecos de la ley** (de references/wiki/mechanics/
 * enemy-level-scaling.md), NO datos de un dominio externo → co-locados con la fórmula (precedente:
 * `common/status-base.ts` co-loca `ELEMENT_COMBINATIONS`).
 */

// ─── Curva-S de escalado (post Update 27.2) ────────────────────────────────────────
// Cada región (`below` Δnivel<70 rápido / `above` Δnivel>80 lento) = { c: coef, e: exponente }.
type SCoef = { below: { c: number; e: number }; above: { c: number; e: number } };

// Coeficientes de HEALTH por grupo de facción (enemy-level-scaling.md §Health). Facciones que comparten
// coef comparten valores. `Orokin` = grupo "Corrupted" del wiki (Corrupted es un tipo Void, no una
// facción propia). `Unaffiliated` = default documentado del wiki para facción no reconocida (NO Grineer).
// `Anarchs` comparte los coeficientes de `Orokin` en las DOS capas (health y shields), no por herencia
// de subfacción sino porque el módulo Lua que la propia wiki ejecuta (`Module:Enemies/infobox`) le da
// esos valores: la prosa que los agrupaba con Murmur/Sentient/Unaffiliated estaba mal y ya se retiró de
// la página. Fuente única ejecutable > prosa. Ver `OQ-ENGINE-21`.
const HEALTH_COEF: Record<string, SCoef> = {
  Grineer:      { below: { c: 0.015,  e: 2.12 }, above: { c: 10.7332, e: 0.72  } },
  Scaldra:      { below: { c: 0.015,  e: 2.12 }, above: { c: 10.7332, e: 0.72  } },
  Corpus:       { below: { c: 0.015,  e: 2.12 }, above: { c: 13.4165, e: 0.55  } },
  Infested:     { below: { c: 0.0225, e: 2.12 }, above: { c: 16.1,     e: 0.72  } },
  Orokin:       { below: { c: 0.015,  e: 2.1  }, above: { c: 10.7332, e: 0.685 } },
  Anarchs:      { below: { c: 0.015,  e: 2.1  }, above: { c: 10.7332, e: 0.685 } },
  Sentient:     { below: { c: 0.015,  e: 2.0  }, above: { c: 10.7332, e: 0.5   } },
  Murmur:       { below: { c: 0.015,  e: 2.0  }, above: { c: 10.7332, e: 0.5   } },
  Unaffiliated: { below: { c: 0.015,  e: 2.0  }, above: { c: 10.7332, e: 0.5   } },
  Techrot:      { below: { c: 0.02,   e: 2.12 }, above: { c: 15.0998, e: 0.7   } },
};

// SUBFACCIÓN → grupo de scaling. Una subfacción es una facción propia para el daño-vs-target
// (Kuva Grineer resiste Heat, Grineer no) pero comparte la CURVA de su base: el wiki no publica
// tablas separadas. Vive acá y no en el dato porque es agrupamiento de la ley, no del enemigo.
const SCALING_GROUP: Record<string, string> = {
  'Kuva Grineer': 'Grineer',
  'Corpus Amalgam': 'Corpus',
  'Infested Deimos': 'Infested',
  'The Murmur': 'Murmur',
};

/** Coeficiente de la facción, cayendo a su grupo si es subfacción, y al default si no hay fila. */
function coefFor(table: Record<string, SCoef>, faction: string, fallback: SCoef): SCoef {
  return table[faction] ?? table[SCALING_GROUP[faction]] ?? fallback;
}

// Coeficientes de SHIELDS por facción. Infested no tiene fila en la wiki (no llevan escudo — el
// `base=0` de esos enemigos hace el coef irrelevante en la práctica); fallback Grineer/Sentient.
const SHIELDS_COEF: Record<string, SCoef> = {
  Corpus:    { below: { c: 0.02, e: 1.76 }, above: { c: 2,   e: 0.76 } },
  Orokin:    { below: { c: 0.02, e: 1.75 }, above: { c: 2,   e: 0.75 } },
  Anarchs:   { below: { c: 0.02, e: 1.75 }, above: { c: 2,   e: 0.75 } },
  Grineer:   { below: { c: 0.02, e: 1.75 }, above: { c: 1.6, e: 0.75 } },
  Sentient:  { below: { c: 0.02, e: 1.75 }, above: { c: 1.6, e: 0.75 } },
  Techrot:   { below: { c: 0.02, e: 1.75 }, above: { c: 3.5, e: 0.76 } },
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

/**
 * HEALTH escalada por facción. Fallback = grupo **Unaffiliated** (el default del wiki para facción no
 * reconocida), NO Grineer. El `faction` que llega ya es canónico (cascada del generador, `OQ-DATA-15`
 * resuelta): caen al default sólo las entidades que el proyecto no modela (fauna), marcadas
 * `Unaffiliated` explícito en el dato. `dx` = Δnivel ≥ 0.
 */
export function scaleHealth(base: number, faction: string, dx: number): number {
  const healthCoef = coefFor(HEALTH_COEF, faction, HEALTH_COEF.Unaffiliated);
  return base * scaleMult(healthCoef, dx);
}

/**
 * SHIELDS escalados por facción. Sin floor/cap — a diferencia de armor, la wiki no documenta ninguno
 * para shields. El wiki tampoco documenta un grupo "Unaffiliated" para shields (a diferencia de health)
 * → el fallback Grineer es una elección de código, no un default del wiki (`OQ-DATA-15`). `dx` = Δnivel ≥ 0.
 */
export function scaleShields(base: number, faction: string, dx: number): number {
  const shieldsCoef = coefFor(SHIELDS_COEF, faction, SHIELDS_COEF.Grineer);
  return base * scaleMult(shieldsCoef, dx);
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
