/**
 * DR de armadura en `resolveHit` — CHECKPOINT 2 de la reconciliación de `resolveHit`.
 *
 * Ancla: Arid Butcher @215, armor=200 → DR = 24.49% (`√3a/100`), ya validada contra el calculador del
 * wiki en P1 (`enemy-scaling.test.ts`). `resolveHit` hoy usa la fórmula vieja `netArmor/(netArmor+300)`
 * = 200/500 = 40% — objetivamente distinta de la que el proyecto ya adoptó.
 *
 * Toxin bypasa shields (`isBypassingShields`) → aísla la capa salud+armor sin importar el shield real
 * de Arid Butcher. Matriz ③ Toxin-vs-Grineer es neutral (FACTION_BONUS sin entrada) → typeMultiplier=1,
 * así el test mide sólo la DR.
 *
 * Nota — NO cierra `OQ-ENGINE-15` (conflicto de 3 fórmulas de DR en la wiki): este checkpoint sólo
 * fuerza que `resolveHit` sea consistente con la fórmula que el proyecto ya eligió en P1.
 */
import { describe, it, expect } from 'vitest';
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { hostileEntity } from './hostile-entity';
import { EnemyState } from '../simulate/enemies/EnemyState';
import { CombatSimulator } from '../simulate/combat/CombatSimulator';
import { BASELINE_GAME_LAWS } from '../contracts';

await loadEngineData(new NodeAdapter());
const ARID_BUTCHER = '/Lotus/Types/Enemies/Grineer/Desert/Avatars/BladeSawmanAvatar';

describe('resolveHit — DR de armadura (Arid Butcher @215)', () => {
  it('DR = 24.49% (√3a/100, P1) — 100 dmg Toxin → 75.51 de daño a salud (NO 60, que sería la vieja fórmula 40%)', () => {
    const state = new EnemyState(hostileEntity(ARID_BUTCHER, 215), BASELINE_GAME_LAWS); // armor=200 (validado en P1)

    const hit = CombatSimulator.resolveHit({ WEAPON_ADD_TOXIN_DAMAGE: 100 }, state);

    expect(hit.health_damage).toBeCloseTo(75.505, 1);
  });
});
