/**
 * Tests de precisión del Resolver v1 + Engine.
 *
 * Complementa resolver.test.ts con casos más específicos:
 *   1. Ranks correctos (r0, r5, r10 — no solo el walkthrough en r10/r5)
 *   2. Mod multi-stat: Malignant Force (WEAPON_PERCENT_BASE_DAMAGE_ADDED + WEAPON_PROC_CHANCE)
 *   3. Stacking del mismo upgradeType: Serration r10 + Hornet Strike r10 (aditivo)
 *   4. Gaps documentados v1: WEAPON_MELEE_DAMAGE y WEAPON_PERCENT_BASE_DAMAGE_ADDED ignorados
 *   5. 4 canales simultáneos (warframe + primary + secondary + melee)
 *   6. Múltiples ataques reciben el mismo multiplicador
 *   7. Mods con condition != null — Resolver los pasa, Engine v1 los trata como activos
 *
 * Para los gaps documentados, los tests CONFIRMAN el comportamiento actual (v1),
 * NO el comportamiento objetivo futuro. Cambiarlos cuando se implemente el fix.
 *
 * Mods y valores usados (tomados del override real — no hardcodeados por convención):
 *   Serration         /Lotus/Upgrades/Mods/Rifle/WeaponDamageAmountMod
 *                     baseValue: [15,30,45,60,75,90,105,120,135,150,165]
 *   Hornet Strike     /Lotus/Upgrades/Mods/Pistol/WeaponDamageAmountMod
 *                     baseValue: [20,40,60,80,100,120,140,160,180,200,220]
 *   Vitality          /Lotus/Upgrades/Mods/Warframe/AvatarHealthMaxMod
 *                     baseValue: [9,18,27,36,45,55,64,73,82,91,100]
 *   Malignant Force   /Lotus/Upgrades/Mods/Rifle/DualStat/PoisonEventRifleMod
 *                     stats[0]: WEAPON_PERCENT_BASE_DAMAGE_ADDED [15,30,45,60]
 *                     stats[1]: WEAPON_PROC_CHANCE               [15,30,45,60]
 *   Pressure Point    /Lotus/Upgrades/Mods/Melee/WeaponMeleeDamageMod
 *                     WEAPON_MELEE_DAMAGE [20,40,60,80,100,120]
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
import { calculate, type CalculationContext } from "../index";
import rawWeapons from "../../../../../public/data/weapons.json";
import rawWarframes from "../../../../../public/data/warframes.json";
import modOverrides from "../../../../../data/overrides/mods/mod-stats.override.json";

// =============================================================================
// SETUP
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

const CTX: CalculationContext = {};

// uniqueNames
const RHINO_PRIME   = "/Lotus/Powersuits/Rhino/RhinoPrime";
const BRATON_PRIME  = "/Lotus/Weapons/Tenno/Rifle/BratonPrime";
const LEX_PRIME     = "/Lotus/Weapons/Tenno/Pistols/PrimeLex/PrimeLex";
const SKANA_PRIME   = "/Lotus/Weapons/Tenno/Melee/LongSword/SkanaPrime";

const SERRATION      = "/Lotus/Upgrades/Mods/Rifle/WeaponDamageAmountMod";
const HORNET_STRIKE  = "/Lotus/Upgrades/Mods/Pistol/WeaponDamageAmountMod";
const VITALITY       = "/Lotus/Upgrades/Mods/Warframe/AvatarHealthMaxMod";
const MALIGNANT_FORCE = "/Lotus/Upgrades/Mods/Rifle/DualStat/PoisonEventRifleMod";
const PRESSURE_POINT  = "/Lotus/Upgrades/Mods/Melee/WeaponMeleeDamageMod";
const POINT_STRIKE    = "/Lotus/Upgrades/Mods/Rifle/WeaponCritChanceMod";

// =============================================================================
// 1. RANKS — r0, r5, r10
// =============================================================================

describe("Resolver — ranks correctos (r0 / r5 / r10)", () => {
	describe("Serration — WEAPON_DAMAGE_AMOUNT", () => {
		it.each([
			[0,  15,  40.25],  // 35 × (1 + 15/100)
			[5,  90,  66.50],  // 35 × (1 + 90/100)
			[10, 165, 92.75],  // 35 × (1 + 165/100)
		])("rank %i → bonus %i%% → totalDamage %f", (rank, expectedBonus, expectedDamage) => {
			const layout = resolve({
				primaryWeapon: { uniqueName: BRATON_PRIME, mods: [{ uniqueName: SERRATION, rank }] },
			}, DEPS);
			const stats = layout.primaryWeapon!.stats;
			expect(stats).toHaveLength(1);
			expect(stats[0].upgradeType).toBe("WEAPON_DAMAGE_AMOUNT");
			expect(stats[0].value).toBe(expectedBonus);

			const out = calculate(layout, CTX);
			expect(out.primaryWeapon!.attacks[0].totalDamage).toBeCloseTo(expectedDamage, 1);
		});
	});

	describe("Vitality — AVATAR_HEALTH_MAX", () => {
		it.each([
			[0,  9,   294.30],  // 270 × (1 + 9/100)
			[5,  55,  418.50],  // 270 × (1 + 55/100)
			[10, 100, 540.00],  // 270 × (1 + 100/100)
		])("rank %i → bonus %i%% → health %f", (rank, expectedBonus, expectedHealth) => {
			const layout = resolve({
				warframe: { uniqueName: RHINO_PRIME, mods: [{ uniqueName: VITALITY, rank }] },
			}, DEPS);
			const stats = layout.warframe!.stats;
			expect(stats[0].upgradeType).toBe("AVATAR_HEALTH_MAX");
			expect(stats[0].value).toBe(expectedBonus);

			const out = calculate(layout, CTX);
			expect(out.warframe!.health).toBeCloseTo(expectedHealth, 1);
		});
	});
});

// =============================================================================
// 2. MOD MULTI-STAT — Malignant Force
// =============================================================================

describe("Resolver — mod multi-stat (Malignant Force r3)", () => {
	// Malignant Force r3 (rank máximo, índice 3):
	//   stats[0]: WEAPON_PERCENT_BASE_DAMAGE_ADDED = 60
	//   stats[1]: WEAPON_PROC_CHANCE               = 60
	const input: LoadoutInput = {
		primaryWeapon: {
			uniqueName: BRATON_PRIME,
			mods: [{ uniqueName: MALIGNANT_FORCE, rank: 3 }],
		},
	};

	it("genera 2 ResolvedStat desde 1 mod", () => {
		const layout = resolve(input, DEPS);
		expect(layout.primaryWeapon!.stats).toHaveLength(2);
	});

	it("upgradeTypes correctos: WEAPON_PERCENT_BASE_DAMAGE_ADDED + WEAPON_PROC_CHANCE", () => {
		const layout = resolve(input, DEPS);
		const types = layout.primaryWeapon!.stats.map(s => s.upgradeType);
		expect(types).toContain("WEAPON_PERCENT_BASE_DAMAGE_ADDED");
		expect(types).toContain("WEAPON_PROC_CHANCE");
	});

	it("valores en rank 3: 60 + 60", () => {
		const layout = resolve(input, DEPS);
		const byType = Object.fromEntries(
			layout.primaryWeapon!.stats.map(s => [s.upgradeType, s.value])
		);
		expect(byType.WEAPON_PERCENT_BASE_DAMAGE_ADDED).toBe(60);
		expect(byType.WEAPON_PROC_CHANCE).toBe(60);
	});

	it("rank intermedio r1: valores 30 + 30", () => {
		const layout = resolve({
			primaryWeapon: {
				uniqueName: BRATON_PRIME,
				mods: [{ uniqueName: MALIGNANT_FORCE, rank: 1 }],
			},
		}, DEPS);
		const byType = Object.fromEntries(
			layout.primaryWeapon!.stats.map(s => [s.upgradeType, s.value])
		);
		expect(byType.WEAPON_PERCENT_BASE_DAMAGE_ADDED).toBe(30);
		expect(byType.WEAPON_PROC_CHANCE).toBe(30);
	});

	describe("Engine: aplicación parcial (v1 — gap documentado)", () => {
		/**
		 * WEAPON_PERCENT_BASE_DAMAGE_ADDED (elemental damage) no está en WeaponModBonuses v1.
		 * El bonus de daño elemental de Malignant Force es ignorado por el Engine.
		 * WEAPON_PROC_CHANCE (status chance) SÍ está mapeado y se aplica.
		 *
		 * Comportamiento esperado v1 (NO es un bug — es un límite de scope consciente):
		 *   totalDamage:  35 (sin cambio — WEAPON_PERCENT_BASE_DAMAGE_ADDED ignorado)
		 *   statusChance: 0.26 × (1 + 60/100) = 0.26 × 1.60 = 0.416 → round2 = 0.42
		 */
		const out = resolveAndCalculate(input, DEPS);
		const attack = out.primaryWeapon!.attacks.find(a => a.name === "Normal Attack")!;

		it("totalDamage sin cambio (WEAPON_PERCENT_BASE_DAMAGE_ADDED ignorado en v1)", () => {
			expect(attack.totalDamage).toBe(35);
		});

		it("statusChance aumentado por WEAPON_PROC_CHANCE (+60%)", () => {
			// 0.26 × 1.60 = 0.416 → round2 = 0.42
			expect(attack.statusChance).toBeCloseTo(0.42, 2);
		});
	});
});

