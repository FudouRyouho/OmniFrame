/**
 * DE QUIÉN ES EL CAP DE STACKS — el caso de `CV-3`, fabricado desde medición propia.
 *
 * Fuente: `references/ingame-tests/status-stack-caps.md` (5/5 escenarios, dos jugadores con caps
 * distintos aplicando Corrosive al mismo enemigo). Doctrina: `arch-decisions §17`.
 *
 * LA REGLA MEDIDA — el cap no decide *si* el proc entra, decide **si suma o reemplaza**:
 *
 *     count <  cap_del_que_aplica  →  count++                      (SUMA)
 *     count ≥  cap_del_que_aplica  →  refresca el stack más viejo  (REEMPLAZA — count NO cambia)
 *
 * LO QUE EL MOTOR HACE — `applyStackProc` (`stack-debuff.ts`), consumido por los cinco behaviors de
 * stack. Antes era `min(cap, count + amount)`, que coincide con la regla **mientras `count ≤ cap`**
 * —o sea mientras haya un solo emisor— y **colapsa el contador hacia abajo** en cuanto lo supera. La
 * regla real nunca lo baja.
 *
 * POR QUÉ EL CASO SE PUEDE ESCRIBIR sin modelar dos jugadores: el caso no necesita dos emisores
 * para manifestarse, necesita `count > cap`. El segundo emisor es sólo la forma en que el juego
 * produce ese estado. Acá se produce declarándolo — que es exactamente lo que el harness hace con
 * cualquier otro número del banco de pruebas.
 *
 * EL EJE QUE NO SE PUEDE EJERCER: hoy `applyProc` no lleva **quién aplica**, así que el cap es
 * siempre la constante. Eso es la mitad de `CV-3` que no existe, y va como `todo`.
 */
import { describe, it, expect } from 'vitest';
import { makeIsolatedTarget } from './harness';
import { CORROSIVE_MAX_STACKS } from '../../formulas/status/stack-debuff';
import type { HitContext } from '../../formulas/status/effect-behavior';
import type { StatusEffect } from '@shared/types';
import { ShardRepository } from '../../resolve/hydration/ShardRepository';
import { loadEngineData } from '../../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { consume } from '../../output/consume';
import { deriveInstance } from '../../simulate/combat/damage-instance';
import { onfoot, RHINO, TIBERON_PRIME, ASH_SHURIKEN } from '../../fixtures/builds';
import { player, withAbilities, scene } from '@shared/types/scene-compose';
import { AbilityRepository } from '../../resolve/hydration/AbilityRepository';

await loadEngineData(new NodeAdapter());

/** Instancia mínima: el contador no depende de la magnitud del hit, sólo del evento. */
const HIT: HitContext = { moddedBase: 100, statusDamageBonusPct: 0, elementBonusPct: {} };

const countOf = (t: ReturnType<typeof makeIsolatedTarget>, effect: StatusEffect = 'corrosion'): number =>
  (t.effectStates.get(effect) as { count: number } | undefined)?.count ?? 0;

