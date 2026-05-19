import { describe, it, expect } from "vitest";
import { MutatorBridge } from "../logic/MutatorBridge";
import { seedRealData } from "../logic/DatasetSeeder";
import { EnemyState } from "../logic/EnemyState";
import type { LoadoutState } from "../../loadout";

describe("Phase 4 Labs: Leyes y Pasivas", () => {
  seedRealData();

  it("Pasiva de Hydroid: Corrosivo al 100% de reducción", () => {
    const bridge = new MutatorBridge();
    
    // Loadout con Hydroid
    const loadout: LoadoutState = {
      warframe: {
        unique_name: "Hydroid",
        active_config_index: 0,
        configs: [{ mods: [] }]
      },
      primary_weapon: {
        unique_name: "StrunPrime",
        active_config_index: 0,
        configs: [{ mods: [] }]
      }
    };

    const { entities } = bridge.simulate(loadout);
    
    // 1. Extraer leyes del simulador (vía Bridge o manualmente para el test)
    // El Bridge ya inyecta las leyes en el contexto durante la simulación.
    // Para validar el EnemyState, necesitamos las leyes que el Bridge extrajo.
    
    const context = (bridge as any).extractLaws(entities);
    expect(context.corrosive_initial_strip).toBe(50);
    
    // 2. Simular combate contra Heavy Gunner
    const heavyGunnerBase = {
        unique_name: "HG", current_health: 100, current_armor: 500, 
        current_shields: 0, health_type: "Flesh", armor_type: "Ferrite", faction: "Grineer"
    };
    
    const enemy = new EnemyState(heavyGunnerBase as any, context);
    
    // Aplicar 10 stacks
    enemy.addStacks("damage_corrosive", 10);
    
    const effectiveArmor = enemy.getEffectiveArmor(0);
    
    console.log(` > Hydroid Corrosive Stacks: ${enemy.stacks.damage_corrosive}`);
    console.log(` > Armor Reduction: ${((1 - effectiveArmor / 500) * 100).toFixed(1)}%`);
    
    // Con Hydroid, 10 stacks = 100% reducción
    expect(effectiveArmor).toBe(0);
    console.log(` ✅ PASIVA DE HYDROID CERTIFICADA: ARMADURA CERO`);
  });

  it("Fragmentos Esmeralda: Expansión de Stacks de Corrosivo", () => {
    const bridge = new MutatorBridge();
    
    const loadout: LoadoutState = {
      warframe: {
        unique_name: "Hydroid",
        active_config_index: 0,
        configs: [{ 
            mods: [{ unique_name: "EmeraldArchonShard", rank: 0 }] 
        }]
      }
    };

    const { entities } = bridge.simulate(loadout);
    const context = (bridge as any).extractLaws(entities);

    // Baseline Hydroid (10) + Shard (+3) = 13
    expect(context.corrosive_max_stacks).toBe(13);
    console.log(` > Max Stacks Permitidos: ${context.corrosive_max_stacks}`);

    const enemy = new EnemyState({ current_armor: 500 } as any, context);
    
    // Intentar aplicar 20 stacks
    enemy.addStacks("damage_corrosive", 20);
    
    expect(enemy.stacks.damage_corrosive).toBe(13);
    console.log(` ✅ LÍMITE DE LEY EXPANDIDO A 13 STACKS`);
  });
});
