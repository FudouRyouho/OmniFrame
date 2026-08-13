/**
 * @domain Engine / C2 — la composición «avanzar → resolver → recibir»
 * @SSoT docs/domains/engine/design/damage-status-model.md §Modelo unificado de proc
 *
 * **Por qué esto no vive dentro del estado.** Antes sí: `EnemyState.processDots` avanzaba los
 * efectos, resolvía lo emitido pasándose a sí mismo al resolvedor —que volvía a leerlo para mitigar
 * y elegir capa— y se escribía el resultado. Causa y efecto en el mismo lugar, y un ciclo de imports
 * real entre el contenedor y el resolvedor.
 *
 * La forma correcta ya estaba escrita una capa más abajo: `EffectBehavior.advance` **devuelve**
 * `{state, damage}` en vez de aplicar. Acá se extiende al contenedor — el estado avanza y **entrega**
 * lo que emitió; quien es dueño del bucle resuelve y le devuelve el resultado por `receive`.
 *
 * Lo que queda del lado del estado es leer y escribirse **desde afuera**. Lo que queda acá es el
 * único lugar donde el ciclo de vida de un tick se compone entero.
 */
import type { EnemyState } from "./enemies/EnemyState";
import { CombatSimulator } from "./combat/CombatSimulator";
import { damageTokenFromType } from "../contracts/damage-logic";

/**
 * Avanza el estado en `[currentTime, +dt)` y aplica lo que sus efectos emitieron, resolviendo cada
 * emisión por el **mismo camino que un hit directo** (`resolveDamageEvent`) — un tick de DoT no es
 * una excepción del pipeline, es una instancia más que nace del target.
 */
export function advanceAndResolve(state: EnemyState, currentTime: number, dt: number): void {
  for (const res of state.advance(currentTime, dt)) {
    const { layer, finalDamage } = CombatSimulator.resolveDamageEvent(
      damageTokenFromType(res.as), res.value, state, currentTime,
    );
    state.receive(layer, finalDamage, currentTime);
  }
  state.clampVitals();
}
