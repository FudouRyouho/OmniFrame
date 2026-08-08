/**
 * @domain Engine / C2 — invariancia al paso de muestreo
 *
 * **La invariante:** cambiar cada cuánto se mira NO puede cambiar lo que pasó. El paso `dt` es una
 * perilla de COSTO (resolución de la simulación), nunca de RESULTADO. Si el número se mueve con `dt`,
 * el muestreo está actuando de fuente de verdad — y el muestreo es la lente, no el suceso.
 *
 * **Por qué existe este archivo.** `arch-decisions §20` decidió que una entidad se lee por MUESTREO y
 * no por eventos (*"the effect will also trigger as soon as an enemy's Overguard breaks, even if new
 * Heat procs are not being actively applied"* — no hay evento que detectar, hay muestreo). Esa decisión
 * sólo se sostiene si lo muestreado declara su ventana en términos ABSOLUTOS. Hoy el motor tiene cuatro
 * nociones privadas de "cuándo" y sólo dos cumplen:
 *
 * | Implementación | Forma del tiempo | invariante |
 * |---|---|---|
 * | `DotPulse {firstTick, ticks, interval}` | intervalo con inicio absoluto | ✅ |
 * | rampa de armor de `ignite` | `f(t − firstProcTime)` | ✅ |
 * | `decayCount(count, dt)` | sangrado recursivo del AGREGADO | ❌ |
 * | `context.variables[x]` (todo el lado source) | ninguna — no hay reloj que preguntar | n/a |
 *
 * Las dos que pasan comparten la propiedad y no es casualidad: **el suceso declara cuándo, la muestra
 * sólo pregunta**. Las dos que fallan guardan el tiempo como *progreso acumulado*, que es otra forma de
 * decir que el reloj es del observador.
 *
 * ⚠️ **Y `dt` no es libre:** `TimelineSimulator` lo fija en `1 / fireRate`. El paso de muestreo lo
 * elige la cadencia del arma, así que la fuga de abajo se expresa como *"el estado del enemigo decae
 * distinto según qué arma tengas en la mano"*. Registrado como deuda en `../../../../../docs/domains/engine/status.md`.
 *
 * **Distinto de `OQ-ENGINE-16`** (N-declarado vs timers reales), y no lo subsume: aquélla pregunta si un
 * N declarado es FIEL —cuestión de dato, gated por medición in-game—; ésta mide que el modelo actual no
 * es consistente **consigo mismo**, sin opinar sobre fidelidad. Se cierra sin dato nuevo.
 */
import { describe, it, expect } from 'vitest';
import { makeIsolatedTarget } from './harness';

/** Avanza un estado de `0` a `hasta` en pasos de `dt`. El épsilon evita un paso final espurio. */
function correr(state: ReturnType<typeof makeIsolatedTarget>, hasta: number, dt: number): void {
  for (let t = 0; t < hasta - 1e-9; t += dt) state.processDots(t, dt);
}

/** Los pasos que se barren. Incluye `1/15` = la cadencia de un arma rápida (el `dt` real del motor). */
const PASOS = [3, 1, 0.5, 0.25, 1 / 15];

const hit = { moddedBase: 100, statusDamageBonusPct: 0, elementBonusPct: {} };

describe('Invariancia al paso de muestreo — `dt` es perilla de costo, no de resultado', () => {
  it('[DoT] el daño total de un pulso de bleed no depende de `dt` — 210 en los 5 pasos', () => {
    const medido = PASOS.map((dt) => {
      const s = makeIsolatedTarget({ health: 100_000 });
      const h0 = s.current_health;
      s.applyProc('bleed', hit, 1, 0);
      correr(s, 8, dt);
      return h0 - s.current_health;
    });

    // El pulso declara `firstTick` absoluto y `tickTimes` deriva los instantes: cada tick cae una vez
    // y sólo una, mire quien mire y cada cuánto.
    for (const total of medido) expect(total).toBeCloseTo(medido[0], 9);
    expect(medido[0]).toBeCloseTo(210, 9);
  });

  it('[ignite] la rampa de armor a un `t` dado no depende de `dt` — lee elapsed absoluto', () => {
    // Se muestrea a `t=1`, a MITAD de rampa (`(1−0.5)/1.5 = ⅓` de un strip máximo del 50%): en la
    // saturación (`t ≥ 2`) el test pasaría trivialmente porque el valor ya no se mueve.
    const medido = PASOS.map((dt) => {
      const s = makeIsolatedTarget({ armor: 1000 });
      s.applyProc('ignite', hit, 1, 0);
      correr(s, 1, dt);
      return s.getEffectiveArmor(1);
    });

    // `elapsed = t − firstProcTime` — el estado guarda CUÁNDO empezó, no cuánto lleva acumulado.
    for (const armor of medido) expect(armor).toBeCloseTo(medido[0], 9);
    // No vacío: la rampa efectivamente movió el armor, y a un valor intermedio (ni 1000 ni 500).
    expect(medido[0]).toBeCloseTo(1000 * (1 - 0.5 / 3), 9);
  });

  it.fails('[stack-debuff] el count de corrosión a 3s NO debería depender de `dt` — se mueve 5.00 → 6.05', () => {
    const medido = PASOS.map((dt) => {
      const s = makeIsolatedTarget();
      s.applyProc('corrosion', hit, 10, 0);
      correr(s, 3, dt);
      return (s.effectStates.get('corrosion') as { count: number }).count;
    });

    // Medido: dt=3 → 5.0000 · dt=1 → 5.7870 · dt=0.5 → 5.9329 · dt=0.25 → 6.0007 · dt=1/15 → 6.0484.
    // La causa es la forma, no un redondeo: `decayCount(count, dt) = count − (count/6)·dt` re-aplica el
    // sangrado sobre el resultado anterior, así que N pasos chicos ≠ un paso grande. Converge a
    // 10·e^(−3/6) = 6.0653 cuando dt→0, o sea que ningún paso da la respuesta correcta: la da el límite.
    //
    // La cura NO es integrar mejor. Es que el estado deje de ser un escalar que sangra y pase a llevar
    // instancias con su propia ventana — que es, además, lo único que puede contestar "cuál es el más
    // viejo" (la regla `count ≥ cap` → refresca el más viejo, medida en `references/ingame-tests/
    // status-stack-caps.md`). Dos razones independientes para el mismo cambio; ver `OQ-ENGINE-16`.
    for (const count of medido) expect(count).toBeCloseTo(medido[0], 9);
  });

  it.todo('[source] la misma invariante del lado emisor — hoy no hay reloj que preguntar (`context.variables` es un número)');
});
