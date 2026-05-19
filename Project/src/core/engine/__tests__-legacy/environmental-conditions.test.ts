import { describe, it, expect } from "vitest";
import { MutatorBridge } from "../logic/MutatorBridge";
import { seedRealData } from "../logic/DatasetSeeder";
import { CombatCalculator } from "../logic/CombatCalculator";
import type { LoadoutState } from "../../loadout";

describe("Phase 3 Labs: Condicionales y Entorno", () => {
  seedRealData();

  it("Strun Prime - Verificación de Rampa Galvanizada (ON/OFF)", () => {
    const bridge = new MutatorBridge();
    const loadout: LoadoutState = {
      primary_weapon: {
        unique_name: "StrunPrime",
        active_config_index: 0,
        configs: [{ 
          mods: [{ unique_name: "GalvanizedHell", rank: 10 }] 
        }]
      }
    };

    // 1. Simular COLD START (Stacks Off)
    const resultOff = bridge.simulate(loadout);
    const msOff = resultOff.entities.find(e => e.id === "StrunPrime")!.attributes["multishot"].final;
    
    // Base 12.0 + 110% = 12 * 2.1 = 25.2
    expect(msOff).toBeCloseTo(25.2, 1);
    console.log(` > Strun (Cold Start): ${msOff.toFixed(1)} multishot`);

    // 2. Simular PEAK PERFORMANCE (Stacks On)
    const contextOn = { 
        flags: { "galvanized_max_stacks": true }, 
        variables: { "distance": 0 } 
    };
    
    const resultOn = bridge.simulate(loadout, contextOn);
    const msOn = resultOn.entities.find(e => e.id === "StrunPrime")!.attributes["multishot"].final;
    
    // Base 12.0 + 110% + 120% = 12 * 3.3 = 39.6
    expect(msOn).toBeCloseTo(39.6, 1);
    console.log(` > Strun (Max Stacks): ${msOn.toFixed(1)} multishot ✅`);
  });

  it("Strun Prime - Verificación de Falloff por Distancia", () => {
    seedRealData();
    const bridge = new MutatorBridge();
    const loadout: LoadoutState = {
      primary_weapon: {
          unique_name: "StrunPrime",
          active_config_index: 0,
          configs: [{ mods: [] }] // Sin mods para ver base
      }
    };

    const { entities } = bridge.simulate(loadout);
    const weapon = entities.find(e => e.id === "StrunPrime")!;

    // 1. Distancia 0m (Full Damage)
    const metrics0m = CombatCalculator.project(weapon, { active_profile_id: 'base', flags: {}, variables: { distance: 0 }, laws: {} as any });
    const dmg0m = metrics0m.burst_dps;

    // 2. Distancia 30m (Max Falloff: 50%)
    const metrics30m = CombatCalculator.project(weapon, { active_profile_id: 'base', flags: {}, variables: { distance: 30 }, laws: {} as any });
    const dmg30m = metrics30m.burst_dps;

    console.log(` > Strun DPS (0m): ${dmg0m.toFixed(0)}`);
    console.log(` > Strun DPS (30m): ${dmg30m.toFixed(0)}`);

    expect(metrics30m.falloff_multiplier).toBeCloseTo(0.5, 2);
    expect(dmg30m).toBeCloseTo(dmg0m * 0.5, 1);
    console.log(` ✅ AUDITORÍA DE BALÍSTICA PASADA`);
  });
});
