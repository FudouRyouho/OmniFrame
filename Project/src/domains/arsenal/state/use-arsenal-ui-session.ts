/**
 * @domain Features / Arsenal / State
 * @SSoT docs/domains/ui-ux/shell-status.md
 * @status en-desarrollo
 * Estado de sesión UI-local del Arsenal (NO es la Capa E / presentación).
 * Store module-level porque el dato tiene vida cross-route: lo escribe ArsenalView
 * y lo lee ArchonShardSelectionView tras navegar.
 * Hoy: slot de archon shard seleccionado. Los shards en sí viven en EnsembleStore
 * (EnsembleIntention.items.warframe.shards).
 */

import { useMemo, useSyncExternalStore } from "react";
import {
  createDefaultArsenalUiState,
  selectArchonShardSlot,
  type ArsenalUiState,
} from "@domains/arsenal/arsenal-ui-session";

type ArsenalUiSnapshot = {
  arsenalUi: ArsenalUiState;
};

let snapshot: ArsenalUiSnapshot = {
  arsenalUi: createDefaultArsenalUiState(),
};

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ArsenalUiSnapshot {
  return snapshot;
}

function updateSnapshot(updater: (current: ArsenalUiSnapshot) => ArsenalUiSnapshot) {
  snapshot = updater(snapshot);
  listeners.forEach((listener) => listener());
}

export function useArsenalUiSession() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const actions = useMemo(() => ({
    selectArchonShardSlot: (slotIndex: number | null) => {
      updateSnapshot((prev) => ({
        ...prev,
        arsenalUi: selectArchonShardSlot(prev.arsenalUi, slotIndex),
      }));
    },
  }), []);

  return {
    arsenalUi: current.arsenalUi,
    ...actions,
  };
}
