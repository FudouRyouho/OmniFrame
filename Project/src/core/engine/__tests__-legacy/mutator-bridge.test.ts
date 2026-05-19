import { describe, it, expect, beforeEach } from "vitest";
import { MutatorBridge } from "../logic/MutatorBridge";
import { DnaRepository } from "../logic/DnaRepository";
import { ModRepository } from "../logic/ModRepository";
import type { LoadoutState } from "../../loadout";

describe("MutatorBridge (Capa B)", () => {
  beforeEach(() => {
    // Registrar ADNs de prueba
    DnaRepository.register({
      entity_id: "Excalibur",
      domain: "warframe",
      kind: "warframe",
      tags: ["warframe"],
      profiles: {
        base: {
          HEALTH: 300,
          ARMOR: 100
        }
      },
      behaviors: []
    });

    DnaRepository.register({
      entity_id: "Braton",
      domain: "weapon",
      kind: "primary",
      tags: ["weapon", "primary"],
      profiles: {
        base: {
          damage_impact: 10,
          damage_puncture: 10,
          damage_slash: 10,
          WEAPON_DAMAGE: 100
        }
      },
      behaviors: []
    });

    // Registrar Mods de prueba
    ModRepository.register({
      unique_name: "Serration",
      compatible_tags: ["primary"],
      getModifiers: (target_id: string) => [{
        id: "serration-bonus",
        target_entity: target_id,
        target_attribute: "WEAPON_DAMAGE",
        operation: "ADD",
        value: 165
      }]
    });
  });

  it("debe hidratar y simular un loadout con mods", () => {
    const bridge = new MutatorBridge();
    const loadout: LoadoutState = {
      "slot:primary_weapon": "Braton",
      "slot:primary_weapon:active_config": 0,
      "slot:primary_weapon:config:0:mod:0": { unique_name: "Serration", rank: 10 }
    };

    const result = bridge.simulate(loadout);
    const braton = result.entities.find(e => e.id === "Braton");
    
    // Base 100 + 165% = 265
    expect(braton?.attributes["WEAPON_DAMAGE"].final).toBe(265);
  });
});
