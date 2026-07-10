/**
 * @domain Simulation-v2 / Logic / Combat
 * @status en-desarrollo
 *
 * Primer forcing-case del eje sujeto (T5, `.working/c1-simulation-doctrine.md` §4-T5 + §5):
 * el objeto de contexto "congelado" (`snapshot`, nombre de trabajo) que un pull-read del
 * target lee para derivar flags de `condition`. Deliberadamente MÍNIMO — dos campos, lo que
 * el caso `while_enemy_below_half_health` fuerza — no una abstracción de snapshot general
 * (armor/shields/status se agregan cuando OTRO caso los fuerce, no antes).
 *
 * Distinto de `EnemyState` (maquinaria C2: stacks, dot_pools, timeline). Este es C1-declarado
 * (arch-decisions.md §8.1, escalón 2): `health_pct` es un input que el consumidor DECLARA
 * ("asumo que el enemigo está a X% de su salud máxima cuando este hit conecta"), no un valor
 * que emerge de una timeline. Sin RNG, sin frames.
 */
import type { ScaledEnemy } from './EnemyRepository';

export interface EnemySnapshot {
  max_health: number;
  current_health: number;
}

/**
 * Congela el estado de salud de un enemigo YA escalado (`EnemyRepository.scale`) contra un
 * `health_pct` declarado (0-1). Write-once: el llamador decide el momento del golpe, esta
 * función no muta nada ni conoce tiempo.
 */
export function snapshotEnemy(scaled: ScaledEnemy, healthPct: number): EnemySnapshot {
  return {
    max_health: scaled.current_health,
    current_health: scaled.current_health * healthPct,
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
