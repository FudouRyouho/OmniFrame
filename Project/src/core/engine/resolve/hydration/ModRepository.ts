/**
 * @domain Engine / Hydration
 * @status en-desarrollo
 */
import { makeModifier, type Modifier, type EntityId } from "../../contracts";
import type { ModOverrideEntry, ModStatRaw, ModStatValueRaw } from "../../contracts/mod-overrides";
import { resolveUpgradeEntry, decodeUpgradeValue } from "@shared/types/modifier";

// ⚠️ FLAGGED (shim temporal — arch-decisions §16, P2b): los tokens de daño por FACCIÓN (Bane/Cleanse)
// son C2·F — su gate depende de la facción del TARGET, que solo se conoce en RESOLUCIÓN (③), NO en el
// grafo C1 (`SimulationContext` no lleva `targetFaction`; vive en `EnemyState`). Emitirlos como modifier
// C1 los vuelve INCONDICIONALES → sobre-cuentan (bug destapado por Felarx/Primed Cleanse: ×1.55 sin target
// faction). Hasta normalizar la semántica del token (que codifique facción + gate) NO se emiten en C1; el
// pool de facción C1 queda para bonos INCONDICIONALES (Roar, 1a). Migrar a resolución al modelar
// `targetFaction`. **Borrar este set al normalizar la semántica.**
const C2F_FACTION_TOKENS_DEFERRED = new Set(['GAMEPLAY_MULT_FACTION_DAMAGE']);

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
            if (C2F_FACTION_TOKENS_DEFERRED.has(entry.attr)) return; // ⚠️ FLAGGED shim (ver arriba)

            const rawValue = Array.isArray(val.base_value)
              ? (val.base_value[rank] ?? val.base_value[val.base_value.length - 1])
              : val.base_value;
            const value = decodeUpgradeValue(entry, rawValue);

            // Blood Rush / Weeping Wounds: `condition: 'per_melee_combo_multiplier'` NO es un gate
            // booleano — es escala disfrazada de condición (misma trampa que `per_status_type_on_target`
            // tuvo para CO, `conditions.md`). Se descarta como condition y se construye la familia
            // COMBO_SCALED_ADD directo (mismo patrón que StaticHydrator sintetiza MELEE_COMBO_MULT a
            // mano) — a diferencia de ese, este SÍ trae `value` propio (rank del mod real).
            if (stat.condition === 'per_melee_combo_multiplier') {
              modifiers.push({
                id: `override:${unique_name}:${entry.attr}`,
                target_entity: target_id,
                target_channel: entry.target_channel,
                target_attribute: entry.attr,
                operation: 'COMBO_SCALED_ADD',
                value,
                melee_combo_factors: { count_var: 'melee_combo_count' },
              });
              return;
            }

            // Galvanized [Arma] (STACK_DECAY_BUFF, arch-decisions §11 + D-15 evolución 2026-07-10):
            // `stat.max_stacks` presente → el dato es total-a-máximo (D-15 §2, sin re-autorizar), el
            // motor deriva perStackPct = value/max_stacks acá. Trigger = `max_stacks`, NO `condition`
            // (on_kill/on_headshot_kill/on_melee_kill son tokens legítimos, reusados en stats NO-
            // stacking del mismo mod — ej. Galvanized Crosshairs). `condition` se descarta igual que
            // en COMBO_SCALED_ADD (C1-declarado, no gate). `stacks_var` se deriva de `unique_name`
            // (NO un nombre genérico compartido, a diferencia de `melee_combo_count`/CO): cada
            // Galvanized es un buff independiente con su propio contador — dos equipados a la vez
            // (slots distintos) no deben colisionar en el mismo `context.variables`.
            if (stat.max_stacks) {
              modifiers.push({
                id: `override:${unique_name}:${entry.attr}`,
                target_entity: target_id,
                target_channel: entry.target_channel,
                target_attribute: entry.attr,
                operation: 'STACK_DECAY_BUFF',
                value: value / stat.max_stacks,
                stack_decay_factors: { stacks_var: `stack_decay:${unique_name}`, cap: stat.max_stacks },
              });
              return;
            }

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
