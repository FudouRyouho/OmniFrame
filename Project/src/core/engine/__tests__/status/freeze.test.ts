/**
 * Freeze (Cold) — el 10º stack: congelación sólida, crit fijo, colapso a residuales (#12).
 *
 * `receiver-layer.test.ts` mide el CANAL (el cap por clase/capa que decide hasta dónde sube el
 * contador); `stackDebuffValue`/`COLD_CRIT_LAW` (1er..9º stack) ya estaban cubiertos ahí y en
 * `stack-debuff-law.test.ts`. Éste mide el BEHAVIOR en sí — el ciclo `applyProc → advance →
 * critModifier` que el 10º stack agrega, altitud 2 (`disruption.test.ts`/`infection.test.ts` son el
 * mismo molde para sus efectos). Ver status-effects.md §Cold.
 */
import { describe, it, expect } from 'vitest';
import { makeIsolatedTarget } from './harness';
import { advanceAndResolve } from '../../simulate/advance';
import { stackDebuffValue, COLD_CRIT_LAW } from '../../formulas/status/stack-debuff';
import type { HitContext } from '../../formulas/status/effect-behavior';

const DUMMY_HIT: HitContext = { moddedBase: 0, statusDamageBonusPct: 0, elementBonusPct: {} };

const countOf = (t: ReturnType<typeof makeIsolatedTarget>): number =>
  (t.effectStates.get('freeze') as { count: number } | undefined)?.count ?? 0;

describe('Freeze — el 10º stack congela (#12)', () => {
  it('al llegar a 10, el crit recibido es el fijo +1.0×, no la fórmula continua (f(10) no se evalúa)', () => {
    const t = makeIsolatedTarget({});
    t.applyProc('freeze', DUMMY_HIT, 10, 0);
    expect(countOf(t)).toBe(10);
    expect(t.getCritBonuses(0).critMultAdd).toBeCloseTo(1.0, 5);
  });

  it('mientras dura la congelación (3s), un proc nuevo no sube el contador — "no recibe más stacks"', () => {
    const t = makeIsolatedTarget({});
    t.applyProc('freeze', DUMMY_HIT, 10, 0);
    t.applyProc('freeze', DUMMY_HIT, 20, 1); // adentro de la ventana de 3s, un EV grande no mueve nada
    expect(countOf(t)).toBe(10);
    expect(t.getCritBonuses(1).critMultAdd).toBeCloseTo(1.0, 5);
  });

  it('al expirar (3s desde que se disparó), colapsa a 3 residuales — no a 0 y no sigue en 10', () => {
    const t = makeIsolatedTarget({});
    t.applyProc('freeze', DUMMY_HIT, 10, 0);
    advanceAndResolve(t, 0, 3);
    expect(countOf(t)).toBe(3);
    // Y el crit vuelve a ser la fórmula continua sobre los residuales, no el fijo de la congelación.
    expect(t.getCritBonuses(3).critMultAdd).toBeCloseTo(stackDebuffValue(COLD_CRIT_LAW, 3), 5);
  });

  it('tras descongelar, vuelve a aceptar stacks nuevos sobre los 3 residuales', () => {
    const t = makeIsolatedTarget({});
    t.applyProc('freeze', DUMMY_HIT, 10, 0);
    advanceAndResolve(t, 0, 3);
    t.applyProc('freeze', DUMMY_HIT, 2, 3);
    expect(countOf(t)).toBe(5); // 3 residuales + 2 nuevos, ya no está congelado
  });

  it('antes del umbral (9 stacks) sigue siendo la fórmula continua — sin regresión sobre lo ya construido', () => {
    const t = makeIsolatedTarget({});
    t.applyProc('freeze', DUMMY_HIT, 9, 0);
    expect(countOf(t)).toBe(9);
    expect(t.getCritBonuses(0).critMultAdd).toBeCloseTo(0.5, 5); // f(9), el techo de la ley continua
  });

  /**
   * LA TRAMPA QUE `frozenUntil` ABRIÓ, y por qué este caso existe.
   *
   * El harness declara estado de proc a mano, y para `freeze` escribía sólo `{ count }` — dejando
   * `frozenUntil` en `undefined`. El behavior preguntaba `!== null`, y en JS `undefined !== null` es
   * **`true`**: un target con 5 stacks declarados cobraba el `+1.0×` de la congelación sólida y su
   * contador **no decaía nunca**. Medido antes de corregirlo, con los dos lados arreglados (el harness
   * fabrica el estado entero; `isFrozen` usa `!= null`).
   *
   * Sin este caso nada lo sostiene: ningún test usaba `stacks: { freeze: N }` cuando el bug se
   * introdujo, que es exactamente por qué pasó desapercibido.
   */
  it('el estado declarado por el harness NO es un estado congelado: cobra f(n) y expira', () => {
    const t = makeIsolatedTarget({ stacks: { freeze: 5 } });
    expect(t.getCritBonuses(0).critMultAdd).toBeCloseTo(stackDebuffValue(COLD_CRIT_LAW, 5), 5);
    // La aserción medía «decayó» contra el sangrado continuo del contador; con la ventana por stack
    // (#10) el conteo se sostiene hasta vencer y recién ahí cae. La INTENCIÓN no cambia —distinguir
    // un estado que envejece de uno trabado en congelación— y el caso sigue distinguiéndolos: si
    // `isFrozen` volviera a leer el declarado como congelado, `advance` devolvería el estado intacto
    // y el conteo seguiría en 5 para siempre, con o sin ventana.
    advanceAndResolve(t, 0, 7);           // más allá de los 6 s de Cold
    expect(countOf(t)).toBe(0);           // envejeció y expiró, no quedó trabado en congelación
  });

  // Lo que NO tenemos hoy — gaps del motor entero, no de este behavior (ver behaviors.ts):
  it.todo('niega la recarga natural de shields durante la congelación — no hay sistema de regen de shields');
  it.todo('"sin acciones" (congelación sólida) — control de input, fuera del dominio del motor');
});
