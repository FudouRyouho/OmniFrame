import { describe, it, expect, beforeAll } from "vitest";
import { ItemRepository } from "../logic/ItemRepository";
import { ModRepository } from "../logic/ModRepository";
import * as fs from "fs";
import * as path from "path";

describe("Hydration Engine: Override Dataset", () => {
  beforeAll(() => {
    // Cargar overrides físicos para el test
    const overridePath = path.resolve(__dirname, "../../../../../public/data/mod-stats.override.json");
    if (fs.existsSync(overridePath)) {
      const data = JSON.parse(fs.readFileSync(overridePath, "utf-8"));
      ItemRepository.loadOverrides(data);
    }
  });

  it("debe mapear Amalgam Serration correctamente (Max Rank)", () => {
    const uniqueName = "/Lotus/Upgrades/Mods/DualSource/Rifle/SerratedRushMod";
    const modifiers = ModRepository.getModifiers(uniqueName, "Braton", 10);
    
    // Amalgam Serration Rank 10: +155% Damage, +25% Sprint Speed
    const damageMod = modifiers.find(m => m.target_attribute === "WEAPON_DAMAGE");
    expect(damageMod).toBeDefined();
    expect(damageMod?.value).toBe(155);
  });

  it("debe resolver el daño elemental mediante la etiqueta (Accelerated Blast)", () => {
    const uniqueName = "/Lotus/Upgrades/Mods/Shotgun/DualStat/AcceleratedBlastMod";
    const modifiers = ModRepository.getModifiers(uniqueName, "Strun", 3);
    
    // Accelerated Blast Rank 3: +60% Fire Rate, +60% Puncture
    const fireRate = modifiers.find(m => m.target_attribute === "fire_rate");
    const puncture = modifiers.find(m => m.target_attribute === "damage_puncture");
    
    expect(fireRate?.value).toBe(60);
    expect(puncture?.value).toBe(60);
  });
});
