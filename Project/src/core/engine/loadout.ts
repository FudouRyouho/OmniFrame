/**
 * @domain Engine / Loadout
 * @SSoT docs/domains/engine/status.md
 * @deprecated Esta implementación forma parte del modelo B1-B4 declarado ROTO. 
 * Se mantiene por compatibilidad de runtime hasta su sustitución por un modelo de Observer puro.
 */

import type { EquippedEntity, LoadoutInput } from "./resolver";

export interface ModSlot {
	uniqueName: string;
	rank: number;
}

export interface ArcaneSlot {
	uniqueName: string;
	rank: number;
}

export interface EntityConfig {
	mods: (ModSlot | null)[];
	arcanes?: (ArcaneSlot | null)[];
}

export interface EntitySlot {
	uniqueName: string;
	activeConfigIndex: number;
	configs: EntityConfig[];
}

export interface LoadoutState {
	warframe?:       EntitySlot;
	primaryWeapon?:  EntitySlot;
	secondaryWeapon?: EntitySlot;
	meleeWeapon?:    EntitySlot;
}

export function emptyConfig(modSlots = 10): EntityConfig {
	return {
		mods: Array<ModSlot | null>(modSlots).fill(null),
	};
}

export function createSlot(uniqueName: string): EntitySlot {
	return {
		uniqueName,
		activeConfigIndex: 0,
		configs: [emptyConfig()],
	};
}

/** @internal */
function getActiveEquippedEntity(slot: EntitySlot): EquippedEntity {
	const config = slot.configs[slot.activeConfigIndex] ?? slot.configs[0];
	const mods = (config.mods ?? [])
		.filter((s): s is ModSlot => s !== null);
	const arcanes = (config.arcanes ?? [])
		.filter((s): s is ArcaneSlot => s !== null);

	return {
		uniqueName: slot.uniqueName,
		mods,
		...(arcanes.length > 0 ? { arcanes } : {}),
	};
}

export function toResolverInput(state: LoadoutState): LoadoutInput {
	const input: LoadoutInput = {};

	if (state.warframe) {
		input.warframe = getActiveEquippedEntity(state.warframe);
	}
	if (state.primaryWeapon) {
		input.primaryWeapon = getActiveEquippedEntity(state.primaryWeapon);
	}
	if (state.secondaryWeapon) {
		input.secondaryWeapon = getActiveEquippedEntity(state.secondaryWeapon);
	}
	if (state.meleeWeapon) {
		input.meleeWeapon = getActiveEquippedEntity(state.meleeWeapon);
	}

	return input;
}

export function equipEntity(
	state: LoadoutState,
	channel: keyof LoadoutState,
	uniqueName: string,
): LoadoutState {
	return {
		...state,
		[channel]: createSlot(uniqueName),
	};
}

export function setActiveConfig(
	state: LoadoutState,
	channel: keyof LoadoutState,
	configIndex: number,
): LoadoutState {
	const slot = state[channel];
	if (!slot) return state;

	const safeIndex = Math.max(0, Math.min(configIndex, slot.configs.length - 1));
	if (safeIndex === slot.activeConfigIndex) return state;

	return {
		...state,
		[channel]: { ...slot, activeConfigIndex: safeIndex },
	};
}

export function setMod(
	state: LoadoutState,
	channel: keyof LoadoutState,
	slotIndex: number,
	mod: ModSlot | null,
): LoadoutState {
	const entitySlot = state[channel];
	if (!entitySlot) return state;

	const configIdx = entitySlot.activeConfigIndex;
	const config = entitySlot.configs[configIdx];
	if (!config) return state;

	const newMods = [...config.mods];
	newMods[slotIndex] = mod;

	const newConfigs = [...entitySlot.configs];
	newConfigs[configIdx] = { ...config, mods: newMods };

	return {
		...state,
		[channel]: { ...entitySlot, configs: newConfigs },
	};
}

export function unequipEntity(
	state: LoadoutState,
	channel: keyof LoadoutState,
): LoadoutState {
	if (!state[channel]) return state;
	const next = { ...state };
	delete next[channel];
	return next;
}
