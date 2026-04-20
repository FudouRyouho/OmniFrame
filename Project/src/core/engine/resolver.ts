/**
 * @domain Engine / Resolver
 * @SSoT docs/domains/engine/status.md
 */

import {
	calculate,
	type AttackDeliveryType,
	type CalculationContext,
	type EngineOutput,
	type ResolvedChannel,
	type ResolvedLayout,
	type ResolvedStat,
	type WarframeBase,
	type WeaponAttack,
	type WeaponBase,
} from "./index";
export interface EquippedMod {
	uniqueName: string;
	rank: number;
}

export interface EquippedEntity {
	uniqueName: string;
	mods: EquippedMod[];
	arcanes?: EquippedMod[];
}

export interface LoadoutInput {
	warframe?:       EquippedEntity;
	primaryWeapon?:  EquippedEntity;
	secondaryWeapon?: EquippedEntity;
	meleeWeapon?:    EquippedEntity;
}

interface RawWeaponAttack {
	name:          string;
	totalDamage?:  number;
	damage?:       Record<string, number>;
	crit_chance?:  number | null;
	crit_mult?:    number | null;
	status_chance?: number | null;
	speed?:        number | null;
	shot_type?:    string | null;
}

export interface RawWeaponItem {
	uniqueName:          string;
	magazineSize?:       number;
	reloadTime?:         number;
	multishot?:          number;
	/** top-level para armas sin attacks[] (fallback) */
	totalDamage?:        number;
	criticalChance?:     number;
	criticalMultiplier?: number;
	procChance?:         number;
	fireRate?:           number;
	attacks?:            RawWeaponAttack[];
}

export interface RawWarframeItem {
	uniqueName:   string;
	health?:      number;
	shield?:      number;
	armor?:       number;
	power?:       number;
	sprintSpeed?: number;
}

export interface ModStatValue {
	baseValue:   number[];
	upgradeType: string;
}

export interface ModStat {
	label:    string;
	values:   ModStatValue[];
	condition: string | null;
}

export interface ModOverrideEntry {
	name:  string;
	stats: ModStat[];
}

export type ModOverrideMap = Record<string, ModOverrideEntry>;

export interface ResolverDependencies {
	/** weapons.json + warframes.json indexados por uniqueName */
	itemDataset: {
		weapons: Map<string, RawWeaponItem>;
		warframes: Map<string, RawWarframeItem>;
	};
	/** mod-stats.override.json indexado por uniqueName del mod */
	modOverrideMap: ModOverrideMap;
}

function normalizeAttack(raw: RawWeaponAttack): WeaponAttack {
	return {
		name:         raw.name,
		totalDamage:  raw.totalDamage  ?? 0,
		damage:       raw.damage       ?? {},
		critChance:   raw.crit_chance  ?? 0,
		critMult:     raw.crit_mult    ?? 1,
		statusChance: raw.status_chance ?? 0,
		fireRate:     raw.speed        ?? 1,
		deliveryType: "unknown" as AttackDeliveryType,
	};
}

function toWeaponBase(raw: RawWeaponItem): WeaponBase {
	const attacks: WeaponAttack[] = raw.attacks && raw.attacks.length > 0
		? raw.attacks.map(normalizeAttack)
		: [{
			name:         "Normal Attack",
			totalDamage:  raw.totalDamage         ?? 0,
			damage:       {},
			critChance:   raw.criticalChance       ?? 0,
			critMult:     raw.criticalMultiplier   ?? 1,
			statusChance: raw.procChance           ?? 0,
			fireRate:     raw.fireRate             ?? 1,
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

function toWarframeBase(raw: RawWarframeItem): WarframeBase {
	return {
		uniqueName:  raw.uniqueName,
		health:      raw.health      ?? 0,
		shield:      raw.shield      ?? 0,
		armor:       raw.armor       ?? 0,
		power:       raw.power       ?? 0,
		sprintSpeed: raw.sprintSpeed ?? 0,
	};
}

function resolveModStats(
	equippedMods: EquippedMod[],
	modOverrideMap: ModOverrideMap,
): ResolvedStat[] {
	const resolved: ResolvedStat[] = [];

	for (const equipped of equippedMods) {
		const entry = modOverrideMap[equipped.uniqueName];
		if (!entry) continue; // mod sin datos de override — ignorado

		for (const stat of entry.stats) {
			for (const val of stat.values) {
				const rankIdx = Math.max(0, Math.min(equipped.rank, val.baseValue.length - 1));
				const value = val.baseValue[rankIdx];
				if (value === undefined) continue;

				resolved.push({
					upgradeType: val.upgradeType,
					value,
					condition:   stat.condition,
				});
			}
		}
	}

	return resolved;
}

function resolveWarframeChannel(
	entity: EquippedEntity,
	deps: ResolverDependencies,
): ResolvedChannel<WarframeBase> | null {
	const raw = deps.itemDataset.warframes.get(entity.uniqueName);
	if (!raw) return null;

	return {
		base:  toWarframeBase(raw),
		stats: resolveModStats(entity.mods, deps.modOverrideMap),
	};
}

/**
 * Construye un canal de arma resuelto:
 * lookup de base stats (con normalización de ataques) + resolución de mod stats.
 */
function resolveWeaponChannel(
	entity: EquippedEntity,
	deps: ResolverDependencies,
): ResolvedChannel<WeaponBase> | null {
	const raw = deps.itemDataset.weapons.get(entity.uniqueName);
	if (!raw) return null;

	return {
		base:  toWeaponBase(raw),
		stats: resolveModStats(entity.mods, deps.modOverrideMap),
	};
}

export function resolve(input: LoadoutInput, deps: ResolverDependencies): ResolvedLayout {
	const layout: ResolvedLayout = {};

	if (input.warframe) {
		const ch = resolveWarframeChannel(input.warframe, deps);
		if (ch) layout.warframe = ch;
	}

	if (input.primaryWeapon) {
		const ch = resolveWeaponChannel(input.primaryWeapon, deps);
		if (ch) layout.primaryWeapon = ch;
	}

	if (input.secondaryWeapon) {
		const ch = resolveWeaponChannel(input.secondaryWeapon, deps);
		if (ch) layout.secondaryWeapon = ch;
	}

	if (input.meleeWeapon) {
		const ch = resolveWeaponChannel(input.meleeWeapon, deps);
		if (ch) layout.meleeWeapon = ch;
	}

	return layout;
}

export function resolveAndCalculate(
	input: LoadoutInput,
	deps: ResolverDependencies,
	context: CalculationContext = {},
): EngineOutput {
	const layout = resolve(input, deps);
	return calculate(layout, context);
}

export function buildWeaponsMap(weapons: RawWeaponItem[]): Map<string, RawWeaponItem> {
	return new Map(weapons.map(w => [w.uniqueName, w]));
}

export function buildWarframesMap(warframes: RawWarframeItem[]): Map<string, RawWarframeItem> {
	return new Map(warframes.map(w => [w.uniqueName, w]));
}
