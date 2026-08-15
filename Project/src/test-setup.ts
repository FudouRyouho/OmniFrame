import '@testing-library/jest-dom';
import { SimulationEngine } from '@core/engine/resolve/SimulationEngine';
import type { SimulationContext } from '@core/engine/contracts';

/**
 * Convergence guard (F1-A) — red de seguridad SOLO-TEST, no producción.
 *
 * El motor resuelve el grafo en UN pass topológico; su correctitud depende de que cada read
 * cross-nodo (`sourceNode.final` en el scaling, los factores de pool en `calculateCurrentValue`)
 * tenga su arista gemela declarada en `rebuildGraph`. Un read nuevo sin su arista lee stale y
 * rompe el orden EN SILENCIO — la clase de bug recurrente (p. ej. la facción cross-entity que
 * `rebuildGraph` tuvo que volver estructural). El probe empírico mostró que hoy el corpus es un
 * DAG puro y pass-1 ya es el punto fijo (167/167 resoluciones, Δ=0), pero eso vale MIENTRAS el set
 * de aristas esté completo.
 *
 * Este guard mantiene esa invariante viva: envuelve `resolve()` para correr un pass topológico de
 * confirmación y exigir que no mueva ningún `.final`. Δ≠0 ⇒ alguien agregó un read cross-nodo sin
 * su arista → CI en rojo, antes de merge, con el nodo culpable nombrado. DETECTA la clase; no la
 * resuelve. Los ciclos reales quedan fuera de su alcance (no existen: si algún día `cycle_detected`
 * deja de ser 0, eso pediría convergencia iterativa — la opción B, diferida hasta tener ese caso).
 *
 * Vive acá y no en el engine a propósito: es infra de test, no maquinaria de producción. Alcanza
 * los miembros privados por runtime (`as unknown as …`); si uno se renombra, el guard falla ruidoso.
 */
const CONVERGENCE_EPSILON = 1e-6;

interface EngineInternals {
  entities: Map<string, { id: string; attributes: Record<string, { final: number }> }>;
  sorted_nodes: string[];
  resetAccumulators: () => void;
  resolveNode: (entityId: string, attributeId: string, context: SimulationContext, pass: number) => void;
}

const originalResolve = SimulationEngine.prototype.resolve;

SimulationEngine.prototype.resolve = function (this: SimulationEngine, context: SimulationContext): void {
  originalResolve.call(this, context);

  const engine = this as unknown as EngineInternals;

  const snapshotFinals = (): Record<string, number> => {
    const finals: Record<string, number> = {};
    engine.entities.forEach(entity =>
      Object.entries(entity.attributes).forEach(([attrId, node]) => {
        finals[`${entity.id}:${attrId}`] = node.final;
      }),
    );
    return finals;
  };

  const before = snapshotFinals();

  // Pass topológico de confirmación: re-deriva todo en el mismo orden de pass-1.
  engine.resetAccumulators();
  engine.sorted_nodes.forEach(key => {
    const [entityId, attributeId] = key.split(':');
    engine.resolveNode(entityId, attributeId, context, 99);
  });

  const after = snapshotFinals();

  let maxDelta = 0;
  let worstNode = '';
  for (const key in before) {
    const delta = Math.abs((before[key] ?? 0) - (after[key] ?? 0));
    if (delta > maxDelta) {
      maxDelta = delta;
      worstNode = key;
    }
  }

  if (maxDelta > CONVERGENCE_EPSILON) {
    throw new Error(
      `[convergence-guard] resolve() no quedó en punto fijo: Δ=${maxDelta} en '${worstNode}'. ` +
      `Un read cross-nodo sin su arista gemela en rebuildGraph (clase stale-read, F1-A). ` +
      `Declará la arista o revisá el orden de dependencias.`,
    );
  }
};
