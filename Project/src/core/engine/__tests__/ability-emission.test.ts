/**
 * LA HABILIDAD COMO EMISOR DE INSTANCIAS — Fase 3 de `arch-decisions §15`, con el banco puesto.
 *
 * §15 nombra tres verbos para un nodo-source: **emite instancia**, **muta un state** y el nulo. El
 * segundo está construido end-to-end (Roar → pool de facción del arma). Este archivo abre el primero
 * por donde §15 pide abrirlo: *"no colgar más código que el eslabón ya sostenido por un test"* — el
 * emisor se **declara** (`ability-instance.ts`) y las leyes que lo consumen son las de producción.
 *
 * ─── QUÉ ES EL SAMPLE Y QUÉ NO ────────────────────────────────────────────────────────────────────
 *
 * **No es inventar una habilidad.** El dato ya la trae entera —Fireball es
 * `{ label: "Damage: <DT_HEAT> |val1| - |val2|", base_value: [400, 800], upgrade_by: "AVATAR_ABILITY_STRENGTH" }`,
 * o sea tipo, magnitud y escalado— y lo que el test declara es **el eje que ejerce**: mismo emisor
 * base, distinto estado por instancia.
 *
 * **Y no compone.** Declara la instancia; no reimplementa la combinación elemental
 * (`describeAbilityStatus` → `status-base.ts`), ni la población de procs (`expectedProcEvents`), ni el
 * mapeo tipo→efecto (`effectOfDamageType`), ni la aplicación (`applyProc`). Un sample que computara
 * esas leyes en vez de consumirlas sería un segundo motor.
 *
 * ⚠️ **El label NO es la fuente de composición** (`§15`: la regla es **por verbo, nunca por identidad
 * de habilidad**). Fireball emite un proyectil y nada más, así que su instancia casi no necesita
 * fórmula propia; una multi-verbo —daño + defense reduction + slow en el mismo cast— no se deriva de
 * su renglón de UI. Acá se toma la **forma**, no el renglón.
 */
import { describe, it, expect } from 'vitest';
import { abilityInstance, hitContextOf } from './ability-instance';
import { makeIsolatedTarget } from './status/harness';
import { describeAbilityStatus } from '../formulas/ability/ability-status';
import { expectedProcEvents } from '../formulas/status/proc-population';
import { CORROSIVE_MAX_STACKS } from '../formulas/status/stack-debuff';
import { modifies } from '../formulas/common/param-deviation';
import { effectOfDamageType, type StatusEffect } from '@shared/types';

/**
 * FIREBALL COMO ESTRUCTURA, NO COMO IDENTIDAD.
 *
 * Los números salen del override (`/Lotus/Powersuits/PowersuitAbilities/FireBallAbility`): el impacto
 * directo `400-800` y el área `150-300`, los dos `<DT_HEAT>`. Se toma el techo del rango porque el
 * eje que se ejerce no es la varianza del rango — es qué estado aplica la instancia.
 */
const FIREBALL_HEAT = 800;

/** El proc que una instancia produce, por las leyes de producción — el mismo camino del `TimelineSimulator`. */
const procsDe = (instance: ReturnType<typeof abilityInstance>): StatusEffect[] =>
  expectedProcEvents(instance.damageByType, instance.statusChance, 0)
    .map((ev) => effectOfDamageType(ev.type))
    .filter((e): e is StatusEffect => !!e);

