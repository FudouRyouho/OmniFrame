/**
 * Tests unitarios de engine/loadout.ts
 * Cubre: toResolverInput, createSlot, emptyConfig, setMod, equipEntity, unequipEntity, setActiveConfig
 */

import { describe, expect, it } from "vitest";

import type { LoadoutState, ModSlot } from "../loadout";
import {
	createSlot,
	emptyConfig,
	equipEntity,
	setActiveConfig,
	setMod,
	toResolverInput,
	unequipEntity,
} from "../loadout";

// =============================================================================
// toResolverInput
// =============================================================================

describe("toResolverInput — canales", () => {
	it("retorna objeto vacío cuando el estado no tiene ningún canal", () => {
		const input = toResolverInput({});
		expect(input).toEqual({});
	});

	it("incluye solo los canales equipados", () => {
		const state: LoadoutState = {
			primaryWeapon: createSlot("PRIMARY_BRATON_PRIME"),
		};
		const input = toResolverInput(state);

		expect(input.primaryWeapon).toBeDefined();
		expect(input.warframe).toBeUndefined();
		expect(input.secondaryWeapon).toBeUndefined();
		expect(input.meleeWeapon).toBeUndefined();
	});

	it("incluye los cuatro canales cuando todos están equipados", () => {
		const state: LoadoutState = {
			warframe:        createSlot("WARFRAME_RHINO_PRIME"),
			primaryWeapon:   createSlot("PRIMARY_BRATON_PRIME"),
			secondaryWeapon: createSlot("SECONDARY_LEX_PRIME"),
			meleeWeapon:     createSlot("MELEE_SKANA_PRIME"),
		};
		const input = toResolverInput(state);

		expect(input.warframe?.uniqueName).toBe("WARFRAME_RHINO_PRIME");
		expect(input.primaryWeapon?.uniqueName).toBe("PRIMARY_BRATON_PRIME");
		expect(input.secondaryWeapon?.uniqueName).toBe("SECONDARY_LEX_PRIME");
		expect(input.meleeWeapon?.uniqueName).toBe("MELEE_SKANA_PRIME");
	});
});

describe("toResolverInput — mods", () => {
	it("filtra nulls del array de mods — slot vacío no aparece en output", () => {
		const slot = createSlot("PRIMARY_BRATON_PRIME");
		// El slot tiene 10 nulls por defecto. No equipamos nada.
		const input = toResolverInput({ primaryWeapon: slot });
		expect(input.primaryWeapon?.mods).toEqual([]);
	});

	it("conserva solo los mods no-null", () => {
		const mod: ModSlot = { uniqueName: "/Lotus/Upgrades/Mods/Damage/WeaponDamageMod", rank: 5 };
		let state: LoadoutState = { primaryWeapon: createSlot("PRIMARY_BRATON_PRIME") };
		state = setMod(state, "primaryWeapon", 0, mod);

		const input = toResolverInput(state);
		expect(input.primaryWeapon?.mods).toHaveLength(1);
		expect(input.primaryWeapon?.mods[0]).toEqual(mod);
	});

	it("preserva todos los mods equipados en sus posiciones lógicas", () => {
		const mod1: ModSlot = { uniqueName: "/Lotus/Upgrades/Mods/Damage/WeaponDamageMod", rank: 10 };
		const mod2: ModSlot = { uniqueName: "/Lotus/Upgrades/Mods/Multishot/WeaponMultishotMod", rank: 5 };
		let state: LoadoutState = { primaryWeapon: createSlot("PRIMARY_BRATON_PRIME") };
		state = setMod(state, "primaryWeapon", 0, mod1);
		state = setMod(state, "primaryWeapon", 3, mod2); // slot 1 y 2 quedan null

		const input = toResolverInput(state);
		expect(input.primaryWeapon?.mods).toHaveLength(2);
		expect(input.primaryWeapon?.mods).toContainEqual(mod1);
		expect(input.primaryWeapon?.mods).toContainEqual(mod2);
	});

	it("no incluye arcanes si la config activa no tiene ninguno", () => {
		const state: LoadoutState = { warframe: createSlot("WARFRAME_RHINO_PRIME") };
		const input = toResolverInput(state);
		expect(input.warframe?.arcanes).toBeUndefined();
	});
});

