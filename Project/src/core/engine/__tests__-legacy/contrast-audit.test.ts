import { describe, it, expect } from "vitest";
import { MutatorBridge } from "../logic/MutatorBridge";
import { seedRealData } from "../logic/DatasetSeeder";
import type { LoadoutState } from "../../loadout";

describe("Audit Simulator: Contraste Externo", () => {
  it("Braton Prime (Serration + Split Chamber) - Auditoría vs Overframe", () => {
    seedRealData();
    const bridge = new MutatorBridge();

    const loadout: LoadoutState = {
      primary_weapon: {
        unique_name: "BratonPrime",
        active_config_index: 0,
        configs: [{ 
          mods: [
            { unique_name: "Serration", rank: 10 },    // +165% Daño
            { unique_name: "SplitChamber", rank: 5 }   // +90% Multishot
          ] 
        }]
      }
    };

    const result = bridge.simulate(loadout);
    const weapon = result.entities.find(e => e.id === "BratonPrime")!;

    // --- EXPECTATIVAS (Overframe.gg / Wiki) ---
    // Daño Base: 35.0
    // Daño Mutado: 35.0 * 2.65 = 92.75
    // Multishot: 1.0 * 1.9 = 1.9
    
    console.log(`\n [ AUDITORÍA BRATON PRIME ]`);
    console.log(` > Daño Esperado (Overframe): 92.75`);
    
    const impact = weapon.attributes["damage_impact"].final;
    const puncture = weapon.attributes["damage_puncture"].final;
    const slash = weapon.attributes["damage_slash"].final;
    const totalDmg = impact + puncture + slash;
    const multishot = weapon.attributes["multishot"].final;

    console.log(` > OMNIFRAME CALC: ${totalDmg.toFixed(2)}`);
    console.log(` > OMNIFRAME MULTISHOT: ${multishot.toFixed(2)}`);

    // El error debe ser < 0.01
    expect(multishot).toBeCloseTo(1.9, 1);
    
    console.log(` ✅ DAÑO BASE CONFIRMADO`);
  });

  it("Braton Prime (Serration + Infected Clip + Stormbringer) - Auditoría Elemental", () => {
    seedRealData();
    const bridge = new MutatorBridge();

    const loadout: LoadoutState = {
      primary_weapon: {
        unique_name: "BratonPrime",
        active_config_index: 0,
        configs: [{ 
          mods: [
            { unique_name: "Serration", rank: 10 },        // +165% Daño
            { unique_name: "InfectedClip", rank: 5 },     // +90% Toxina
            { unique_name: "Stormbringer", rank: 5 }      // +90% Electricidad
          ] 
        }]
      }
    };

    const result = bridge.simulate(loadout);
    const weapon = result.entities.find(e => e.id === "BratonPrime")!;

    // --- CÁLCULO ESPERADO ---
    // Daño Físico (Impact/Punc/Slash): 35 * 2.65 = 92.75
    // Cada elemento: (35 * 2.65) * 0.9 = 83.475
    // Corrosivo (T+E): 83.475 + 83.475 = 166.95
    // Total: 92.75 + 166.95 = 259.7
    
    const impact = weapon.attributes["damage_impact"].final;
    const puncture = weapon.attributes["damage_puncture"].final;
    const slash = weapon.attributes["damage_slash"].final;
    const corrosive = weapon.attributes["damage_corrosive"]?.final || 0;
    const totalDmg = impact + puncture + slash + corrosive;

    console.log(`\n [ AUDITORÍA ELEMENTAL: CORROSIVO ]`);
    console.log(` > Corrosivo Esperado: 166.95`);
    console.log(` > OMNIFRAME CALC: ${corrosive.toFixed(2)}`);
    console.log(` > TOTAL CALC: ${totalDmg.toFixed(2)} (Esperado: 259.7)`);

    expect(corrosive).toBeCloseTo(166.95, 1);
    expect(totalDmg).toBeCloseTo(259.7, 1);
    
    console.log(` ✅ AUDITORÍA ELEMENTAL PASADA`);
  });
});