describe('El emisor declarado — un banco de pruebas del lado source', () => {
  /**
   * Lo que este banco corrige: **toda instancia salía de una build real**. Para ejercer una ley del
   * emisor había que elegir un arma concreta y heredar sus números, y `deriveInstance` filtra por
   * `isWeaponDamageToken` — o sea que lo que no es arma no podía emitir nada.
   */
  it('una instancia nace sin build: tipo y magnitud declarados, contrato real', () => {
    const fireball = abilityInstance({ damageByType: { heat: FIREBALL_HEAT } });

    expect(fireball.damageByType).toEqual({ heat: 800 });
    expect(fireball.moddedBase).toBe(800);
    // `damageByToken` se DERIVA del tipo por la tabla canónica: son la misma información en dos
    // llaves, y escribirlas por separado dejaría declarar un par que ninguna build podría producir.
    expect(fireball.damageByToken).toEqual({ WEAPON_ADD_HEAT_DAMAGE: 800 });
  });

  /**
   * El default es `1` y no es cosmético: una habilidad que aplica estado lo aplica **garantizado**
   * (`AbilityProcBehavior.guaranteed`), a diferencia de un arma que tira los dados.
   */
  it('el status de una habilidad es garantizado por default', () => {
    expect(abilityInstance({ damageByType: { heat: FIREBALL_HEAT } }).statusChance).toBe(1);
  });
});

describe('Mismo emisor, distinto estado por instancia — el eje del banco', () => {
  /** UNO: la forma de Fireball con su tipo real. */
  it('uno — Heat emite un solo proc, y es el suyo', () => {
    const procs = procsDe(abilityInstance({ damageByType: { heat: FIREBALL_HEAT } }));
    expect(procs).toEqual(['ignite']);
  });

  /**
   * VARIOS: la misma forma repartida en dos tipos. El peso de cada proc lo decide
   * `expectedProcEvents` por proporción de daño — el test no lo computa, lo consume.
   */
  it('varios — dos tipos reparten el proc por peso de daño, sin que el sample lo calcule', () => {
    const mixta = abilityInstance({ damageByType: { corrosive: 600, toxin: 200 } });
    const eventos = expectedProcEvents(mixta.damageByType, mixta.statusChance, 0);

    expect(eventos.map((e) => e.type).sort()).toEqual(['corrosive', 'toxin']);
    // 600/800 y 200/800 — la ley de población, no aritmética escrita acá.
    const porTipo = Object.fromEntries(eventos.map((e) => [e.type, e.expected]));
    expect(porTipo.corrosive).toBeCloseTo(0.75, 6);
    expect(porTipo.toxin).toBeCloseTo(0.25, 6);
    expect(porTipo.corrosive + porTipo.toxin).toBeCloseTo(1, 6);
  });

  /**
   * NINGUNO — el caso que no se probaba en ningún lado: **emitir daño y no proquear**. Es el
   * `AbilityProcBehavior.none` de `ability-status.ts`, expresado donde vive: en la instancia.
   *
   * Y al escribirlo apareció que **la ley no gatea por chance**: `expectedProcEvents` filtra por
   * *peso de daño* (`if (!weight) continue`), así que con `statusChance: 0` emite el evento igual,
   * con `expected: 0`. Los números salen bien —lo que el test fija— y el gap está abajo.
   */
  it('ninguno — el daño sigue ahí y el efecto no rinde nada', () => {
    const sinProc = abilityInstance({ damageByType: { heat: FIREBALL_HEAT }, statusChance: 0 });
    expect(sinProc.moddedBase).toBe(800);

    const eventos = expectedProcEvents(sinProc.damageByType, sinProc.statusChance, 0);
    expect(eventos.map((e) => e.expected)).toEqual([0]);   // el evento existe, su peso esperado es 0
  });

  /**
   * 🔴 PERO EL ESTADO NACE, Y NACE INERTE.
   *
   * Medido: aplicar los eventos de una instancia con `statusChance: 0` deja
   * `{ ignite: {pool:0, ignite:0, …}, corrosion: {count:0} }` en el contenedor. Ningún número cambia
   * —el armor queda entero— así que es **latente**, exactamente igual que lo eran `min(cap, count+1)`
   * y la fuga del override de enemigo.
   *
   * Por qué importa igual: `activeBehaviors()` los itera en **cada** `advance` y en cada
   * `getDamageMultiplier`, y `effectStates.has('corrosion')` contesta que sí a un efecto que nunca
   * ocurrió. La primera pregunta de un consumidor que sea *"¿qué estados tiene este target?"* recibe
   * una respuesta falsa.
   *
   * Rojo medido en vez de anotado. Dónde se arregla —gatear en `expectedProcEvents` (no emitir con
   * chance 0) o en `applyProc` (no crear estado con amount 0)— **no es obvio**: son dos leyes con dos
   * dueños, y la segunda también recibe `amount` fraccionales legítimos.
   */
  it.fails('un emisor sin status chance no debería dejar estado en el receptor', () => {
    const sinProc = abilityInstance({ damageByType: { heat: FIREBALL_HEAT, corrosive: 200 }, statusChance: 0 });
    const t = makeIsolatedTarget({ armor: 1000 });
    for (const ev of expectedProcEvents(sinProc.damageByType, sinProc.statusChance, 0)) {
      const effect = effectOfDamageType(ev.type);
      if (effect) t.applyProc(effect, hitContextOf(sinProc), ev.expected, 0);
    }
    expect(t.getEffectiveArmor(0)).toBe(1000);   // ✅ esto ya vale: ningún número se movió
    expect([...t.effectStates.keys()]).toEqual([]);  // ❌ hay `ignite` y `corrosion` en 0
  });
});

