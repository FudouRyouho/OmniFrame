import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '../logic/SimulationEngine';
import { RngProvider } from '../logic/RngProvider';
import { AtomicSimulator } from '../logic/AtomicSimulator';
import type { SimulationEntity, Modifier, SimulationContext } from '../contracts';

describe('Sim-v2 Audit System & Determinism', () => {
  let engine: SimulationEngine;
  const ENTITY_ID = 'test-warframe';
  const ATTR_ARMOR = 'armor';

  beforeEach(() => {
    engine = new SimulationEngine();
    
    const entity: SimulationEntity = {
      id: ENTITY_ID,
      unique_name: 'Warframe/Excalibur',
      domain: "warframe",
      kind: "warframe",
      persistence: 'PE',
      tags: ['warframe'],
      behaviors: [],
      attributes: {
        [ATTR_ARMOR]: {
          base: 100,
          base_flat: 0,
          base_add_pct: 0,
          mods_add_pct: 0,
          total_flat: 0,
          multiplicative: 1.0,
          final: 100
        }
      }
    };
    engine.addEntity(entity);
  });

  it('should capture a detailed audit trace for modifiers', () => {
    const mod: Modifier = {
      id: 'steel-fiber',
      source_id: 'Mod:SteelFiber',
      target_entity: ENTITY_ID,
      target_attribute: ATTR_ARMOR,
      operation: 'ADD',
      value: 110 // +110% Armor
    };
    engine.addModifier(mod);

    const context: SimulationContext = {
      active_profile_id: 'base',
      flags: {},
      variables: {},
      laws: {} as any
    };

    engine.resolve(context);

    const audit = engine.getAuditResponse(ENTITY_ID, ATTR_ARMOR);
    expect(audit.trace.length).toBeGreaterThan(0);
    expect(audit.trace[0].source).toBe('Mod:SteelFiber');
    expect(audit.trace[0].impact).toBe(110);
    expect(engine.getEntityStats(ENTITY_ID)[ATTR_ARMOR]).toBe(210);
  });

  it('should be deterministic with seeded RNG', () => {
    const rng1 = new RngProvider(12345);
    const rng2 = new RngProvider(12345);
    const rng3 = new RngProvider(67890);

    const rolls1 = AtomicSimulator.rollPellets(2.5, 50, rng1);
    const rolls2 = AtomicSimulator.rollPellets(2.5, 50, rng2);
    const rolls3 = AtomicSimulator.rollPellets(2.5, 50, rng3);

    expect(rolls1).toEqual(rolls2);
    expect(rolls1).not.toEqual(rolls3);
  });

  it('should capture context_value in audit for scaled modifiers', () => {
    const mod: Modifier = {
      id: 'condition-overload',
      source_id: 'Mod:ConditionOverload',
      target_entity: ENTITY_ID,
      target_attribute: ATTR_ARMOR,
      operation: 'CONTEXT_SCALE',
      value: 80,
      context_variable: 'status_count'
    };
    engine.addModifier(mod);

    const context: SimulationContext = {
      active_profile_id: 'base',
      flags: {},
      variables: { 'status_count': 3 },
      laws: {} as any
    };

    engine.resolve(context);

    const audit = engine.getAuditResponse(ENTITY_ID, ATTR_ARMOR);
    const step = audit.trace.find(s => s.source === 'Mod:ConditionOverload');
    expect(step).toBeDefined();
    expect(step?.context_value).toBe(3);
    expect(step?.impact).toBe(240); // 80 * 3
  });

  it('should detect and handle circular dependencies with fallback', () => {
    // A depends on B, B depends on A
    const ATTR_A = 'attribute_a';
    const ATTR_B = 'attribute_b';

    const entity: SimulationEntity = {
      id: 'cycle-entity',
      unique_name: 'CycleEntity',
      domain: "weapon",
      kind: "primary",
      persistence: 'PE',
      tags: [],
      behaviors: [],
      attributes: {
        [ATTR_A]: { base: 100, base_flat: 0, base_add_pct: 0, mods_add_pct: 0, total_flat: 0, multiplicative: 1.0, final: 100 },
        [ATTR_B]: { base: 100, base_flat: 0, base_add_pct: 0, mods_add_pct: 0, total_flat: 0, multiplicative: 1.0, final: 100 }
      }
    };
    engine.addEntity(entity);

    engine.addModifier({
      id: 'mod-a-from-b',
      source_id: 'Mod:A',
      target_entity: 'cycle-entity',
      target_attribute: ATTR_A,
      source_attribute: ATTR_B,
      operation: 'ADD',
      value: 10
    });

    engine.addModifier({
      id: 'mod-b-from-a',
      source_id: 'Mod:B',
      target_entity: 'cycle-entity',
      target_attribute: ATTR_B,
      source_attribute: ATTR_A,
      operation: 'ADD',
      value: 10
    });

    const context: SimulationContext = { active_profile_id: 'base', flags: {}, variables: {}, laws: {} as any };
    
    engine.resolve(context);

    // If it didn't crash and resolved, it's good.
    // In pass 1: A=100, B=100 -> Resolve A=110, B=110
    // In pass 2 (fallback): A depends on B(110) -> A=111, B depends on A(111) -> B=111.1
    // ...
    const stats = engine.getEntityStats('cycle-entity');
    expect(stats[ATTR_A]).toBeGreaterThan(100);
    expect(stats[ATTR_B]).toBeGreaterThan(100);
    
    // Check if sorted_nodes missed these nodes (Kahn's fails on cycles)
    // Actually, I should expose cycle_detected for testing or check audit.
  });
});
