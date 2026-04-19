/**
 * Smoke test: Engine contra el dataset completo.
 *
 * Propósito: detectar puntos de fuga numérica (NaN, Infinity, negativos inesperados)
 * antes de implementar el Resolver. No verifica correctness semántica — solo sanidad
 * numérica sobre 628 armas × 1485 ataques + 114 warframes.
 *
 * Este test simula el trabajo del Resolver de forma inline:
 *   1. Normaliza el dataset crudo (snake_case → camelCase, deliveryType = "unknown")
 *   2. Lee valores del override para un set de mods representativo
 *   3. Construye ResolvedLayout y lo pasa al Engine
 *
 * Casos edge conocidos (assert explícito, no fallas):
 *   - Simulor / Synoid Simulor: "Orb Launch" tiene totalDamage = 0 (dataset PA-T)
 *   - Helminth: excluido de `warframes.json` (NPC no equipable)
 *   - Inaros / Inaros Prime: shield = 0 (diseño intencional del personaje)
 *   - Coda Bubonico, Enkaus, Grimoire, Tenet Quanta: sin attacks[] en el dataset
 */

import { describe, it, expect } from "vitest";
import { calculate } from "../index";
import type {
	ResolvedLayout,
	CalculationContext,
	WeaponBase,
	WarframeBase,
	WeaponAttack,
	AttackDeliveryType,
} from "../index";
import rawWeapons from "../../../../public/data/weapons.json";
import rawWarframes from "../../../../public/data/warframes.json";
import modOverrides from "../../../../public/data/mod-stats.override.json";

// =============================================================================
// TIPOS DEL DATASET CRUDO — solo los campos que usa el smoke test
// =============================================================================

type RawAttack = {
	name: string;
	totalDamage?: number;
	crit_chance?: number | null;
	crit_mult?: number | null;
	status_chance?: number | null;
	speed?: number | null;
	shot_type?: string | null;
};

type RawWeapon = {
	name: string;
	uniqueName: string;
	kind?: string;
	totalDamage?: number;
	criticalChance?: number;
	criticalMultiplier?: number;
	procChance?: number;
	fireRate?: number;
	magazineSize?: number;
	reloadTime?: number;
	multishot?: number;
	attacks?: RawAttack[];
};

type RawWarframe = {
	name: string;
	uniqueName: string;
	health?: number;
	shield?: number;
	armor?: number;
	power?: number;
	sprintSpeed?: number;
};

type ModOverrideEntry = {
	name: string;
	stats: Array<{
		values: Array<{
			upgradeType: string;
			baseValue: number[];
		}>;
	}>;
};

// =============================================================================
// NORMALIZACIÓN INLINE — simula lo que hará generate-data + Resolver
// =============================================================================

/**
 * Convierte un ataque crudo del dataset (snake_case) a WeaponAttack (camelCase).
 * deliveryType = "unknown" en todos — el smoke test no verifica entrega.
 */
function normalizeAttack(raw: RawAttack): WeaponAttack {
	return {
		name:         raw.name,
		totalDamage:  raw.totalDamage ?? 0,
		damage:       {},
		critChance:   raw.crit_chance   ?? 0,
		critMult:     raw.crit_mult     ?? 1,
		statusChance: raw.status_chance ?? 0,
		fireRate:     raw.speed         ?? 1,
		deliveryType: "unknown" as AttackDeliveryType,
	};
}

/**
 * Convierte un arma cruda a WeaponBase.
 * Para armas sin attacks[], sintetiza 1 ataque desde los campos top-level.
 */
