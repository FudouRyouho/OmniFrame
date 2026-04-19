/**
 * @stub Store singleton del carril UX paralelo de Arsenal (R4).
 *
 * Usa useSyncExternalStore con estado de módulo para persistir entre navegaciones
 * sin necesidad de un provider React. Este patrón es intencional para el stub:
 * simple, sin reset, sin SSR safety.
 *
 * En runtime se reemplaza por un provider/contexto siguiendo el patrón de
 * LoadoutProvider (useReducer + contexto React). No extender este patrón
 * a otros dominios.
 *
 * Referencia: Docs/domains/builder-engine/status.md (Tramo 4, carril R4)
 */
import { useMemo, useSyncExternalStore } from "react";
import {
	clearWarframeArchonShard,
	createDefaultArsenalMetadataState,
	createDefaultArsenalUiState,
	equipWarframeArchonShard,
	replaceSurfaceMetadataEntity,
	replaceWarframeArchonShard,
	replaceWarframeExtensions,
	replaceWeaponIncarnon,
	selectArchonShardSlot,
	type ArchonShardSelection,
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
			updateSnapshot((prev) => ({
				...prev,
				arsenalMetadata: nextMetadata,
			}));
		},
		setWarframeArchonShard: (slotIndex: number, shard: ArchonShardSelection | null) => {
			updateSnapshot((prev) => ({
				...prev,
				arsenalMetadata: replaceWarframeArchonShard(prev.arsenalMetadata, slotIndex, shard),
			}));
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
		equipWarframeArchonShardByEffect: (slotIndex: number, effectId: string, isTauforged: boolean) => {
			updateSnapshot((prev) => ({
				...prev,
				arsenalMetadata: equipWarframeArchonShard(prev.arsenalMetadata, slotIndex, effectId, isTauforged),
			}));
		},
		clearWarframeArchonShardSlot: (slotIndex: number) => {
			updateSnapshot((prev) => ({
				...prev,
				arsenalMetadata: clearWarframeArchonShard(prev.arsenalMetadata, slotIndex),
			}));
		},
	}), []);

	return {
		arsenalMetadata: current.arsenalMetadata,
		arsenalUi: current.arsenalUi,
		...actions,
	};
}