describe("toResolverInput — activeConfigIndex", () => {
	it("usa la config activa, no la primera", () => {
		const mod: ModSlot = { uniqueName: "/Lotus/Upgrades/Mods/Damage/WeaponDamageMod", rank: 10 };

		// Config 0 vacía, config 1 con mod
		const slot = createSlot("PRIMARY_BRATON_PRIME");
		slot.configs.push(emptyConfig()); // config 1
		slot.configs[1].mods[0] = mod;

		let state: LoadoutState = { primaryWeapon: slot };
		// Por defecto activeConfigIndex = 0 → mods vacíos
		expect(toResolverInput(state).primaryWeapon?.mods).toEqual([]);

		// Cambio a config 1 → mod aparece
		state = setActiveConfig(state, "primaryWeapon", 1);
		expect(toResolverInput(state).primaryWeapon?.mods).toHaveLength(1);
		expect(toResolverInput(state).primaryWeapon?.mods[0]).toEqual(mod);
	});
});

// =============================================================================
// createSlot
// =============================================================================

describe("createSlot", () => {
	it("crea un slot con uniqueName, activeConfigIndex=0 y 1 config vacía", () => {
		const slot = createSlot("PRIMARY_BRATON_PRIME");

		expect(slot.uniqueName).toBe("PRIMARY_BRATON_PRIME");
		expect(slot.activeConfigIndex).toBe(0);
		expect(slot.configs).toHaveLength(1);
	});

	it("la config por defecto tiene 10 slots de mod todos null", () => {
		const slot = createSlot("WARFRAME_RHINO_PRIME");
		const mods = slot.configs[0].mods;

		expect(mods).toHaveLength(10);
		expect(mods.every((m) => m === null)).toBe(true);
	});
});

// =============================================================================
// emptyConfig
// =============================================================================

describe("emptyConfig", () => {
	it("devuelve config con N mods null (default 10)", () => {
		const config = emptyConfig();
		expect(config.mods).toHaveLength(10);
		expect(config.mods.every((m) => m === null)).toBe(true);
	});

	it("respeta el parámetro modSlots", () => {
		const config = emptyConfig(8);
		expect(config.mods).toHaveLength(8);
	});
});

// =============================================================================
// setMod — inmutabilidad
// =============================================================================

describe("setMod — inmutabilidad", () => {
	it("no muta el estado original", () => {
		const original: LoadoutState = { primaryWeapon: createSlot("PRIMARY_BRATON_PRIME") };
		const mod: ModSlot = { uniqueName: "/Lotus/Upgrades/Mods/Damage/WeaponDamageMod", rank: 5 };

		const next = setMod(original, "primaryWeapon", 0, mod);

		expect(original.primaryWeapon?.configs[0].mods[0]).toBeNull();
		expect(next.primaryWeapon?.configs[0].mods[0]).toEqual(mod);
	});

	it("retorna el mismo estado si el canal no existe", () => {
		const state: LoadoutState = {};
		const mod: ModSlot = { uniqueName: "/Lotus/Upgrades/Mods/Damage/WeaponDamageMod", rank: 5 };
		const next = setMod(state, "primaryWeapon", 0, mod);
		expect(next).toBe(state);
	});

	it("puede limpiar un slot (mod → null)", () => {
		const mod: ModSlot = { uniqueName: "/Lotus/Upgrades/Mods/Damage/WeaponDamageMod", rank: 5 };
		let state: LoadoutState = { primaryWeapon: createSlot("PRIMARY_BRATON_PRIME") };
		state = setMod(state, "primaryWeapon", 0, mod);
		state = setMod(state, "primaryWeapon", 0, null);

		expect(state.primaryWeapon?.configs[0].mods[0]).toBeNull();
	});

	it("no afecta otros slots al equipar un mod", () => {
		const mod: ModSlot = { uniqueName: "/Lotus/Upgrades/Mods/Damage/WeaponDamageMod", rank: 5 };
		let state: LoadoutState = { primaryWeapon: createSlot("PRIMARY_BRATON_PRIME") };
		state = setMod(state, "primaryWeapon", 2, mod);

		const mods = state.primaryWeapon!.configs[0].mods;
		expect(mods[0]).toBeNull();
		expect(mods[1]).toBeNull();
		expect(mods[2]).toEqual(mod);
		expect(mods[3]).toBeNull();
	});
});

// =============================================================================
// equipEntity
// =============================================================================

