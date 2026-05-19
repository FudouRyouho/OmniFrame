/**
 * @domain Simulation-v2 / Logic / Hydration
 * @status en-desarrollo
 */
import type { Modifier, EntityId } from "../contracts";
import type { ModStatRaw, ModStatValueRaw } from "../contracts/mod-overrides";
import { ItemRepository } from "./ItemRepository";

export interface ModBlueprint {
  unique_name: string;
  compatible_tags: string[];
  getModifiers: (target_id: EntityId, rank: number) => Modifier[];
}

type UpgradeEntry = {
  attr: string;
  op: Modifier['operation'];
  // true cuando el JSON almacena el valor como multiplicador (ej. 1.30) en lugar de porcentaje (30)
  toPercent?: boolean;
};

const UPGRADE_MAP: Record<string, UpgradeEntry> = {
  // Daño global de arma — Serration (rifle), Pressure Point (melee), Hornet Strike (pistol)
  "WEAPON_DAMAGE_AMOUNT":        { attr: "WEAPON_DAMAGE",          op: "ADD" },
  "WEAPON_MELEE_DAMAGE":         { attr: "WEAPON_DAMAGE",          op: "ADD" },
  // Stats de combate
  "WEAPON_FIRE_RATE":            { attr: "fire_rate",              op: "ADD" },
  "WEAPON_CRIT_CHANCE":          { attr: "critical_chance",        op: "ADD" },
  "WEAPON_CRIT_DAMAGE":          { attr: "critical_multiplier",    op: "ADD" },
  "WEAPON_PROC_CHANCE":          { attr: "status_chance",          op: "ADD" },
  "WEAPON_CLIP_MAX":             { attr: "magazine_size",          op: "ADD" },
  "WEAPON_RELOAD_SPEED":         { attr: "reload_speed",           op: "ADD" },
  // Faction damage — los mods de facción (Bane, Expel) apilan aditivamente entre sí.
  // El JSON almacena el valor como multiplicador (1.30 = +30%); se convierte a porcentaje.
  // CombatCalculator aplica faction_damage_bonus.final / 100 cuando la facción del objetivo coincide.
  "GAMEPLAY_FACTION_DAMAGE":     { attr: "faction_damage_bonus",   op: "ADD", toPercent: true },
  // Stats de Warframe
  "AVATAR_ABILITY_STRENGTH":     { attr: "ability_strength",       op: "ADD" },
  "AVATAR_ABILITY_RANGE":        { attr: "ability_range",          op: "ADD" },
  "AVATAR_ABILITY_DURATION":     { attr: "ability_duration",       op: "ADD" },
  "AVATAR_ABILITY_EFFICIENCY":   { attr: "ability_efficiency",     op: "ADD" },
  "AVATAR_HEALTH_MAX":           { attr: "health_max",             op: "ADD" },
  "AVATAR_SHIELD_MAX":           { attr: "shield_max",             op: "ADD" },
  "AVATAR_ARMOUR":               { attr: "armor",                  op: "ADD" },
  "AVATAR_POWER_MAX":            { attr: "energy_max",             op: "ADD" },
  "AVATAR_MOVEMENT_SPEED":       { attr: "movement_speed",         op: "ADD" },
  "AVATAR_SPRINT_SPEED":         { attr: "sprint_speed",           op: "ADD" },
  "AVATAR_CASTING_SPEED":        { attr: "casting_speed",          op: "ADD" },
  "AVATAR_SHIELD_RECHARGE_RATE": { attr: "shield_recharge_rate",   op: "ADD" },
};

const ELEMENT_MAP: Record<string, string> = {
  "Impact": "damage_impact",
  "Puncture": "damage_puncture",
  "Slash": "damage_slash",
  "Heat": "damage_heat",
  "Cold": "damage_cold",
  "Electricity": "damage_electricity",
  "Toxin": "damage_toxin",
  "Radiation": "damage_radiation",
  "Viral": "damage_viral",
  "Corrosive": "damage_corrosive",
  "Gas": "damage_gas",
  "Magnetic": "damage_magnetic",
  "Blast": "damage_blast"
};

/**
 * Repositorio de Blueprints de Mods.
 * Centraliza el acceso entre stubs manuales y el dataset real mapeado desde mod-stats.override.json.
 */
export class ModRepository {
  private static registry: Map<string, ModBlueprint> = new Map();

  public static register(blueprint: ModBlueprint): void {
    this.registry.set(blueprint.unique_name, blueprint);
  }

  /**
   * Obtiene los modificadores para un mod.
   * Prioridad: Registro manual (Leyes complejas) > Overrides deterministas.
   */
  public static getModifiers(unique_name: string, target_id: EntityId, rank: number): Modifier[] {
    // 1. Registro manual (Stubs)
    const blueprint = this.registry.get(unique_name);
    if (blueprint) return blueprint.getModifiers(target_id, rank);

    // 2. Overrides Deterministas (SSoT del proyecto)
    const override = ItemRepository.getModOverride(unique_name);
    if (override && override.stats) {
      const modifiers: Modifier[] = [];

      (override.stats as ModStatRaw[]).forEach((stat: ModStatRaw) => {
        stat.values.forEach((val: ModStatValueRaw) => {
          const entry = UPGRADE_MAP[val.upgrade_type];
          let attrId: string | undefined = entry?.attr;
          let operation: Modifier['operation'] = entry?.op ?? "ADD";

          // Resolución de Daño Elemental basada en Label
          if (val.upgrade_type === "WEAPON_PERCENT_BASE_DAMAGE_ADDED") {
            const element = Object.keys(ELEMENT_MAP).find(el => stat.label.includes(el));
            if (element) {
              attrId = ELEMENT_MAP[element];
              operation = "ADD";
            }
          }

          if (attrId) {
            const rawValue = Array.isArray(val.base_value)
              ? (val.base_value[rank] ?? val.base_value[val.base_value.length - 1])
              : val.base_value;
            const value = entry?.toPercent ? (rawValue - 1) * 100 : rawValue;

            modifiers.push({
              id: `override:${unique_name}:${attrId}`,
              target_entity: target_id,
              target_attribute: attrId,
              operation,
              value
            });
          } else {
            console.warn(`[Hydration] No se pudo mapear upgrade_type: ${val.upgrade_type} para el mod: ${unique_name}`);
          }
        });
      });

      return modifiers;
    }

    return [];
  }

  public static createLinearScaler(base_val: number): (r: number) => number {
    return (rank: number) => base_val * (rank + 1);
  }
}
