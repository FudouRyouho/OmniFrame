/**
 * EL RECEPTOR QUE FUERZA **POR CAPA** — el tercer registro de `arch-decisions §22` (#11).
 *
 * Los dos hermanos de este archivo miden los otros dos pobladores del mismo canal:
 * `receiver-law.test.ts` la **clase** (Acolyte, `forces`) y `receiver-modifies.test.ts` el **estado**
 * (marca de Hydroid, `modifies`). Acá entra la **capa**, y con ella `ReceiverContext` queda siendo el
 * test de tres vías de §22 hecho estructura — no por diseño previo, sino porque los casos llegaron
 * uno por registro.
 *
 * ─── LA FUENTE ───────────────────────────────────────────────────────────────────────────────────
 *
 * `overguard.wikitext:37` — *"On enemies, they can receive Status Effects but while their Overguard is
 * active … and can normally **only receive a maximum of 4** {{D|Cold}} procs"*.
 * `damage-cold-damage.wikitext:26` — *"Bosses, as well as **enemies with active Overguard**, can
 * receive a maximum of **4** Cold stacks"*.
 *
 * El verbo es `forces` por el discriminador textual de §17 (*"can only receive a maximum of N"* = un
 * límite), el mismo que fijó el del Acolyte. **No se deduce de la aritmética**, que acá no distingue:
 * el default es `9`, así que `forces(4)` y `replace(4)` dan el mismo número. Es justamente el caso
 * donde la fuente tiene que decidir porque la medición no puede.
 *
 * ─── POR QUÉ ESTE CASO NO NECESITÓ QUE `critModifier` RECIBIERA EL CONTEXTO ───────────────────────
 *
 * El issue pedía originalmente llevar el `ReceiverContext` a `resolutionModifier`/`critModifier`. Medido
 * contra el código, **no hacía falta**: el cap se aplica en `applyProc` —que ya recibía el contexto— y
 * el bonus de crit lo arrastra solo, porque es `f(count)`. `COLD_CRIT_LAW.cap = 0.5 = f(9)`, así que
 * con el contador topado en `4` el valor es `f(4) = 0.25` y el clamp nunca interviene. Los dos últimos
 * casos de este archivo lo miden en vez de afirmarlo.
 *
 * ─── QUÉ SE DECLARA Y QUÉ SE EJERCE ──────────────────────────────────────────────────────────────
 *
 * El Overguard se **declara** en el harness, igual que la marca de Hydroid y por el mismo motivo: **su
 * origen no está modelado**. `current_overguard` nace en `0` y nada de producción lo sube — la capa
 * nace de la clase (Eximus) o de una habilidad (Iron Skin), y ninguno de esos caminos existe. Lo que
 * este archivo ejerce es la LEY y su canal, no de dónde sale la cantidad.
 */
import { describe, it, expect } from 'vitest';
import { makeIsolatedTarget } from './harness';
import {
  RECEIVER_MAX_STACKS_BY_LAYER,
  COLD_CRIT_LAW,
  HYDROID_MARK,
  receiverMaxStacks,
  stackDebuffValue,
} from '../../formulas/status/stack-debuff';
import type { HitContext } from '../../formulas/status/effect-behavior';
import type { StatusEffect } from '@shared/types';

const DUMMY_HIT: HitContext = { moddedBase: 0, statusDamageBonusPct: 0, elementBonusPct: {} };

/** El default del concepto, tal como `behaviors.ts` lo declara — replicado acá para que el test lo nombre. */
const FREEZE_DEFAULT_CAP = 9;

const countOf = (t: ReturnType<typeof makeIsolatedTarget>, effect: StatusEffect): number =>
  (t.effectStates.get(effect) as { count: number } | undefined)?.count ?? 0;

