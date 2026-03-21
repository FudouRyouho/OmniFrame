import { useState, useEffect, useCallback } from "react";
import { fetchWeapons } from "@lib/weaponData";
import { fetchWarframes } from "@lib/warframeData";
import { fetchMods } from "@lib/modData";
import type { BaseItem, Weapon } from "@lib/types";

// Cache de datos cargados para evitar peticiones redundantes
const itemsCache: Partial<Record<ItemSource, BaseItem[]>> = {};

export type ItemSource = 'primary' | 'secondary' | 'melee' | 'warframe' | 'mod' | 'all';

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
  all: async () => {
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

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sources = Array.isArray(source) ? source : [source];
      const results = await Promise.all(
        sources.map(async (src) => {
          // Si ya está en cache, lo devolvemos
          if (itemsCache[src]) {
            return itemsCache[src]!;
          }

          // Si no, lo cargamos dinámicamente
          const loader = lazyLoaders[src];
          if (!loader) {
            console.warn(`No loader found for source: ${src}`);
            return [];
          }

          const items = await loader();
          itemsCache[src] = items;
          return items;
        })
      );

      // Aplanamos los resultados si es un array de arrays
      const flattenedData = results.flat();
      setData(flattenedData);
    } catch (err) {
      console.error("Error loading items:", err);
      setError(err instanceof Error ? err : new Error("Unknown error loading items"));
    } finally {
      setIsLoading(false);
    }
  }, [source]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoading, error, reload: loadData };
};
