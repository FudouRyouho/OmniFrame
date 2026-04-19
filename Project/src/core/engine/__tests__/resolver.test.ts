/**
 * Tests de integración del Resolver v1.
 *
 * Cubre:
 *   1. resolve() → ResolvedLayout correcto (B1 → B2)
 *   2. resolveAndCalculate() → EngineOutput ≈ walkthrough manual (B1 → B3)
 *   3. Manejo de entidades no encontradas en el dataset
 *   4. Mod sin datos en el override → ignorado silenciosamente
 *   5. buildWeaponsMap / buildWarframesMap — helpers de indexación
 *
 * Walkthrough de referencia (Paso 15 — Rhino Prime + Braton Prime + mods canónicos):
 *   Warframe:
 *     health  : 270 × (1 + 1.00) = 540   con Vitality r10 (+100%)
 *     shield  : 455 × (1 + 1.00) = 910   con Redirection r10 (+100%)
 *     armor   : 290 × (1 + 1.00) = 580   con Steel Fiber r10 (+100%)
 *     power   : 100 × (1 + 1.00) = 200   con Flow r10 (+100%)
 *   Weapon "Normal Attack":
 *     totalDamage: 35 × (1 + 1.65) = 92.75  con Serration r10 (+165%)
 *     critChance : 0.12 × (1 + 1.50) = 0.30  con Point Strike r5 (+150%)
 *     critMult   : 2    × (1 + 1.20) = 4.40  con Vital Sense r5 (+120%)
 *     avgCrit    : round2(1 + 0.30 × (4.40 - 1)) = round2(1 + 1.02) = 2.02
 *
 * Nota: valores de los mods tomados del override real — no hardcodeados aquí.
 */

import { describe, it, expect } from "vitest";
import {
	resolve,
	resolveAndCalculate,
	buildWeaponsMap,
	buildWarframesMap,
	type LoadoutInput,
	type ModOverrideMap,
	type ResolverDependencies,
} from "../resolver";
import rawWeapons from "../../../../public/data/weapons.json";
import rawWarframes from "../../../../public/data/warframes.json";
import modOverrides from "../../../../public/data/mod-stats.override.json";
// =============================================================================
// SETUP — dependencias inyectadas
// =============================================================================

const weapons   = rawWeapons  as Parameters<typeof buildWeaponsMap>[0];
const warframes = rawWarframes as Parameters<typeof buildWarframesMap>[0];

const DEPS: ResolverDependencies = {
	itemDataset: {
		weapons:   buildWeaponsMap(weapons),
		warframes: buildWarframesMap(warframes),
	},
	modOverrideMap: modOverrides as ModOverrideMap,
};

// Mods del walkthrough canónico
const VITALITY   = "/Lotus/Upgrades/Mods/Warframe/AvatarHealthMaxMod";
const REDIRECTION = "/Lotus/Upgrades/Mods/Warframe/AvatarShieldMaxMod";
const STEEL_FIBER = "/Lotus/Upgrades/Mods/Warframe/AvatarArmourMod";
const FLOW        = "/Lotus/Upgrades/Mods/Warframe/AvatarPowerMaxMod";
const INTENSIFY   = "/Lotus/Upgrades/Mods/Warframe/AvatarAbilityStrengthMod";
const SERRATION   = "/Lotus/Upgrades/Mods/Rifle/WeaponDamageAmountMod";
const POINT_STRIKE = "/Lotus/Upgrades/Mods/Rifle/WeaponCritChanceMod";
const VITAL_SENSE  = "/Lotus/Upgrades/Mods/Rifle/WeaponCritDamageMod";

const RHINO_PRIME  = "/Lotus/Powersuits/Rhino/RhinoPrime";
const BRATON_PRIME = "/Lotus/Weapons/Tenno/Rifle/BratonPrime";

const WARFRAME_MODS = [
	{ uniqueName: VITALITY,    rank: 10 },
	{ uniqueName: REDIRECTION, rank: 10 },
	{ uniqueName: STEEL_FIBER, rank: 10 },
	{ uniqueName: FLOW,        rank: 10 },
	{ uniqueName: INTENSIFY,   rank: 5  },
];

const WEAPON_MODS = [
	{ uniqueName: SERRATION,    rank: 10 },
	{ uniqueName: POINT_STRIKE, rank: 5  },
	{ uniqueName: VITAL_SENSE,  rank: 5  },
];

// =============================================================================
// TESTS — resolve() → ResolvedLayout
// =============================================================================

