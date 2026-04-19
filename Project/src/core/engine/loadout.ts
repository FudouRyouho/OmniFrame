/**
 * @module engine/loadout
 * @description Loadout v1 — capa de estado mutable de selección del jugador.
 *
 * Responsabilidades (C37):
 *   - Almacena el equipamiento activo por canal (warframe, primary, secondary, melee)
 *   - Cada canal tiene múltiples configs (A, B, C — estilo in-game)
 *   - Expone toResolverInput() que serializa la config activa como LoadoutInput (B1)
 *
 *   El Loadout NO:
 *     - Evalúa fórmulas. Es estado puro.
 *     - Conoce el Resolver ni el Engine.
 *     - Valida compatibilidad de mods (eso es responsabilidad de capas superiores).
 *
 * Companion: fuera de v1 (C37).
 * Exaltadas / Venari: capacidades de la entidad, no canales del Loadout (C37/PA-N).
 *
 * Contratos cerrados: C37 — Docs/decisions/stage-0-architecture-decisions.md
 */

import type { EquippedEntity, LoadoutInput } from "./resolver";

// =============================================================================
// TIPOS — Loadout state (C37)
// =============================================================================

/** Un slot de mod individual. null = slot vacío. */
export interface ModSlot {
	uniqueName: string;
	rank: number;
}

/** Un slot de arcano individual. null = slot vacío. */
export interface ArcaneSlot {
	uniqueName: string;
	rank: number;
}

/**
 * Una configuración atómica de una entidad.
 * Representa una build guardada (equivale a una config A/B/C in-game).
 *
 * mods es un array de longitud fija (8 slots normales + 1 aura/stance + 1 exilus = 10).
 * Los slots vacíos son null — no se omiten, para mantener la posición de cada slot.
 */
export interface EntityConfig {
	mods: (ModSlot | null)[];
	arcanes?: (ArcaneSlot | null)[];
}

/**
 * Un canal del Loadout — warframe, primary, secondary o melee.
 * Admite múltiples configs (A/B/C...) con una activa a la vez.
 */
export interface EntitySlot {
	/** uniqueName de la entidad equipada (arma o warframe). */
	uniqueName: string;
	/** Índice de la config activa en configs[]. */
	activeConfigIndex: number;
	/** Array de configs guardadas. Mínimo 1. */
	configs: EntityConfig[];
}

/**
 * Estado completo de un loadout.
 * Todos los canales son opcionales — un loadout puede ser parcial.
 */
export interface LoadoutState {
	warframe?:       EntitySlot;
	primaryWeapon?:  EntitySlot;
	secondaryWeapon?: EntitySlot;
	meleeWeapon?:    EntitySlot;
}

// =============================================================================
// HELPERS — construcción de estado
// =============================================================================

/**
 * Crea un EntityConfig vacío con N slots de mod (todos null).
 * @param modSlots Número de slots de mod (default: 10 — 8 normales + aura + exilus).
 */
export function emptyConfig(modSlots = 10): EntityConfig {
	return {
		mods: Array<ModSlot | null>(modSlots).fill(null),
	};
}

/**
 * Crea un EntitySlot con una sola config vacía.
 * Punto de partida para equipar una entidad nueva.
 */
export function createSlot(uniqueName: string): EntitySlot {
	return {
		uniqueName,
		activeConfigIndex: 0,
		configs: [emptyConfig()],
	};
}

// =============================================================================
// SERIALIZACIÓN — Loadout → LoadoutInput (B1)
// =============================================================================

/**
 * Extrae la lista de mods equipados (sin nulls) de la config activa de un EntitySlot.
 * @internal
 */
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

/**
 * Serializa el Loadout a LoadoutInput (B1) para el Resolver.
 *
 * Solo incluye los canales con entidad equipada.
 * No clona datos innecesariamente — devuelve referencias a los mismos objetos.
 *
 * @param state Estado completo del Loadout.
 * @returns     LoadoutInput parcial con los canales disponibles.
 */
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

// =============================================================================
// MUTACIONES — devuelven nuevo estado (inmutabilidad para React)
// =============================================================================

/**
 * Equipa una entidad en un canal. Si ya había una entidad, la reemplaza
 * con un slot nuevo (una config vacía). Las configs previas se descartan.
 *
 * Para preservar configs al cambiar entidad, usar `setSlot()` directamente.
 */
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

/**
 * Cambia la config activa de un canal.
 * No lanza si el índice está fuera de rango — clampea al último disponible.
 */
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

/**
 * Coloca un mod en un slot específico de la config activa de un canal.
 *
 * @param slot  Índice del slot de mod (0-based).
 * @param mod   null para limpiar el slot.
 */
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

/**
 * Elimina la entidad de un canal (slot vacío).
 */
export function unequipEntity(
	state: LoadoutState,
	channel: keyof LoadoutState,
): LoadoutState {
	if (!state[channel]) return state;
	const next = { ...state };
	delete next[channel];
	return next;
}