describe('`describeAbilityStatus` tiene su primer consumidor', () => {
  /**
   * La ley existía sin nadie que la llamara. Lo que hace **no** es describir: resuelve la combinación
   * elemental con la **misma tabla canónica que las armas** (`status-base.ts`), así que un sample que
   * la ignorara estaría inventando un segundo camino para la misma pregunta.
   */
  it('mono-tipo: Fireball no combina nada, y eso es una respuesta', () => {
    const d = describeAbilityStatus({ heat: FIREBALL_HEAT });
    expect(d.combinedElement).toBeNull();
    expect(d.procBehavior).toBe('guaranteed');
  });

  it('dos primarios combinan por la tabla de las armas: Heat + Cold → Blast', () => {
    expect(describeAbilityStatus({ heat: 400, cold: 400 }).combinedElement).toBe('blast');
  });

  /** El tercer valor de la unión, que la instancia expresa con `statusChance: 0`. */
  it('`none` no combina aunque los tipos lo permitan — el verbo gana sobre el tipo', () => {
    const d = describeAbilityStatus({ heat: 400, cold: 400 }, 'none');
    expect(d.procBehavior).toBe('none');
  });
});

describe('⭐ La habilidad ve el mismo cap desviado que el arma — cierra el límite de `§17`', () => {
  /**
   * EL GEMELO QUE LA CAMPAÑA DEL RECEPTOR DEJÓ ABIERTO.
   *
   * `stack-cap-ownership.test.ts` mide la cadena entera con el arma como emisor y declara su propio
   * límite: *"ninguna habilidad emite instancia ni aplica proc"*. Con el banco puesto, el segundo
   * emisor existe — y lo que se ejerce es que **el cap es del que aplica**, no del arma: la misma
   * `+9` de tres Tauforged Emerald rinde 19 venga de donde venga.
   *
   * ⚠️ **Acá el desvío se DECLARA, y esa es la mitad honesta.** En el arma sale del grafo (shard →
   * ruteo `GAMEPLAY→weapon` → nodo → `deriveInstance`); una habilidad **no tiene ese nodo**, y de
   * dónde debería leerlo es la decisión que sigue abierta (`contracts/law-params.ts`: duplicar el nodo
   * en cada destino ⊥ dejarlo donde nace y que cada instancia lo lea subiendo por el árbol). El banco
   * separa las dos preguntas: que la ley funcione con dos emisores se prueba acá; de dónde sale el
   * número es el `todo` de abajo.
   */
  const conDesvio = (n: number) =>
    abilityInstance({
      damageByType: { corrosive: 500 },
      lawDeviations: { 'corrosive.maxStacks': [modifies.add(n)] },
    });

  it('una habilidad con el desvío del jugador topea en 19, igual que el arma', () => {
    const hit = hitContextOf(conDesvio(9));           // 3 × Tauforged = +9 sobre el default 10
    const t = makeIsolatedTarget({ armor: 1000 });
    for (let i = 0; i < 30; i++) t.applyProc('corrosion', hit, 1, 0);

    expect(CORROSIVE_MAX_STACKS + 9).toBe(19);
    expect((t.effectStates.get('corrosion') as { count: number }).count).toBe(19);
    expect(t.getEffectiveArmor(0)).toBe(0);           // 19 stacks → strip 100%
  });

  /** Sin desvío, la misma habilidad se traba en el default — el cap no es del arma, es del que aplica. */
  it('y sin desvío se traba en 10: el cap viaja con la instancia, no con el portador', () => {
    const t = makeIsolatedTarget({ armor: 1000 });
    const hit = hitContextOf(abilityInstance({ damageByType: { corrosive: 500 } }));
    for (let i = 0; i < 30; i++) t.applyProc('corrosion', hit, 1, 0);
    expect((t.effectStates.get('corrosion') as { count: number }).count).toBe(10);
  });

  /** Y el receptor sigue ganando cuando habla, venga la instancia de un arma o de una habilidad. */
  it('contra un acólito la habilidad también topea en 4 — la precedencia no mira quién emite', () => {
    const t = makeIsolatedTarget({ armor: 1000, unitClass: ['acolyte'] });
    const hit = hitContextOf(conDesvio(9));
    for (let i = 0; i < 30; i++) t.applyProc('corrosion', hit, 1, 0);
    expect((t.effectStates.get('corrosion') as { count: number }).count).toBe(4);
  });
});

