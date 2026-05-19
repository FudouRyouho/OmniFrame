import { describe, it } from "vitest";
import { MutatorBridge } from "../logic/MutatorBridge";
import { seedRealData } from "../logic/DatasetSeeder";
import { EnemyRepository } from "../logic/EnemyRepository";
import { TimelineSimulator } from "../logic/TimelineSimulator";
import type { LoadoutState } from "../../loadout";

describe("Timeline Simulation Lab (Capa C.7)", () => {
  it("Simulación de Erosión de Armadura — Strun Prime vs HG Lvl 100", () => {
    seedRealData();
    const bridge = new MutatorBridge();

    // Build de Corrosivo básica para probar la erosión
    const loadout: LoadoutState = {
      primary_weapon: {
        unique_name: "StrunPrime",
        active_config_index: 0,
        configs: [{ 
          mods: [
            { unique_name: "Serration", rank: 10 },
            { unique_name: "SplitChamber", rank: 5 },
            // Simulamos Corrosivo inyectando modificadores (en un caso real serían mods de Electricidad/Toxina)
          ] 
        }]
      }
    };

    const result = bridge.simulate(loadout);
    const weapon = result.entities.find(e => e.id === "StrunPrime")!;
    
    // Build de Sangrado y Fuego (0.5s ráfaga, 5s observación)
    weapon.attributes["damage_slash"] = {
       base: 40, base_flat: 0, base_add_pct: 0, mods_add_pct: 0, 
       total_flat: 0, multiplicative: 2.65, final: 40 * 2.65
    };
    weapon.attributes["damage_heat"] = {
       base: 20, base_flat: 0, base_add_pct: 0, mods_add_pct: 0, 
       total_flat: 0, multiplicative: 2.65, final: 20 * 2.65
    };
    weapon.attributes["status_chance"] = { ...weapon.attributes["status_chance"], final: 100 };

    const hg_dna = EnemyRepository.find("HeavyGunner")!;
    const hg_lvl_100 = EnemyRepository.scale(hg_dna, 100);

    // 0.5s de ráfaga, 5.0s de tiempo total
    const simulation = TimelineSimulator.simulateBurst(weapon, hg_lvl_100, 5.0, 0.5);

    console.log("\n" + "=".repeat(75));
    console.log(" OMNIFRAME TIMELINE REPORT: SANGRE Y FUEGO (POST-RÁFAGA)");
    console.log("=".repeat(75));
    console.log(` OBJETIVO: HG Lvl 100 | Ráfaga: 0.5s | Observación: 5.0s`);
    console.log("-".repeat(75));
    
    console.log("T(s) | Estado Arma | Vida Enemiga | Stacks (C/V/H) | Armadura");
    console.log("-".repeat(75));

    simulation.events.forEach((e) => {
        // Mostramos puntos clave: inicio (0), ráfaga (0.5), y cada segundo (1, 2, 3...)
        const isMilestone = Math.abs(e.time % 1.0) < 0.01 || Math.abs(e.time - 0.5) < 0.01;
        if (isMilestone) {
          const time = e.time.toFixed(1).padEnd(4);
          const state = e.time <= 0.5 ? "DISPARANDO" : "SANGRE/FUEGO";
          const hp = e.enemy_health.toFixed(0).padEnd(12);
          
          const c_stacks = e.stacks.damage_corrosive.toFixed(1);
          const v_stacks = e.stacks.damage_viral.toFixed(1);
          const h_stacks = e.stacks.damage_heat.toFixed(1);
          const stacks = `${c_stacks}/${v_stacks}/${h_stacks}`.padEnd(14);
          
          const armor = e.enemy_armor.toFixed(0);
          console.log(`${time} | ${state.padEnd(11)} | ${hp} | ${stacks} | ${armor}`);
        }
    });

    console.log("-".repeat(75));
    console.log(` > Resultado: ${simulation.ttk ? `KILL en ${simulation.ttk.toFixed(2)}s` : "OBJETIVO VIVO"}`);
    console.log(` > Daño Total en Ráfaga: ${simulation.total_damage.toFixed(2)}`);
    console.log("=".repeat(60) + "\n");
  });
});
