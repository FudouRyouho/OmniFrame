/**
 * @domain Engine / Status / Ciclo de vida de los stack-debuff
 *
 * **La red que no existía.** Cambiar `DECAY_DURATION` de `6.0` a `8.0` no rompía un solo test de los
 * 597: el valor de esa constante era libre porque nada lo assertaba. Este archivo fija el ciclo de
 * vida de los cinco behaviors que acumulan stacks (`corrosion`, `infection`, `disruption`,
 * `weakened`, `freeze`) contra lo que la fuente declara, no contra lo que el código hace hoy.
 *
 * **Lo que la fuente declara** (`references/wiki/mechanics/status-effects.md` §Duración base,
 * §Stacks: caps y comportamiento — corregidas contra las subpáginas por tipo):
 *
 * ```
 * Corrosive  cap 10   8 s    reemplaza al más viejo   timer propio por stack
 * Viral      cap 10   6 s    reemplaza al más viejo   timer propio por stack
 * Magnetic   cap 10   6 s    reemplaza al más viejo   timer propio por stack
 * Puncture   cap  5  10 s    reemplaza al más viejo   timer propio  ← «aunque al viejo le quede más duración»
 * Cold       cap 10   6 s    (10º congela)            timer propio
 * ```
 *
 * > **Regla general emergente:** timer independiente por stack/instancia en casi todos.
 *
 * Heat es la **excepción explícita de la misma fuente** (*"los stacks se consolidan en UN solo
 * tick/s compartido"*), así que no entra acá: su decay agregado es fiel, no una simplificación.
 *
 * **Por qué el modelo escalar no puede pasar estos tests.** `decayCount(count, dt) = count −
 * (count/D)·dt` sangra el AGREGADO: es exponencial, nunca llega a cero (vale `1.78e-5` a los 60 s) y
 * su resultado depende del paso de muestreo. Con una constante única para cinco efectos cuyas
 * duraciones publicadas son 6/6/6/8/10, además, dos de los cinco están simplemente mal.
 *
 * Ligado a #10 y a `dt-invariance.test.ts` (que mide la misma causa desde la consistencia interna).
 * **No contesta `OQ-ENGINE-16`**: aquélla pregunta si declarar N es FIEL —eje del input de C1—, y
 * esto es el ciclo de vida del estado ya aplicado. Son ejes distintos y el refactor no los junta.
 */
import { describe, it, expect } from 'vitest';
import { advanceAndResolve } from '../../simulate/advance';
import { makeIsolatedTarget } from './harness';
import type { StatusEffect } from '@shared/types';

/** Avanza un estado de `0` a `hasta` en pasos de `dt`. El épsilon evita un paso final espurio. */
function correr(state: ReturnType<typeof makeIsolatedTarget>, hasta: number, dt: number): void {
  for (let t = 0; t < hasta - 1e-9; t += dt) advanceAndResolve(state, t, dt);
}

const hit = { moddedBase: 100, statusDamageBonusPct: 0, elementBonusPct: {} };

const countOf = (s: ReturnType<typeof makeIsolatedTarget>, effect: StatusEffect): number =>
  (s.effectStates.get(effect) as { count: number } | undefined)?.count ?? 0;

/** Duración publicada por la fuente, por efecto. */
const DURACION: Record<string, number> = {
  corrosion: 8,   // Corrosive
  infection: 6,   // Viral
  disruption: 6,  // Magnetic
  weakened: 10,   // Puncture
  freeze: 6,      // Cold
};

describe('La ventana es por efecto, no una constante única', () => {
  for (const [effect, dur] of Object.entries(DURACION)) {
    it(`\`${effect}\` sobrevive hasta su duración publicada (${dur} s) y expira después`, () => {
      const antes = makeIsolatedTarget();
      antes.applyProc(effect as StatusEffect, hit, 1, 0);
      correr(antes, dur - 0.2, 0.1);
      expect(countOf(antes, effect as StatusEffect)).toBeCloseTo(1, 9);

      const despues = makeIsolatedTarget();
      despues.applyProc(effect as StatusEffect, hit, 1, 0);
      correr(despues, dur + 0.2, 0.1);
      expect(countOf(despues, effect as StatusEffect)).toBe(0);
    });
  }

  it('`corrosion` (8 s) y `weakened` (10 s) no expiran juntos — hoy comparten constante', () => {
    const s = makeIsolatedTarget();
    s.applyProc('corrosion', hit, 1, 0);
    s.applyProc('weakened', hit, 1, 0);
    correr(s, 9, 0.1);   // pasada la ventana de Corrosive, dentro de la de Puncture
    expect(countOf(s, 'corrosion')).toBe(0);
    expect(countOf(s, 'weakened')).toBeCloseTo(1, 9);
  });
});

describe('El contador llega a cero exacto, no asintóticamente', () => {
  it('un stack expira entero: no queda residuo', () => {
    const s = makeIsolatedTarget();
    s.applyProc('infection', hit, 5, 0);
    correr(s, 20, 0.1);   // muy por encima de los 6 s de Viral
    // El decay exponencial deja `5·e^(−20/6) ≈ 0.018`: distinto de 0, y suficiente para que
    // `if (state.count <= 0)` no corte y el debuff siga contribuyendo para siempre.
    expect(countOf(s, 'infection')).toBe(0);
  });
});

describe('El conteo no depende del paso de muestreo', () => {
  const PASOS = [3, 1, 0.5, 0.25, 1 / 15];

  it('el count de corrosión a 3 s es el mismo con cualquier `dt`', () => {
    const medido = PASOS.map((dt) => {
      const s = makeIsolatedTarget();
      s.applyProc('corrosion', hit, 10, 0);
      correr(s, 3, dt);
      return countOf(s, 'corrosion');
    });
    // Con ventana por instancia el resultado sólo depende de `t` absoluto: los 10 stacks entraron en
    // `t=0` y su ventana de 8 s no venció, así que son 10 en los cinco pasos. El escalar da
    // 5.00 · 5.79 · 5.93 · 6.00 · 6.05 — el muestreo actuando de fuente de verdad.
    for (const count of medido) expect(count).toBeCloseTo(medido[0], 9);
    expect(medido[0]).toBeCloseTo(10, 9);
  });
});

describe('Sobre-cap: refrescar el más viejo mantiene el conteo — `references/ingame-tests/status-stack-caps.md`', () => {
  it('con el cap lleno, los procs nuevos sostienen el conteo en vez de dejarlo decaer (test 2 del ingame)', () => {
    // El caso medido: A llena el cap y espera; B sigue disparando. Medido in-game: **no decae**,
    // porque cada proc de B refresca rotativamente el stack más viejo. Un contador escalar no puede
    // expresarlo — no hay «el más viejo» en un número.
    const s = makeIsolatedTarget();
    s.applyProc('corrosion', hit, 10, 0);
    for (let t = 0.5; t <= 12; t += 0.5) {
      advanceAndResolve(s, t - 0.5, 0.5);
      s.applyProc('corrosion', hit, 1, t);   // un proc por medio segundo, con el cap ya lleno
    }
    expect(countOf(s, 'corrosion')).toBeCloseTo(10, 9);
  });

  it('sin procs nuevos, el mismo conteo sí expira', () => {
    // La contraparte del anterior: si el refresco es lo que sostiene el conteo, quitarlo lo tira.
    // Sin este caso, un behavior que simplemente nunca decae pasaría el test de arriba.
    const s = makeIsolatedTarget();
    s.applyProc('corrosion', hit, 10, 0);
    correr(s, 12, 0.5);
    expect(countOf(s, 'corrosion')).toBe(0);
  });
});
