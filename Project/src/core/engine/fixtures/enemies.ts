/**
 * Catálogo de enemigos-fixture para tests de la capa de combate (hermano de `builds.ts`).
 * Los stats base salen de `@wfcd` (`warframe-items/data/json/Enemy.json`); lo que @wfcd NO trae
 * (base_level, y los health/armor type) se completa desde la wiki como dato de referencia.
 *
 * NOTA (2026-07-06): el multiplicador de daño hoy es por **FACCIÓN** (`enemy-resistances.md`),
 * no por health/armor type — esos tipos quedaron deprecados como multiplicador. Se conservan en
 * el DNA porque la armadura como *valor* sigue mitigando y algún mecanismo (armor-strip) puede
 * mirarlos, pero NO son el eje del daño-vs-tipo.
 */
import type { EnemyDNA } from '../simulate/enemies/EnemyRepository';

/**
 * Arid Butcher — target base compartido para los tests (el que el usuario usa in-game).
 * @wfcd: health 50, armor 5, shield 0, Grineer. Wiki: base_level 1. Unidad ligera casi sin
 * armadura → target health-dominante, limpio para validar el escalado.
 */
export const ARID_BUTCHER: EnemyDNA = {
  unique_name: '/Lotus/Types/Enemies/Grineer/Desert/Avatars/BladeSawmanAvatar',
  base_level: 1,
  health: 50,
  health_type: 'ClonedFlesh',   // Grineer estándar (vestigial para daño — hoy es por facción)
  armor: 5,
  armor_type: 'FerriteArmor',
  shields: 0,
  shield_type: 'None',
  faction: 'Grineer',
};
