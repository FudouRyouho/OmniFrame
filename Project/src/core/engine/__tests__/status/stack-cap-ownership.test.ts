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
 * LO QUE EL MOTOR HACE HOY — `behaviors.ts`: `min(CORROSIVE_MAX_STACKS, count + amount)`.
 * Las dos funciones coinciden **mientras `count ≤ cap`**, o sea mientras haya un solo emisor. Cuando
 * el contador ya está por encima del cap del que aplica, `min()` lo **colapsa hacia abajo** — y la
 * regla real nunca lo baja.
 *
 * POR QUÉ EL CASO SE PUEDE ESCRIBIR HOY sin modelar dos jugadores: el bug no necesita dos emisores
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

/** Instancia mínima: el contador no depende de la magnitud del hit, sólo del evento. */
const HIT: HitContext = { moddedBase: 100, statusDamageBonusPct: 0, elementBonusPct: 0 };

const countOf = (t: ReturnType<typeof makeIsolatedTarget>): number =>
  (t.effectStates.get('corrosion') as { count: number } | undefined)?.count ?? 0;

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

  // ── Lo que el motor rompe: `min()` colapsa el contador cuando ya está sobre el cap ──────────────

  it.fails(
    '#1 — con 19 stacks puestos, un emisor de cap 10 REFRESCA y el contador SE MANTIENE en 19',
    () => {
      // Medido: "A pone 19, B dispara → se mantiene en 19". El motor da `min(10, 20)` = 10.
      const t = makeIsolatedTarget({ armor: 1000, stacks: { corrosion: 19 } });
      t.applyProc('corrosion', HIT, 1, 0);
      expect(countOf(t)).toBe(19);
    },
  );

  it.fails(
    '#5 — con 11 stacks, el emisor de cap 10 no puede subirlo NI bajarlo (queda 11)',
    () => {
      // Mismo bug, un stack por encima del cap: `min(10, 12)` = 10, o sea le BAJA uno.
      const t = makeIsolatedTarget({ armor: 1000, stacks: { corrosion: 11 } });
      t.applyProc('corrosion', HIT, 1, 0);
      expect(countOf(t)).toBe(11);
    },
  );

  it.fails(
    'un proc sobre-cap nunca baja el contador — invariante sobre todo el rango medido',
    () => {
      for (const n of [11, 13, 15, 17, 19]) {
        const t = makeIsolatedTarget({ armor: 1000, stacks: { corrosion: n } });
        t.applyProc('corrosion', HIT, 1, 0);
        expect(countOf(t)).toBeGreaterThanOrEqual(n);
      }
    },
  );

  // ── La mitad de `CV-3` que no tiene maquinaria: el desvío con su procedencia ────────────────────

  // El cap 19 = default 10 + `3 × Tauforged Emerald` (+3 c/u). Es un desvío del EMISOR, y hoy
  // `applyProc` no recibe quién aplica — el cap sale de una constante del módulo.
  it.todo('el EMISOR desvía su propio cap (3 × Tauforged Emerald: 10 → 19) — CV-3, canal de desvío');
  it.todo('dos emisores con caps distintos sobre UN contador: el cap efectivo difiere por instancia');
  it.todo('el RECEPTOR fuerza el cap (Acolyte: N ≤ 4) — `fuerza` ⊥ `modifica`, §17');
  // `StackState { count }` es escalar; "refresca el más viejo" opera sobre instancias con timer
  // propio. El DoT ya modela instancias (`DotState { pulses }`) — la asimetría es interna al módulo.
  it.todo('refrescar el stack más viejo requiere instancias con timer, no un contador — OQ-ENGINE-16');
});