function toWeaponBase(raw: RawWeapon): WeaponBase {
	const attacks: WeaponAttack[] = raw.attacks && raw.attacks.length > 0
		? raw.attacks.map(normalizeAttack)
		: [{
			name:         "Normal Attack",
			totalDamage:  raw.totalDamage          ?? 0,
			damage:       {},
			critChance:   raw.criticalChance        ?? 0,
			critMult:     raw.criticalMultiplier    ?? 1,
			statusChance: raw.procChance            ?? 0,
			fireRate:     raw.fireRate              ?? 1,
			deliveryType: "unknown" as AttackDeliveryType,
		}];

	return {
		uniqueName:   raw.uniqueName,
		magazineSize: raw.magazineSize  ?? 0,
		reloadTime:   raw.reloadTime    ?? 1,
		multishot:    raw.multishot     ?? 1,
		attacks,
	};
}

/** Convierte un warframe crudo a WarframeBase (los campos ya están en camelCase). */
function toWarframeBase(raw: RawWarframe): WarframeBase {
	return {
		uniqueName:  raw.uniqueName,
		health:      raw.health      ?? 0,
		shield:      raw.shield      ?? 0,
		armor:       raw.armor       ?? 0,
		power:       raw.power       ?? 0,
		sprintSpeed: raw.sprintSpeed ?? 0,
	};
}

// =============================================================================
// OVERRIDE READER — simula lo que hará el Resolver
// =============================================================================

const overrideMap = modOverrides as Record<string, ModOverrideEntry>;

function readModValue(uniqueName: string, rank: number): number {
	const entry = overrideMap[uniqueName];
	if (!entry) return 0;
	const stat = entry.stats[0];
	if (!stat?.values[0]?.baseValue) return 0;
	const values = stat.values[0].baseValue;
	const idx = Math.max(0, Math.min(rank, values.length - 1));
	return values[idx] ?? 0;
}

function getUpgradeType(uniqueName: string): string {
	const entry = overrideMap[uniqueName];
	return entry?.stats[0]?.values[0]?.upgradeType ?? "";
}

// =============================================================================
// SETS DE MODS DE PRUEBA
// =============================================================================

const WARFRAME_MOD_SET = [
	{ uniqueName: "/Lotus/Upgrades/Mods/Warframe/AvatarHealthMaxMod",       rank: 10 }, // Vitality
	{ uniqueName: "/Lotus/Upgrades/Mods/Warframe/AvatarShieldMaxMod",       rank: 10 }, // Redirection
	{ uniqueName: "/Lotus/Upgrades/Mods/Warframe/AvatarArmourMod",          rank: 10 }, // Steel Fiber
	{ uniqueName: "/Lotus/Upgrades/Mods/Warframe/AvatarPowerMaxMod",        rank: 5  }, // Flow
	{ uniqueName: "/Lotus/Upgrades/Mods/Warframe/AvatarAbilityStrengthMod", rank: 5  }, // Intensify
];

const WEAPON_MOD_SET = [
	{ uniqueName: "/Lotus/Upgrades/Mods/Rifle/WeaponDamageAmountMod", rank: 10 }, // Serration
	{ uniqueName: "/Lotus/Upgrades/Mods/Rifle/WeaponCritChanceMod",   rank: 5  }, // Point Strike
	{ uniqueName: "/Lotus/Upgrades/Mods/Rifle/WeaponCritDamageMod",   rank: 5  }, // Vital Sense
];

function buildResolvedStats(mods: Array<{ uniqueName: string; rank: number }>) {
	return mods
		.map(m => ({
			upgradeType: getUpgradeType(m.uniqueName),
			value:       readModValue(m.uniqueName, m.rank),
			condition:   null,
		}))
		.filter(s => s.upgradeType !== "");
}

const WF_STATS  = buildResolvedStats(WARFRAME_MOD_SET);
const WEP_STATS = buildResolvedStats(WEAPON_MOD_SET);
const CTX: CalculationContext = {};

// =============================================================================
// TESTS
// =============================================================================

