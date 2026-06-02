/**
 * Setup de datos para los tests del engine.
 *
 * Importar este módulo al inicio de cada test file del engine:
 *   import '../helpers/engine-data-setup'
 *
 * El código se ejecuta a nivel de módulo (antes de cualquier describe/it),
 * inicializando todos los repositorios con los datos reales de public/data/.
 *
 * Para añadir un nuevo override: agregar el import y el campo en DataLoader.init().
 */
import weaponsData  from '../../../../../public/data/weapons.json';
import modOverrides from '../../../../../public/data/mod-stats.override.json';
import incarnon     from '../../../../../public/data/incarnon-evolutions.override.json';
import weaponStats  from '../../../../../public/data/weapon-stats.override.json';
import { DataLoader } from '../../hydration/DataLoader';

DataLoader.init({
  weapons:               weaponsData as any[],
  modOverrides:          modOverrides as Record<string, any>,
  weaponAttackOverrides: weaponStats  as Record<string, any>,
  incarnon:              incarnon     as Record<string, any>,
});
