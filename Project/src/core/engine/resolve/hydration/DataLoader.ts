/**
 * @domain Engine / Hydration
 * @status activo
 *
 * Punto de inicialización único para todos los datos del engine.
 * Reemplaza los beforeAll dispersos en los tests y será el punto de bootstrap en runtime.
 *
 * Uso en tests/CLI: llamar `loadEngineData()` de `@core/engine/bootstrap/engine-data` (envuelve init()).
 * Uso en runtime: llamar a DataLoader.init() en el bootstrap de la aplicación.
 */
import type { ModOverrideEntry } from '../../contracts/mod-overrides';
import { ItemRepository } from './ItemRepository';
import { ModRepository } from './ModRepository';
import { IncarnonRepository } from './IncarnonRepository';
import { ArcaneRepository } from './ArcaneRepository';
import { AbilityRepository } from './AbilityRepository';
import { ShardRepository } from './ShardRepository';
import { EnemyRepository, type RawEnemyEntry, type EnemyOverride } from '../../simulate/enemies/EnemyRepository';

export interface DataLoaderInput {
  weapons:               any[];
  warframes:             any[];
  modOverrides:          Record<string, ModOverrideEntry>;
  weaponAttackOverrides: Record<string, any>;
  incarnon:              Record<string, any>;
  arcaneOverrides:       Record<string, any>;
  abilityOverrides:      Record<string, any>;
  archonShards:          Record<string, any>;
  companions:            any[];
  enemies:               RawEnemyEntry[];
  enemyOverrides:        EnemyOverride;
}

export class DataLoader {
  private static _initialized = false;

  static init(input: DataLoaderInput): void {
    // Warframes y weapons comparten ItemRepository (ambos cuatro-pilares, indexados por unique_name)
    // pero en Maps separados desde Fase 2 Slice C (segmentación storage+normalize).
    ItemRepository.loadWeapons(input.weapons);
    ItemRepository.loadWarframes(input.warframes);
    // Un compañero no es un ítem del loadout de armas, pero SÍ es un participante con stats
    // propios; entra al mismo repositorio porque comparte los cuatro pilares y el molde de avatar.
    ItemRepository.loadCompanions(input.companions);
    ItemRepository.loadWeaponAttackOverrides(input.weaponAttackOverrides);
    ModRepository.loadOverrides(input.modOverrides);
    IncarnonRepository.load(input.incarnon);
    ArcaneRepository.load(input.arcaneOverrides);
    AbilityRepository.load(input.abilityOverrides);
    ShardRepository.load(input.archonShards);
    EnemyRepository.load(input.enemies, input.enemyOverrides);
    // Doble carga a propósito: EnemyRepository lo escala para C2, ItemRepository lo hidrata como
    // participante de C1. Son dos usos del mismo raw, no una duplicación de la fuente.
    ItemRepository.loadEnemies(input.enemies);
    DataLoader._initialized = true;
  }

  static isReady(): boolean {
    return DataLoader._initialized;
  }
}
