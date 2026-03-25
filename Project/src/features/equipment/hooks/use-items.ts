import { useState, useEffect, useCallback } from "react";
import { fetchWeapons } from "@lib/weaponData";
import { fetchWarframes } from "@lib/warframeData";
import { fetchMods } from "@lib/modData";
import { fetchArcanes } from "@lib/arcaneData";
import { fetchCompanions } from "@lib/companionData";
import { fetchArchwingWeapons } from "@lib/archwingWeaponData";
import { fetchVehicles } from "@lib/vehicleData";
import type { BaseItem, Weapon } from "@lib/types";
import { usePerformanceDebug } from "./use-performance-debug";

// Cache de datos cargados para evitar peticiones redundantes
const itemsCache: Partial<Record<ItemSource, BaseItem[]>> = {};

export type ItemSource = 'primary' | 'secondary' | 'melee' | 'warframe' | 'mod' | 'arcane' | 'companion' | 'archgun' | 'archmelee' | 'necramech' | 'archwing' | 'all';

/**
 * Lazy loaders para cada categoría de items.
 * Cada loader retorna una Promise que resuelve a un array de BaseItem.
 */
const lazyLoaders: Record<ItemSource, () => Promise<BaseItem[]>> = {
  primary: async () => {
    const weapons = await fetchWeapons();
    return weapons.filter((w: Weapon) => w.category === 'Primary');
  },
  secondary: async () => {
    const weapons = await fetchWeapons();
    return weapons.filter((w: Weapon) => w.category === 'Secondary');
  },
  melee: async () => {
    const weapons = await fetchWeapons();
    return weapons.filter((w: Weapon) => w.category === 'Melee');
  },
  warframe: async () => {
    return fetchWarframes();
  },
  mod: async () => {
    return fetchMods();
  },
  arcane: async () => {
    return fetchArcanes();
  },
  companion: async () => {
    return fetchCompanions();
  },
  archgun: async () => {
    return fetchArchwingWeapons().then(items => items.filter(i => i.kind === 'archgun'));
  },
  archmelee: async () => {
    return fetchArchwingWeapons().then(items => items.filter(i => i.kind === 'archmelee'));
  },
  necramech: async () => {
    return fetchVehicles().then(items => items.filter(i => i.kind === 'necramech'));
  },
  archwing: async () => {
    return fetchVehicles().then(items => items.filter(i => i.kind === 'archwing'));
  },
  all: async () => {
    // Scope v1: solo warframes, weapons y mods.
    // arcanes, companions, vehicles y archwing-weapons excluidos hasta que el builder los consuma.
    // Ver DF-G8 en data-foundation/status.md
    const [weapons, warframes, mods] = await Promise.all([
      fetchWeapons(),
      fetchWarframes(),
      fetchMods(),
    ]);
    return [...weapons, ...warframes, ...mods];
  },
};

/**
 * Hook para obtener items de forma organizada y con carga lazy.
 * Soporta carga de una sola categoría, múltiples categorías o 'all'.
 * 
 * Implementa caching para evitar peticiones redundantes.
 */
export const useItems = (source: ItemSource | ItemSource[]) => {
  const [data, setData] = useState<BaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Serializar para evitar que un array nuevo en cada render cause bucle infinito
  const sourceKey = Array.isArray(source) ? source.join(",") : source;

  const perf = usePerformanceDebug(`useItems(${sourceKey})`);

  const loadData = useCallback(async () => {
    perf.start();

    setIsLoading(true);
    setData([]);
    setError(null);

    const sources = sourceKey.split(",") as ItemSource[];
    
    console.log(`%c[PERF] Loading ${sources.length} source(s): ${sources.join(', ')}`, 'color: #ffd93d; font-weight: bold');

    const fetchStart = performance.now();

    try {
      // Resolver todas las sources en paralelo y reemplazar el estado de golpe
      // Evita el patrón acumulativo (prev => [...prev, ...new]) que causa duplicados
      // cuando StrictMode ejecuta el efecto dos veces.
      const results = await Promise.all(
        sources.map(async (src) => {
          const srcStart = performance.now();

          if (!itemsCache[src]) {
            const loader = lazyLoaders[src];
            if (!loader) {
              console.warn(`No loader found for source: ${src}`);
              return [];
            }
            console.log(`[PERF] Fetching ${src}...`);
            itemsCache[src] = await loader();
            console.log(
              `%c[PERF] ✓ Fetch ${src}: ${(performance.now() - srcStart).toFixed(2)}ms (${itemsCache[src]!.length} items)`,
              'color: #6bcf7f'
            );
          } else {
            console.log(
              `%c[PERF] ⚡ Cache hit ${src}: ${itemsCache[src]!.length} items`,
              'color: #95e1d3'
            );
          }

          return itemsCache[src]!;
        })
      );

      const totalFetchTime = performance.now() - fetchStart;
      console.log(
        `%c[PERF] Total fetch time: ${totalFetchTime.toFixed(2)}ms`,
        'color: #4ecdc4; font-weight: bold'
      );

      // Reemplazar estado completo en un solo setState
      setData(results.flat());
    } catch (err) {
      console.error(`Error loading sources "${sourceKey}":`, err);
      setError(err instanceof Error ? err : new Error(`Error loading ${sourceKey}`));
    }

    setIsLoading(false);
    perf.end('Complete');
  }, [sourceKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoading, error, reload: loadData };
};
