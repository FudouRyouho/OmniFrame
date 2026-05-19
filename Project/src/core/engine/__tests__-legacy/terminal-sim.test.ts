import { describe, it } from "vitest";
import { MutatorBridge } from "../logic/MutatorBridge";
import { seedRealData } from "../logic/DatasetSeeder";
import { CombatCalculator } from "../logic/CombatCalculator";
import { EnemyRepository } from "../logic/EnemyRepository";
import { CombatSimulator } from "../logic/CombatSimulator";
import { EnemyState } from "../logic/EnemyState";
import type { LoadoutState } from "../../loadout";

describe("Simulation Terminal Lab (Capa C)", () => {
  it("Reporte de Combate — Strun Prime", () => {
    seedRealData();
    const bridge = new MutatorBridge();

    const loadout: LoadoutState = {
      primary_weapon: {
        unique_name: "StrunPrime",
        active_config_index: 0,
        configs: [{ 
          mods: [
            { unique_name: "PointBlank", rank: 5 },
            { unique_name: "Hell'sChamber", rank: 5 },
            { unique_name: "GalvanizedHell", rank: 10 },
            { unique_name: "ToxicBarrage", rank: 5 }
          ] 
        }]
      }
    };

    const result = bridge.simulate(loadout);
    const weapon = result.entities.find(e => e.id === "StrunPrime")!;
    const fullContext = { active_profile_id: 'base', flags: {}, variables: {}, laws: {} as any };
    const metrics = CombatCalculator.project(weapon, fullContext);

    // --- ASCII REPORTER ---
    console.log("\n" + "=".repeat(60));
    console.log(" OMNIFRAME SIMULATION REPORT — TERMINAL V2.8 (SINCERITY)");
    console.log("=".repeat(60));
    console.log(` ENTIDAD: ${weapon.unique_name}`);
    console.log("-".repeat(60));
    
    console.log(" [ ATRIBUTOS: BASE -> FINAL ]");
    const attrRows = Object.entries(weapon.attributes).map(([id, node]) => ({
      Atributo: id.padEnd(20),
      Evolución: `${node.base.toFixed(2).padStart(6)}  ->  ${node.final.toFixed(2).padEnd(6)}`
    }));
    console.table(attrRows);

    console.log("\n [ MÉTRICAS DE COMBATE ]");
    console.log(` > Pellets promedio: ${metrics.pellet_count.toFixed(2)}`);
    console.log(` > Burst DPS:        ${metrics.burst_dps.toFixed(2)}`);
    console.log(` > Sustained DPS:    ${metrics.sustained_dps.toFixed(2)}`);
    
    console.log("\n [ CRITICAL TIER DISTRIBUTION ]");
    Object.entries(metrics.crit_distribution).forEach(([tier, prob]) => {
      const percentage = prob * 100;
      const bar = "█".repeat(Math.round(percentage / 2));
      const labels: Record<string, string> = { "0": "Blanco", "1": "Amarillo", "2": "Naranja", "3": "Rojo" };
      const label = labels[tier] || `Rojo (${tier})`;
      console.log(` > Tier ${tier} (${label.padEnd(8)}): ${percentage.toFixed(2)}% ${bar}`);
    });
    console.log(` > Crit Avg Mult:    ${metrics.average_crit_multiplier.toFixed(2)}x`);
    
    const slash_proc = metrics.status_projections.find(p => p.type === "damage_slash_proc");
    if (slash_proc) {
       const p = slash_proc;
       const total = p.damage_per_tick * p.ticks;
       console.log(` > ${p.type.padEnd(20)}: ${p.damage_per_tick.toFixed(2)} / tick (Total: ${total.toFixed(2)})`);
       console.log(`   Duración: ${p.duration}s | Ticks: ${p.ticks}`);
    }

    console.log("\n [ PROBABILITY STATUS MAP ]");
    Object.entries(metrics.status_map).forEach(([type, prob]) => {
      const percentage = prob * 100;
      const bar = "█".repeat(Math.round(percentage / 1.5));
      console.log(` > ${type.replace('damage_', '').padEnd(10)}: ${percentage.toFixed(2)}% ${bar}`);
    });

    console.log("\n [ COMBAT RESOLUTION (vs HEAVY GUNNER LVL 100) ]");
    const hg_dna = EnemyRepository.find("HeavyGunner")!;
    const hg_lvl_100 = EnemyRepository.scale(hg_dna, 100);
    const targetState = new EnemyState(hg_lvl_100, fullContext.laws);
    
    // Preparar mapa de daño simplificado para el simulador
    const damageMap: Record<string, number> = {};
    Object.entries(weapon.attributes).forEach(([id, node]) => {
      if (id.startsWith('damage_')) damageMap[id] = node.final;
    });

    const resolution = CombatSimulator.resolveHit(damageMap, targetState);
    const paper_total = Object.values(damageMap).reduce((a,b) => a+b, 0);
    const global_dr = 1 - (resolution.total_damage / paper_total);

    console.log(` > Armadura Escalada: ${hg_lvl_100.current_armor.toFixed(0)}`);
    console.log(` > Daño de Papel:     ${paper_total.toFixed(2)}`);
    console.log(` > Daño Efectivo:    ${resolution.total_damage.toFixed(2)}`);
    console.log(` > Reducción Total:  ${(global_dr * 100).toFixed(2)}%`);
    
    console.log("\n" + "=".repeat(50) + "\n");
  });
});
