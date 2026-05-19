/**
 * @domain Simulation-v2 / Contracts / Damage
 * @status en-desarrollo
 */

/**
 * Tabla de Eficiencia Elemental según el tipo de armadura/salud.
 * Basado en las leyes de Warframe.
 */
export const DAMAGE_EFFICIENCY: Record<string, Record<string, number>> = {
  "damage_impact": {
    "Shields": 0.50,
    "ProtoShield": 0.15,
    "Machinery": 0.25
  },
  "damage_puncture": {
    "FerriteArmor": 0.50,
    "AlloyArmor": 0.15,
    "Robotic": 0.25
  },
  "damage_slash": {
    "ClonedFlesh": 0.25,
    "Infested": 0.25,
    "Flesh": 0.25,
    "FerriteArmor": -0.15,
    "AlloyArmor": -0.50,
    "Robotic": -0.25
  },
  "damage_heat": {
    "ClonedFlesh": 0.25,
    "Flesh": 0.25,
    "InfestedFlesh": 0.50,
    "ProtoShield": -0.50
  },
  "damage_cold": {
    "AlloyArmor": 0.25,
    "Shields": 0.50,
    "ProtoShield": 0.15,
    "Fossilized": -0.50
  },
  "damage_electricity": {
    "Robotic": 0.50,
    "Shields": 0.50,
    "AlloyArmor": -0.50
  },
  "damage_toxin": {
    "Flesh": 0.50,
    "ProtoShield": -0.25,
    "Robotic": -0.25
    // Nota: Toxin ignora Shields en el combate real
  },
  "damage_corrosive": {
    "FerriteArmor": 0.75,
    "Fossilized": 0.75,
    "ProtoShield": -0.50
  },
  "damage_viral": {
    "ClonedFlesh": 0.75,
    "Flesh": 0.50,
    "Machinery": -0.25
  },
  "damage_magnetic": {
    "Shields": 0.75,
    "ProtoShield": 0.75,
    "AlloyArmor": -0.50
  },
  "damage_radiation": {
    "AlloyArmor": 0.75,
    "Robotic": 0.25,
    "InfestedSinew": 0.50,
    "Shields": -0.25,
    "Fossilized": -0.75
  },
  "damage_blast": {
    "Fossilized": 0.50,
    "Machinery": 0.75,
    "FerriteArmor": -0.25
  },
  "damage_gas": {
    "Infested": 0.75,
    "InfestedFlesh": 0.50,
    "ClonedFlesh": -0.50,
    "Flesh": -0.50
  }
};
