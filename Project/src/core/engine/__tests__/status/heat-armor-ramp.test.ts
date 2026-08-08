/**
 * @domain Engine / C2 — el armor strip de Heat: un NIVEL en el portador, no una ventana del proc
 *
 * **La forma, tal como la declara la fuente** (`references/wiki/mechanics/damage-heat-damage.wikitext`
 * §Armor Stripping):
 *
 * ```
 * sube   15 → 30 → 40 → 50      cada 0.5 s   (2 s de ida)
 * baja   50 → 40 → 30 → 15 → 0  cada 1.5 s   (6 s de vuelta)
 * ```
 *
 * Los mismos cuatro valores, recorridos al revés, 3× más lento. Eso NO son dos efectos: es **un nivel
 * con dos regímenes**, y el proc sólo elige la dirección. La regla de cierre es leer el nivel, no
 * componer ventanas — un proc que entra a mitad de la vuelta no cancela nada ni abre nada: el nivel
 * deja de bajar y sube **desde donde está** (`… 40 → 30 → [proc] → 40 → 50`). Por eso no hay que
 * decidir "quién gana": hay un solo valor.
 *
 * **Qué mide este archivo.** Las tres facetas en que el motor se aparta de esa forma, cada una con el
 * target que la fuente declara. Son `fails` y no `todo` porque están MEDIDAS y el target es verificable
 * (`test/test-workflow.md`): no es un borde por construir, es un conocido-roto con número.
 *
 * **Por qué no se arreglan acá.** Las tres piden lo mismo y es lo mismo que pide la fuga de `dt`
 * (`dt-invariance.test.ts`): que el nivel guarde **el instante del cambio de régimen** —
 * `{nivel, at, dirección}` → `f(t − at)` — en vez de progreso acumulado. Es el modelo de tiempo, no un
 * parche de `igniteBehavior`. Registrado en `../../../../../docs/domains/engine/status.md §Deudas`.
 */
import { describe, it, expect } from 'vitest';
import { makeIsolatedTarget } from './harness';

const hit = { moddedBase: 100, statusDamageBonusPct: 0, elementBonusPct: {} };

/** Avanza el estado de `0` a `hasta` en pasos de `dt`. El épsilon evita un paso final espurio. */
function correr(state: ReturnType<typeof makeIsolatedTarget>, hasta: number, dt: number): void {
  for (let t = 0; t < hasta - 1e-9; t += dt) state.processDots(t, dt);
}

/** Un solo proc en `t=0` y nada más: el caso mínimo donde la terminación es toda la pregunta. */
function unSoloProc(dt: number, hasta: number) {
  const s = makeIsolatedTarget({ armor: 1000, health: 1e9 });
  s.applyProc('ignite', hit, 1, 0);
  correr(s, hasta, dt);
  return s;
}

describe('Heat — el nivel de armor strip vive en el portador y tiene que volver', () => {
  it.fails('[termina] a los 60 s de un solo proc el armor está entero — hoy sigue 50% stripeado', () => {
    // Medido: `armor = 500.0000` a t=60 con `dt=1` Y con `dt=1/15` — el armor NO se mueve con el paso,
    // así que esto no es la fuga de `dt`: es el mismo escalar por otra vía. El gate es `state.ignite > 0`
    // y `decayCount` es exponencial (`count − (count/6)·dt`), o sea que vale `1.78e-5` a los 60 s y no
    // cruza cero nunca. La misma raíz deja el `pool` de daño emitiendo `8.9e-4/s` sobre un DoT de 6 s.
    for (const dt of [1, 1 / 15]) {
      expect(unSoloProc(dt, 60).getEffectiveArmor(60)).toBeCloseTo(1000, 6);
    }
  });

  it.fails('[vuelve] la vuelta pasa por los mismos escalones, 3× más lenta — hoy no hay vuelta', () => {
    // El DoT de Heat dura 6 s, así que la vuelta corre de `t=6` a `t=12`. El motor no modela ese cierre
    // (el pool decae asintótico, ver arriba); el target es el de la fuente, no el del modelo actual.
    const s = unSoloProc(1 / 15, 12);
    const esperado: Array<[number, number]> = [
      [6.0, 500],   // el proc acaba de morir: meseta, 50% stripeado
      [7.5, 600],   // 40%
      [9.0, 700],   // 30%
      [10.5, 850],  // 15%
      [12.0, 1000], // 0% — el nivel volvió a su lugar
    ];
    for (const [t, armor] of esperado) expect(s.getEffectiveArmor(t)).toBeCloseTo(armor, 6);
  });

  it.fails('[sube por escalones] a `t=1` el strip es 30%, no 16.67% — la rampa del motor es lineal', () => {
    // `rampProgress = (elapsed − 0.5)/1.5` es continuo; la fuente da cuatro escalones discretos. El
    // motor y la fuente sólo coinciden en la meseta (`t ≥ 2`), que es justamente el tramo que
    // `references/ingame-tests/damage-buckets.md` §Test 7 se cuida de medir (por eso mide el ÚLTIMO tick).
    const s = unSoloProc(1 / 15, 2);
    const esperado: Array<[number, number]> = [
      [0.5, 850],  // 15% — el motor todavía no strippea nada (su gate es `elapsed > 0.5` estricto)
      [1.0, 700],  // 30% — el motor da 833.33
      [1.5, 600],  // 40%
      [2.0, 500],  // 50% — acá sí coinciden
    ];
    for (const [t, armor] of esperado) expect(s.getEffectiveArmor(t)).toBeCloseTo(armor, 6);
  });

  it.todo('[la vuelta no es del emisor] Status Duration alarga la ida; la vuelta ocurre sin emisor vivo — sin medir');
});