// =============================================================================
// 3. STACKING — mismo upgradeType (WEAPON_DAMAGE_AMOUNT aditivo)
// =============================================================================

describe("Engine — stacking aditivo del mismo upgradeType", () => {
	/**
	 * Serration r10 (rifle, WEAPON_DAMAGE_AMOUNT: 165) +
	 * Hornet Strike r10 (pistol, WEAPON_DAMAGE_AMOUNT: 220) en Braton Prime.
	 *
	 * El Resolver no valida compatibilidad de tipo de arma — solo resuelve stats.
	 * Esta combinación sirve para probar que el Engine suma correctamente el mismo
	 * upgradeType de múltiples fuentes.
	 *
	 * total WEAPON_DAMAGE_AMOUNT = 165 + 220 = 385
	 * totalDamage = 35 × (1 + 385/100) = 35 × 4.85 = 169.75
	 */
	const input: LoadoutInput = {
		primaryWeapon: {
			uniqueName: BRATON_PRIME,
			mods: [
				{ uniqueName: SERRATION,     rank: 10 },
				{ uniqueName: HORNET_STRIKE, rank: 10 },
			],
		},
	};

	it("Resolver genera 2 entradas separadas de WEAPON_DAMAGE_AMOUNT", () => {
		const layout = resolve(input, DEPS);
		const dmgStats = layout.primaryWeapon!.stats.filter(s => s.upgradeType === "WEAPON_DAMAGE_AMOUNT");
		expect(dmgStats).toHaveLength(2);
		expect(dmgStats[0].value).toBe(165);
		expect(dmgStats[1].value).toBe(220);
	});

	it("Engine suma ambos bonuses (165 + 220 = 385%) → totalDamage 169.75", () => {
		const out = resolveAndCalculate(input, DEPS);
		expect(out.primaryWeapon!.attacks[0].totalDamage).toBeCloseTo(169.75, 1);
	});

	it("mayor stacking que mod único (169.75 > 92.75 de Serration solo)", () => {
		const outSingle  = resolveAndCalculate({ primaryWeapon: { uniqueName: BRATON_PRIME, mods: [{ uniqueName: SERRATION, rank: 10 }] } }, DEPS);
		const outStacked = resolveAndCalculate(input, DEPS);
		expect(outStacked.primaryWeapon!.attacks[0].totalDamage).toBeGreaterThan(
			outSingle.primaryWeapon!.attacks[0].totalDamage
		);
	});
});

