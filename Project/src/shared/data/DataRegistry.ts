/**
 * src/shared/data/DataRegistry.ts
 * Single Source of Truth para el acceso y carga de datos en OmniFrame.
 */
import type { BaseItem, Weapon, Warframe, Mod, Arcane, Companion, Vehicle, Ability, AbilityStatsData } from "@shared/types";
import { hydrateImageFromImageName } from "@lib/image-url";
import { matchesRouteIdentifier } from "@lib/route-id";

type DatasetKey = 'warframes' | 'weapons' | 'mods' | 'arcanes' | 'companions' | 'archwing-weapons' | 'vehicles';

class DataRegistry {
  private cache: Map<DatasetKey, any[]> = new Map();
  private loadingPromises: Map<DatasetKey, Promise<any[]>> = new Map();
  private abilityStatsDb: Record<string, any> | null = null;
  private passivesDb: Record<string, { name: string; description: string }> | null = null;
  // Catálogos crudos (forma Record<key,entry>, no BaseItem[]): archon-shards, incarnon, etc.
  private catalogCache: Map<string, unknown> = new Map();
  private catalogPromises: Map<string, Promise<unknown>> = new Map();

  /**
   * Carga un dataset específico asegurando hidratación base.
   */
  async getDataset<T extends BaseItem>(key: DatasetKey): Promise<T[]> {
    if (this.cache.has(key)) return this.cache.get(key) as T[];
    
    if (this.loadingPromises.has(key)) return this.loadingPromises.get(key) as Promise<T[]>;

    const promise = (async () => {
      try {
        const res = await fetch(`/data/${key}.json`);
        if (!res.ok) throw new Error(`Failed to load ${key}.json`);
        const data: T[] = await res.json();
        
        let hydrated = data.map(hydrateImageFromImageName);

        // Hidratación específica por dominio
        if (key === 'warframes') {
          hydrated = await this.hydrateWarframes(hydrated as unknown as Warframe[]) as unknown as T[];
        }
        
        this.cache.set(key, hydrated);
        return hydrated;
      } catch (e) {
        console.error(`[DataRegistry] Error loading ${key}:`, e);
        return [];
      } finally {
        this.loadingPromises.delete(key);
      }
    })();

    this.loadingPromises.set(key, promise);
    return promise;
  }

  private async hydrateWarframes(warframes: Warframe[]): Promise<Warframe[]> {
    if (!this.abilityStatsDb) {
      const res = await fetch('/data/ability-stats.override.json').catch(() => null);
      this.abilityStatsDb = res?.ok ? await res.json() : {};
    }
    if (!this.passivesDb) {
      const res = await fetch('/data/passives.json').catch(() => null);
      this.passivesDb = res?.ok ? await res.json() : {};
    }

    return warframes.map(wf => ({
      ...wf,
      // Resuelve la passive (key string → {name, description}); absorbido de lib/warframe-data
      // al colapsar esa isla — Registry es el merge completo (abilities + passives).
      passive: typeof wf.passive === 'string'
        ? (this.passivesDb![wf.passive] ?? wf.passive)
        : wf.passive,
      passive_description:
        (typeof wf.passive === 'string' ? this.passivesDb![wf.passive]?.description : undefined)
          ?? wf.passive_description,
      abilities: wf.abilities.map(a => this.hydrateAbility(a))
    }));
  }

  private hydrateAbility(ability: Ability): Ability {
    const dbEntry = this.abilityStatsDb?.[ability.unique_name];
    if (!dbEntry) return ability;

    const isNewStructure = !Array.isArray(dbEntry);
    const metadata = isNewStructure ? dbEntry : (dbEntry[0] ?? {});
    const groupsArray = isNewStructure ? dbEntry.groups : [];

    const statsData: AbilityStatsData = {
      name: String(metadata.name ?? ability.unique_name.split('/').pop() ?? 'Unknown'),
      description: String(metadata.description ?? ''),
      image_name: String(metadata.image_name ?? metadata.icon ?? ''),
      groups: Array.isArray(groupsArray) ? groupsArray : [],
    };

    return {
      ...ability,
      name: statsData.name,
      description: statsData.description,
      image_name: statsData.image_name || ability.image_name,
      stats: statsData,
    };
  }

