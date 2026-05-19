import { describe, it, expect } from "vitest";
import { MutatorBridge } from "../logic/MutatorBridge";
import { seedRealData } from "../logic/DatasetSeeder";
import { CombatCalculator } from "../logic/CombatCalculator";
import type { LoadoutState } from "../../loadout";

describe("Phase 5 Labs: Arcanos de Rampa Elemental", () => {
  seedRealData();

  it("Primary Frostbite: Rampa de Crítico y Multidisparo (Escopeta)", () => {
    const bridge = new MutatorBridge();
    const loadout: LoadoutState = {
      "slot:primary_weapon": "StrunPrime",
      "slot:primary_weapon:active_config": 0,
      "slot:primary_weapon:config:0:mod:0": { unique_name: "PrimaryFrostbite", rank: 5 }
    };

    // 1. OFF
    const resultOff = bridge.simulate(loadout);
    const weaponOff = resultOff.entities.find(e => e.id === "StrunPrime")!;
    const metricsOff = CombatCalculator.project(weaponOff, { active_profile_id: 'base', flags: {}, variables: {}, laws: {} as any });
    expect(metricsOff.average_crit_multiplier).toBeCloseTo(1.29, 2); // Base 24% crit

    // 2. MAX STACKS (Interruptor ON)
    const contextOn = { flags: { "frostbite_max": true } };
    const resultOn = bridge.simulate(loadout, contextOn);
    const weaponOn = resultOn.entities.find(e => e.id === "StrunPrime")!;

    // CD Base 2.2 * (1 + 1.20) = 4.84
    expect(weaponOn.attributes["critical_multiplier"].final).toBeCloseTo(4.84, 2);
    // Multishot Base 12 * (1 + 1.20) = 26.4
    expect(weaponOn.attributes["multishot"].final).toBeCloseTo(26.4, 1);
    
    console.log(` > Strun + Frostbite (MAX): CD ${weaponOn.attributes["critical_multiplier"].final.toFixed(1)}x, MS ${weaponOn.attributes["multishot"].final.toFixed(1)}`);
    console.log(` ✅ PRIMARY FROSTBITE CERTIFICADO`);
  });

  it("Cascadia Flare: Salto masivo de daño base (Secundaria)", () => {
    const bridge = new MutatorBridge();
    const loadout: LoadoutState = {
      "slot:secondary_weapon": "GenericSecondary",
      "slot:secondary_weapon:active_config": 0,
      "slot:secondary_weapon:config:0:mod:0": { unique_name: "CascadiaFlare", rank: 5 }
    };

    const contextOn = { flags: { "cascadia_flare_max": true } };
    const resultOn = bridge.simulate(loadout, contextOn);
    const weaponOn = resultOn.entities.find(e => e.id === "GenericSecondary")!;
    
    // WEAPON_DAMAGE Base 100 + 480 = 580
    expect(weaponOn.attributes["WEAPON_DAMAGE"].final).toBe(580);
    console.log(` > Secondary + Flare (MAX): Damage x${(weaponOn.attributes["WEAPON_DAMAGE"].final / 100).toFixed(1)} ✅`);
  });

  it("Conjunction Voltage: Rampa de Recarga Ultra-rápida", () => {
    const bridge = new MutatorBridge();
    const loadout: LoadoutState = {
      "slot:secondary_weapon": "GenericSecondary",
      "slot:secondary_weapon:active_config": 0,
      "slot:secondary_weapon:config:0:mod:0": { unique_name: "ConjunctionVoltage", rank: 5 }
    };

    const contextOn = { flags: { "voltage_max": true } };
    const { entities } = bridge.simulate(loadout, contextOn);
    const weapon = entities.find(e => e.id === "GenericSecondary")!;
    const metrics = CombatCalculator.project(weapon, { active_profile_id: 'base', flags: { "voltage_max": true }, variables: {}, laws: {} as any });

    // Reload Speed: 100 + 600 = 700% (Factor 7)
    // Reload Time: 1.5 / 7 = 0.214s
    // Nota: sustained dps se verá afectado por esta recarga casi instantánea
    console.log(` > Secondary + Voltage (MAX): Reload Speed ${weapon.attributes["reload_speed"].final.toFixed(0)}%`);
    
    // Verificamos que el Sustained DPS es mucho mayor (ahora ronda el ~80% de eficiencia)
    expect(metrics.sustained_dps).toBeGreaterThan(metrics.burst_dps * 0.75);
    console.log(` ✅ CONJUNCTION VOLTAGE CERTIFICADO: RECARGA INSTANTÁNEA`);
  });
});
