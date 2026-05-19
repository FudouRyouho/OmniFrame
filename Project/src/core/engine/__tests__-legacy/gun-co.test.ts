import { describe, it, expect } from "vitest";
import { MutatorBridge } from "../logic/MutatorBridge";
import { seedRealData } from "../logic/DatasetSeeder";
import type { LoadoutState } from "../../loadout";

describe("Phase 6 Labs: Sinceridad GunCO (Galvanized Aptitude/Savvy)", () => {
  seedRealData();

  it("Braton Prime: Escalado Aditivo (Aptitude + Serration)", () => {
    const bridge = new MutatorBridge();
    const loadout: LoadoutState = {
      primary_weapon: {
        unique_name: "BratonPrime",
        active_config_index: 0,
        configs: [{ 
          mods: [
            { unique_name: "Serration", rank: 10 },        // +165%
            { unique_name: "GalvanizedAptitude", rank: 10 } // +80% por status
          ] 
        }]
      }
    };

    // 1. ESCENARIO: Enemigo Limpio (0 estados)
    const contextClean = { variables: { "unique_status_count": 0 } };
    const { entities: entitiesClean } = bridge.simulate(loadout, contextClean);
    const bratonClean = entitiesClean.find(e => e.id === "BratonPrime")!;
    
    // Daño: 100 + 165 = 265
    expect(bratonClean.attributes["WEAPON_DAMAGE"].final).toBe(265);
    console.log(` > Braton (0 Status): Daño Base 265%`);

    // 2. ESCENARIO: Enemigo Cebado (3 estados: Viral, Calor, Slash)
    const contextPrimed = { variables: { "unique_status_count": 3 } };
    const { entities: entitiesPrimed } = bridge.simulate(loadout, contextPrimed);
    const bratonPrimed = entitiesPrimed.find(e => e.id === "BratonPrime")!;

    /**
     * CÁLCULO MANUAL (Modelo Adding):
     * Bono Base: 100
     * Serration: +165
     * Aptitude (3 status): 80 * 3 = +240
     * TOTAL: 100 + 165 + 240 = 505
     */
    expect(bratonPrimed.attributes["WEAPON_DAMAGE"].final).toBe(505);
    console.log(` > Braton (3 Status): Daño Base 505% ✅`);
    console.log(` ✅ ESCALADO ADITIVO (GA) CERTIFICADO`);
  });

  it("Strun Prime: Escalado Savvy en Escopeta", () => {
    const bridge = new MutatorBridge();
    const loadout: LoadoutState = {
      primary_weapon: {
        unique_name: "StrunPrime",
        active_config_index: 0,
        configs: [{ 
          mods: [{ unique_name: "GalvanizedSavvy", rank: 10 }] 
        }]
      }
    };

    // Simulamos que el perdigón anterior ya aplicó 2 estados
    const contextRamp = { variables: { "unique_status_count": 2 } };
    const { entities } = bridge.simulate(loadout, contextRamp);
    const strun = entities.find(e => e.id === "StrunPrime")!;

    // 100 + (80 * 2) = 260
    expect(strun.attributes["WEAPON_DAMAGE"].final).toBe(260);
    console.log(` > Strun Savvy (Rampa 2): Daño Base 260% ✅`);
    console.log(` ✅ ESCALADO SAVVY CERTIFICADO`);
  });
});