describe("equipEntity", () => {
	it("agrega un canal nuevo", () => {
		const state = equipEntity({}, "primaryWeapon", "PRIMARY_BRATON_PRIME");
		expect(state.primaryWeapon?.uniqueName).toBe("PRIMARY_BRATON_PRIME");
	});

	it("reemplaza la entidad previa con slot limpio", () => {
		const mod: ModSlot = { uniqueName: "/Lotus/Upgrades/Mods/Damage/WeaponDamageMod", rank: 5 };
		let state: LoadoutState = { primaryWeapon: createSlot("PRIMARY_BRATON") };
		state = setMod(state, "primaryWeapon", 0, mod);

		// Cambiamos de Braton a Braton Prime
		state = equipEntity(state, "primaryWeapon", "PRIMARY_BRATON_PRIME");

		expect(state.primaryWeapon?.uniqueName).toBe("PRIMARY_BRATON_PRIME");
		expect(state.primaryWeapon?.configs[0].mods[0]).toBeNull(); // slot limpio
	});

	it("no muta otros canales", () => {
		let state: LoadoutState = {
			warframe: createSlot("WARFRAME_RHINO_PRIME"),
		};
		state = equipEntity(state, "primaryWeapon", "PRIMARY_BRATON_PRIME");

		expect(state.warframe?.uniqueName).toBe("WARFRAME_RHINO_PRIME");
	});
});

// =============================================================================
// unequipEntity
// =============================================================================

describe("unequipEntity", () => {
	it("elimina el canal indicado", () => {
		let state: LoadoutState = { primaryWeapon: createSlot("PRIMARY_BRATON_PRIME") };
		state = unequipEntity(state, "primaryWeapon");

		expect(state.primaryWeapon).toBeUndefined();
	});

	it("retorna el mismo estado si el canal ya estaba vacío", () => {
		const state: LoadoutState = {};
		const next = unequipEntity(state, "primaryWeapon");
		expect(next).toBe(state);
	});

	it("no afecta otros canales", () => {
		let state: LoadoutState = {
			warframe:      createSlot("WARFRAME_RHINO_PRIME"),
			primaryWeapon: createSlot("PRIMARY_BRATON_PRIME"),
		};
		state = unequipEntity(state, "primaryWeapon");

		expect(state.warframe?.uniqueName).toBe("WARFRAME_RHINO_PRIME");
	});
});

// =============================================================================
// setActiveConfig
// =============================================================================

describe("setActiveConfig", () => {
	it("cambia el índice de config activa", () => {
		let state: LoadoutState = { primaryWeapon: createSlot("PRIMARY_BRATON_PRIME") };
		// Añadimos una segunda config
		state.primaryWeapon!.configs.push(emptyConfig());

		state = setActiveConfig(state, "primaryWeapon", 1);
		expect(state.primaryWeapon?.activeConfigIndex).toBe(1);
	});

	it("retorna el mismo estado si el canal no existe", () => {
		const state: LoadoutState = {};
		const next = setActiveConfig(state, "primaryWeapon", 1);
		expect(next).toBe(state);
	});

	it("retorna el mismo estado si el índice ya es el activo", () => {
		const state: LoadoutState = { primaryWeapon: createSlot("PRIMARY_BRATON_PRIME") };
		const next = setActiveConfig(state, "primaryWeapon", 0);
		expect(next).toBe(state);
	});

	it("clampea al último índice válido si el índice está fuera de rango", () => {
		let state: LoadoutState = { primaryWeapon: createSlot("PRIMARY_BRATON_PRIME") };
		state = setActiveConfig(state, "primaryWeapon", 99);
		// Solo hay 1 config (índice 0 es el máximo)
		expect(state.primaryWeapon?.activeConfigIndex).toBe(0);
	});

	it("no muta el estado original", () => {
		const mod: ModSlot = { uniqueName: "/Lotus/Upgrades/Mods/Damage/WeaponDamageMod", rank: 5 };
		let state: LoadoutState = { primaryWeapon: createSlot("PRIMARY_BRATON_PRIME") };
		state.primaryWeapon!.configs.push(emptyConfig());
		state = setMod(state, "primaryWeapon", 0, mod);

		const originalConfigIdx = state.primaryWeapon!.activeConfigIndex;
		const next = setActiveConfig(state, "primaryWeapon", 1);

		expect(state.primaryWeapon?.activeConfigIndex).toBe(originalConfigIdx);
		expect(next.primaryWeapon?.activeConfigIndex).toBe(1);
	});
});
