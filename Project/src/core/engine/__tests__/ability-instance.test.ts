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
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { abilityInstance, hitContextOf } from './ability-instance';
import { makeIsolatedTarget } from './status/harness';
import { syntheticHostile } from './hostile-entity';
import { EntityState } from '../simulate/EntityState';
import { CombatSimulator } from '../simulate/combat/CombatSimulator';
import { describeAbilityStatus } from '../formulas/ability/ability-status';
import { expectedProcEvents } from '../formulas/status/proc-population';
import { CORROSIVE_MAX_STACKS } from '../formulas/status/stack-debuff';
import { modifies } from '../formulas/common/param-deviation';
import { effectOfDamageType, type StatusEffect } from '@shared/types';
import { AbilityRepository } from '../resolve/hydration/AbilityRepository';
import type { SimulationEntity } from '../contracts';

await loadEngineData(new NodeAdapter());

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
   * Escribirlo destapó que la ley gateaba sólo por **peso de daño** (`if (!weight) continue`), así que
   * con `statusChance: 0` emitía un evento por tipo con `expected: 0`. Cerrado: un evento de esperanza
   * cero no es un evento (`proc-population.ts`, **ausencia ≠ 0**). Callar y declarar cero son cosas
   * distintas, y el motor decía la segunda donde correspondía la primera.
   */
  it('ninguno — el daño sigue ahí y no hay un solo evento de proc', () => {
    const sinProc = abilityInstance({ damageByType: { heat: FIREBALL_HEAT }, statusChance: 0 });
    expect(sinProc.moddedBase).toBe(800);

    expect(expectedProcEvents(sinProc.damageByType, sinProc.statusChance, 0)).toEqual([]);
  });

  /**
   * Y EL RECEPTOR NO GUARDA NADA — el consumidor de la ley de arriba, del otro lado del seam.
   *
   * Antes esto era rojo medido: el estado nacía **inerte** (`{ignite:{pool:0,…}, corrosion:{count:0}}`).
   * Ningún número se movía —el armor quedaba entero, así que era latente igual que `min(cap, count+1)`
   * y la fuga del override de enemigo— pero `activeBehaviors()` los iteraba en cada `advance` y en cada
   * `getDamageMultiplier`, y `effectStates.has('corrosion')` contestaba que sí a un efecto que nunca
   * ocurrió. La primera pregunta de un consumidor que fuera *"¿qué estados tiene este target?"* recibía
   * una respuesta falsa.
   *
   * El gate quedó en el **poblador** y no en `applyProc`: la pregunta *"¿hubo proc?"* es de quien
   * conoce la chance. `applyProc` sigue aplicando lo que le den —el modelo EV le pasa `expected`
   * fraccionales legítimos y no tiene con qué distinguir un 0 válido de uno espurio—.
   */
  it('un emisor sin status chance no deja estado en el receptor', () => {
    const sinProc = abilityInstance({ damageByType: { heat: FIREBALL_HEAT, corrosive: 200 }, statusChance: 0 });
    const t = makeIsolatedTarget({ armor: 1000 });
    for (const ev of expectedProcEvents(sinProc.damageByType, sinProc.statusChance, 0)) {
      const effect = effectOfDamageType(ev.type);
      if (effect) t.applyProc(effect, hitContextOf(sinProc), ev.expected, 0);
    }
    expect(t.getEffectiveArmor(0)).toBe(1000);
    expect([...t.effectStates.keys()]).toEqual([]);
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
   * **Acá el desvío se DECLARA a propósito — esto prueba el receptor, no el peer-read.** En producción
   * una habilidad ya no declara nada: `AbilityRepository.getEmissions` lo lee del peer que
   * `resolveFamilyEntities('GAMEPLAY', entities)` resuelve (F3, `.working/
   * refactor-engine-2-recomposicion.md`; caso real end-to-end en `status/stack-cap-ownership.test.ts`
   * §"El desvío del emisor, extremo a extremo"). Este bloque sigue vivo porque prueba algo distinto y
   * todavía sin cubrir ahí: que el RECEPTOR (`applyProc`/el cap) trata igual un desvío declarado que
   * uno leído del grafo — la ley no mira de dónde vino `lawDeviations`, sólo que esté.
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
    const t = makeIsolatedTarget({ armor: 1000, unitClass: 'acolyte' });
    const hit = hitContextOf(conDesvio(9));
    for (let i = 0; i < 30; i++) t.applyProc('corrosion', hit, 1, 0);
    expect((t.effectStates.get('corrosion') as { count: number }).count).toBe(4);
  });
});

/**
 * ⭐ LAS LEYES DE RESOLUCIÓN ALCANZAN A LA HABILIDAD — el corte del token-space, medido.
 *
 * **Qué se rompía.** Las tres leyes de resolución (matriz de facción, bypass de capa, bypass de armor)
 * se keyeaban por el token `WEAPON_ADD_<TIPO>_DAMAGE`, así que respondían *"¿de qué tipo es este
 * daño?"* con una llave que además nombra **de qué familia de emisor sale**. Un emisor que no fuera un
 * arma las perdía **sin un throw y sin un warn** — números creíbles y falsos. Medido antes del corte,
 * cambiando SÓLO el prefijo y dejando el tipo y el target iguales:
 *
 *     Heat 1000 vs Infested       WEAPON_ 1500        AVATAR_ 1000       (matriz perdida)
 *     Toxin 200 vs shields 500    WEAPON_ {health}    AVATAR_ {shield}   (capa equivocada)
 *     True 1000 vs armor 2700     WEAPON_ 1000        AVATAR_ 99.99      (DR aplicada de más)
 *
 * **Qué se hizo.** No se acuñó ningún token nuevo —y en particular NO existe `AVATAR_ADD_<TIPO>_DAMAGE`
 * en el dato real de DE— sino que se partió la llave en sus dos trabajos: el **bucket de upgrade**
 * sigue siendo del arma (y ahí `WEAPON_` es fiel, incluidas las habilidades que el juego trata como
 * armas) y el **tipo de la instancia** pasó a `DamageType`, que no tiene dueño. Detalle en
 * `contracts/damage-logic.ts` §los dos trabajos.
 *
 * Lo que estos tests fijan es que **la instancia de una habilidad recibe la misma física que la de un
 * arma**, y que eso ya no depende de con qué prefijo viaje.
 */
