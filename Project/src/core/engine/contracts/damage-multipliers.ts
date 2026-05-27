/**
 * @domain Simulation-v2 / Contracts / Damage
 * @status en-desarrollo
 */

/**
 * Tabla de Eficiencia Elemental según el tipo de armadura/salud.
 * Basado en las leyes de Warframe.
 */
export const DAMAGE_EFFICIENCY: Record<string, Record<string, number>> = {
  "WEAPON_ADD_IMPACT_DAMAGE": {
    "Shields": 0.50,
    "ProtoShield": 0.15,
    "Machinery": 0.25
  },
  "WEAPON_ADD_PUNCTURE_DAMAGE": {
    "FerriteArmor": 0.50,
    "AlloyArmor": 0.15,
    "Robotic": 0.25
  },
  "WEAPON_ADD_SLASH_DAMAGE": {
    "ClonedFlesh": 0.25,
    "Infested": 0.25,
    "Flesh": 0.25,
    "FerriteArmor": -0.15,
    "AlloyArmor": -0.50,
    "Robotic": -0.25
  },
  "WEAPON_ADD_HEAT_DAMAGE": {
    "ClonedFlesh": 0.25,
    "Flesh": 0.25,
    "InfestedFlesh": 0.50,
    "ProtoShield": -0.50
  },
  "WEAPON_ADD_COLD_DAMAGE": {
    "AlloyArmor": 0.25,
    "Shields": 0.50,
    "ProtoShield": 0.15,
    "Fossilized": -0.50
  },
  "WEAPON_ADD_ELECTRICITY_DAMAGE": {
    "Robotic": 0.50,
    "Shields": 0.50,
    "AlloyArmor": -0.50
  },
  "WEAPON_ADD_TOXIN_DAMAGE": {
    "Flesh": 0.50,
    "ProtoShield": -0.25,
    "Robotic": -0.25
    // Nota: Toxin ignora Shields en el combate real
  },
  "WEAPON_ADD_CORROSIVE_DAMAGE": {
    "FerriteArmor": 0.75,
    "Fossilized": 0.75,
    "ProtoShield": -0.50
  },
  "WEAPON_ADD_VIRAL_DAMAGE": {
    "ClonedFlesh": 0.75,
    "Flesh": 0.50,
    "Machinery": -0.25
  },
  "WEAPON_ADD_MAGNETIC_DAMAGE": {
    "Shields": 0.75,
    "ProtoShield": 0.75,
    "AlloyArmor": -0.50
  },
  "WEAPON_ADD_RADIATION_DAMAGE": {
    "AlloyArmor": 0.75,
    "Robotic": 0.25,
    "InfestedSinew": 0.50,
    "Shields": -0.25,
    "Fossilized": -0.75
  },
  "WEAPON_ADD_BLAST_DAMAGE": {
    "Fossilized": 0.50,
    "Machinery": 0.75,
    "FerriteArmor": -0.25
  },
  "WEAPON_ADD_GAS_DAMAGE": {
    "Infested": 0.75,
    "InfestedFlesh": 0.50,
    "ClonedFlesh": -0.50,
    "Flesh": -0.50
  }
};
