import { useSyncExternalStore, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { EnsembleIntention, ArchonShardIntent } from './ensemble.types';
import { ensembleStore } from './ensemble-store';

/**
 * Hook de Consumo: useEnsemble
 * Permite a cualquier componente React suscribirse a la "Intención" actual.
 * Solo causará re-render si la estructura del estado cambia.
 */
export function useEnsemble(): EnsembleIntention {
  return useSyncExternalStore(
    (l) => ensembleStore.subscribe(l),
    () => ensembleStore.getState()
  );
}

/**
 * Hook de Acciones: useEnsembleActions
 * Expone los métodos para modificar la intención. 
 * Las funciones son estables y no cambian entre renders.
 */
export function useEnsembleActions() {
  return {
    setItem: (channel: Parameters<typeof ensembleStore.setItem>[0], itemId: string | null) =>
      ensembleStore.setItem(channel, itemId),

    setItemRank: (channel: Parameters<typeof ensembleStore.setItemRank>[0], rank: number) =>
      ensembleStore.setItemRank(channel, rank),

    setMod: (channel: string, slotIndex: number, mod: Parameters<typeof ensembleStore.setMod>[2]) =>
      ensembleStore.setMod(channel, slotIndex, mod),

    setShard: (slotIndex: number, intent: ArchonShardIntent | null) =>
      ensembleStore.setShard(slotIndex, intent),

    clear: () => ensembleStore.clear()
  };
}

// --- Provider (Opcional pero recomendado para consistencia de arquitectura) ---

const EnsembleContext = createContext<typeof ensembleStore | null>(null);

export function EnsembleProvider({ children }: { children: ReactNode }) {
  return (
    <EnsembleContext.Provider value={ensembleStore}>
      {children}
    </EnsembleContext.Provider>
  );
}

/**
 * Acceso directo al store (para casos avanzados o fuera de hooks)
 */
export function useEnsembleStore() {
  const context = useContext(EnsembleContext);
  if (!context) {
    throw new Error('useEnsembleStore debe usarse dentro de un EnsembleProvider');
  }
  return context;
}
