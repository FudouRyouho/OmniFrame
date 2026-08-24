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
 * ⚠️ **Y `dt` no es libre:** `TimelineSimulator` avanza con `step = 0.1` **fijo** — el paso no es una
 * perilla del observador, es una constante enterrada en el bucle, y la fuga de abajo la vuelve parte
 * del resultado. (`1/fireRate` NO es el paso: gobierna la detección de disparos y el piso del `ttk`,
 * con problemas propios registrados aparte.) Deuda en `../../../../../docs/domains/engine/status.md`.
 *
 * **Distinto de `OQ-ENGINE-16`** (N-declarado vs timers reales), y no lo subsume: aquélla pregunta si un
 * N declarado es FIEL —cuestión de dato, gated por medición in-game—; ésta mide que el modelo actual no
 * es consistente **consigo mismo**, sin opinar sobre fidelidad. Se cierra sin dato nuevo.
 */
import { describe, it, expect } from 'vitest';
import { advanceAndResolve } from '../../simulate/advance';
import { makeIsolatedTarget } from './harness';

/** Avanza un estado de `0` a `hasta` en pasos de `dt`. El épsilon evita un paso final espurio. */
function correr(state: ReturnType<typeof makeIsolatedTarget>, hasta: number, dt: number): void {
  for (let t = 0; t < hasta - 1e-9; t += dt) advanceAndResolve(state, t, dt);
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

  it('[stack-debuff] el count de corrosión a 3s no depende de `dt` — cerrado por #10', () => {
    const medido = PASOS.map((dt) => {
      const s = makeIsolatedTarget();
      s.applyProc('corrosion', hit, 10, 0);
      correr(s, 3, dt);
      return (s.effectStates.get('corrosion') as { count: number }).count;
    });

    // Fue `it.fails` mientras el estado era un escalar que sangraba: `decayCount(count, dt) = count −
    // (count/6)·dt` re-aplicaba el sangrado sobre su propio resultado, así que N pasos chicos ≠ un
    // paso grande — 5.0000 · 5.7870 · 5.9329 · 6.0007 · 6.0484 para los cinco `dt`, convergiendo a
    // 10·e^(−3/6) sólo en el límite. Ningún paso daba la respuesta: la daba el límite.
    //
    // La cura no fue integrar mejor, fue cambiar la forma del estado: cada stack lleva su ventana y
    // la poda se evalúa contra un instante ABSOLUTO (`at + duración > until`), así que el muestreo
    // dejó de ser fuente de verdad. Los 10 stacks entran en `t=0` y su ventana de 8 s (Corrosive) no
    // vence a los 3 s — son 10 en los cinco pasos, y el número ya no es «lo que el muestreo dejó».
    for (const count of medido) expect(count).toBeCloseTo(medido[0], 9);
    expect(medido[0]).toBeCloseTo(10, 9);
  });

  it.todo('[source] la misma invariante del lado emisor — hoy no hay reloj que preguntar (`context.variables` es un número)');
});

describe('El gate expone que las emisiones pierden su instante', () => {
  /**
   * 🔴 **CONOCIDO-ROTO, y la causa no es el gate.**
   *
   * `Resolucion { value, as }` **no lleva `at`**: el behavior del DoT suma todos los ticks que caen
   * en `[t, t+dt)` en un solo `value`, y `advanceAndResolve` los resuelve como **un evento** en
   * `currentTime`. Los ticks declaran su instante (`DotPulse.firstTick` + `interval`) y la emisión lo
   * tira — que es exactamente lo que este archivo llama *"el reloj es del observador"*.
   *
   * Hasta ahora no importaba: el TOTAL es invariante (el primer test de este archivo lo fija en 210)
   * y ningún consumidor dependía del evento individual. **El gate es el primero que sí**, porque
   * corta por evento: dos ticks agrupados encuentran shield una sola vez.
   *
   * MEDIDO — daño que llega a la salud, shield 100, bleed de 210 en 6 ticks de 35 espaciados 1 s:
   *
   * | `dt`   | 0.1 | 0.5 | 0.9 | 1.0 | 1.1 | **1.5** | 2.0 | **3.0** |
   * |--------|-----|-----|-----|-----|-----|---------|-----|---------|
   * | perdido|105.25|105.25|105.25|105.25|105.25| **72.00** |105.25| **38.75** |
   *
   * Diverge **cuando `dt` supera el intervalo entre ticks**, y `dt=2` vuelve a coincidir por
   * casualidad (agrupa de a dos, en fase). **No está activo en producción**: `TimelineSimulator`
   * avanza con `step = 0.1` fijo.
   *
   * LA CURA es que `Resolucion` lleve su `at` y que cada emisión se resuelva en SU instante, no en el
   * del muestreo. Eso además arregla algo que hoy nadie mide: el armor y los multiplicadores de capa
   * se leen con `currentTime`, así que un tick que ocurrió a mitad del intervalo se resuelve contra
   * el estado del borde.
   */
  it.fails('[gate] la ventana no debería depender de `dt` — se mueve 105.25 → 72.00 → 38.75', () => {
    const medido = PASOS.map((dt) => {
      const s = makeIsolatedTarget({ shields: 100, health: 10_000 });
      s.applyProc('bleed', hit, 1, 0);
      correr(s, 8, dt);
      return s.current_health;
    });
    for (const hp of medido) expect(hp).toBeCloseTo(medido[0], 9);
  });

  it('el gate SÍ es invariante mientras `dt` no agrupe ticks — el rango que el motor usa', () => {
    // Con el `step = 0.1` real y todo lo que no agrupe, el resultado es estable. Esto no disimula el
    // `it.fails` de arriba: acota dónde vale hoy, para que la cura se mida contra algo.
    for (const dt of [0.1, 0.25, 0.5, 1]) {
      const s = makeIsolatedTarget({ shields: 100, health: 10_000 });
      s.applyProc('bleed', hit, 1, 0);
      correr(s, 8, dt);
      expect(10_000 - s.current_health).toBeCloseTo(105.25, 9);
    }
  });
});
