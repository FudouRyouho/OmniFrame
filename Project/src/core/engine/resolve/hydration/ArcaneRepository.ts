/**
 * @domain Engine / Hydration
 * @status en-desarrollo
 * @SSoT docs/data/schemas/arcane/schema.md
 *
 * Resuelve arcanos equipados → Modifier[]. Análogo a IncarnonRepository: lee
 * arcane-stats.override.json (clave = uniqueName) y emite modifiers directos.
 *
 * A diferencia de los mods, los arcanos NO pasan por DamageCombiner — su daño
 * elemental no se combina con el del arma (naturaleza distinta, como los shards).
 * Por eso StaticHydrator empuja estos modifiers directo a `modifiers[]`.
 *
 * Scope v0 (mapped subset): solo stats con `base_value` y `upgrade_type` poblados.
 * Se omiten (sin warning): `base_value: null` (familia stacking Merciless — OQ-DATA-4)
 * y `upgrade_type: null` (sin token — status resists, fórmulas per-stat, operador/amp).
 */
import type { Modifier, EntityId } from "../../contracts";
import type { ConditionInput } from "@shared/types/condition";
import { resolveUpgradeEntry } from "@shared/types/modifier";

type ArcaneValueRaw = {
  base_value: number[] | null;
  upgrade_type: string | null;
};

type ArcaneStatRaw = {
  label?: string;
  values: ArcaneValueRaw[];
  condition?: ConditionInput | null;
  notes?: string[];
};

type ArcaneOverrideEntry = {
  name?: string;
  stats: ArcaneStatRaw[];
};

export class ArcaneRepository {
  private static index: Map<string, ArcaneOverrideEntry> = new Map();

  public static load(data: Record<string, ArcaneOverrideEntry>): void {
    this.index.clear();
    Object.entries(data).forEach(([uniqueName, entry]) => {
      this.index.set(uniqueName, entry);
    });
  }

  /**
   * Resuelve los stats de un arcano equipado a Modifier[].
   * @param rank rank del arcano en la intención; clampado a la longitud real de
   *   la serie (hay arcanos 0-3, no todos 0-5 — un rank fuera de rango rompería).
   */
  public static getModifiers(uniqueName: string, rank: number, targetId: EntityId): Modifier[] {
    const entry = this.index.get(uniqueName);
    if (!entry || !Array.isArray(entry.stats)) return [];

    const modifiers: Modifier[] = [];

    entry.stats.forEach((stat, statIdx) => {
      stat.values.forEach((val, valIdx) => {
        // Guarda: base_value null → stacking sin valor estático (familia Merciless, OQ-DATA-4).
        if (!val.base_value || !val.upgrade_type) return;

        // Guarda: upgrade_type sin mapeo → se omite sin warning (como Incarnon).
        const upgradeEntry = resolveUpgradeEntry(val.upgrade_type);
        if (!upgradeEntry) return;

        const idx = Math.max(0, Math.min(rank, val.base_value.length - 1));
        const rawValue = val.base_value[idx];
        const value = upgradeEntry.toPercent ? (rawValue - 1) * 100 : rawValue;

        modifiers.push({
          id: `arcane:${uniqueName}:s${statIdx}:v${valIdx}:${upgradeEntry.attr}`,
          source_id: `Arcane:${uniqueName}`,
          target_entity: targetId,
          target_channel: upgradeEntry.target_channel,
          target_attribute: upgradeEntry.attr,
          operation: upgradeEntry.op,
          value,
          ...(stat.condition ? { condition: stat.condition } : {}),
        });
      });
    });

    return modifiers;
  }
}
