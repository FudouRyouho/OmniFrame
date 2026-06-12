/**
 * Bootstrap de datos del engine para consumidores no-dominio (tests + CLI oráculo).
 *
 * Promovido de `__tests__/helpers/engine-data-setup.ts`: ahora es función explícita
 * `loadEngineData()` en vez de side-effect import — el consumidor decide *cuándo* cargar
 * (importante para el CLI; el test la llama una vez al tope del módulo).
 *
 * Impersona la carga de A: mete la data real de `public/data/` en los repositorios.
 *
 * Ubicación provisional (`fixtures/` mezcla bootstrap + intenciones) — ver OQ-ENGINE-9.
 */
import weaponsData  from '../../../../public/data/weapons.json';
import warframesData from '../../../../public/data/warframes.json';
import modOverrides from '../../../../public/data/mod-stats.override.json';
import incarnon     from '../../../../public/data/incarnon-evolutions.override.json';
import weaponStats  from '../../../../public/data/weapon-stats.override.json';
import arcaneOverrides from '../../../../public/data/arcane-stats.override.json';
import archonShards from '../../../../public/data/archon-shards.json';
import { DataLoader } from '../resolve/hydration/DataLoader';

/** Carga la data real del juego en los repositorios. Idempotente: carga una sola vez. */
export function loadEngineData(): void {
  if (DataLoader.isReady()) return;
  DataLoader.init({
    weapons:               weaponsData,
    warframes:             warframesData,
    modOverrides:          modOverrides,
    weaponAttackOverrides: weaponStats,
    incarnon:              incarnon,
    arcaneOverrides:       arcaneOverrides,
    archonShards:          archonShards,
  });
}
