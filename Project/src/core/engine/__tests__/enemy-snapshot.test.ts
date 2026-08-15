/**
 * EnemySnapshot — forcing-case del **eje sujeto** (qué entidad lee un `condition`; doctrina en
 * `docs/domains/engine/design/arch-decisions.md` §8). Primer pull-read real: un `condition` que lee el
 * estado del ENEMIGO (no del jugador/loadout) contra un flag derivado de un snapshot congelado.
 *
 * Vehículo: Sicarus Prime, perk incarnon "Feigned Retreat" (`while_enemy_below_half_health`,
 * +40% Damage — additive a mods, como Hornet Strike). `upgrade_type: WEAPON_ADD_DAMAGE` poblado
 * 2026-07-09 (antes ausente → el perk se omitía en silencio, `data:class:cat/e`).
 *
 * El flag NO se declara a mano (a diferencia de CO estático) — se DERIVA del participante que el
 * ESCENARIO resolvió (pipeline "0" → C1) + un `health_pct` C1-declarado por el test
 * (T3: "asumo que el enemigo está a X% de salud cuando este hit conecta"). Cero cambios a
 * `SimulationContext`/`SimulationEngine`/`MutatorBridge` — el consumidor arma `context.flags`
 * con `deriveEnemyFlags()`, mismo patrón que ya usan los tests de CO estático.
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { sicarus, SICARUS_PRIME } from '../fixtures/builds';
import { snapshotEnemy, deriveEnemyFlags } from '../simulate/enemies/EnemySnapshot';
import { hostileEntity } from './hostile-entity';
import { vitalsOf } from '../simulate/EntityState';

await loadEngineData(new NodeAdapter());

const ARID_BUTCHER = '/Lotus/Types/Enemies/Grineer/Desert/Avatars/BladeSawmanAvatar';
const arid50 = hostileEntity(ARID_BUTCHER, 50); // health ≈ 2922.6 (validado en enemy-scaling.test.ts)

const probe = (healthPct: number) => {
  const snapshot = snapshotEnemy(arid50, healthPct);
  const flags = deriveEnemyFlags(snapshot);
  return { snapshot, flags, w: consume(sicarus({ perks: { 2: 'feigned_retreat' } }), { flags }).weapon(SICARUS_PRIME) };
};

describe('EnemySnapshot — deriva el flag desde el estado real del enemigo (no declarado a mano)', () => {
  it('health_pct=0.3: current_health < mitad del max escalado → flag true', () => {
    const { snapshot, flags } = probe(0.3);
    expect(snapshot.max_health).toBeCloseTo(2922.6, 0);
    expect(snapshot.current_health).toBeCloseTo(876.8, 0);
    expect(flags.while_enemy_below_half_health).toBe(true);
  });

  it('health_pct=0.8: current_health > mitad del max escalado → flag false', () => {
    const { flags } = probe(0.8);
    expect(flags.while_enemy_below_half_health).toBe(false);
  });

  it('health_pct=0.5 exacto: NO es "below" (comparación estricta <)', () => {
    const { flags } = probe(0.5);
    expect(flags.while_enemy_below_half_health).toBe(false);
  });
});

describe('Sicarus / Feigned Retreat — el perk responde al flag derivado, no a un valor a mano', () => {
  it('bajo la mitad: +40 en mods_add_pct (el bonus condicional aplica)', () => {
    expect(probe(0.3).w.node('WEAPON_ADD_DAMAGE').mods_add_pct).toBeCloseTo(40, 0);
  });

  it('sobre la mitad: el bonus condicional NO aplica (mods_add_pct = 0)', () => {
    expect(probe(0.8).w.node('WEAPON_ADD_DAMAGE').mods_add_pct).toBeCloseTo(0, 0);
  });

  it('Base Damage +40/+50 (prime/base, sin condición) aplica siempre, independiente del flag', () => {
    expect(probe(0.3).w.node('WEAPON_ADD_DAMAGE').base_flat).toBeCloseTo(40, 0);
    expect(probe(0.8).w.node('WEAPON_ADD_DAMAGE').base_flat).toBeCloseTo(40, 0);
  });

  it('el mismo enemigo a otro nivel cambia el umbral: @215 (max≈25612) con current fijo en el valor absoluto de @50 → ahora SÍ está bajo la mitad', () => {
    const snapshot = {
      max_health: vitalsOf(hostileEntity(ARID_BUTCHER, 215)).health,
      current_health: vitalsOf(arid50).health * 0.8,
    };
    expect(deriveEnemyFlags(snapshot).while_enemy_below_half_health).toBe(true);
  });
});