describe('Lo que el banco EXPONE y no resuelve', () => {
  // El desvío del emisor se declara acá porque una habilidad no tiene el nodo `GAMEPLAY_*` — vive en
  // el arma por el ruteo (`FAMILY_ROUTE.GAMEPLAY = 'weapon'`). Con el segundo emisor construido, la
  // decisión deja de ser hipotética: duplicar el nodo en cada destino ⊥ dejarlo donde nace y que cada
  // instancia lo lea subiendo por el árbol de propiedad (`arch-decisions §18`).
  it.todo('de dónde lee sus `lawDeviations` una instancia que no sale de un arma — nodo duplicado ⊥ leído por el árbol');
  // 🔴 `damageTokenFromType('heat')` da `WEAPON_ADD_HEAT_DAMAGE`: una habilidad emite su daño con
  // tokens de arma. No bloquea —el motor rutea por TIPO— pero es el mismo sesgo de `GAMEPLAY_ → weapon`
  // visto desde el otro lado, y ahora es visible en vez de teórico.
  it.todo('el token de daño dice `WEAPON_` aunque el emisor sea una habilidad — sesgo de vocabulario, no de ruteo');
  // `calculateGyreCrit` sigue sin consumidor: es la EXCEPCIÓN (una warframe con crit de habilidad),
  // no la regla, y la regla —¿una habilidad critea por default?— no está medida.
  it.todo('`ability-crit.ts` tiene su primer consumidor — hoy sólo cubre la excepción (Gyre), no la ley');
  // §2: no hay modelo ontológico único. Fireball (proyectil → daño y nada más) casi no necesita
  // fórmula propia; una multi-verbo no se deriva de su renglón de UI. La partición es por VERBO (§15).
  it.todo('la partición emisor simple ⊥ multi-verbo: qué habilidad necesita fórmula dedicada y cuál no');
  // El escalado por Ability Strength no entra en la instancia: `upgrade_by` es del dato de la carta y
  // `AbilityRepository.ABILITY_SCALE_NODE` lo puentea para el verbo muta-state. Para emite-instancia
  // no hay puente todavía.
  it.todo('el daño de la instancia escala con `AVATAR_ABILITY_STRENGTH` — hoy el sample declara el número ya escalado');
});