  /**
   * Obtiene ítems filtrados por KIND (Pilar 2) de forma determinista.
   */
  async getByKind<T extends BaseItem>(kind: string): Promise<T[]> {
    const weaponKinds = ['primary', 'secondary', 'melee'];
    const companionKinds = ['pet', 'sentinel', 'companion'];
    const vehicleKinds = ['archwing', 'necramech', 'vehicle'];
    const awWeaponKinds = ['archgun', 'archmelee', 'archwing-weapon'];

    if (weaponKinds.includes(kind)) {
      const items = await this.getDataset<Weapon>('weapons');
      return items.filter(i => i.kind === kind || kind === 'weapon') as unknown as T[];
    }

    if (kind === 'warframe') return this.getDataset<Warframe>('warframes') as unknown as T[];
    if (kind === 'mod') return this.getDataset<Mod>('mods') as unknown as T[];
    if (kind === 'arcane') return this.getDataset<Arcane>('arcanes') as unknown as T[];

    if (companionKinds.includes(kind)) {
      const items = await this.getDataset<Companion>('companions');
      if (kind === 'companion') return items as unknown as T[];
      return items.filter(i => i.kind === kind) as unknown as T[];
    }

    if (awWeaponKinds.includes(kind)) {
      const items = await this.getDataset<Weapon>('archwing-weapons');
      if (kind === 'archwing-weapon') return items as unknown as T[];
      return items.filter(i => i.kind === kind) as unknown as T[];
    }

    if (vehicleKinds.includes(kind)) {
      const items = await this.getDataset<Vehicle>('vehicles');
      if (kind === 'vehicle') return items as unknown as T[];
      return items.filter(i => i.kind === kind) as unknown as T[];
    }

    return [];
  }

  /**
   * Busca un ítem específico por su identificador de ruta.
   */
  async getItemById<T extends BaseItem>(domain: string, identifier: string): Promise<T | undefined> {
    const datasetMap: Record<string, DatasetKey> = {
      warframe: 'warframes',
      weapon: 'weapons',
      mod: 'mods',
      arcane: 'arcanes',
      companion: 'companions',
      vehicle: 'vehicles',
      'archwing-weapon': 'archwing-weapons'
    };

    const key = datasetMap[domain];
    if (!key) return undefined;

    const items = await this.getDataset<T>(key);
    return items.find((i) => matchesRouteIdentifier(i, identifier));
  }

  /**
   * Obtiene todos los ítems de un DOMAIN (Pilar 1).
   */
  async getByDomain<T extends BaseItem>(domain: string): Promise<T[]> {
    if (domain === 'weapon') {
      const [w, aw] = await Promise.all([
        this.getDataset<Weapon>('weapons'),
        this.getDataset<Weapon>('archwing-weapons')
      ]);
      return [...w, ...aw] as unknown as T[];
    }
    
    if (domain === 'warframe') return this.getDataset<Warframe>('warframes') as unknown as T[];
    if (domain === 'mod') return this.getDataset<Mod>('mods') as unknown as T[];
    if (domain === 'arcane') return this.getDataset<Arcane>('arcanes') as unknown as T[];
    if (domain === 'companion') return this.getDataset<Companion>('companions') as unknown as T[];
    if (domain === 'vehicle') return this.getDataset<Vehicle>('vehicles') as unknown as T[];

    return [];
  }

  /**
   * Carga un catálogo crudo con forma `Record<key, entry>` (no `BaseItem[]`): archon-shards,
   * incarnon-evolutions, etc. Sin hidratación — los catálogos no son ítems. Cacheado por key.
   * Reemplaza los mini-fetchers ad-hoc (use-archon-shard-catalog, use-incarnon-catalog).
   */
  async getCatalog<T>(key: string): Promise<T> {
    if (this.catalogCache.has(key)) return this.catalogCache.get(key) as T;
    if (this.catalogPromises.has(key)) return this.catalogPromises.get(key) as Promise<T>;

    const promise = (async () => {
      try {
        const res = await fetch(`/data/${key}.json`);
        if (!res.ok) throw new Error(`Failed to load catalog ${key}.json`);
        const data = await res.json();
        this.catalogCache.set(key, data);
        return data;
      } catch (e) {
        console.error(`[DataRegistry] Error loading catalog ${key}:`, e);
        return {} as T;
      } finally {
        this.catalogPromises.delete(key);
      }
    })();

    this.catalogPromises.set(key, promise);
    return promise as Promise<T>;
  }
}

export const Registry = new DataRegistry();