describe('Cap de stacks — el cap es del que APLICA, el contador es del receptor', () => {
  // El default es el cap de un jugador sin shards: el "Jugador B" de la medición.
  it('la constante del motor es el cap sin desvío (Jugador B, sin shards)', () => {
    expect(CORROSIVE_MAX_STACKS).toBe(10);
  });

  it('#3 — bajo el cap, el proc SUMA hasta trabarse (un solo emisor: motor y juego coinciden)', () => {
    const t = makeIsolatedTarget({ armor: 1000, stacks: { corrosion: 1 } });
    for (let i = 0; i < 20; i++) t.applyProc('corrosion', HIT, 1, 0);
    expect(countOf(t)).toBe(10);
  });

  it('#4 — decaído por debajo del cap, vuelve a subir y se traba en 10', () => {
    const t = makeIsolatedTarget({ armor: 1000, stacks: { corrosion: 8 } });
    t.applyProc('corrosion', HIT, 1, 0);
    expect(countOf(t)).toBe(9);
    t.applyProc('corrosion', HIT, 1, 0);
    expect(countOf(t)).toBe(10);
    t.applyProc('corrosion', HIT, 1, 0);
    expect(countOf(t)).toBe(10);
  });

  // ── Sobre el cap: el proc REEMPLAZA, y el contador no se mueve ──────────────────────────────────

  it('#1 — con 19 stacks puestos, un emisor de cap 10 REFRESCA y el contador SE MANTIENE en 19', () => {
    // Medido: "A pone 19, B dispara → se mantiene en 19". Con `min(10, 20)` daba 10.
    const t = makeIsolatedTarget({ armor: 1000, stacks: { corrosion: 19 } });
    t.applyProc('corrosion', HIT, 1, 0);
    expect(countOf(t)).toBe(19);
  });

  it('#5 — con 11 stacks, el emisor de cap 10 no puede subirlo NI bajarlo (queda 11)', () => {
    // Un stack por encima del cap: `min(10, 12)` daba 10, o sea le BAJABA uno.
    const t = makeIsolatedTarget({ armor: 1000, stacks: { corrosion: 11 } });
    t.applyProc('corrosion', HIT, 1, 0);
    expect(countOf(t)).toBe(11);
  });

  it('un proc sobre-cap nunca baja el contador — invariante sobre todo el rango medido', () => {
    for (const n of [11, 13, 15, 17, 19]) {
      const t = makeIsolatedTarget({ armor: 1000, stacks: { corrosion: n } });
      t.applyProc('corrosion', HIT, 1, 0);
      expect(countOf(t)).toBeGreaterThanOrEqual(n);
    }
  });

  /**
   * La regla es de la FAMILIA, no de Corrosive: los cinco behaviors de stack la consumen del mismo
   * `applyStackProc`. Sin este caso, reintroducir `min()` en uno solo pasa la suite — que es la forma
   * en que la ley se escribió dos veces la vez anterior.
   *
   * Los caps difieren por efecto (`weakened` 5, `freeze` 9) y ninguno es el de Corrosive, así que el
   * caso también fija que el cap consultado es el del efecto y no una constante compartida.
   */
  it('ningún efecto de stack baja su contador sobre-cap — la regla es de la familia', () => {
    for (const [effect, sobreCap] of [['weakened', 8], ['freeze', 12], ['infection', 14]] as const) {
      const t = makeIsolatedTarget({ armor: 1000, stacks: { [effect]: sobreCap } });
      t.applyProc(effect, HIT, 1, 0);
      expect(countOf(t, effect)).toBe(sobreCap);
    }
  });

  // ── La mitad de `CV-3` que no tiene maquinaria: el desvío con su procedencia ────────────────────

  /**
   * EL DESVÍO DEL EMISOR YA TIENE LENGUAJE — y ahí se termina lo que hoy existe.
   *
   * `+2 max Corrosive stacks` (`+3` Tauforged) estaba en el dataset con `upgrade_type: null`, así que
   * `ShardRepository.resolve` devolvía `null` y el desvío **moría en la hidratación, en silencio** —
   * el modo de falla que `upgrade-tokens.md §Registro de lo inexpresable` existe para evitar
   * (*"el objetivo no es cero descartes: es cero descartes sin nombre"*).
   *
   * El token es `GAMEPLAY_*` porque el número **no es un atributo de ninguna entidad**: es un
   * parámetro de una ley. `AVATAR_*` mentiría sobre el sujeto (el contador vive en el enemigo) y
   * `ENEMY_*` lo haría del receptor, cuando la medición dice que el cap es **del que aplica**.
   */
  it('el desvío del emisor sobrevive la hidratación: +2 normal, +3 Tauforged', () => {
    const EMERALD = '/Lotus/Types/Gameplay/NarmerSorties/ArchonCrystalGreen';
    expect(ShardRepository.resolve(EMERALD, 'emerald-corrosive-stacks', false))
      .toMatchObject({ value: 2, op: 'ADD_FLAT' });
    expect(ShardRepository.resolve(EMERALD, 'emerald-corrosive-stacks', true))
      .toMatchObject({ value: 3, op: 'ADD_FLAT' });
    // El cap 19 de la medición son los tres Tauforged sobre el default: 10 + 3×3.
    expect(CORROSIVE_MAX_STACKS + 3 * 3).toBe(19);
  });

  // El receptor que fuerza (`Acolyte: N ≤ 4`) YA CORRE — abajo, y su canal en `receiver-law.test.ts`.
  // El que MODIFICA (Hydroid) corre en `receiver-modifies.test.ts` — #8.
  // `StackState { count }` es escalar; "refresca el más viejo" opera sobre instancias con timer
  // propio. El DoT ya modela instancias (`DotState { pulses }`) — la asimetría es interna al módulo.
  it.todo('refrescar el stack más viejo requiere instancias con timer, no un contador — #10');
});

