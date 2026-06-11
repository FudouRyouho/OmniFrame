/**
 * @domain Engine / Hydration
 * @status activo
 *
 * Punto de inicialización único para todos los datos del engine.
 * Reemplaza los beforeAll dispersos en los tests y será el punto de bootstrap en runtime.
 *
 * Uso en tests/CLI: llamar `loadEngineData()` de `@core/engine/fixtures/engine-data` (envuelve init()).
 * Uso en runtime: llamar a DataLoader.init() en el bootstrap de la aplicación.
 */
import { ItemRepository } from './ItemRepository';
import { IncarnonRepository } from './IncarnonRepository';

export interface DataLoaderInput {
  weapons:               any[];
  modOverrides:          Record<string, any>;
  weaponAttackOverrides: Record<string, any>;
  incarnon:              Record<string, any>;
}

export class DataLoader {
  private static _initialized = false;

  static init(input: DataLoaderInput): void {
    ItemRepository.load(input.weapons);
    ItemRepository.loadOverrides(input.modOverrides);
    ItemRepository.loadWeaponAttackOverrides(input.weaponAttackOverrides);
    IncarnonRepository.load(input.incarnon);
    DataLoader._initialized = true;
  }

  static isReady(): boolean {
    return DataLoader._initialized;
  }
}