describe("Resolver — resolve() → ResolvedLayout", () => {
	it("devuelve warframe channel con base stats correctos", () => {
		const input: LoadoutInput = {
			warframe: { uniqueName: RHINO_PRIME, mods: [] },
		};
		const layout = resolve(input, DEPS);
		expect(layout.warframe).toBeDefined();
		expect(layout.warframe!.base.health).toBe(270);
		expect(layout.warframe!.base.shield).toBe(455);
		expect(layout.warframe!.base.armor).toBe(290);
		expect(layout.warframe!.base.power).toBe(100);
		expect(layout.warframe!.stats).toHaveLength(0);
	});

	it("devuelve weapon channel con base stats correctos (primer ataque)", () => {
		const input: LoadoutInput = {
			primaryWeapon: { uniqueName: BRATON_PRIME, mods: [] },
		};
		const layout = resolve(input, DEPS);
		expect(layout.primaryWeapon).toBeDefined();
		expect(layout.primaryWeapon!.base.attacks[0].totalDamage).toBe(35);
		expect(layout.primaryWeapon!.base.attacks[0].critChance).toBeCloseTo(0.12, 4);
		expect(layout.primaryWeapon!.base.attacks[0].critMult).toBe(2);
	});

	it("genera ResolvedStat[] plana (sin agregar) por cada stat de cada mod", () => {
		const input: LoadoutInput = {
			warframe: { uniqueName: RHINO_PRIME, mods: WARFRAME_MODS },
		};
		const layout = resolve(input, DEPS);
		// 5 mods × 1 stat cada uno = 5 ResolvedStat (Intensify solo tiene ability strength)
		expect(layout.warframe!.stats.length).toBeGreaterThanOrEqual(5);
	});

	it("statsUpgradeTypes incluyen los esperados del set de warframe", () => {
		const input: LoadoutInput = {
			warframe: { uniqueName: RHINO_PRIME, mods: WARFRAME_MODS },
		};
		const layout = resolve(input, DEPS);
		const types = layout.warframe!.stats.map(s => s.upgradeType);
		expect(types).toContain("AVATAR_HEALTH_MAX");
		expect(types).toContain("AVATAR_SHIELD_MAX");
		expect(types).toContain("AVATAR_ARMOUR");
		expect(types).toContain("AVATAR_POWER_MAX");
		expect(types).toContain("AVATAR_ABILITY_STRENGTH");
	});

	it("entidad no encontrada en el dataset → canal omitido (sin throw)", () => {
		const input: LoadoutInput = {
			warframe: { uniqueName: "/Lotus/DoesNotExist", mods: [] },
		};
		const layout = resolve(input, DEPS);
		expect(layout.warframe).toBeUndefined();
	});

	it("mod no encontrado en el override → ignorado silenciosamente", () => {
		const input: LoadoutInput = {
			warframe: {
				uniqueName: RHINO_PRIME,
				mods: [{ uniqueName: "/Lotus/Upgrades/Unknown/Mod", rank: 5 }],
			},
		};
		const layout = resolve(input, DEPS);
		expect(layout.warframe).toBeDefined();
		expect(layout.warframe!.stats).toHaveLength(0);
	});

	it("soporta layout parcial — solo primaryWeapon", () => {
		const input: LoadoutInput = {
			primaryWeapon: { uniqueName: BRATON_PRIME, mods: WEAPON_MODS },
		};
		const layout = resolve(input, DEPS);
		expect(layout.warframe).toBeUndefined();
		expect(layout.primaryWeapon).toBeDefined();
		expect(layout.secondaryWeapon).toBeUndefined();
		expect(layout.meleeWeapon).toBeUndefined();
	});

	it("layout vacío devuelve ResolvedLayout vacío", () => {
		const layout = resolve({}, DEPS);
		expect(layout.warframe).toBeUndefined();
		expect(layout.primaryWeapon).toBeUndefined();
	});
});

// =============================================================================
// TESTS — resolveAndCalculate() → EngineOutput (walkthrough)
// =============================================================================

describe("Resolver — resolveAndCalculate() walkthrough", () => {
	const input: LoadoutInput = {
		warframe:      { uniqueName: RHINO_PRIME,  mods: WARFRAME_MODS },
		primaryWeapon: { uniqueName: BRATON_PRIME, mods: WEAPON_MODS   },
	};
	const out = resolveAndCalculate(input, DEPS);

	describe("warframe stats", () => {
		it("health con Vitality r10", () => {
			// 270 × (1 + 1.00) = 540
			expect(out.warframe?.health).toBeCloseTo(540, 1);
		});
		it("shield con Redirection r10", () => {
			// 455 × (1 + 1.00) = 910
			expect(out.warframe?.shield).toBeCloseTo(910, 1);
		});
		it("armor con Steel Fiber r10", () => {
			// 290 × (1 + 1.00) = 580
			expect(out.warframe?.armor).toBeCloseTo(580, 1);
		});
		it("power con Flow r10", () => {
			// 100 × (1 + 1.00) = 200
			expect(out.warframe?.power).toBeCloseTo(200, 1);
		});
		it("abilityStrength con Intensify r5", () => {
			// 1 + 0.30 = 1.30
			expect(out.warframe?.abilityStrength).toBeCloseTo(1.30, 2);
		});
	});

	describe("weapon stats — Normal Attack (Braton Prime)", () => {
		const attack = out.primaryWeapon?.attacks.find(a => a.name === "Normal Attack");

		it("ataque Normal Attack existe", () => {
			expect(attack).toBeDefined();
		});
		it("totalDamage con Serration r10", () => {
			// 35 × (1 + 1.65) = 92.75
			expect(attack?.totalDamage).toBeCloseTo(92.75, 1);
		});
		it("critChance con Point Strike r5", () => {
			// 0.12 × (1 + 1.50) = 0.30
			expect(attack?.critChance).toBeCloseTo(0.30, 2);
		});
		it("critMult con Vital Sense r5", () => {
			// 2 × (1 + 1.20) = 4.40
			expect(attack?.critMult).toBeCloseTo(4.40, 2);
		});
		it("averageCritMultiplier", () => {
			// 1 + 0.30 × (4.40 - 1) = 1 + 1.02 = 2.02
			expect(attack?.averageCritMultiplier).toBeCloseTo(2.02, 2);
		});
	});
});

// =============================================================================
// TESTS — helpers de indexación
// =============================================================================

describe("Resolver — helpers de indexación", () => {
	it("buildWeaponsMap indexa correctamente", () => {
		const map = buildWeaponsMap(weapons);
		expect(map.has(BRATON_PRIME)).toBe(true);
		const wp = map.get(BRATON_PRIME);
		expect(wp?.magazineSize).toBe(75);
	});

	it("buildWarframesMap indexa correctamente", () => {
		const map = buildWarframesMap(warframes);
		expect(map.has(RHINO_PRIME)).toBe(true);
		const wf = map.get(RHINO_PRIME);
		expect(wf?.health).toBe(270);
	});
});
