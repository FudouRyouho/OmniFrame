/**
 * Derivación cross-stat — DOCUMENTO DE RESTRICCIONES EJECUTABLE (`OQ-ENGINE-24`).
 *
 * NO es cobertura de una feature, y NO prueba que el motor pueda hacer esto: prueba lo contrario.
 * Es el registro ejecutable de **por qué la clase "habilidad que lee un capacity-stat del propio
 * warframe" está diferida**, y de qué restricciones tendrá que respetar la solución cuando llegue.
 * Los `it.fails` SON el gap: asertan la verdad del juego y quedan rojos-esperados hasta que
 * `OQ-ENGINE-24` se resuelva. Si alguno se vuelve verde, el gap se cerró y hay que actualizar la OQ.
 *
 * Fixtures sintéticos hand-built (molde de `rhino.test.ts` Fase 1a): entidades y modifiers a mano,
 * SIN pasar por `AbilityRepository`. Prueban la CAPACIDAD del grafo aislada de la hidratación.
 *
 * Casos vehiculares, verificados contra `references/wiki/` (NO contra el override, que estaba
 * sembrado pre-pipeline):
 *   - Trinity pasiva — el mínimo de la clase: `ally_health += 0.5 × trinity_energy_max`
 *     (1 input, sin bracket, sin cap, sin strength).
 *   - Iron Skin — el máximo: `([1200 + 2.5 × TotalArmor] × Strength) + Absorbed`.
 *
 * Dato base: `warframes.json` → Trinity `energy: 175`, Rhino `armor: 240`. Los mods son hand-built
 * (mismo criterio que el `STRENGTH +154` del fixture de Roar).
 */
import { describe, it, expect } from 'vitest';
import { SimulationEngine } from '../resolve/SimulationEngine';
import { resolveStatValue } from '../formulas/weapon/stat-accumulator';
import { BASELINE_GAME_LAWS } from '../contracts';
import type { SimulationEntity, AttributeNode, AccumulatorModifier, SimulationContext } from '../contracts';

const node = (base: number): AttributeNode => ({
  base, base_flat: 0, mods_add_pct: 0, total_flat: 0, multiplicative: 1.0, final: base,
});

const CTX: SimulationContext = {
  active_profile_id: 'base', flags: {}, variables: {}, laws: BASELINE_GAME_LAWS,
};

const TRINITY_ENERGY_BASE = 175;  // warframes.json
const ALLY_HEALTH_BASE = 270;     // aliado Rhino-like (fixture_01)

// Verdad del juego (Trinity): energy = 175 × (1+1.50) = 437.5 → bonus = 0.5 × 437.5 = 218.75
const ENERGY_ESPERADA = 437.5;
const BONUS_ESPERADO = 218.75;

function synthTrinity(): SimulationEntity {
  return {
    id: 'trin', unique_name: 'trin', domain: 'warframe', kind: 'warframe', persistence: 'PE',
    tags: ['warframe'], attributes: { AVATAR_ADD_ENERGY_MAX: node(TRINITY_ENERGY_BASE) },
  };
}

function synthAlly(): SimulationEntity {
  return {
    id: 'ally', unique_name: 'ally', domain: 'warframe', kind: 'warframe', persistence: 'PE',
    tags: ['warframe'], attributes: { AVATAR_ADD_HEALTH_MAX: node(ALLY_HEALTH_BASE) },
  };
}

/** Flow-like: +150% al pool de energía de Trinity → 175 × 2.5 = 437.5. */
const FLOW: AccumulatorModifier = {
  id: 'flow', source_id: 'Mod:flow',
  target_entity: 'trin', target_attribute: 'AVATAR_ADD_ENERGY_MAX', operation: 'ADD', value: 150,
};

/** Shard-like: +20 flat al pool de energía (bucket distinto — post-escala, no amplificado). */
const SHARD: AccumulatorModifier = {
  id: 'shard', source_id: 'Shard:energy',
  target_entity: 'trin', target_attribute: 'AVATAR_ADD_ENERGY_MAX', operation: 'ADD_FLAT', value: 20,
};

/** La pasiva con la SEMÁNTICA NATURAL del dato de wiki: `value = 50` (el "50%"). */
const LIFEGIVER_NATURAL: AccumulatorModifier = {
  id: 'lifegiver', source_id: 'Passive:trinity',
  target_entity: 'ally', target_attribute: 'AVATAR_ADD_HEALTH_MAX', operation: 'ADD_FLAT', value: 50,
  source_entity: 'trin', source_attribute: 'AVATAR_ADD_ENERGY_MAX',
};

