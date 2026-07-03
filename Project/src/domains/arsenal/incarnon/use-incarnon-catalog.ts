import type { ConditionInput } from '@shared/types/condition';
import { useCatalog } from '@shared/hooks/data/use-catalog';

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

/** El fetch+cache vive en Registry.getCatalog (canal de carga único). */
export const useIncarnorCatalog = (): IncarnorCatalog | null =>
  useCatalog<IncarnorCatalog>('incarnon-evolutions.override');

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
