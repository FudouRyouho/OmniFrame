/**
 * @domain Engine / Hydration
 * @status en-desarrollo
 */
import { makeModifier, type Modifier, type EntityId } from "../../contracts";
import type { ModOverrideEntry, ModStatRaw, ModStatValueRaw } from "../../contracts/mod-overrides";
import { resolveUpgradeEntry } from "@shared/types/modifier";

export interface ModBlueprint {
  unique_name: string;
  compatible_tags: string[];
  getModifiers: (target_id: EntityId, rank: number) => Modifier[];
}

/**
 * Repositorio de Blueprints de Mods.
 * Centraliza el acceso entre stubs manuales y el dataset real mapeado desde mod-stats.override.json.
 */
export class ModRepository {
  private static registry: Map<string, ModBlueprint> = new Map();
  private static overrides: Map<string, ModOverrideEntry> = new Map();

  public static register(blueprint: ModBlueprint): void {
    this.registry.set(blueprint.unique_name, blueprint);
  }

  /** Carga los overrides deterministas de mods (mod-stats.override.json). */
  public static loadOverrides(data: Record<string, ModOverrideEntry>): void {
    Object.entries(data).forEach(([key, val]) => {
      this.overrides.set(key, val);
    });
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
    const override = this.overrides.get(unique_name);
    if (override && override.stats) {
      const modifiers: Modifier[] = [];

      (override.stats as ModStatRaw[]).forEach((stat: ModStatRaw) => {
        stat.values.forEach((val: ModStatValueRaw) => {
          const entry = resolveUpgradeEntry(val.upgrade_type);

          if (entry) {
            const rawValue = Array.isArray(val.base_value)
              ? (val.base_value[rank] ?? val.base_value[val.base_value.length - 1])
              : val.base_value;
            const value = entry.toPercent ? (rawValue - 1) * 100 : rawValue;

            modifiers.push(makeModifier(
              {
                id: `override:${unique_name}:${entry.attr}`,
                target_entity: target_id,
                target_channel: entry.target_channel,
                target_attribute: entry.attr,
                ...(stat.condition ? { condition: stat.condition } : {})
              },
              entry.op,
              value,
              entry.co_factors,
            ));
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
