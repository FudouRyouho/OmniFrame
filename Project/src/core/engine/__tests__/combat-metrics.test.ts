/**
 * Contrato de salida de C — `CombatMetrics` (materializa `DC-OQ-ENGINE-8`).
 *
 * Verifica las DECISIONES del contrato, no números in-game (eso lo cubren los ingame-tests):
 *   - Fork (a): `ttk` NUNCA es 0 — un one-shot mata en ≥ 1 ciclo de disparo (piso `timeStep`).
 *   - Fork (b): `effective_dps` coherente — `total/ttk` cuando mata (hasta matar), `total/dur` cuando no.
 *   - Estructura: el conjunto se parte por dependencia-de-target (`target_agnostic` / `vs_target`).
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { computeCombatMetrics } from '../output/combat-metrics';
import { hostileEntity } from './hostile-entity';

/** Arid Butcher — el objetivo de referencia de esta suite (por display name, lo resuelve el catálogo). */
const ARID = 'Arid Butcher';
import { BASELINE_GAME_LAWS } from '../contracts';
import { lanka } from '../fixtures/builds';
import type { SimulationEntity, SimulationContext } from '../contracts';

await loadEngineData(new NodeAdapter());

const ctx: SimulationContext = {
  active_profile_id: 'base',
  flags: {},
  variables: {},
  laws: { ...BASELINE_GAME_LAWS },
};

const weapon = () =>
  consume(lanka('charged_shot'), { flags: {} }).snapshot().find((e) => e.domain === 'weapon') as SimulationEntity;

describe('CombatMetrics — contrato de salida de C (DC-OQ-ENGINE-8)', () => {
  it('estructura: el conjunto se parte en target_agnostic + vs_target', () => {
    const m = computeCombatMetrics(weapon(), hostileEntity(ARID, 1), ctx, 6);
    expect(m.target_agnostic.burst_dps).toBeGreaterThan(0);
    expect(m.target_agnostic.sustained_dps).toBeGreaterThan(0);
    expect(m.target_agnostic).toHaveProperty('status_map');
    expect(m.vs_target).toHaveProperty('ttk');
    expect(m.vs_target).toHaveProperty('effective_dps');
  });

  it('fork (a): un kill nunca reporta ttk=0 (piso = 1 ciclo de disparo)', () => {
    // Lanka charged vs Arid Butcher lvl 1 → muere en el primer disparo (antes daba ttk=0.00).
    const m = computeCombatMetrics(weapon(), hostileEntity(ARID, 1), ctx, 6);
    expect(m.vs_target.ttk).not.toBeNull();
    expect(m.vs_target.ttk!).toBeGreaterThan(0); // la firma del fix
    expect(m.vs_target.shots_to_kill!).toBeGreaterThanOrEqual(1);
    // effective_dps siempre finito — sin división por cero aunque el kill sea instantáneo
    expect(Number.isFinite(m.vs_target.effective_dps)).toBe(true);
  });

  it('fork (b) — mata: effective_dps = total_damage / ttk (DPS hasta matar)', () => {
    const m = computeCombatMetrics(weapon(), hostileEntity(ARID, 1), ctx, 6);
    expect(m.vs_target.ttk).not.toBeNull();
    expect(m.vs_target.effective_dps).toBeCloseTo(m.vs_target.total_damage / m.vs_target.ttk!, 3);
  });

  it('fork (b) — no mata: ttk=null y effective_dps = total_damage / dur (sostenido)', () => {
    // Arid Butcher a nivel absurdo → no muere en la ventana.
    const dur = 3;
    const m = computeCombatMetrics(weapon(), hostileEntity(ARID, 9999), ctx, dur);
    expect(m.vs_target.ttk).toBeNull();
    expect(m.vs_target.shots_to_kill).toBeNull();
    expect(m.vs_target.effective_dps).toBeCloseTo(m.vs_target.total_damage / dur, 3);
  });
});