/** La misma pasiva con el `value` PRE-HORNEADO (`0.5 × source.base = 87.5`) para explotar la
 *  cancelación algebraica de `scaleFactor = final/base`: 87.5 × (final/175) = 0.5 × final. */
const LIFEGIVER_HORNEADO: AccumulatorModifier = {
  ...LIFEGIVER_NATURAL, id: 'lifegiver-baked', value: 0.5 * TRINITY_ENERGY_BASE,
};

function resolveWith(mods: AccumulatorModifier[]) {
  const engine = new SimulationEngine();
  const trin = synthTrinity();
  const ally = synthAlly();
  engine.addEntity(trin);
  engine.addEntity(ally);
  mods.forEach(m => engine.addModifier(m));
  engine.resolve(CTX);
  return { trin, ally, engine };
}

// ─── ✓ El terreno: lo que el grafo YA resuelve (no hay que construirlo) ─────────────

describe('cross-stat — terreno existente', () => {
  it('el pool de energía de Trinity resuelve normal: 175 × (1+1.5) = 437.5', () => {
    const { trin } = resolveWith([FLOW, LIFEGIVER_NATURAL]);
    expect(trin.attributes['AVATAR_ADD_ENERGY_MAX'].final).toBeCloseTo(ENERGY_ESPERADA, 5);
  });

  // La arista cross-entity y el orden topológico YA funcionan con un capacity-stat como source (no
  // sólo con strength). Se prueba invirtiendo el orden de INSERCIÓN — la pasiva antes que el mod que
  // la alimenta: si el resultado no cambia, lo ordena Kahn por la arista declarada, no la lista.
  it('Kahn ordena source→target cross-entity: el orden de inserción no altera el resultado', () => {
    const a = resolveWith([FLOW, LIFEGIVER_HORNEADO]).ally.attributes['AVATAR_ADD_HEALTH_MAX'].final;
    const b = resolveWith([LIFEGIVER_HORNEADO, FLOW]).ally.attributes['AVATAR_ADD_HEALTH_MAX'].final;
    expect(a).toBeCloseTo(b, 5);
  });
});

// ─── ✗ EL GAP — asertan la verdad del juego y quedan ROJOS hasta OQ-ENGINE-24 ───────

const RHINO_ARMOR_BASE = 240;
const OG_BASE = 1200;      // Base Overguard rank 3 (wiki)
const ARMOR_MULT = 2.5;    // Armor Multiplier rank 3 (wiki)

/** Rhino sintético con el landing-pad de Overguard + los dos nodos que Iron Skin lee. */
function rhinoIronSkin(mods: AccumulatorModifier[], strengthMod: number): SimulationEntity {
  const engine = new SimulationEngine();
  const rhino: SimulationEntity = {
    id: 'rhino', unique_name: 'rhino', domain: 'warframe', kind: 'warframe', persistence: 'PE',
    tags: ['warframe'],
    attributes: {
      AVATAR_ADD_ARMOUR: node(RHINO_ARMOR_BASE),
      AVATAR_ADD_ABILITY_STRENGTH: node(100),
      AVATAR_ADD_OVERGUARD: node(OG_BASE),
    },
  };
  engine.addEntity(rhino);
  engine.addModifier({ id: 'steel-fiber', target_entity: 'rhino', target_attribute: 'AVATAR_ADD_ARMOUR', operation: 'ADD', value: 100 });
  engine.addModifier({ id: 'str-mods', target_entity: 'rhino', target_attribute: 'AVATAR_ADD_ABILITY_STRENGTH', operation: 'ADD', value: strengthMod });
  mods.forEach(m => engine.addModifier(m));
  engine.resolve(CTX);
  return rhino;
}

/** Bracket de armor con el `value` horneado (`2.5 × armor.base`) — ver caracterización más abajo. */
const ARMOR_BRACKET: AccumulatorModifier = {
  id: 'iron-skin-armor', target_entity: 'rhino', target_attribute: 'AVATAR_ADD_OVERGUARD',
  operation: 'BASE_FLAT', value: ARMOR_MULT * RHINO_ARMOR_BASE,
  source_attribute: 'AVATAR_ADD_ARMOUR',
};