// =============================================================================
// 4. GAP DOCUMENTADO — WEAPON_MELEE_DAMAGE (v1: ignorado)
// =============================================================================

describe("Engine — WEAPON_MELEE_DAMAGE ignorado en v1 (gap documentado)", () => {
	/**
	 * Pressure Point r5 (max): WEAPON_MELEE_DAMAGE = 120.
	 * Este upgradeType NO está en WeaponModBonuses — el Engine no lo aplica en v1.
	 *
	 * Skana Prime base totalDamage = 210.
	 * Con Pressure Point: totalDamage sigue siendo 210 (bonus no aplicado).
	 *
	 * TODO: implementar WEAPON_MELEE_DAMAGE en WeaponModBonuses cuando se amplíe v1.
	 */
	const input: LoadoutInput = {
		meleeWeapon: {
			uniqueName: SKANA_PRIME,
			mods: [{ uniqueName: PRESSURE_POINT, rank: 5 }],
		},
	};

	it("Resolver genera 1 ResolvedStat con WEAPON_MELEE_DAMAGE = 120", () => {
		const layout = resolve(input, DEPS);
		expect(layout.meleeWeapon!.stats).toHaveLength(1);
		expect(layout.meleeWeapon!.stats[0].upgradeType).toBe("WEAPON_MELEE_DAMAGE");
		expect(layout.meleeWeapon!.stats[0].value).toBe(120);
	});

	it("Engine ignora WEAPON_MELEE_DAMAGE → totalDamage sin cambio (v1 gap)", () => {
		const out = resolveAndCalculate(input, DEPS);
		// Skana Prime base: 210. Sin bonus aplicado por gap v1.
		expect(out.meleeWeapon!.attacks[0].totalDamage).toBe(210);
	});

	it("sin mods = mismo resultado → confirma que gap no es regresión", () => {
		const outNone = resolveAndCalculate({ meleeWeapon: { uniqueName: SKANA_PRIME, mods: [] } }, DEPS);
		const outPP   = resolveAndCalculate(input, DEPS);
		expect(outNone.meleeWeapon!.attacks[0].totalDamage).toBe(
			outPP.meleeWeapon!.attacks[0].totalDamage
		);
	});
});

