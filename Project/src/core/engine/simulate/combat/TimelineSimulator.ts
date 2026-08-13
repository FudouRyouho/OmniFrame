/**
 * @domain Simulation-v2 / Logic / Simulator
 */
import type { SimulationEntity, SimulationContext } from "../../contracts";
import type { Layer } from "../../contracts/layers";
import { CombatSimulator } from "./CombatSimulator";
import { RngProvider } from "./RngProvider";
import { EnemyState } from "../enemies/EnemyState";
import { advanceAndResolve } from "../advance";
import { effectOfDamageType } from "@shared/types";
import { expectedProcEvents } from "../../formulas/status/proc-population";
import type { HitContext } from "../../formulas/status/effect-behavior";
import { deriveInstance } from "./damage-instance";

export interface TimelineEvent {
  time: number;
  damage: number;
  cumulative_damage: number;
  enemy_health: number;
  enemy_armor: number;
  stacks: Record<string, number>;
}

export interface SimulationResult {
  events: TimelineEvent[];
  ttk: number | null; // Time to Kill en segundos (nunca 0: piso = 1 ciclo de disparo)
  shots_to_kill: number | null; // disparos efectuados hasta detectar la muerte
  total_damage: number;
}

/**
 * TimelineSimulator - Proyecta el combate como una serie temporal de eventos.
 */
