/**
 * @domain Simulation-v2 / Contracts / Damage Logic
 * @status en-desarrollo
 */

export const ELEMENTAL_COMBINATIONS: Record<string, string> = {
  "damage_cold+damage_toxin": "damage_viral",
  "damage_toxin+damage_cold": "damage_viral",
  "damage_heat+damage_toxin": "damage_gas",
  "damage_toxin+damage_heat": "damage_gas",
  "damage_electricity+damage_toxin": "damage_corrosive",
  "damage_toxin+damage_electricity": "damage_corrosive",
  "damage_heat+damage_cold": "damage_blast",
  "damage_cold+damage_heat": "damage_blast",
  "damage_electricity+damage_cold": "damage_magnetic",
  "damage_cold+damage_electricity": "damage_magnetic",
  "damage_heat+damage_electricity": "damage_radiation",
  "damage_electricity+damage_heat": "damage_radiation",
};

export const PRIMARY_ELEMENTS: string[] = [
  "damage_heat", 
  "damage_cold", 
  "damage_electricity", 
  "damage_toxin"
];