// =============================================================================
// 5. 4 CANALES SIMULTÁNEOS
// =============================================================================

describe("Resolver — 4 canales simultáneos", () => {
	/**
	 * Rhino Prime + Braton Prime (primary) + Lex Prime (secondary) + Skana Prime (melee).
	 * Lex Prime base: totalDamage 180, critChance 0.25, critMult 2.
	 * Skana Prime base: totalDamage 210.
	 */
	const input: LoadoutInput = {
		warframe:       { uniqueName: RHINO_PRIME,  mods: [{ uniqueName: VITALITY, rank: 10 }] },
		primaryWeapon:  { uniqueName: BRATON_PRIME,  mods: [{ uniqueName: SERRATION, rank: 10 }] },
		secondaryWeapon: { uniqueName: LEX_PRIME,    mods: [{ uniqueName: HORNET_STRIKE, rank: 10 }] },
		meleeWeapon:    { uniqueName: SKANA_PRIME,   mods: [] },
	};

	const out = resolveAndCalculate(input, DEPS);

	it("los 4 canales tienen output", () => {
		expect(out.warframe).toBeDefined();
		expect(out.primaryWeapon).toBeDefined();
		expect(out.secondaryWeapon).toBeDefined();
		expect(out.meleeWeapon).toBeDefined();
	});

	it("warframe health con Vitality r10", () => {
		// 270 × (1 + 100/100) = 540
		expect(out.warframe!.health).toBeCloseTo(540, 1);
	});

	it("primary totalDamage con Serration r10", () => {
		// 35 × (1 + 165/100) = 92.75 (Normal Attack)
		const attack = out.primaryWeapon!.attacks.find(a => a.name === "Normal Attack")!;
		expect(attack.totalDamage).toBeCloseTo(92.75, 1);
	});

	it("secondary totalDamage con Hornet Strike r10", () => {
		// Lex Prime: 180 × (1 + 220/100) = 180 × 3.20 = 576
		expect(out.secondaryWeapon!.attacks[0].totalDamage).toBeCloseTo(576, 1);
	});

	it("melee totalDamage sin mods", () => {
		// Skana Prime: 210 (sin cambio)
		expect(out.meleeWeapon!.attacks[0].totalDamage).toBe(210);
	});

	it("canales son independientes — no hay contaminación entre ellos", () => {
		// El bonus de Serration (rifle) no afecta al secondary ni al melee
		const primaryDmgBonus = out.primaryWeapon!.attacks[0].totalDamage / 35;
		const meleeDmgBonus   = out.meleeWeapon!.attacks[0].totalDamage   / 210;
		expect(primaryDmgBonus).toBeGreaterThan(1); // Serration aplicado
		expect(meleeDmgBonus).toBe(1);              // sin mods, sin bonus
	});
});

// =============================================================================
// 6. MÚLTIPLES ATAQUES — mismo multiplicador aplicado a todos
// =============================================================================