/** Target aislado con (o sin) Overguard activo, al que se le vacían `n` procs de Cold de una. */
const frozen = (n: number, overguard: number, extra: Parameters<typeof makeIsolatedTarget>[0] = {}) => {
  const t = makeIsolatedTarget({ overguard, ...extra });
  t.applyProc('freeze', DUMMY_HIT, n, 0);
  return t;
};

describe('El receptor que fuerza por CAPA — Overguard topea Cold en 4 (§17/§22, #11)', () => {
  it('sin Overguard rige el default del concepto: 9 stacks', () => {
    expect(countOf(frozen(20, 0), 'freeze')).toBe(FREEZE_DEFAULT_CAP);
  });

  it('con Overguard activo el contador se traba en 4, no en 9', () => {
    expect(countOf(frozen(20, 500), 'freeze')).toBe(4);
  });

  /**
   * EL CASO QUE JUSTIFICA LA FORMA — y el que separa la capa de la marca.
   *
   * Una marca es permanente (*"**permanently** more vulnerable"*, Hydroid); una capa **se agota**, y el
   * desvío tiene que morir con ella en el mismo instante. Si el Overguard hubiera entrado como `marks`
   * —que era la forma disponible y más barata— este caso daría `4` y el enemigo seguiría topado
   * después de que le rompieran la capa.
   */
  it('roto el Overguard, el cap vuelve al default en el mismo instante', () => {
    const t = frozen(20, 500);
    expect(countOf(t, 'freeze')).toBe(4);

    // ⚠️ `setLayer` es el atajo de LEY: acá se mide que el contexto reacciona al número, no cómo el
    // número llegó a cero. Romperla con daño resuelto por el camino real es `overguard-e2e.test.ts`.
    t.setLayer('overguard', 0);
    t.applyProc('freeze', DUMMY_HIT, 20, 0);
    expect(countOf(t, 'freeze')).toBe(FREEZE_DEFAULT_CAP);
  });

  /**
   * La tabla de la capa **no tiene comodín**, y eso es una afirmación sobre la fuente. La misma línea
   * dice que el Overguard ignora el CC de otros nueve status — pero eso es otra ley, no un cap. Un
   * `'*'` acá haría que el Overguard topeara Corrosive en `4`, que ninguna fuente dice.
   */
  it('la capa habla sólo de Cold: Corrosive contra el mismo target sigue en su default', () => {
    const t = makeIsolatedTarget({ overguard: 500 });
    t.applyProc('corrosion', DUMMY_HIT, 20, 0);
    t.applyProc('freeze', DUMMY_HIT, 20, 0);

    // ⚠️ **Los dos en el MISMO target, y ése es el punto.** Con sólo el `corrosion → 10` el caso pasa
    // por dos razones indistinguibles: porque la tabla calla sobre Corrosive, o porque el canal entero
    // está muerto. El `freeze → 4` al lado es lo que separa "calla sobre esto" de "no habla nunca".
    expect(countOf(t, 'corrosion')).toBe(10);
    expect(countOf(t, 'freeze')).toBe(4);
    expect(RECEIVER_MAX_STACKS_BY_LAYER.overguard?.['*']).toBeUndefined();
  });

  /**
   * `forces` compone con `min`, así que dos declaraciones del mismo dueño sobre el mismo parámetro no
   * se pisan ni se suman — se toma la más restrictiva. Un acólito con Overguard declara `4` dos veces
   * y da `4`, no `3` ni un throw: es el camino que `applyDeviations` ya sostenía sin caso que lo
   * ejerciera. (Con dos `replace` habría tirado, que es la razón por la que el verbo importa.)
   */
  it('clase + capa componen sin pisarse: un acólito con Overguard sigue en 4', () => {
    expect(countOf(frozen(20, 500, { unitClass: ['acolyte'] }), 'freeze')).toBe(4);
    expect(countOf(frozen(20, 0, { unitClass: ['acolyte'] }), 'freeze')).toBe(4);

    // ⚠️ **El número solo NO prueba la composición**: los dos pobladores fuerzan `4`, así que el
    // acólito da `4` aunque la capa no participe — el caso pasaba entero con el canal desconectado.
    // Lo que hay que medir es que la capa APORTE su fila, no que el resultado coincida.
    const conAmbas = makeIsolatedTarget({ overguard: 500, unitClass: ['acolyte'] });
    expect(receiverMaxStacks(conAmbas.receiverContext(), 'freeze')).toEqual([
      { verb: 'forces', value: 4 },   // la clase
      { verb: 'forces', value: 4 },   // la capa
    ]);
    // Y sobre un status que sólo la clase nombra, la capa calla: una fila, no dos.
    expect(receiverMaxStacks(conAmbas.receiverContext(), 'corrosion')).toHaveLength(1);
  });

  /** Una capa presente sin fila en la tabla **calla** — no es la presencia de capas lo que desvía. */
  it('un shield presente no desvía nada: la tabla decide, no el hecho de portar capas', () => {
    expect(countOf(frozen(20, 0, { shields: 300 }), 'freeze')).toBe(FREEZE_DEFAULT_CAP);
    expect(RECEIVER_MAX_STACKS_BY_LAYER.shield).toBeUndefined();
  });
});

