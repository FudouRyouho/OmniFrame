/**
 * @module engine/resolver
 * @description Resolver v1 — capa de traducción entre Loadout y Engine.
 *
 * Responsabilidades (C35, C36):
 *   FORWARD: LoadoutInput (B1) + datasets inyectados → ResolvedLayout (B2)
 *     1. Lookup de entidad en itemDataset por uniqueName → base stats
 *     2. Lookup de cada mod en modOverrideMap por uniqueName, rank → lista plana de ResolvedStat[]
 *     3. Entrega ResolvedLayout con base stats normalizados + stats sin agregar (C35)
 *
 *   El Resolver NO:
 *     - Agrupa ni suma upgradeTypes (eso lo hace el Engine)
 *     - Evalúa condiciones (eso es responsabilidad del Engine + CalculationContext)
 *     - Accede a ningún JSON directamente — recibe datasets como dependencias inyectadas
 *
 *   BACKWARD (B4): enfoque arquitectonico cerrado (OQ-12, A+). Projection estructural (datos/metadata), no textual.
 *   Implementacion/payload final pendiente. B4-lite purgado (2026-04-14).
 *   Referencia: Docs/domains/engine/architecture.md, Docs/decisions/open-questions.md
 *
 * Contratos cerrados: C35, C36, C37, C38 — Docs/decisions/stage-0-architecture-decisions.md
 *
 * Normalización de campos del dataset:
 *   Warframes: campos ya en camelCase (health, shield, armor, power, sprintSpeed) ✓
 *   Weapons/attacks: snake_case → camelCase
 *     crit_chance → critChance | crit_mult → critMult | speed → fireRate | status_chance → statusChance
 *   deliveryType: "unknown" en todos los ataques (pendiente generate-data — C39)
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
// =============================================================================
// TIPOS DE ENTRADA (BOUNDARY B1) — LoadoutInput
// =============================================================================

/** Un mod equipado en un slot: uniqueName del mod + rango actual. */
export interface EquippedMod {
	uniqueName: string;
	rank: number;
}

/**
 * Una entidad equipada en un canal del Loadout.
 * El Resolver hace el lookup de base stats y mod stats desde aquí.
 */
export interface EquippedEntity {
	uniqueName: string;
	mods: EquippedMod[];
	arcanes?: EquippedMod[]; // v1: ignorados por el Engine, incluidos por completitud del contrato
}

/**
 * Entrada del Resolver (B1 — Loadout → Resolver).
 * Todos los canales son opcionales: el Resolver calcula lo que tiene disponible.
 */
export interface LoadoutInput {
	warframe?:       EquippedEntity;
	primaryWeapon?:  EquippedEntity;
	secondaryWeapon?: EquippedEntity;
	meleeWeapon?:    EquippedEntity;
}

// =============================================================================
// TIPOS DEL DATASET — forma mínima esperada para la normalización
// =============================================================================

/** Forma mínima de un ataque en weapons.json */
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

/** Forma mínima de un arma en weapons.json */
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

/** Forma mínima de un warframe en warframes.json */
export interface RawWarframeItem {
	uniqueName:   string;
	health?:      number;
	shield?:      number;
	armor?:       number;
	power?:       number;
	sprintSpeed?: number;
}

// =============================================================================
// TIPOS DEL OVERRIDE — schema cerrado (C12–C28)
// =============================================================================

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

/** Mapa indexado por uniqueName del mod → datos de override */
export type ModOverrideMap = Record<string, ModOverrideEntry>;

// =============================================================================
// TIPOS DE DEPENDENCIAS INYECTADAS
// =============================================================================

/**
 * Dependencias que el Resolver necesita para operar.
 * No importa ningún JSON directamente — el caller inyecta los datasets (C36).
 */
export interface ResolverDependencies {
	/** weapons.json + warframes.json indexados por uniqueName */
	itemDataset: {
		weapons: Map<string, RawWeaponItem>;
		warframes: Map<string, RawWarframeItem>;
	};
	/** mod-stats.override.json indexado por uniqueName del mod */
	modOverrideMap: ModOverrideMap;
}

// =============================================================================
// NORMALIZACIÓN — dataset crudo → contratos del Engine
// =============================================================================

/**
 * Normaliza un ataque crudo del dataset a WeaponAttack.
 * snake_case → camelCase, defaults seguros, deliveryType = "unknown" (C39).
 */
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

/**
 * Construye WeaponBase a partir del raw del dataset.
 * Para armas sin attacks[], sintetiza 1 ataque desde los campos top-level.
 */
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

/** Construye WarframeBase a partir del raw del dataset. */
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

// =============================================================================
// RESOLUCIÓN DE MODS — override → ResolvedStat[]
// =============================================================================

/**
 * Resuelve una lista de mods equipados en una lista plana de ResolvedStat[].
 * Un mod con N stats genera N entradas (C35: sin agregar, sin sumar).
 * Un mod no encontrado en el override genera 0 entradas (silencioso — sin datos, sin ruido).
 */
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

// =============================================================================
// CANALIZACIÓN — LoadoutInput → ResolvedLayout
// =============================================================================

/**
 * Construye un canal de warframe resuelto:
 * lookup de base stats + resolución de mod stats.
 */
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

// =============================================================================
// API PÚBLICA
// =============================================================================

/**
 * Resuelve un LoadoutInput en un ResolvedLayout listo para el Engine.
 *
 * Función pura: sin estado, sin efectos secundarios.
 * Ignora canales cuya entidad no existe en el dataset (no lanza — devuelve canal omitido).
 *
 * @param input     Loadout con uniqueNames + mods por canal
 * @param deps      Datasets inyectados (itemDataset + modOverrideMap)
 * @returns         ResolvedLayout parcial — solo los canales resolvibles
 */
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

/**
 * Composición: resolve → calculate en un solo paso.
 * Conveniente para consumers que no necesitan el ResolvedLayout intermedio.
 *
 * @param input    Loadout con uniqueNames + mods por canal
 * @param deps     Datasets inyectados
 * @param context  CalculationContext (v1: vacío)
 * @returns        EngineOutput con stats calculados
 */
export function resolveAndCalculate(
	input: LoadoutInput,
	deps: ResolverDependencies,
	context: CalculationContext = {},
): EngineOutput {
	const layout = resolve(input, deps);
	return calculate(layout, context);
}

// =============================================================================
// FACTORY DE DEPENDENCIAS — helpers opcionales para construir los datasets
// =============================================================================

/**
 * Construye el mapa de armas indexado por uniqueName desde el array del dataset.
 * Usar una sola vez al inicializar, no en cada llamada al Resolver.
 */
export function buildWeaponsMap(weapons: RawWeaponItem[]): Map<string, RawWeaponItem> {
	return new Map(weapons.map(w => [w.uniqueName, w]));
}

/**
 * Construye el mapa de warframes indexado por uniqueName desde el array del dataset.
 * Usar una sola vez al inicializar, no en cada llamada al Resolver.
 */
export function buildWarframesMap(warframes: RawWarframeItem[]): Map<string, RawWarframeItem> {
	return new Map(warframes.map(w => [w.uniqueName, w]));
}