describe("Engine — múltiples ataques reciben el mismo multiplicador", () => {
	/**
	 * Braton Prime tiene 3 ataques:
	 *   Normal Attack:     base totalDamage = 35
	 *   Incarnon Form:     base totalDamage = 70
	 *   Incarnon Form AoE: base totalDamage = 70
	 *
	 * Con Serration r10 (WEAPON_DAMAGE_AMOUNT = 165):
	 *   Normal Attack:     35 × 2.65 = 92.75
	 *   Incarnon Form:     70 × 2.65 = 185.50
	 *   Incarnon Form AoE: 70 × 2.65 = 185.50
	 */
	const out = resolveAndCalculate({
		primaryWeapon: { uniqueName: BRATON_PRIME, mods: [{ uniqueName: SERRATION, rank: 10 }] },
	}, DEPS);

	it("Braton Prime tiene exactamente 3 ataques", () => {
		expect(out.primaryWeapon!.attacks).toHaveLength(3);
	});

	it.each([
		["Normal Attack",     35, 92.75],
		["Incarnon Form",     70, 185.50],
		["Incarnon Form AoE", 70, 185.50],
	])("%s: base %f → con Serration r10 %f", (name, _base, expected) => {
		const attack = out.primaryWeapon!.attacks.find(a => a.name === name);
		expect(attack, `ataque "${name}" no encontrado`).toBeDefined();
		expect(attack!.totalDamage).toBeCloseTo(expected, 1);
	});

	it("multiplier es consistente entre ataques (× 2.65 en todos)", () => {
		const [a0, a1, a2] = out.primaryWeapon!.attacks;
		// ratio respecto a base debe ser ≈ 2.65 en todos
		expect(a0.totalDamage / 35).toBeCloseTo(2.65, 2);
		expect(a1.totalDamage / 70).toBeCloseTo(2.65, 2);
		expect(a2.totalDamage / 70).toBeCloseTo(2.65, 2);
	});

	it("averageCritMultiplier varía entre ataques si critChance/critMult base difieren", () => {
		const attacks = out.primaryWeapon!.attacks;
		// Normal Attack: critChance base 0.12, critMult base 2
		// Incarnon Form: critChance base 0.30, critMult base 3
		// → avgCrit NO debe ser idéntico entre todos los ataques
		const avgCrits = attacks.map(a => a.averageCritMultiplier);
		const allSame = avgCrits.every(v => v === avgCrits[0]);
		expect(allSame).toBe(false);
	});
});

// =============================================================================
// 7. CONDITION FIELD — Resolver pasa condition, Engine v1 la trata como activa
// =============================================================================

describe("Resolver — condition field y comportamiento v1 del Engine", () => {
	/**
	 * C20: todas las condiciones activas en v1 (CalculationContext vacío).
	 * El Resolver pasa condition tal como está en el override (string | null).
	 * El Engine v1 no filtra por condition — suma TODOS los upgradeTypes.
	 *
	 * Test con override mock que incluye un mod condicional (on_headshot).
	 */
	const MOCK_OVERRIDE_MAP: ModOverrideMap = {
		"/Lotus/Upgrades/Mods/Test/ConditionalMod": {
			name: "Test Conditional",
			stats: [{
				label: "+|val1|% Damage on Headshot",
				values: [{ baseValue: [100], upgradeType: "WEAPON_DAMAGE_AMOUNT" }],
				condition: "on_headshot",
			}],
		},
	};

	const MOCK_DEPS: ResolverDependencies = {
		itemDataset:    DEPS.itemDataset,
		modOverrideMap: MOCK_OVERRIDE_MAP,
	};

	const input: LoadoutInput = {
		primaryWeapon: {
			uniqueName: BRATON_PRIME,
			mods: [{ uniqueName: "/Lotus/Upgrades/Mods/Test/ConditionalMod", rank: 0 }],
		},
	};

	it("Resolver pasa condition 'on_headshot' al ResolvedStat", () => {
		const layout = resolve(input, MOCK_DEPS);
		expect(layout.primaryWeapon!.stats[0].condition).toBe("on_headshot");
	});

	it("Engine v1 incluye stats condicionales (todos tratados como activos — C20)", () => {
		// Con WEAPON_DAMAGE_AMOUNT = 100 (conditional, rank 0):
		// 35 × (1 + 100/100) = 35 × 2.00 = 70
		const out = resolveAndCalculate(input, MOCK_DEPS);
		expect(out.primaryWeapon!.attacks[0].totalDamage).toBeCloseTo(70, 1);
	});

	it("mod null condition pasa correctamente", () => {
		const NULL_OVERRIDE: ModOverrideMap = {
			"/Lotus/Upgrades/Mods/Test/NullCondMod": {
				name: "Test Null Cond",
				stats: [{
					label: "+|val1|% Damage",
					values: [{ baseValue: [50], upgradeType: "WEAPON_DAMAGE_AMOUNT" }],
					condition: null,
				}],
			},
		};
		const layout = resolve({
			primaryWeapon: {
				uniqueName: BRATON_PRIME,
				mods: [{ uniqueName: "/Lotus/Upgrades/Mods/Test/NullCondMod", rank: 0 }],
			},
		}, { ...DEPS, modOverrideMap: NULL_OVERRIDE });
		expect(layout.primaryWeapon!.stats[0].condition).toBeNull();
	});

	it("Point Strike (condition null) no contamina el campo condition", () => {
		const layout = resolve({
			primaryWeapon: {
				uniqueName: BRATON_PRIME,
				mods: [{ uniqueName: POINT_STRIKE, rank: 5 }],
			},
		}, DEPS);
		expect(layout.primaryWeapon!.stats[0].condition).toBeNull();
	});
});