export class TimelineSimulator {
  /**
   * Simula una ráfaga y luego observa el sangrado post-disparo.
   *
   * ⚠️ `context` NO TIENE UN SOLO LECTOR acá. Al retirar `laws` (§17) quedó visible que ese parámetro
   * existía únicamente para transportarlas: `flags`, `variables` y `active_profile_id` no se leen en
   * ninguna línea de la timeline. No es un hueco — es el corte C1→C2 funcionando: los flags gatean
   * modificadores durante la RESOLUCIÓN, y C2 recibe los nodos ya resueltos (`.final`). Lo que llega
   * acá es el resultado, no la condición.
   *
   * Se conserva la firma en vez de purgarla porque el caller (`combat-metrics.ts`) la propaga desde su
   * propio contrato, y decidir si C2 debe o no ver el contexto es una pregunta de diseño abierta —
   * la reversión del strip y las ventanas de tiempo pueden necesitarlo. Queda declarado, no disimulado.
   */
  public static simulateBurst(
    weapon: SimulationEntity,
    target: SimulationEntity,
    simDuration: number,
    burstDuration: number = simDuration,
    _context?: Partial<SimulationContext>,
    rng: RngProvider = new RngProvider()
  ): SimulationResult {
    const state = new EnemyState(target);
    const events: TimelineEvent[] = [];
    
    const fireRate = weapon.attributes["WEAPON_ADD_FIRE_RATE"]?.final || 1;
    const timeStep = 1 / fireRate;
    let currentTime = 0;
    let totalDamage = 0;
    let ttk: number | null = null;
    let shotsFired = 0;
    let shotsToKill: number | null = null;

    // La Instancia (①②) — derivada UNA vez del entity de C1; C2 la CONSUME (seam, `damage-instance.ts`),
    // no re-extrae de `attributes`. Contexto FROZEN source-side (estático por burst en este modelo). Cada
    // behavior computa su snapshot del `HitContext` (subset de la Instancia) al aplicar el proc.
    const instance = deriveInstance(weapon);
    const damageBreakdown = instance.damageByType;
    const statusChance = instance.statusChance;
    // El DoT usa el `dotModdedBase` (base innato × Serration, SIN mods de elemento) y el `ownElementBonusPct`
    // (mods del propio elemento) — NO el daño compuesto. Ver `damage-instance.ts` + `ingame-tests/dot-scaling.md`.
    const hitContext: HitContext = {
      moddedBase: instance.dotModdedBase,
      statusDamageBonusPct: instance.statusDamageBonusPct,
      elementBonusPct: instance.ownElementBonusPct,
    };

    // Bucle Temporal
    const step = 0.1;
    while (currentTime <= simDuration + 0.001 && !state.isDead()) {
      // 1. Procesar DoTs del intervalo previo
      advanceAndResolve(state, currentTime, step);

      // 2. ¿Hay disparo en este momento? 
      // Calculado como: ¿El tiempo actual coincide con un múltiplo del intervalo de disparo?
      const isFiring = currentTime <= burstDuration && 
                      (currentTime === 0 || Math.abs((currentTime % timeStep)) < 0.01 || Math.abs((currentTime % timeStep) - timeStep) < 0.01);
      
      if (isFiring) {
        shotsFired++;
        // Resolución del ataque = MISMO camino que un hit directo (`CombatSimulator.simulateAttack`:
        // híbrido atómico/bulk, con multishot+crit YA adentro). `simulateBurst` ya no reimplementa la
        // resolución ni re-multiplica post-hoc — camino único (ver `status.md §C2`, nota "camino de
        // resolución unificado"). Con multishot ≤ HYBRID_THRESHOLD (casi toda arma real) el modo es
        // atómico → el timeline es estocástico pero reproducible por `rng` (seed fijo). `pellets`
        // (multishot EV) se conserva SOLO para la población de status (eje EV — proc-population), NO
        // para el daño.
        const resolution = CombatSimulator.simulateAttack(instance, state, currentTime, rng);
        const pellets = instance.multishot;

        // EL HIT ESCRIBE POR EL MISMO CAMINO QUE EL DoT: `state.receive(capa, daño)`.
        //
        // Acá vivía un segundo derrame, escrito a mano (`if (state.current_shields > 0)` … y el
        // excedente a `current_health`), y **conocía sólo dos de las cuatro capas de la pila**. La
        // divergencia era medible: 210 de daño contra un target con `overguard 500` lo absorbía el
        // Overguard por el camino del DoT y **lo atravesaba** por éste, pegando a la salud. No era un
        // bug activo —ningún build del catálogo tiene Overguard— pero sí una ley escrita dos veces, y
        // las leyes duplicadas divergen: es cuestión de cuándo, no de si.
        //
        // La resolución ya devuelve la partición completa (`by_layer`); `receive` es dueño del
        // derrame. `shield_damage`/`health_damage` quedan como atajos de lectura, no como el camino.
        for (const [layer, dmg] of Object.entries(resolution.by_layer) as Array<[Layer, number]>) {
          if (dmg > 0) state.receive(layer, dmg);
        }
        state.clampVitals();

        totalDamage += resolution.total_damage;

        // Generación de procs UNIFICADA (colapsa las 3 ramas viejas): un solo loop para todos los
        // efectos modelados. `expectedProcEvents` da los procs esperados por tipo (chance×peso); el
        // tipo mapea a su efecto (`effectOfDamageType`, canónico) y `applyProc` rutea al behavior, que
        // computa su snapshot del `hitContext`. `expected × pellets` (cada pellet es un roll
        // independiente al SC nominal, sin dividir — post-27.2). Efecto sin modelar = no-op.
        const procEvents = expectedProcEvents(damageBreakdown, statusChance, currentTime);
        for (const ev of procEvents) {
          const effect = effectOfDamageType(ev.type);
          if (!effect) continue;
          state.applyProc(effect, hitContext, ev.expected * pellets, currentTime);
        }
      }

      // 3. Registrar Evento
      events.push({
        time: currentTime,
        damage: isFiring ? totalDamage : 0,
        cumulative_damage: totalDamage,
        enemy_health: Math.max(0, state.current_health),
        enemy_armor: state.getEffectiveArmor(currentTime),
        stacks: Object.fromEntries(state.activeEffects().map((e) => [e, 1])),
      });

      if (state.isDead() && ttk === null) {
        // Piso = 1 ciclo de disparo: un one-shot mata en `timeStep`, no en 0. El reloj discreto pone
        // el primer disparo en t=0; sin el piso, `ttk=0` mentiría y rompería cualquier `total/ttk`.
        ttk = Math.max(currentTime, timeStep);
        shotsToKill = shotsFired;
      }

      // Avanzar el reloj
      currentTime += step;
    }

    return {
      events,
      ttk,
      shots_to_kill: shotsToKill,
      total_damage: totalDamage
    };
  }
}