describe("Engine smoke — warframes (114)", () => {
	const weapons = rawWeapons as RawWeapon[];
	const warframes = rawWarframes as RawWarframe[];

	it("calcula todos los warframes sin NaN ni Infinite", () => {
		const failures: string[] = [];

		for (const raw of warframes) {
			const layout: ResolvedLayout = {
				warframe: { base: toWarframeBase(raw), stats: WF_STATS },
			};
			const out = calculate(layout, CTX);
			const wf = out.warframe;
			if (!wf) { failures.push(`${raw.name}: output.warframe undefined`); continue; }

			for (const [key, val] of Object.entries(wf) as [string, number | undefined][]) {
				if (val === undefined) continue;
				if (!isFinite(val) || isNaN(val) || val < 0) {
					failures.push(`${raw.name}.${key} = ${val}`);
				}
			}
		}

		expect(failures, `Warframes con output inválido:\n${failures.join("\n")}`).toHaveLength(0);
	});

	it("Helminth no aparece en warframes.json", () => {
		const helminth = warframes.find(w => w.name === "Helminth");
		expect(helminth).toBeUndefined();
	});

	it("Inaros tiene shield=0 pero health > 0 — intencional", () => {
		const inaros = warframes.find(w => w.name === "Inaros");
		expect(inaros).toBeDefined();
		const layout: ResolvedLayout = {
			warframe: { base: toWarframeBase(inaros!), stats: WF_STATS },
		};
		const out = calculate(layout, CTX);
		expect(out.warframe?.health).toBeGreaterThan(0);
		expect(out.warframe?.shield).toBe(0); // base = 0, mod × 0 = 0
	});

	it("abilityStrength = 1.30 con Intensify rank 5", () => {
		const rhino = warframes.find(w => w.name === "Rhino Prime") 
			?? warframes.find(w => w.name === "Rhino");
		expect(rhino).toBeDefined();
		const layout: ResolvedLayout = {
			warframe: { base: toWarframeBase(rhino!), stats: WF_STATS },
		};
		const out = calculate(layout, CTX);
		expect(out.warframe?.abilityStrength).toBeCloseTo(1.30, 2);
	});

	it("cobertura — 114 warframes procesados", () => {
		expect(warframes.length).toBe(114);
	});

	// Evitar warning de variable no usada en el scope
	void weapons;
});

