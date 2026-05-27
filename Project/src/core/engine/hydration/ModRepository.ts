/**
 * @domain Engine / Hydration
 * @status en-desarrollo
 */
import type { Modifier, EntityId } from "../contracts";
import type { ModStatRaw, ModStatValueRaw } from "../contracts/mod-overrides";
import { isUpgrade, UPGRADE_MAP, resolveToken } from "@shared/types/modifier";
import { ItemRepository } from "./ItemRepository";

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
          const entry = isUpgrade(val.upgrade_type)
            ? (UPGRADE_MAP[val.upgrade_type] ?? resolveToken(val.upgrade_type))
            : undefined;
          const attrId = entry?.attr;
          const operation: Modifier['operation'] = entry?.op ?? 'ADD';

          if (attrId) {
            const rawValue = Array.isArray(val.base_value)
              ? (val.base_value[rank] ?? val.base_value[val.base_value.length - 1])
              : val.base_value;
            const value = entry?.toPercent ? (rawValue - 1) * 100 : rawValue;

            modifiers.push({
              id: `override:${unique_name}:${attrId}`,
              target_entity: target_id,
              target_channel: entry?.target_channel,
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
