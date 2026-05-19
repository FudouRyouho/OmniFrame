/**
 * @domain Simulation-v2 / Tests / Fixtures
 * @status en desarrollo
 */

import type { MutatedDNA, Ensemble } from "../../contracts";

export const SYNTHETIC_WARFRAME_DNA: MutatedDNA = {
  entity_id: "powersuit_rhino",
  domain: "warframe",
  kind: "warframe",
  tags: ["warframe", "heavy"],
  profiles: {
    base: {
      "health": 300,
      "shield": 450,
      "armor": 225,
      "energy": 150,
      "ability_strength": 100,
      "ability_duration": 100,
      "ability_efficiency": 100,
      "ability_range": 100,
    }
  },
  behaviors: ["PASSIVE_HEAVY_LANDING"]
};

export const SYNTHETIC_WEAPON_DNA: MutatedDNA = {
  entity_id: "weapon_ignis_wraith",
  domain: "weapon",
  kind: "primary",
  tags: ["weapon", "primary", "beam", "continuous"],
  profiles: {
    base: {
      "damage_heat": 35,
      "crit_chance": 17,
      "crit_mult": 2.1,
      "status_chance": 29,
      "fire_rate": 8,
      "multishot": 1,
      "reload_time": 1.7,
      "magazine_size": 200,
    }
  },
  behaviors: ["BEAM_PROC_SCALING"]
};

export const SYNTHETIC_MOD_SERRATION: MutatedDNA = {
  entity_id: "mod_serration",
  domain: "mod",
  kind: "mod",
  tags: ["mod", "damage"],
  profiles: { base: {} },
  behaviors: ["MOD_SERRATION_EFFECT"]
};

export const SYNTHETIC_ENSEMBLE: Ensemble = {
  warframe: {
    id: "powersuit_rhino",
    rank: 30,
    slots: {},
    shards: []
  },
  weapons: {
    primary: {
      id: "weapon_ignis_wraith",
      slots: {
        0: { mod_id: "mod_serration", level: 10 }
      },
      active_profile_id: "base"
    }
  }
};
