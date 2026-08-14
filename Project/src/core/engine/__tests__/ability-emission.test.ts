/**
 * LA HABILIDAD COMO EMISOR DE INSTANCIAS — el frente, anclado antes de construirlo.
 *
 * `arch-decisions §15` nombra tres verbos para un nodo-source: **emite instancia**, **muta un state** y
 * el nulo. El segundo está construido end-to-end (Roar → pool de facción del arma). **El primero no**,
 * y §15 lo declara Fase 3 con una advertencia que este archivo respeta: *"no colgar más código que el
 * eslabón ya sostenido por un test"*. Por eso acá no hay implementación: hay `todo`s que nombran qué
 * habría que sostener.
 *
 * ─── POR QUÉ HACE FALTA UN BANCO DE PRUEBAS DEL EMISOR ────────────────────────────────────────────
 *
 * El lado receptor lo tiene desde hace tiempo y su doctrina está escrita: `makeIsolatedTarget` es
 * *"un banco de pruebas con números elegidos a mano"* y `syntheticHostile` **no pasa por el catálogo**
 * porque *"un test de ley que dependiera del dato del juego se rompería cuando ese dato cambie, y acá
 * lo que se ejerce es el behavior, no el enemigo"*. **Del lado emisor no hay equivalente**: todo test
 * de emisión sale de una build real, así que para ejercer una ley hay que elegir un arma concreta y
 * heredar sus números.
 *
 * ─── QUÉ ES EL SAMPLE Y QUÉ NO ────────────────────────────────────────────────────────────────────
 *
 * **No es inventar una habilidad.** Es tomar una real como **estructura** —el dato ya la trae entera:
 * `{ label: "Damage: <DT_HEAT> |val1|", base_value: [400, 800], upgrade_by: "AVATAR_ABILITY_STRENGTH" }`
 * es tipo, magnitud y escalado— y que el test declare **el eje que ejerce**: mismo emisor base, distinto
 * tipo de estado por instancia. Es el mismo movimiento que `lanka('charged_shot')`, donde el dato real
 * trae perfiles y el test elige cuál correr.
 *
 * **Y no compone.** Declara la instancia (tipos, procs, magnitud, `lawDeviations`); no reimplementa la
 * combinación de elementos (`status-base.ts`), ni el escalado por Ability Strength, ni la selección de
 * proc por peso (`proc-selection.ts`). Un sample que computa esas leyes en vez de consumirlas es un
 * segundo motor — la misma línea que sostiene al harness del receptor, que **declara**
 * `stacks: { corrosion: 5 }` en vez de simular cinco procs.
 *
 * ⚠️ **El label NO es la fuente de composición.** Fireball emite un proyectil que hace un daño y nada
 * más, así que su instancia casi no necesita fórmula propia; una habilidad multi-verbo (daño + defense
 * reduction + slow en el mismo cast, como Ophanim Eyes) no se deriva de leer su renglón de UI. La regla
 * de clasificación es la de §15: **por verbo, nunca por identidad de habilidad**.
 *
 * ─── EL CORPUS DISPONIBLE, MEDIDO ─────────────────────────────────────────────────────────────────
 *
 * `ability-stats.override.json`: **144 de 287** habilidades declaran al menos un `<DT_*>`, sobre 16
 * tipos. Corrosive aparece en 10, Heat en 30.
 */
import { describe, it } from 'vitest';

describe('La habilidad emite instancia — Fase 3 de `arch-decisions §15`', () => {
  // El sample: estructura de una habilidad real, eje declarado por el test. Sin él, ejercer una ley
  // del emisor obliga a elegir un arma concreta y heredar sus números.
  it.todo('un emisor declarado: `{ damageByType, statusChance, lawDeviations }` sin derivarlo de una build');
  // El eje del usuario: mismo emisor base, distinto estado por instancia. Los tres casos incluyen el
  // que hoy no se prueba en ningún lado — emitir daño y NO proquear.
  it.todo('mismo emisor, distinto proc por instancia: uno · varios · ninguno');

  // El primer consumidor real, y hoy imposible de escribir: no hay forma de emitir una instancia que
  // no venga de un arma. Es el `todo` gemelo del que vive en `status/stack-cap-ownership.test.ts`.
  it.todo('una habilidad que aplique Corrosive ve el cap desviado del emisor (19 con 3 Tauforged), igual que el arma');
  // Y su forma general: el desvío es del jugador, el nodo vive en el arma (`contracts/law-params.ts`).
  it.todo('de dónde lee sus `lawDeviations` una instancia que no sale de un arma — nodo duplicado ⊥ leído por el árbol');

  // Dos leyes escritas y nunca ejercidas: `formulas/ability/{ability-status,ability-crit}.ts` tienen
  // CERO consumidores. Un banco del emisor las vuelve ejecutables sin esperar a modelar un warframe.
  it.todo('`ability-status.ts` y `ability-crit.ts` tienen su primer consumidor');

  // §2: no hay modelo ontológico único. Fireball (proyectil → daño y nada más) casi no necesita
  // fórmula propia; una multi-verbo no se deriva de su renglón de UI. La partición es por VERBO (§15).
  it.todo('la partición emisor simple ⊥ multi-verbo: qué habilidad necesita fórmula dedicada y cuál no');
});
