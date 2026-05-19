import { useState, useEffect, useCallback } from "react";
import { Registry } from "@shared/data/DataRegistry";
import type { BaseItem, ItemSource } from "@shared/types";
import { usePerformanceDebug } from "../debug/use-performance-debug";

const itemsCache: Partial<Record<string, BaseItem[]>> = {};

const loadFromRegistry = async (source: ItemSource): Promise<BaseItem[]> => {
  if (source === 'all') {
    const results = await Promise.all([
      Registry.getDataset('warframes'),
      Registry.getDataset('weapons'),
      Registry.getDataset('mods'),
      Registry.getDataset('arcanes'),
      Registry.getDataset('companions'),
      Registry.getDataset('vehicles'),
    ]);
    return results.flat();
  }

  return Registry.getByKind(source);
};


export const useItems = (source: ItemSource | ItemSource[]) => {
  const [data, setData] = useState<BaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const sourceKey = Array.isArray(source) ? source.join(",") : source;

  const perf = usePerformanceDebug(`useItems(${sourceKey})`);

  const loadData = useCallback(async () => {
    perf.start();

    setIsLoading(true);
    setData([]);
    setError(null);

    const sources = sourceKey.split(",") as ItemSource[];
    
    try {
      const results = await Promise.all(
        sources.map(async (src) => {
          if (!itemsCache[src]) {
            itemsCache[src] = await loadFromRegistry(src);
          }
          return itemsCache[src]!;
        })
      );

      setData(results.flat());
    } catch (err) {
      console.error(`%c[DATA-ERROR] Error loading sources "${sourceKey}":`, 'color: #ff4757; font-weight: bold; font-size: 14px', err);
      setError(err instanceof Error ? err : new Error(`Error loading ${sourceKey}`));
    }

    setIsLoading(false);
    perf.end('Complete');
  }, [sourceKey, perf]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoading, error, reload: loadData };
};
