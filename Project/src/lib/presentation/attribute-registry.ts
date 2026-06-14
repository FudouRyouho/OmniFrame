/**
 * @domain Presentation / Metadata / Attributes
 * @status en-desarrollo
 */

export interface AttributeMetadata {
  label: string;
  category: 'primary' | 'offensive' | 'utility' | 'elemental';
  unit: '%' | 'x' | 's' | '';
}

/**
 * Registro de Atributos.
 * Actúa como diccionario de presentación para los IDs técnicos del motor.
 */
export const ATTRIBUTE_REGISTRY: Record<string, AttributeMetadata> = {
  // primary
  "WEAPON_ADD_DAMAGE": { label: "Damage", category: "primary", unit: "%" },
  "critical_chance": { label: "Critical Chance", category: "primary", unit: "%" },
  "critical_multiplier": { label: "Critical Multiplier", category: "primary", unit: "x" },
  "status_chance": { label: "Status Chance", category: "primary", unit: "%" },
  
  // offensive
  "fire_rate": { label: "Fire Rate", category: "offensive", unit: "" },
  "multishot": { label: "Multishot", category: "offensive", unit: "" },
  "magazine_size": { label: "Magazine", category: "offensive", unit: "" },
  "reload_time": { label: "Reload", category: "offensive", unit: "s" },
  "reload_speed": { label: "Reload Speed", category: "offensive", unit: "%" },
  "accuracy": { label: "Accuracy", category: "offensive", unit: "" },
  
  // physical / elemental
  "damage_impact": { label: "Impact", category: "elemental", unit: "" },
  "damage_puncture": { label: "Puncture", category: "elemental", unit: "" },
  "damage_slash": { label: "Slash", category: "elemental", unit: "" },
  "damage_heat": { label: "Heat", category: "elemental", unit: "" },
  "damage_cold": { label: "Cold", category: "elemental", unit: "" },
  "damage_electricity": { label: "Electricity", category: "elemental", unit: "" },
  "damage_toxin": { label: "Toxin", category: "elemental", unit: "" },
  "damage_viral": { label: "Viral", category: "elemental", unit: "" },
  "damage_corrosive": { label: "Corrosive", category: "elemental", unit: "" },
  "damage_gas": { label: "Gas", category: "elemental", unit: "" },
  "damage_magnetic": { label: "Magnetic", category: "elemental", unit: "" },
  "damage_radiation": { label: "Radiation", category: "elemental", unit: "" },
  "damage_blast": { label: "Blast", category: "elemental", unit: "" },

  // utility
  "law_corrosive_max_stacks": { label: "Max Corrosive Stacks", category: "utility", unit: "" },
};

/**
 * Mapeo de Uids de slots para la UI
 */
export const SLOT_LABELS: Record<string, string> = {
  "aura": "Aura",
  "stance": "Stance",
  "exilus": "Exilus",
  "normal": "Mod",
  "arcanes": "Arcane"
};

export function getAttributeMetadata(id: string): AttributeMetadata {
  return ATTRIBUTE_REGISTRY[id] || { label: id, category: "utility", unit: "" };
}
