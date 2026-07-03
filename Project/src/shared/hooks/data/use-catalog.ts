import { useState, useEffect } from "react";
import { Registry } from "@shared/data/DataRegistry";

/**
 * Binding React a un catálogo crudo del Registry (forma `Record<key, entry>`).
 * null mientras carga. Reemplaza los mini-fetchers ad-hoc por canal de carga único.
 *
 * @param key  nombre del JSON en /data/ sin extensión (ej. 'archon-shards',
 *             'incarnon-evolutions.override').
 */
export function useCatalog<T>(key: string): T | null {
  const [catalog, setCatalog] = useState<T | null>(null);

  useEffect(() => {
    let mounted = true;
    Registry.getCatalog<T>(key).then((c) => {
      if (mounted) setCatalog(c);
    });
    return () => {
      mounted = false;
    };
  }, [key]);

  return catalog;
}
