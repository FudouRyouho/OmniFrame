/**
 * @domain Shared / Infrastructure / Storage
 * @SSoT docs/domains/integration/runtime-hydration.md
 */
import Dexie, { type EntityTable } from 'dexie';
import type { Warframe, Weapon, Mod, Arcane, Companion, Vehicle, ArchwingWeapon } from '../shared/types';

// Incrementar cuando los datos cambien (invalida cache)
const DB_VERSION = 4;
const DB_NAME = 'OmniFrameDB';
const VERSION_KEY = 'db_version';

interface DBMetadata {
  key: string;
  value: number;
}

class OmniFrameDB extends Dexie {
  warframes!: EntityTable<Warframe, 'uniqueName'>;
  weapons!: EntityTable<Weapon, 'uniqueName'>;
  mods!: EntityTable<Mod, 'uniqueName'>;
  arcanes!: EntityTable<Arcane, 'uniqueName'>;
  companions!: EntityTable<Companion, 'uniqueName'>;
  vehicles!: EntityTable<Vehicle, 'uniqueName'>;
  archwingWeapons!: EntityTable<ArchwingWeapon, 'uniqueName'>;
  metadata!: EntityTable<DBMetadata, 'key'>;

  constructor() {
    super(DB_NAME);
    this.version(1).stores({
      warframes: 'uniqueName, name, kind, isPrime',
      weapons: 'uniqueName, name, kind, category',
      mods: 'uniqueName, name, kind, polarity',
      arcanes: 'uniqueName, name, kind',
      companions: 'uniqueName, name, kind',
      vehicles: 'uniqueName, name, kind',
      archwingWeapons: 'uniqueName, name, kind',
      metadata: 'key',
    });
  }
}

export const db = new OmniFrameDB();

export const checkDBVersion = async (): Promise<boolean> => {
  try {
    const meta = await db.metadata.get(VERSION_KEY);
    if (meta?.value !== DB_VERSION) {
      console.log(`[IndexedDB] Version mismatch (stored: ${meta?.value}, current: ${DB_VERSION}). Clearing cache...`);
      await db.warframes.clear();
      await db.weapons.clear();
      await db.mods.clear();
      await db.arcanes.clear();
      await db.companions.clear();
      await db.vehicles.clear();
      await db.archwingWeapons.clear();
      await db.metadata.put({ key: VERSION_KEY, value: DB_VERSION });
      return false;
    }
    return true;
  } catch (err) {
    console.error('[IndexedDB] Error checking version:', err);
    return false;
  }
};

export const fetchWithCache = async <T extends { uniqueName: string }>(
  table: EntityTable<T, 'uniqueName'>,
  fetchFn: () => Promise<T[]>,
  label: string
): Promise<T[]> => {
  try {
    // Verificar versión de DB
    await checkDBVersion();

    const cached = await table.toArray();
    if (cached.length > 0) {
      console.log(`[IndexedDB] ⚡ Cache hit: ${label} (${cached.length} items)`);
      return cached;
    }

    // Fallback direct JSON
    console.log(`[IndexedDB] Fetching ${label} from JSON...`);
    const data = await fetchFn();

    await table.bulkPut(data);
    console.log(`[IndexedDB] ✓ Cached ${label} (${data.length} items)`);

    return data;
  } catch (err) {
    console.error(`[IndexedDB] Error with ${label}, falling back to JSON:`, err);
    // Fallback: si IndexedDB falla, usar JSON directamente
    return fetchFn();
  }
};
