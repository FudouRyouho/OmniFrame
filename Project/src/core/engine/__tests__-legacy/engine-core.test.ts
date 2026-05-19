/**
 * @domain Simulation-v2 / Tests / Core
 * @status en desarrollo
 */

import { describe, it, expect } from "vitest";
import { SimulationEngine } from "../logic/SimulationEngine";
import { 
  SYNTHETIC_WEAPON_DNA, 
  SYNTHETIC_WARFRAME_DNA 
} from "./fixtures/synthetic-dna";
import { ATTR } from "../contracts/attributes";
import type { SimulationEntity, AttributeNode } from "../contracts";

describe("SimulationEngine - Core Formula v3", () => {
  
  const createEntity = (dna: any, persistence: 'PE' | 'TE'): SimulationEntity => {
    const attributes: Record<string, AttributeNode> = {};
    const base_attributes = dna.profiles.base;
    Object.entries(base_attributes).forEach(([id, value]) => {
      attributes[id] = {
        base: value as number,
        base_flat: 0,
        base_add_pct: 0,
        mods_add_pct: 0,
        total_flat: 0,
        multiplicative: 1.0,
        final: value as number
      };
    });

    return {
      id: dna.entity_id,
      unique_name: dna.entity_id,
      domain: dna.domain,
      kind: dna.kind,
      family: dna.family,
      persistence,
      tags: dna.tags || [],
      attributes,
      behaviors: dna.behaviors
    };
  };

  it("should calculate base weapon damage correctly", () => {
    const engine = new SimulationEngine();
    const weapon = createEntity(SYNTHETIC_WEAPON_DNA, 'PE');
    
    engine.addEntity(weapon);
    engine.resolve({ active_profile_id: 'base', flags: {}, variables: {}, laws: {} as any });

    const stats = engine.getEntityStats(weapon.id);
    expect(stats[ATTR.damage_heat]).toBe(35);
  });

  it("should apply additive mods (Serration +165%) correctly", () => {
    const engine = new SimulationEngine();
    const weapon = createEntity(SYNTHETIC_WEAPON_DNA, 'PE');
    
    engine.addEntity(weapon);
    
    // Simular inyección de Serration
    engine.addModifier({
      id: "mod_serration_dmg",
      source_id: "mod_serration",
      target_entity: weapon.id,
      target_attribute: ATTR.weapon_damage, 
      operation: 'ADD',
      value: 165
    });

    // En el motor de Warframe, WEAPON_DAMAGE afecta a todos los tipos de daño base
    engine.addModifier({
      id: "mod_serration_heat",
      source_id: "mod_serration",
      target_entity: weapon.id,
      target_attribute: ATTR.damage_heat,
      operation: 'ADD',
      value: 165
    });

    engine.resolve({ active_profile_id: 'base', flags: {}, variables: {}, laws: {} as any });

    const stats = engine.getEntityStats(weapon.id);
    // Formula: 35 * (1 + 165/100) = 35 * 2.65 = 92.75
    expect(stats[ATTR.damage_heat]).toBe(92.75);
  });

  it("should handle BaseFlat modifiers (Arcanes) correctly", () => {
    const engine = new SimulationEngine();
    const rhino = createEntity(SYNTHETIC_WARFRAME_DNA, 'PE');
    
    engine.addEntity(rhino);

    // Aplicar Arcano de Armadura (+900 Armor Flat)
    engine.addModifier({
      id: "arcane_guardian_bonus",
      source_id: "arcane_guardian",
      target_entity: rhino.id,
      target_attribute: ATTR.armor,
      operation: 'BASE_FLAT',
      value: 900
    });

    // Aplicar Steel Fiber (+110% Armor Additive)
    engine.addModifier({
      id: "mod_steel_fiber_bonus",
      source_id: "mod_steel_fiber",
      target_entity: rhino.id,
      target_attribute: ATTR.armor,
      operation: 'ADD',
      value: 110
    });

    engine.resolve({ active_profile_id: 'base', flags: {}, variables: {}, laws: {} as any });

    const stats = engine.getEntityStats(rhino.id);
    /**
     * Formula Maestra v3:
     * ((Base + BaseFlat) * (1 + BaseAddPct) * (1 + ModsAddPct) + TotalFlat) * Multiplicative
     * ((225 + 900) * (1 + 0) * (1 + 1.10) + 0) * 1.0
     * 1125 * 2.1 = 2362.5
     */
    expect(stats[ATTR.armor]).toBe(2362.5);
  });
});
