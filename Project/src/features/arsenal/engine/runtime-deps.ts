import { fetchWarframes } from "@lib/warframeData";
import { fetchWeapons } from "@lib/weaponData";
import {
	buildWarframesMap,
	buildWeaponsMap,
	type ModOverrideMap,
	type ResolverDependencies,
} from "./resolver";

let modOverrideCache: ModOverrideMap | null = null;
let resolverDepsCache: ResolverDependencies | null = null;
let pendingResolverDeps: Promise<ResolverDependencies> | null = null;

async function fetchModOverrideMap(): Promise<ModOverrideMap> {
	if (modOverrideCache) {
		return modOverrideCache;
	}

	const response = await fetch("/data/mod-stats.override.json");
	if (!response.ok) {
		throw new Error("No se pudo cargar /data/mod-stats.override.json");
	}

	modOverrideCache = await response.json() as ModOverrideMap;
	return modOverrideCache;
}

export async function loadResolverDependencies(): Promise<ResolverDependencies> {
	if (resolverDepsCache) {
		return resolverDepsCache;
	}

	if (pendingResolverDeps) {
		return pendingResolverDeps;
	}

	pendingResolverDeps = Promise.all([
		fetchWeapons(),
		fetchWarframes(),
		fetchModOverrideMap(),
	]).then(([weapons, warframes, modOverrideMap]) => {
		resolverDepsCache = {
			itemDataset: {
				weapons: buildWeaponsMap(weapons as Parameters<typeof buildWeaponsMap>[0]),
				warframes: buildWarframesMap(warframes as Parameters<typeof buildWarframesMap>[0]),
			},
			modOverrideMap,
		};

		return resolverDepsCache;
	}).finally(() => {
		pendingResolverDeps = null;
	});

	return pendingResolverDeps;
}