describe('cross-stat — EL GAP (rojo esperado hasta OQ-ENGINE-24)', () => {
  // `resolveNode` computa `value × (source.final / source.base)` = RATIO ("cuánto se amplificó" —
  // correcto para Roar, cuyo source tiene base 100). La pasiva de Trinity necesita ABSOLUTO: una
  // fracción del valor del pool. Con el `value` natural del dato (50 = "50%") el motor da 125.
  it.fails('[Trinity] la pasiva debería sumar 218.75 al Health del aliado (0.5 × 437.5) — da 125', () => {
    const { ally } = resolveWith([FLOW, LIFEGIVER_NATURAL]);
    expect(ally.attributes['AVATAR_ADD_HEALTH_MAX'].total_flat).toBeCloseTo(BONUS_ESPERADO, 5);
  });

  // "× Ability Strength" (multiplicar por el VALOR del stat) NO es "+50% × Strength" (Roar, un bonus
  // escalado). El bucket `ADD` recibe un BONUS; acá hace falta un FACTOR. Resolviendo
  // `value × (str/100) = str − 100` sale `value = 100(str−100)/str` — DEPENDE de str ⇒ no existe un
  // `value` constante que lo exprese. Ni con horneado. Este es el gap estructural, no de unidad.
  it.fails('[Iron Skin] con str=200 el Overguard debería ser 4800 — el value calibrado da 3507.69', () => {
    const VALUE_CALIBRADO_A_130 = 100 * (130 - 100) / 130; // ≈ 23.077 — sirve para UN solo strength
    const strengthScale: AccumulatorModifier = {
      id: 'iron-skin-str', target_entity: 'rhino', target_attribute: 'AVATAR_ADD_OVERGUARD',
      operation: 'ADD', value: VALUE_CALIBRADO_A_130, source_attribute: 'AVATAR_ADD_ABILITY_STRENGTH',
    };
    const og = rhinoIronSkin([ARMOR_BRACKET, strengthScale], 100).attributes['AVATAR_ADD_OVERGUARD'];
    expect(og.final).toBeCloseTo(4800, 0); // (1200 + 2.5×480) × 2.0 — wiki
  });
});

// ─── Caracterización: POR QUÉ los caminos baratos no sirven ─────────────────────────

describe('cross-stat — el horneado: funciona, y por eso es peligroso', () => {
  // Hornear `0.5 × source.base` en el `value` explota la cancelación `value × final/base` y entrega
  // el número exacto. Resiste incluso un bucket distinto en el source. La objeción NO es numérica.
  it('el horneado da el número correcto y resiste otros buckets en el source', () => {
    expect(resolveWith([FLOW, LIFEGIVER_HORNEADO]).ally.attributes['AVATAR_ADD_HEALTH_MAX'].total_flat)
      .toBeCloseTo(BONUS_ESPERADO, 5);
    // + shard flat: energy = 457.5 → 0.5 × 457.5 = 228.75. El ratio absorbe todo lo que aterrizó.
    expect(resolveWith([FLOW, SHARD, LIFEGIVER_HORNEADO]).ally.attributes['AVATAR_ADD_HEALTH_MAX'].total_flat)
      .toBeCloseTo(228.75, 5);
    expect(rhinoIronSkin([ARMOR_BRACKET], 30).attributes['AVATAR_ADD_OVERGUARD'].base_flat)
      .toBeCloseTo(1200, 5);
  });

  // La objeción es de CONTRATO: estos dos modifiers son estructuralmente idénticos —misma operation,
  // misma arista, mismos campos— y significan cosas distintas. La intención vive escondida en una
  // multiplicación del hidratador, y el número horneado no existe en ninguna fuente del juego.
  it('el contrato no distingue la lectura-ratio de la lectura-absoluta', () => {
    const forma = (m: AccumulatorModifier) => Object.keys(m).filter(k => k !== 'id' && k !== 'value').sort();
    expect(forma(LIFEGIVER_NATURAL)).toEqual(forma(LIFEGIVER_HORNEADO));
    expect(LIFEGIVER_HORNEADO.value).toBe(87.5); // ni la wiki ni el override dicen "87.5"
  });
});