/**
 * LA CADENA ENTERA, DE LA MOCHILA AL CONTADOR — el eslabón que `arch-decisions §17` declaraba ausente.
 *
 * *"La instancia lleva el **output** del emisor y **no** sus desvíos de ley, así que `applyProc` toma
 * el cap de una constante de módulo. Los tres primeros eslabones no tienen por dónde entrar."* Esto es
 * ese camino, corriendo:
 *
 *     shard en el warframe → ruteo GAMEPLAY→weapon → nodo en el arma (total_flat suma los tres)
 *       → deriveInstance → HitContext.lawDeviations → applyProc → resolveParam
 *
 * El `+9` no lo computa nadie a mano: son tres modifiers `ADD_FLAT` sobre el mismo nodo, sumados por
 * el mismo acumulador que suma Serration.
 */
describe('El desvío del emisor, extremo a extremo', () => {
  const EMERALD_CORROSIVE_TAU = {
    uniqueName: '/Lotus/Types/Gameplay/NarmerSorties/ArchonCrystalGreen',
    effectId: 'emerald-corrosive-stacks',
    isTauforged: true,
  };
  const conShards = (n: number) => onfoot({
    warframe: { uniqueName: RHINO, rank: 30, shards: Array.from({ length: n }, () => ({ ...EMERALD_CORROSIVE_TAU })) },
    primary: { uniqueName: TIBERON_PRIME, rank: 30, activeProfile: 'base' },
  });
  const armaDe = (scene: ReturnType<typeof conShards>) =>
    consume(scene, { flags: {} }).snapshot().find((e) => e.domain === 'weapon')!;

  it('el desvío del warframe baja al ARMA y se compone: 3 × Tauforged = +9', () => {
    const arma = armaDe(conShards(3));
    expect(arma.attributes['GAMEPLAY_FLAT_CORROSIVE_MAX_STACKS'].final).toBe(9);
    expect(deriveInstance(arma).lawDeviations).toEqual({
      'corrosive.maxStacks': [{ verb: 'modifies', op: 'add', value: 9 }],
    });
  });

  /**
   * LA SEÑAL QUE LA SIEMBRA APAGA, restituida acá.
   *
   * El nodo de un parámetro de ley se siembra **en la entidad que el ruteo eligió**, así que el token
   * deja de estar *acuñado sin nodo* y `reportUnlandedModifiers` ya no lo mira. Eso cuesta algo: un
   * ruteo equivocado ya no se nota — el nodo nacería en el destino equivocado igual de callado.
   *
   * Fijar dónde **no** debe estar es lo que devuelve esa señal: si el modifier se quedara en el
   * warframe (contención en vez de baja por familia), este caso lo dice.
   */
  it('el desvío NO se queda en el warframe — la baja por familia ocurrió', () => {
    const wf = consume(conShards(3), { flags: {} }).snapshot().find((e) => e.domain === 'warframe')!;
    expect(wf.attributes['GAMEPLAY_FLAT_CORROSIVE_MAX_STACKS']).toBeUndefined();
  });

  it('⭐ el cap efectivo de la instancia es 19, y el contador llega hasta ahí', () => {
    const hit: HitContext = { ...HIT, lawDeviations: deriveInstance(armaDe(conShards(3))).lawDeviations };
    const t = makeIsolatedTarget({ armor: 1000 });
    for (let i = 0; i < 30; i++) t.applyProc('corrosion', hit, 1, 0);
    expect(countOf(t)).toBe(19);   // con la constante de módulo se trababa en 10
  });

  it('y el strip llega al 100%, que es lo que el cap 19 hace observable', () => {
    // El pago de los dos pasos previos: con el techo viejo de 0.80 este número era 80% con y sin
    // shards, y el canal habría parecido funcionar sin cambiar nada.
    const hit: HitContext = { ...HIT, lawDeviations: deriveInstance(armaDe(conShards(3))).lawDeviations };
    const conShard = makeIsolatedTarget({ armor: 1000 });
    for (let i = 0; i < 30; i++) conShard.applyProc('corrosion', hit, 1, 0);
    const sinShard = makeIsolatedTarget({ armor: 1000 });
    for (let i = 0; i < 30; i++) sinShard.applyProc('corrosion', HIT, 1, 0);

    expect(conShard.getEffectiveArmor(0)).toBe(0);            // 19 stacks → strip 100%
    expect(sinShard.getEffectiveArmor(0)).toBeCloseTo(200, 6); // 10 stacks → strip 80%
  });

  /**
   * CALLAR ≠ DECLARAR CERO (`vocabulary.md §6`). Sin shard no hay nodo — no un nodo en 0. Hoy la
   * diferencia no cambia ningún número porque el verbo es `add`; el día que alguien declare un
   * `replace` o un techo por nodo, sembrar de más sí lo cambiaría.
   */
  it('sin shard, el arma NO tiene el nodo — y la instancia no declara nada', () => {
    const arma = armaDe(conShards(0));
    expect(arma.attributes['GAMEPLAY_FLAT_CORROSIVE_MAX_STACKS']).toBeUndefined();
    expect(deriveInstance(arma).lawDeviations).toBeUndefined();
  });

  /**
   * ⭐ LA CADENA COMPLETA — el eslabón que cierra los cuatro de `arch-decisions §17`.
   *
   * *"Cinco fragmentos esmeralda no rinden nada contra un Acolyte"*: el receptor **habla** sobre este
   * parámetro y entonces el del emisor no llega. Es el mismo `+9` del caso de arriba, contra otro
   * receptor, dando otro número — que es lo que hace observable que el cap se resuelve **por
   * instancia** y no es propiedad de ninguno de los dos lados.
   */
  it('contra un Acolyte el cap es 4, no 19 — el receptor gana cuando habla', () => {
    const hit: HitContext = { ...HIT, lawDeviations: deriveInstance(armaDe(conShards(3))).lawDeviations };
    const acolito = makeIsolatedTarget({ armor: 1000, unitClass: 'acolyte' });
    for (let i = 0; i < 30; i++) acolito.applyProc('corrosion', hit, 1, 0);
    expect(countOf(acolito)).toBe(4);
  });

  /**
   * PRECEDENCIA, NO DOMINANCIA — el par que impide leer la regla como *"el receptor gana"*.
   *
   * §17 lo dice y el par lo mide: si el receptor ganara siempre, el esmeralda no funcionaría nunca; si
   * el emisor ganara siempre, el acólito no toparía nada. Los dos casos corren el **mismo emisor**.
   */
  it('el mismo emisor rinde 19 contra un hostil común y 4 contra un acólito', () => {
    const hit: HitContext = { ...HIT, lawDeviations: deriveInstance(armaDe(conShards(3))).lawDeviations };
    const cap = (unitClass?: 'acolyte') => {
      const t = makeIsolatedTarget({ armor: 1000, ...(unitClass ? { unitClass } : {}) });
      for (let i = 0; i < 30; i++) t.applyProc('corrosion', hit, 1, 0);
      return countOf(t);
    };
    expect(cap()).toBe(19);
    expect(cap('acolyte')).toBe(4);
  });

  /**
   * Y SIN EMISOR TAMBIÉN — el techo del receptor no necesita que alguien haya hablado primero.
   *
   * Sin este caso, `4` podría salir de que el desvío del emisor se anulara en vez de no llegar. Acá no
   * hay nada que anular: el default del concepto es `10` y el acólito lo baja igual.
   */
  it('el receptor topea al emisor que calla: default 10 → 4', () => {
    const acolito = makeIsolatedTarget({ armor: 1000, unitClass: 'acolyte' });
    for (let i = 0; i < 30; i++) acolito.applyProc('corrosion', HIT, 1, 0);
    expect(countOf(acolito)).toBe(4);
  });

  /**
   * EL PAGO OBSERVABLE, del otro lado del que ya está arriba: con 4 stacks el strip es `26 + 6×3 = 44 %`
   * y quedan `1000 × 0.56 = 560` de armadura. Los tres esmeralda no compraron nada.
   */
  it('y el strip se queda en 44% — los 3 Tauforged no rinden contra un acólito', () => {
    const hit: HitContext = { ...HIT, lawDeviations: deriveInstance(armaDe(conShards(3))).lawDeviations };
    const acolito = makeIsolatedTarget({ armor: 1000, unitClass: 'acolyte' });
    for (let i = 0; i < 30; i++) acolito.applyProc('corrosion', hit, 1, 0);
    expect(acolito.getEffectiveArmor(0)).toBeCloseTo(560, 6);
  });

  /**
   * EL DESVÍO ES DEL JUGADOR, PERO EL NODO VIVE EN EL ARMA — y eso alcanza sólo mientras el arma sea
   * el único emisor de instancias.
   *
   * La fuente no acota el shard a las armas, y el precedente por el que este token bajó al arma tiene
   * el mismo sesgo: [`roar.wikitext`](../../../../../references/wiki/warframes/rhino/roar.wikitext)
   * declara *"bonus damage to all **weapons and abilities**"* y *"increases the damage any ally deals
   * from **any source**"*, mientras `FAMILY_ROUTE.GAMEPLAY = 'weapon'` lo aterriza sólo en las armas.
   * O sea el límite **es preexistente**, no lo introdujo este canal.
   *
   * ✅ **Resuelto — F3 (`.working/refactor-engine-2-recomposicion.md`).** La decisión que este bloque
   * dejaba pendiente (duplicar el nodo en cada destino ⊥ leerlo subiendo por el árbol de propiedad) se
   * resolvió por la segunda vía, sin duplicar nada: `AbilityRepository.getEmissions` lee el desvío del
   * PEER que `resolveFamilyEntities('GAMEPLAY', entities)` resuelve — el mismo arma que ya lo lleva por
   * `FAMILY_ROUTE.GAMEPLAY = 'weapon'` — en vez de declararlo a mano en un banco sintético.
   */
  it('el desvío de una habilidad se lee del PEER, sin nodo propio — mismo +9 que el arma', () => {
    const entities = consume(scene(withAbilities(player(conShards(3)), [{ uniqueName: ASH_SHURIKEN }])), { flags: {} }).snapshot();
    const caster = entities.find((e) => e.domain === 'warframe')!;
    const [emission] = AbilityRepository.getEmissions(ASH_SHURIKEN, caster.id, entities);

    expect(emission.instance.lawDeviations).toEqual(deriveInstance(armaDe(conShards(3))).lawDeviations);
    expect(emission.instance.lawDeviations).toEqual({
      'corrosive.maxStacks': [{ verb: 'modifies', op: 'add', value: 9 }],
    });
  });
});