describe('⭐ la física del target no pregunta quién emitió', () => {
  const hostilDe = (faction: string, opts: { armor?: number; shields?: number } = {}) =>
    new EntityState(syntheticHostile({ faction, health: 100_000, ...opts }));

  it('la matriz de facción alcanza a una habilidad: Heat vs Infested paga ×1.5', () => {
    const fireball = abilityInstance({ damageByType: { heat: 1000 } });
    const hit = CombatSimulator.resolveHit(fireball.damageByType, hostilDe('Infested'));
    expect(hit.total_damage).toBe(1500);
  });

  it('…y la resistencia también: el mismo Heat contra Kuva Grineer paga ×0.5', () => {
    const fireball = abilityInstance({ damageByType: { heat: 1000 } });
    const hit = CombatSimulator.resolveHit(fireball.damageByType, hostilDe('Kuva Grineer'));
    expect(hit.total_damage).toBe(500);
  });

  it('el Toxin de una habilidad atraviesa el shield igual que el de un arma', () => {
    const toxica = abilityInstance({ damageByType: { toxin: 200 } });
    const hit = CombatSimulator.resolveHit(toxica.damageByType, hostilDe('Isolated', { shields: 500 }));
    expect(hit.by_layer).toEqual({ health: 200 });
  });

  /**
   * El caso que cierra el eje: la ley se pregunta por el TIPO, así que la respuesta no puede cambiar
   * porque el emisor cambie. Dos instancias con el mismo tipo y el mismo número —una nacida del banco
   * de habilidades, otra escrita a mano como lo haría cualquier otro emisor— resuelven idéntico.
   */
  it('mismo tipo y mismo número ⇒ mismo resultado, venga de donde venga', () => {
    const target = () => hostilDe('Infested', { armor: 2700, shields: 300 });
    const desdeHabilidad = CombatSimulator.resolveHit(abilityInstance({ damageByType: { heat: 750 } }).damageByType, target());
    const desdeCualquiera = CombatSimulator.resolveHit({ heat: 750 }, target());
    expect(desdeHabilidad.total_damage).toBe(desdeCualquiera.total_damage);
    expect(desdeHabilidad.by_layer).toEqual(desdeCualquiera.by_layer);
  });
});

/**
 * `ability-crit.ts` TIENE SU PRIMER CONSUMIDOR REAL (#9) — no el DSL `abilityInstance()` (que es un
 * stand-in deliberado de la ley), sino `AbilityRepository.getEmissions` en producción: la excepción
 * conocida (Gyre) ya cablea su crit real, y el resto de las habilidades sigue en el default de la
 * ley (0), no en un hardcode ciego.
 *
 * El caster de la excepción y la habilidad emitida son deliberadamente independientes (Gyre casteando
 * su propia Arcsphere en un test, cualquier otro warframe casteándola en el otro): lo que se ejerce es
 * que `hasAbilityCritException` mira **quién castea**, no cuál habilidad — mismo principio que "la
 * física del target no pregunta quién emitió" un poco más arriba en este archivo.
 */
describe('`ability-crit.ts` tiene su primer consumidor real (#9)', () => {
  const GYRE_ARCSPHERE = '/Lotus/Powersuits/PowersuitAbilities/GyrePulseAbility';

  const casterDe = (uniqueName: string): SimulationEntity => ({
    id: 'caster', unique_name: uniqueName, domain: 'warframe', kind: 'warframe',
    persistence: 'PE', tags: ['warframe'], attributes: {},
  });

  it('Gyre: la excepción conocida cablea su crit real (+10% flat, aproximación v1 — #33)', () => {
    const gyre = casterDe('/Lotus/Powersuits/Gyre/Gyre');
    const emissions = AbilityRepository.getEmissions(GYRE_ARCSPHERE, gyre.id, [gyre]);
    expect(emissions.length).toBeGreaterThan(0);
    for (const e of emissions) {
      expect(e.instance.critChance).toBeCloseTo(10, 5);  // calculateGyreCrit: 0.10 decimal → 10%
      expect(e.instance.critMult).toBeCloseTo(1.5, 5);   // 150% default de habilidad, sin mods
    }
  });

  it('cualquier otro caster: la ley por default sigue en 0 — no hay excepción sin nombrar', () => {
    const otro = casterDe('/Lotus/Powersuits/Volt/Volt');
    const emissions = AbilityRepository.getEmissions(GYRE_ARCSPHERE, otro.id, [otro]);
    expect(emissions.length).toBeGreaterThan(0);
    for (const e of emissions) {
      expect(e.instance.critChance).toBe(0);
      expect(e.instance.critMult).toBe(1);
    }
  });
});

describe('Lo que el banco EXPONE y no resuelve', () => {
  // El sesgo del token de daño **se cerró** — ver el bloque ⭐ de abajo, que lo mide en verde.
  // §2: no hay modelo ontológico único. Fireball (proyectil → daño y nada más) casi no necesita
  // fórmula propia; una multi-verbo no se deriva de su renglón de UI. La partición es por VERBO (§15).
  it.todo('la partición emisor simple ⊥ multi-verbo: qué habilidad necesita fórmula dedicada y cuál no');
});
