/**
 * @domain Simulation-v2 / Hooks / C2-Static
 * @status en-desarrollo
 */
import { useMemo } from 'react';
import { CombatCalculator } from '../combat/CombatCalculator';
import type { CombatMetrics } from '../combat/CombatCalculator';
import { BASELINE_GAME_LAWS } from '../contracts';
import type { SimulationEntity, SimulationContext } from '../contracts';

/**
 * useSimulationMetrics — C2-Static.
 * Proyecta métricas de combate (DPS, crit, status map) para una entidad
 * ya resuelta por C1. No requiere enemigo — trabaja con Valor Esperado.
 *
 * Se usa en la vista avanzada para mostrar estimaciones de daño sin
 * necesitar un objetivo específico. Para daño efectivo contra un enemigo
 * concreto, usar useTimeline.
 */
export function useSimulationMetrics(
  entity: SimulationEntity | null | undefined,
  context?: Partial<SimulationContext>,
): CombatMetrics | null {
  return useMemo(() => {
    if (!entity) return null;

    const fullContext: SimulationContext = {
      active_profile_id: context?.active_profile_id ?? 'base',
      flags:     context?.flags     ?? {},
      variables: context?.variables ?? {},
      laws:      context?.laws      ?? { ...BASELINE_GAME_LAWS },
    };

    return CombatCalculator.project(entity, fullContext);
  }, [entity, context]);
}
