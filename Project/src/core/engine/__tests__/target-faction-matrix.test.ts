/**
 * Matriz ③ (Faction bonus, single-dip) — CHECKPOINT 1 de la reconciliación de `resolveHit`.
 *
 * Ancla: `damage-status-model.md §Evidencia` — Charger (Infested) Heat (vulnerable ×1.5) vs Toxin
 * (neutral ×1.0), mismo coeficiente base (0.5) → el ratio Heat/Toxin aísla la matriz. Medido in-game
 * ×1.49–1.50 constante en todo nivel de buff (base/Expel/Roar/ambos). Charger real (`enemies.json`)
 * tiene armor=0 Y shields=0 → sin confound de DR ni de capa (post-U36 la matriz no distingue capa,
 * ver `enemy-resistances.md` línea 12).
 *
 * Antes de este checkpoint, `resolveHit` era 100% inerte en el eje facción: el viejo lookup per-clase
 * (`EnemyRepository.load()` rellena `health_type/armor_type/shield_type` con defaults inertes para TODO
 * enemigo) no matcheaba nunca → `typeMultiplier` siempre ×1, sin importar elemento o facción real
 * (confirmado por este mismo test antes del fix: ratio = 1.0, no 1.5).
 */
import { describe, it, expect } from 'vitest';
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { EnemyRepository } from '../simulate/enemies/EnemyRepository';
import { hostileEntity } from './hostile-entity';
import { EnemyState } from '../simulate/enemies/EnemyState';
import { CombatSimulator } from '../simulate/combat/CombatSimulator';

await loadEngineData(new NodeAdapter());
const CHARGER_ID = '/Lotus/Types/Enemies/Infested/AiWeek/Quadrupeds/QuadrupedAvatar';
const CHARGER = EnemyRepository.find(CHARGER_ID)!;

describe('Charger real (pipeline) — aísla la matriz sin confound de DR/capa', () => {
  it('Infested, armor=0, shields=0', () => {
    expect(CHARGER).toBeTruthy();
    expect(CHARGER.faction).toBe('Infested');
    expect(CHARGER.armor).toBe(0);
    expect(CHARGER.shields).toBe(0);
  });
});

describe('resolveHit — matriz ③ (Heat vulnerable ×1.5 vs Toxin neutral ×1.0 contra Infested)', () => {
  it('ratio Heat/Toxin = 1.5 exacto (damage-status-model.md: medido ×1.49–1.50 in-game)', () => {
    const state = new EnemyState(hostileEntity(CHARGER_ID, CHARGER.base_level));

    const heatHit = CombatSimulator.resolveHit({ WEAPON_ADD_HEAT_DAMAGE: 100 }, state);
    const toxinHit = CombatSimulator.resolveHit({ WEAPON_ADD_TOXIN_DAMAGE: 100 }, state);

    expect(heatHit.health_damage / toxinHit.health_damage).toBeCloseTo(1.5, 5);
  });
});
