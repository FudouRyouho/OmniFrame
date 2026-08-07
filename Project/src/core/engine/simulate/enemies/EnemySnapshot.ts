/**
 * @domain Simulation-v2 / Logic / Combat
 * @status en-desarrollo
 *
 * Primer forcing-case del **eje sujeto** —qué entidad lee un `condition`, el portador o el objetivo—:
 * el objeto de contexto "congelado" (`snapshot`, nombre de trabajo) que un pull-read del
 * target lee para derivar flags de `condition`. Deliberadamente MÍNIMO — dos campos, lo que
 * el caso `while_enemy_below_half_health` fuerza — no una abstracción de snapshot general
 * (armor/shields/status se agregan cuando OTRO caso los fuerce, no antes).
 *
 * Distinto de `EnemyState` (maquinaria C2: `effectStates` Map<StatusEffect,S> — stacks/pools por
 * efecto + avance temporal). Este es C1-declarado
 * (arch-decisions.md §8.1, escalón 2): `health_pct` es un input que el consumidor DECLARA
 * ("asumo que el enemigo está a X% de su salud máxima cuando este hit conecta"), no un valor
 * que emerge de una timeline. Sin RNG, sin frames.
 */
import type { SimulationEntity } from '../../contracts';
import { hostileVitals } from './EnemyState';

export interface EnemySnapshot {
  max_health: number;
  current_health: number;
}

/**
 * Congela el estado de salud del participante tal como el escenario lo consolidó, contra un
 * `health_pct` declarado (0-1). Write-once: el llamador decide el momento del golpe, esta función
 * no muta nada ni conoce tiempo.
 *
 * El `max_health` sale del nodo resuelto y no de un objeto paralelo: lo que el escenario le hizo al
 * enemigo (un debuff de vida máxima, si algún día existe) entra acá por el mismo camino que todo.
 */
export function snapshotEnemy(entity: SimulationEntity, healthPct: number): EnemySnapshot {
  const maxHealth = hostileVitals(entity).health;
  return {
    max_health: maxHealth,
    current_health: maxHealth * healthPct,
  };
}

/**
 * Deriva los flags de `condition` que un snapshot activa. Un solo token hoy
 * (`while_enemy_below_half_health` — único `while_enemy_*` con vehículo real cableado,
 * ver `docs/semantic/conditions.md` G3). Se amplía token por token, no por anticipación.
 */
export function deriveEnemyFlags(snapshot: EnemySnapshot): Record<string, boolean> {
  return {
    while_enemy_below_half_health: snapshot.current_health < snapshot.max_health * 0.5,
  };
}
