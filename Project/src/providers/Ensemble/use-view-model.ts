/**
 * useViewModel — binding reactivo (z3) de la Capa D1 (UI).
 *
 * Liga el EnsembleStore (intención, A1) → motor (`consume`, salida de C) →
 * `project()` (cut C→D) y devuelve el `ViewModelContract` listo para display.
 * Re-evalúa cuando cambia la intención.
 *
 * Vive en `@providers` (capa de composición / adapter) — el único lugar legal
 * para importar `@core` además de los no-dominios. Reemplaza el consumo directo
 * que UpgradeView hacía de `@core/engine/hooks/useSimulation` (drift Restricción 1).
 * Hermano reactivo del adaptador no-reactivo (oráculo CLI / D2): ambos comparten
 * `project()` (z2), difieren en z3.
 */
import { useMemo } from 'react';
import { useEnsemble } from './EnsembleProvider';
import { consume } from '@core/engine/output/consume';
import { project, type ViewModelContract } from '@shared/view-model';

export function useViewModel(): ViewModelContract {
  const intention = useEnsemble();
  // Sin context: el bridge deriva las flags estáticas del equipamiento (modo arsenal),
  // igual que el useSimulation() previo.
  return useMemo(() => project(consume(intention).snapshot()), [intention]);
}
