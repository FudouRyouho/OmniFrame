/**
 * @domain Simulation-v2 / Hooks / C2-Dynamic
 * @status en-desarrollo
 */
import { useMemo } from 'react';
import { TimelineSimulator } from '../simulate/combat/TimelineSimulator';
import type { SimulationResult as TimelineResult } from '../simulate/combat/TimelineSimulator';
import type { SimulationEntity, SimulationContext } from '../contracts';
import type { ScaledEnemy } from '../simulate/enemies/EnemyRepository';

/**
 * useTimeline — C2-Dynamic.
 * Simula el combate en una ventana de tiempo contra un enemigo específico.
 * Modela DoTs (Slash, Heat, Toxin), reducción de armadura por Corrosivo/Calor,
 * y emite el TTK y la serie temporal de eventos.
 *
 * Requiere un enemigo escalado (EnemyRepository.scale(dna, level)).
 * Para proyecciones sin enemigo, usar useSimulationMetrics.
 *
 * @param weapon        Entidad de arma resuelta por C1 (useSimulation).
 * @param target        Enemigo escalado al nivel deseado.
 * @param duration      Duración total de la simulación en segundos.
 * @param burstDuration Duración del burst activo (default: duration completo).
 * @param context       Context overrides (flags, variables, laws).
 */
export function useTimeline(
  weapon: SimulationEntity | null | undefined,
  target: ScaledEnemy | null | undefined,
  duration: number,
  burstDuration?: number,
  context?: Partial<SimulationContext>,
): TimelineResult | null {
  return useMemo(() => {
    if (!weapon || !target) return null;

    return TimelineSimulator.simulateBurst(
      weapon,
      target,
      duration,
      burstDuration ?? duration,
      context,
    );
  }, [weapon, target, duration, burstDuration, context]);
}
