/**
 * @domain Features / Arsenal / State
 * @SSoT docs/domains/ui-ux/shell-status.md
 * @status en-desarrollo
 * Arsenal UI state — gestiona el estado de sesión de la UI del Arsenal
 * (slot seleccionado, metadata visual de incarnon/focus/companion/vehicles).
 * Los archon shards viven en EnsembleStore (EnsembleIntention.items.warframe.shards).
 */
import { useMemo, useSyncExternalStore } from "react";
import {
  createDefaultArsenalMetadataState,
  createDefaultArsenalUiState,
  replaceSurfaceMetadataEntity,
  replaceWarframeExtensions,
  replaceWeaponIncarnon,
  selectArchonShardSlot,
  type ArsenalMetadataEntity,
  type ArsenalMetadataSlotKey,
  type ArsenalMetadataState,
  type ArsenalUiState,
  type IncarnonMetadata,
  type WeaponMetadataChannel,
} from "@domains/arsenal/arsenal-state";

type ArsenalUiSnapshot = {
  arsenalMetadata: ArsenalMetadataState;
  arsenalUi: ArsenalUiState;
};

let snapshot: ArsenalUiSnapshot = {
  arsenalMetadata: createDefaultArsenalMetadataState(),
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

export function useArsenalUiState() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const actions = useMemo(() => ({
    replaceArsenalMetadata: (nextMetadata: ArsenalMetadataState) => {
      updateSnapshot((prev) => ({ ...prev, arsenalMetadata: nextMetadata }));
    },
    setWeaponIncarnon: (channel: WeaponMetadataChannel, incarnon: IncarnonMetadata | null) => {
      updateSnapshot((prev) => ({
        ...prev,
        arsenalMetadata: replaceWeaponIncarnon(prev.arsenalMetadata, channel, incarnon),
      }));
    },
    setWarframeExtensions: (extensions: ArsenalMetadataEntity[]) => {
      updateSnapshot((prev) => ({
        ...prev,
        arsenalMetadata: replaceWarframeExtensions(prev.arsenalMetadata, extensions),
      }));
    },
    setSurfaceMetadataEntity: (slotKey: ArsenalMetadataSlotKey, entity: ArsenalMetadataEntity) => {
      updateSnapshot((prev) => ({
        ...prev,
        arsenalMetadata: replaceSurfaceMetadataEntity(prev.arsenalMetadata, slotKey, entity),
      }));
    },
    selectArchonShardSlot: (slotIndex: number | null) => {
      updateSnapshot((prev) => ({
        ...prev,
        arsenalUi: selectArchonShardSlot(prev.arsenalUi, slotIndex),
      }));
    },
  }), []);

  return {
    arsenalMetadata: current.arsenalMetadata,
    arsenalUi: current.arsenalUi,
    ...actions,
  };
}
