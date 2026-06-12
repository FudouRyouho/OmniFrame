/**
 * @domain Simulation-v2 / Hooks
 * @status en-desarrollo
 */
import { useMemo } from 'react';
import { MutatorBridge } from '../../bridge/MutatorBridge';
import { useEnsemble } from '@providers/Ensemble/EnsembleProvider';
import type { SimulationContext } from '../contracts';
import type { EnsembleIntention } from '@providers/Ensemble/ensemble.types';

const bridge = new MutatorBridge();

/**
 * useSimulation — Hook reactivo al EnsembleStore.
 * Proporciona el ProjectionSnapshot del motor cada vez que cambia la intención.
 * Permite un override de EnsembleIntention para herramientas de desarrollo (SimulationLab).
 */
export function useSimulation(override?: EnsembleIntention, context?: Partial<SimulationContext>) {
  const globalIntention = useEnsemble();
  const intention = override ?? globalIntention;

  return useMemo(() => {
    return bridge.simulateFromIntention(intention, context);
  }, [intention, context]);
}