describe("Engine smoke — weapons (628)", () => {
	const weapons = rawWeapons as RawWeapon[];

	it("calcula todos los ataques sin NaN ni Infinite", () => {
		const failures: string[] = [];

		for (const raw of weapons) {
			const base = toWeaponBase(raw);
			const layout: ResolvedLayout = {
				primaryWeapon: { base, stats: WEP_STATS },
			};
			const out = calculate(layout, CTX);
			const weapon = out.primaryWeapon;
			if (!weapon) { failures.push(`${raw.name}: output.primaryWeapon undefined`); continue; }

			assertLoop: for (const [idx, attack] of weapon.attacks.entries()) {
				const name = `${raw.name}[${idx}] "${attack.name}"`;
				for (const [field, val] of Object.entries(attack) as [string, number | string][]) {
					if (typeof val !== "number") continue;
					if (!isFinite(val) || isNaN(val)) {
						failures.push(`${name}.${field} = ${val}`);
						break assertLoop;
					}
				}
			}
		}

		expect(failures, `Armas con output inválido:\n${failures.join("\n")}`).toHaveLength(0);
	});

	it("averageCritMultiplier >= 1 para todos los ataques", () => {
		const failures: string[] = [];

		for (const raw of weapons) {
			const base = toWeaponBase(raw);
			const layout: ResolvedLayout = {
				primaryWeapon: { base, stats: WEP_STATS },
			};
			const out = calculate(layout, CTX);
			for (const [idx, attack] of (out.primaryWeapon?.attacks ?? []).entries()) {
				if (attack.averageCritMultiplier < 1) {
					failures.push(`${raw.name}[${idx}] "${attack.name}": avgCrit = ${attack.averageCritMultiplier}`);
				}
			}
		}

		expect(failures, `Ataques con avgCrit < 1:\n${failures.join("\n")}`).toHaveLength(0);
	});

	it("totalDamage > 0 para todos los ataques salvo casos conocidos", () => {
		// Excluidos del assert (totalDamage = 0 es dato correcto en el dataset):
		// 1. Variantes PvP de Zaw strikes (uniqueName incluye "PvPVariant") — Conclave.
		// 2. Componentes de Zaw sin attacks[] y totalDamage = 0 (balance links, handles, grips).
		//    El dataset los incluye porque son "items" del catálogo, no armas ensambladas.
		// 3. Simulor / Synoid Simulor: "Orb Launch" con totalDamage = 0 (dataset PA-T).
		const KNOWN_ZERO_DAMAGE_NAMES = new Set([
			"Simulor",
			"Synoid Simulor",
		]);
		const failures: string[] = [];

		for (const raw of weapons) {
			if (KNOWN_ZERO_DAMAGE_NAMES.has(raw.name)) continue;
			if (raw.uniqueName.includes("PvPVariant")) continue;
			// Componentes modulares (Zaw handles/links) sin daño standalone
			if ((raw.attacks?.length ?? 0) === 0 && (raw.totalDamage ?? 0) === 0) continue;
			const base = toWeaponBase(raw);
			const layout: ResolvedLayout = {
				primaryWeapon: { base, stats: WEP_STATS },
			};
			const out = calculate(layout, CTX);
			for (const [idx, attack] of (out.primaryWeapon?.attacks ?? []).entries()) {
				if (attack.totalDamage === 0) {
					failures.push(`${raw.name}[${idx}] "${attack.name}": totalDamage = 0`);
				}
			}
		}

		expect(failures, `Ataques con totalDamage=0 (no esperados):\n${failures.join("\n")}`).toHaveLength(0);
	});

	it("Simulor y Synoid Simulor tienen Orb Launch con totalDamage=0 — caso PA-T", () => {
		for (const name of ["Simulor", "Synoid Simulor"]) {
			const raw = weapons.find(w => w.name === name);
			expect(raw, `${name} debe existir en el dataset`).toBeDefined();
			const base = toWeaponBase(raw!);
			const launch = base.attacks.find(a => a.name === "Orb Launch");
			expect(launch, `${name}: debe tener ataque "Orb Launch"`).toBeDefined();
			expect(launch!.totalDamage).toBe(0);
		}
	});

	it("armas sin attacks[] en el dataset sintetizan 1 ataque", () => {
		const NO_ATTACKS = ["Coda Bubonico", "Enkaus", "Grimoire", "Tenet Quanta"];
		for (const name of NO_ATTACKS) {
			const raw = weapons.find(w => w.name === name);
			expect(raw, `${name} debe existir en el dataset`).toBeDefined();
			const base = toWeaponBase(raw!);
			expect(base.attacks).toHaveLength(1);
			expect(base.attacks[0].name).toBe("Normal Attack");
		}
	});

	it("critChance moddada nunca excede 100 (sin mods de tier sobrenatural)", () => {
		// Con PointStrike r5 (+150%), el máximo realista de critChance base es ~0.5
		// → moddado: 0.5 * 2.5 = 1.25 (125%). Sobre 1 es válido en el juego.
		// Detectar solo valores absurdos (> 5.0 = 500%) como fuga de escala.
		const failures: string[] = [];
		for (const raw of weapons) {
			const base = toWeaponBase(raw);
			const layout: ResolvedLayout = { primaryWeapon: { base, stats: WEP_STATS } };
			const out = calculate(layout, CTX);
			for (const attack of out.primaryWeapon?.attacks ?? []) {
				if (attack.critChance > 5.0) {
					failures.push(`${raw.name} "${attack.name}": critChance = ${attack.critChance}`);
				}
			}
		}
		expect(failures, `CritChance > 500% (fuga de escala):\n${failures.join("\n")}`).toHaveLength(0);
	});

	it("cobertura — 628 armas procesadas", () => {
		expect(weapons.length).toBe(628);
	});
});