describe('cross-stat — por qué la derivación post-resolve NO sirve (H1 descartada)', () => {
  // La analogía con `effective-health.ts` no se sostiene: el EHP de enemigo es una HOJA TERMINAL que
  // un consumidor externo compone; el Health del aliado es un NODO VIVO del grafo.
  it('escribir `final` post-resolve deja el nodo inconsistente con sus buckets', () => {
    const { trin, ally } = resolveWith([FLOW]);
    const healthNode = ally.attributes['AVATAR_ADD_HEALTH_MAX'];
    healthNode.final += 0.5 * trin.attributes['AVATAR_ADD_ENERGY_MAX'].final;
    expect(healthNode.final).toBeCloseTo(488.75, 5); // el número sale...
    expect(healthNode.total_flat).toBe(0);           // ...pero ningún bucket lo respalda
  });

  it('el aporte post-resolve se evapora en el siguiente resolve (silencioso)', () => {
    const { trin, ally, engine } = resolveWith([FLOW]);
    ally.attributes['AVATAR_ADD_HEALTH_MAX'].final += 0.5 * trin.attributes['AVATAR_ADD_ENERGY_MAX'].final;
    engine.resolve(CTX);                                          // mismo contexto, nada "cambió"
    expect(ally.attributes['AVATAR_ADD_HEALTH_MAX'].final).toBe(270); // el bonus desapareció
  });

  it('escribir el bucket post-resolve exige recomputar a mano y tampoco sobrevive', () => {
    const { trin, ally, engine } = resolveWith([FLOW]);
    const healthNode = ally.attributes['AVATAR_ADD_HEALTH_MAX'];
    healthNode.total_flat += 0.5 * trin.attributes['AVATAR_ADD_ENERGY_MAX'].final;
    expect(healthNode.final).toBe(270);      // el bucket cambió pero `final` NO se enteró
    engine.resolve(CTX);
    expect(healthNode.total_flat).toBe(0);   // resetAccumulators() lo zeroea
  });
});

// ─── ⚠️ IDENTIDAD ALGEBRAICA — NO es una capacidad del motor ────────────────────────

describe('cross-stat — restricciones que la solución deberá respetar (NO prueba de capacidad)', () => {
  // ⚠️ LEER ANTES DE USAR ESTO COMO ARGUMENTO: el mapeo término→bucket de abajo **lo escribe este
  // fixture a mano**. NO es el engine componiendo — es la fórmula de Iron Skin redactada en notación
  // de buckets. Prueba que la fórmula es EXPRESABLE en ese vocabulario (identidad algebraica), NO que
  // el motor pueda DERIVARLA del dato (que es justamente lo que los `it.fails` de arriba niegan).
  //
  // Su valor real es fijar DÓNDE puede depositar su resultado la futura fórmula dedicada:
  //   Base OG                → base
  //   ArmorMult × TotalArmor → base_flat      (dentro del bracket, pre-escala)
  //   × Strength             → mods_add_pct   (escala el bracket)
  //   + Absorbed             → total_flat     (FUERA del × Strength)
  const ironSkinNode = (totalArmor: number, strengthFinal: number, absorbed = 0): AttributeNode => ({
    base: OG_BASE,
    base_flat: ARMOR_MULT * totalArmor,
    mods_add_pct: strengthFinal - 100,
    total_flat: absorbed,
    multiplicative: 1,
    final: 0,
  });

  it('la precedencia de buckets admite la forma de Iron Skin: 3120 (ejemplo verbatim de la wiki)', () => {
    expect(resolveStatValue(ironSkinNode(480, 130))).toBeCloseTo(3120, 5);
  });

  // Restricción dura para el diseño: el bucket NO es libre. `total_flat` está DENTRO de
  // `multiplicative` — depositar el escalado de Strength ahí amplificaría el Absorbed (3770 ≠ 3620).
  it('el `+ Absorbed` sólo cierra en `total_flat`: post-escala, no amplificado por Strength', () => {
    expect(resolveStatValue(ironSkinNode(480, 130, 500))).toBeCloseTo(3620, 5);
  });

  // Restricción: `value × (final/base)` ≡ `(value/100) × final` SÓLO si base = 100. Los tres
  // `source_attribute` que la hidratación puede emitir hoy (ABILITY_SCALE_NODE) tienen base 100 →
  // el mecanismo actual es una particularización accidental, no una decisión.
  it('ratio ≡ absoluto con base 100 (Roar), divergen con un capacity-stat', () => {
    const ratio    = (v: number, final: number, base: number) => v * (final / base);
    const absoluto = (v: number, final: number) => (v / 100) * final;
    expect(ratio(50, 254, 100)).toBeCloseTo(absoluto(50, 254), 5);              // strength: idénticos
    expect(ratio(50, ENERGY_ESPERADA, TRINITY_ENERGY_BASE)).toBeCloseTo(125, 5); // energy: divergen
    expect(absoluto(50, ENERGY_ESPERADA)).toBeCloseTo(BONUS_ESPERADO, 5);        // sólo éste es la verdad
  });
});
