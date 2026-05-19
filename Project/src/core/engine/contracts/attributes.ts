/**
 * @domain Simulation-v2 / Contracts / Attributes
 * @status en-desarrollo
 */

export const ATTR = {
  // Warframe Core
  health: "health",
  shield: "shield",
  armor: "armor",
  energy: "energy",
  ability_strength: "ability_strength",
  ability_duration: "ability_duration",
  ability_range: "ability_range",
  ability_efficiency: "ability_efficiency",

  // Weapon Core
  weapon_damage: "weapon_damage", 
  crit_chance: "crit_chance",
  crit_mult: "crit_mult",
  status_chance: "status_chance",
  fire_rate: "fire_rate",
  multishot: "multishot",
  reload_time: "reload_time",
  magazine_size: "magazine_size",
  punch_through: "punch_through",
  
  // Damage Types (Prefix logic simplified to match dataset where possible)
  damage_impact: "damage_impact",
  damage_puncture: "damage_puncture",
  damage_slash: "damage_slash",
  damage_heat: "damage_heat",
  damage_cold: "damage_cold",
  damage_electricity: "damage_electricity",
  damage_toxin: "damage_toxin",
  
  // Derived
  ammo_max: "ammo_max",
  follow_through: "follow_through",
} as const;

export type AttributeKey = keyof typeof ATTR;