describe('El cap arrastra el bonus de crit sin que `critModifier` lo sepa', () => {
  /**
   * LA MEDICIÓN QUE RE-ESPECIFICÓ EL ISSUE. `critModifier` no recibe el `ReceiverContext` y **no le
   * hace falta**: lee `f(count)`, y el contexto ya actuó aguas arriba, sobre el contador.
   */
  it('con Overguard el crit damage recibido topea en +0.25×, la mitad del default +0.50×', () => {
    expect(frozen(20, 0).getCritBonuses(0).critMultAdd).toBeCloseTo(0.5, 5);
    expect(frozen(20, 500).getCritBonuses(0).critMultAdd).toBeCloseTo(0.25, 5);
  });

  /**
   * Y el clamp de la ley **no interviene**: `f(4) = 0.25` está por debajo del techo `0.5`. Es lo que
   * `stack-debuff.ts` ya declaraba —*"el único desvío declarado va hacia abajo … donde un clamp no
   * interviene"*— y ahora hay un caso que lo mide en vez de afirmarlo.
   */
  it('el desvío va hacia abajo, así que el cap `f(maxStacks)` de la ley no se ejerce', () => {
    expect(COLD_CRIT_LAW.cap).toBe(stackDebuffValue({ ...COLD_CRIT_LAW, cap: undefined }, FREEZE_DEFAULT_CAP));
    expect(stackDebuffValue(COLD_CRIT_LAW, 4)).toBeLessThan(COLD_CRIT_LAW.cap!);
  });
});

describe('Los tres pobladores del canal son ortogonales', () => {
  /**
   * §22 declara los tres registros excluyentes, y acá se mide que también lo son en composición: la
   * capa fuerza el CAP de Cold, la marca modifica el COEFICIENTE de Corrosive, la clase fuerza el cap
   * de cualquiera. Un target que porte los tres cobra los tres, sobre parámetros distintos.
   */
  it('capa ⊥ marca: el Overguard no toca el strip de Hydroid, la marca no toca el cap de Cold', () => {
    const t = makeIsolatedTarget({ armor: 1000, overguard: 500, marks: [HYDROID_MARK] });
    t.applyProc('freeze', DUMMY_HIT, 20, 0);
    t.applyProc('corrosion', DUMMY_HIT, 1, 0);

    expect(countOf(t, 'freeze')).toBe(4);                          // la capa fuerza
    expect(t.getEffectiveArmor(0)).toBeCloseTo(1000 * (1 - 0.50), 5); // la marca modifica

    // Y la marca sola no topea Cold: sin la capa, el default vuelve.
    const soloMarca = frozen(20, 0, { marks: [HYDROID_MARK] });
    expect(countOf(soloMarca, 'freeze')).toBe(FREEZE_DEFAULT_CAP);
  });
});
