/**
 * Contrato de salida de C — métricas de combate (materializa `DC-OQ-ENGINE-8`).
 *
 * `CombatMetrics` es un CONJUNTO neutro y extensible de métricas, particionado por su
 * **dependencia de target** (no por tema):
 *   - `target_agnostic` — lo que C1 computa en forma cerrada, SIN ver al enemigo (DPS, crit, pesos de
 *     status). Producido por `CombatCalculator.project`.
 *   - `vs_target`       — lo que SOLO emerge de correr el reloj contra un enemigo escalado (ttk, daño
 *     realizado, DPS efectivo). Derivado de `TimelineSimulator.simulateBurst`.
 *
 * Las hojas son **valores neutros** (números tipados con nombre semántico) — el contrato es
 * "D consumible": D1 (UI) y D2 (oráculo/CLI) los toman y los representan cada uno como corresponda,
 * sin que C formatee. Añadir una métrica es aditivo (crece horizontal); el catálogo se puebla cuando
 * un consumidor la pida, no se predice (el error que purgó `ProjectionSnapshot`).
 *
 * El contrato vive acá, separado del productor: `CombatCalculator` lo IMPORTA y produce su parte,
 * no lo posee.
 */
import type { SimulationEntity, SimulationContext } from '../contracts';
import { CombatCalculator } from '../simulate/combat/CombatCalculator';
import { TimelineSimulator } from '../simulate/combat/TimelineSimulator';

/** Grupo target-agnóstico: closed-form de C1, sin target. Lo produce `CombatCalculator.project`. */
export interface TargetAgnosticMetrics {
  average_crit_multiplier: number;
  burst_dps: number;
  sustained_dps: number;
  status_map: Record<string, number>;
  crit_distribution: Record<number, number>;
  pellet_count: number;
  falloff_multiplier: number;
}

/** Grupo vs-target: emerge de correr el reloj contra un enemigo escalado. */
export interface VsTargetMetrics {
  /** Tiempo hasta matar en segundos. `null` = no muere en la ventana. Nunca 0: piso = 1 ciclo de disparo. */
  ttk: number | null;
  /** Disparos efectuados hasta detectar la muerte. `null` = no muere en la ventana. */
  shots_to_kill: number | null;
  /** Daño total realizado (corta al morir, o a fin de ventana si no muere). */
  total_damage: number;
  /** DPS efectivo: `total_damage / ttk` cuando mata (hasta matar); `/ dur` cuando no mata (sostenido en la ventana). */
  effective_dps: number;
}

/** Conjunto de métricas de combate. Contenedor extensible, particionado por dependencia de target. */
export interface CombatMetrics {
  target_agnostic: TargetAgnosticMetrics;
  vs_target: VsTargetMetrics;
}

/**
 * Ensambla el `CombatMetrics` corriendo los dos actos del motor contra un enemigo escalado.
 * `effective_dps` se DERIVA acá (en C), no en el consumidor — es dato que D consume, no computa.
 */
export function computeCombatMetrics(
  weapon: SimulationEntity,
  target: SimulationEntity,
  context: SimulationContext,
  duration: number,
): CombatMetrics {
  const target_agnostic = CombatCalculator.project(weapon, context);
  const run = TimelineSimulator.simulateBurst(weapon, target, duration, duration, context);

  const effective_dps =
    run.ttk !== null && run.ttk > 0
      ? run.total_damage / run.ttk
      : duration > 0
        ? run.total_damage / duration
        : 0;

  return {
    target_agnostic,
    vs_target: {
      ttk: run.ttk,
      shots_to_kill: run.shots_to_kill,
      total_damage: run.total_damage,
      effective_dps,
    },
  };
}
