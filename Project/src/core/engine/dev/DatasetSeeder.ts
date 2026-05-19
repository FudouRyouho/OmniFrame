/**
 * @domain Simulation-v2 / Dataset / Stub
 */
import { DnaRepository } from "../hydration/DnaRepository";
import { ModRepository } from "../hydration/ModRepository";
import { EnemyRepository } from "../enemies/EnemyRepository";

export function seedRealData() {
  // --- ENEMIGOS ---
  EnemyRepository.register({
    unique_name: "HeavyGunner",
    base_level: 8,
    health: 300, health_type: "ClonedFlesh",
    armor: 500, armor_type: "FerriteArmor",
    shields: 0, shield_type: "None", faction: "Grineer"
  });

  EnemyRepository.register({
    unique_name: "CorruptedHeavyGunner",
    base_level: 8,
    health: 350, health_type: "ClonedFlesh",
    armor: 500, armor_type: "FerriteArmor",
    shields: 0, shield_type: "None", faction: "Corrupted"
  });

  // --- ARMAS ---
  DnaRepository.register({
    entity_id: "BratonPrime",
    domain: "weapon",
    kind: "primary",
    tags: ["weapon", "primary", "rifle"],
    profiles: {
      base: {
        critical_chance: 12.0, critical_multiplier: 2.0, status_chance: 26.0,
        fire_rate: 9.58, multishot: 1.0, magazine_size: 75, reload_time: 2.1,
        reload_speed: 100,
        damage_impact: 1.7, damage_puncture: 12.3, damage_slash: 21.0,
        WEAPON_DAMAGE: 100
      }
    },
    behaviors: []
  });

  DnaRepository.register({
    entity_id: "StrunPrime",
    domain: "weapon",
    kind: "primary",
    tags: ["weapon", "primary", "shotgun"],
    profiles: {
      base: {
        damage_impact: 18, damage_puncture: 18, damage_slash: 24,
        critical_chance: 24, critical_multiplier: 2.2, status_chance: 6.7,
        fire_rate: 2.5, multishot: 12.0, magazine_size: 10, reload_time: 2.3,
        reload_speed: 100,
        falloff_start: 10, falloff_end: 30, falloff_min_pct: 50,
        WEAPON_DAMAGE: 100
      }
    },
    behaviors: []
  });

  DnaRepository.register({
    entity_id: "GenericSecondary",
    domain: "weapon",
    kind: "secondary",
    tags: ["weapon", "secondary"],
    profiles: {
      base: {
        damage_impact: 20, damage_puncture: 20, damage_slash: 20,
        critical_chance: 20, critical_multiplier: 2.0, status_chance: 20,
        fire_rate: 5, multishot: 1.0, magazine_size: 30, reload_time: 1.5,
        reload_speed: 100,
        WEAPON_DAMAGE: 100
      }
    },
    behaviors: []
  });

  DnaRepository.register({
    entity_id: "Hydroid",
    domain: "warframe",
    kind: "warframe",
    tags: ["warframe"],
    profiles: {
      base: {
        "health": 300,
        "law_corrosive_max_stacks": 10,
        "law_corrosive_initial_strip": 50
      }
    },
    behaviors: []
  });
  DnaRepository.register({
    entity_id: "IgnisWraith",
    domain: "weapon",
    kind: "primary",
    tags: ["weapon", "primary", "beam", "continuous"],
    profiles: {
      base: {
        damage_heat: 35,
        critical_chance: 17, critical_multiplier: 2.1, status_chance: 29,
        fire_rate: 8, multishot: 1.0, magazine_size: 200, reload_time: 1.7,
        reload_speed: 100,
        falloff_start: 15, falloff_end: 27, falloff_min_pct: 0,
        WEAPON_DAMAGE: 100
      }
    },
    behaviors: []
  });


  // --- MODS BÁSICOS ---
  ModRepository.register({
    unique_name: "Serration",
    compatible_tags: ["rifle"],
    getModifiers: (id, _rank) => [{
      id: "serration", target_entity: id, target_attribute: "WEAPON_DAMAGE",
      operation: "ADD", value: ModRepository.createLinearScaler(15)(_rank)
    }]
  });

  ModRepository.register({
    unique_name: "SplitChamber",
    compatible_tags: ["rifle"],
    getModifiers: (id, _rank) => [{
      id: "split-chamber", target_entity: id, target_attribute: "multishot",
      operation: "ADD", value: ModRepository.createLinearScaler(15)(_rank)
    }]
  });

  ModRepository.register({
    unique_name: "Hell'sChamber",
    compatible_tags: ["shotgun"],
    getModifiers: (id, _rank) => [{
      id: "hells-chamber", target_entity: id, target_attribute: "multishot",
      operation: "ADD", value: ModRepository.createLinearScaler(20)(_rank)
    }]
  });

  // --- MODS ELEMENTALES RIFLE ---
  ModRepository.register({
    unique_name: "InfectedClip",
    compatible_tags: ["rifle"],
    getModifiers: (id, _rank) => [{
      id: "infected-clip", target_entity: id, target_attribute: "damage_toxin",
      operation: "ADD", value: ModRepository.createLinearScaler(15)(_rank)
    }]
  });

  ModRepository.register({
    unique_name: "Stormbringer",
    compatible_tags: ["rifle"],
    getModifiers: (id, _rank) => [{
      id: "stormbringer", target_entity: id, target_attribute: "damage_electricity",
      operation: "ADD", value: ModRepository.createLinearScaler(15)(_rank)
    }]
  });

  ModRepository.register({
    unique_name: "MalignantForce",
    compatible_tags: ["rifle"],
    getModifiers: (id, _rank) => [
      {
        id: "malignant-toxin", target_entity: id, target_attribute: "damage_toxin",
        operation: "ADD", value: ModRepository.createLinearScaler(10)(_rank)
      },
      {
        id: "malignant-status", target_entity: id, target_attribute: "status_chance",
        operation: "ADD", value: ModRepository.createLinearScaler(10)(_rank)
      }
    ]
  });

  ModRepository.register({
    unique_name: "HighVoltage",
    compatible_tags: ["rifle"],
    getModifiers: (id, _rank) => [
      {
        id: "highvoltage-elec", target_entity: id, target_attribute: "damage_electricity",
        operation: "ADD", value: ModRepository.createLinearScaler(10)(_rank)
      },
      {
        id: "highvoltage-status", target_entity: id, target_attribute: "status_chance",
        operation: "ADD", value: ModRepository.createLinearScaler(10)(_rank)
      }
    ]
  });

  // --- MODS GALVANIZADOS ---
  ModRepository.register({
    unique_name: "GalvanizedHell",
    compatible_tags: ["shotgun"],
    getModifiers: (id, _rank) => [
      {
        id: "galv-hell-base", target_entity: id, target_attribute: "multishot",
        operation: "ADD", value: ModRepository.createLinearScaler(10)(_rank)
      },
      {
        id: "galv-hell-ramp", target_entity: id, target_attribute: "multishot",
        operation: "ADD", value: 120, // 4 stacks * 30% (Test expects 39.6 total)
        condition: "galvanized_max_stacks"
      }
    ]
  });

  ModRepository.register({
    unique_name: "GalvanizedAptitude",
    compatible_tags: ["rifle"],
    getModifiers: (id, _rank) => [{
      id: "galv-aptitude", target_entity: id, target_attribute: "WEAPON_DAMAGE",
      operation: "CONTEXT_SCALE", value: 80, context_variable: "unique_status_count"
    }]
  });

  ModRepository.register({
    unique_name: "GalvanizedSavvy",
    compatible_tags: ["shotgun"],
    getModifiers: (id, _rank) => [{
      id: "galv-savvy", target_entity: id, target_attribute: "WEAPON_DAMAGE",
      operation: "CONTEXT_SCALE", value: 80, context_variable: "unique_status_count"
    }]
  });

  // --- ARCANOS Y UTILIDAD ---
  ModRepository.register({
    unique_name: "CascadiaFlare",
    compatible_tags: ["secondary"],
    getModifiers: (id, _rank) => [{
      id: "cascadia-flare-dmg", target_entity: id, target_attribute: "WEAPON_DAMAGE",
      operation: "ADD", value: 480, condition: "cascadia_flare_max"
    }]
  });

  ModRepository.register({
    unique_name: "PrimaryFrostbite",
    compatible_tags: ["rifle"],
    getModifiers: (id, _rank) => [
      {
        id: "frostbite-crit", target_entity: id, target_attribute: "critical_multiplier",
        operation: "ADD", value: 120, condition: "frostbite_max"
      },
      {
        id: "frostbite-ms", target_entity: id, target_attribute: "multishot",
        operation: "ADD", value: 120, condition: "frostbite_max"
      }
    ]
  });

  ModRepository.register({
    unique_name: "ConjunctionVoltage",
    compatible_tags: ["secondary"],
    getModifiers: (id, _rank) => [
      {
        id: "voltage-dmg", target_entity: id, target_attribute: "WEAPON_DAMAGE",
        operation: "ADD", value: 60, condition: "voltage_max"
      },
      {
        id: "voltage-reload", target_entity: id, target_attribute: "reload_speed",
        operation: "ADD", value: 60, condition: "voltage_max"
      }
    ]
  });

  ModRepository.register({
    unique_name: "EmeraldArchonShard",
    compatible_tags: ["warframe"],
    getModifiers: (id) => [{
      id: "emerald-shard", target_entity: id, target_attribute: "law_corrosive_max_stacks",
      operation: "ADD_FLAT", value: 3 
    }]
  });
}
