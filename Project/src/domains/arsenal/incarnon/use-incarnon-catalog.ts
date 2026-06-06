import { useState, useEffect } from 'react';
import type { ConditionInput } from '@shared/types/condition';

export type IncarnorStat = {
  label:         string;
  base_value?:   number | Record<string, number>;
  upgrade_type?: string;
  condition?:    ConditionInput | null;  // token | {any|all} | null (sin token) | ausente — D-18
};

export type IncarnorPerk = {
  name?:       string;
  image_name?: string;
  stats:       IncarnorStat[];
  notes?:      string[];
};

export type IncarnorEvolution = Record<string, IncarnorPerk>;

export type IncarnorEntry = {
  weapons: string | Record<string, string>;
  evolutions: Record<string, IncarnorEvolution>;
};

export type IncarnorCatalog = Record<string, IncarnorEntry>;

let catalogPromise: Promise<IncarnorCatalog> | null = null;

function fetchCatalog(): Promise<IncarnorCatalog> {
  if (!catalogPromise) {
    catalogPromise = fetch('/data/incarnon-evolutions.override.json').then(r => r.json());
  }
  return catalogPromise;
}

export function useIncarnorCatalog(): IncarnorCatalog | null {
  const [catalog, setCatalog] = useState<IncarnorCatalog | null>(null);

  useEffect(() => {
    fetchCatalog().then(setCatalog);
  }, []);

  return catalog;
}

export function findEntryForWeapon(catalog: IncarnorCatalog, weaponId: string): IncarnorEntry | null {
  for (const entry of Object.values(catalog)) {
    if (typeof entry.weapons === 'string') {
      if (entry.weapons === weaponId) return entry;
    } else {
      if (Object.values(entry.weapons).includes(weaponId)) return entry;
    }
  }
  return null;
}
