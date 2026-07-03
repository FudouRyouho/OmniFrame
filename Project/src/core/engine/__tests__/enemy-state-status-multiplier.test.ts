/**
 * EnemyState.getDamageMultiplier — Fase 3, campaña de saneamiento.
 *
 * Cobertura nueva: la función estaba rota (comparaba un token D-6 contra
 * strings legacy que nunca matcheaban) y C2 no tenía ningún test que lo
 * cubriera — ver current-state.md. Verifica la fórmula documentada en
 * references/wiki/mechanics/status-effects.md §Infection(Viral)/Disruption(Magnetic):
 * Viral multiplica daño a salud, Magnetic multiplica daño a shields, por capa
 * golpeada — no por el tipo de daño de la instancia actual.
 */
import { describe, it, expect } from 'vitest';
import { EnemyState } from '../simulate/enemies/EnemyState';
import type { ScaledEnemy, EnemyDNA } from '../simulate/enemies/EnemyRepository';
import { CombatSimulator } from '../simulate/combat/CombatSimulator';
import { BASELINE_GAME_LAWS } from '../contracts';

const dna: EnemyDNA = {
  unique_name: 'test-enemy',
  base_level: 1,
  health: 500,
  health_type: 'Flesh',
  armor: 0,
  armor_type: 'None',
  shields: 500,
  shield_type: 'Shields',
  faction: 'Grineer',
};

const scaled: ScaledEnemy = {
  dna,
  current_level: 1,
  current_health: dna.health,
  current_armor: dna.armor,
  current_shields: dna.shields,
};

describe('EnemyState.getDamageMultiplier — fórmula por capa (Viral=salud, Magnetic=shields)', () => {
  it('sin stacks: multiplicador neutro en ambas capas', () => {
    const state = new EnemyState(scaled, BASELINE_GAME_LAWS);
    expect(state.getDamageMultiplier(false)).toBe(1.0); // salud
    expect(state.getDamageMultiplier(true)).toBe(1.0);  // shields
  });

  it('1 stack de Viral: ×2.0 en salud, shields sin cambio', () => {
    const state = new EnemyState(scaled, BASELINE_GAME_LAWS);
    state.stacks.damage_viral = 1;
    expect(state.getDamageMultiplier(false)).toBeCloseTo(2.0, 5);
    expect(state.getDamageMultiplier(true)).toBe(1.0);
  });

  it('10 stacks de Magnetic: ×4.25 en shields (cap documentado), salud sin cambio', () => {
    const state = new EnemyState(scaled, BASELINE_GAME_LAWS);
    state.stacks.damage_magnetic = 10;
    expect(state.getDamageMultiplier(true)).toBeCloseTo(4.25, 5);
    expect(state.getDamageMultiplier(false)).toBe(1.0);
  });
});

describe('CombatSimulator.resolveHit — el multiplicador de status llega a la resolución real', () => {
  it('daño a salud (Toxin, bypassa shields) se multiplica ×2.0 con 1 stack de Viral', () => {
    const damageMap = { WEAPON_ADD_TOXIN_DAMAGE: 100 };

    const baseline = new EnemyState(scaled, BASELINE_GAME_LAWS);
    const baseHit = CombatSimulator.resolveHit(damageMap, baseline);

    const withViral = new EnemyState(scaled, BASELINE_GAME_LAWS);
    withViral.stacks.damage_viral = 1;
    const viralHit = CombatSimulator.resolveHit(damageMap, withViral);

    expect(viralHit.health_damage).toBeCloseTo(baseHit.health_damage * 2, 5);
  });
});
