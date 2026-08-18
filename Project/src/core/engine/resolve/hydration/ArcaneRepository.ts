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
 * Se omiten (sin warning), por tres motivos distintos:
 *  - `base_value: null` — familia stacking Merciless/Deadhead/Dexterity, OQ-DATA-4.
 *  - `upgrade_type: null` sin token — status resists, fórmulas per-stat, operador/amp.
 *  - `upgrade_type: null` en la familia `STACK_DECAY_BUFF` pendiente de `max_stacks`
 *    (Exhilarate) — arch-decisions.md §11: mecanismo construido y validado contra mods
 *    (Galvanized). Cascadia Flare ya lo ejerce (CAS-1) — Exhilarate tiene una forma de
 *    dato distinta (un solo `values`, sin par per-stack/total-a-máximo) y no se portó igual.
 */
import { makeModifier, type Modifier, type EntityId } from "../../contracts";
import type { ConditionInput } from "@shared/types/condition";
import { resolveUpgradeEntry, decodeUpgradeValue } from "@shared/types/modifier";

type ArcaneValueRaw = {
  base_value: number[] | null;
  upgrade_type: string | null;
};

type ArcaneStatRaw = {
  label?: string;
  values: ArcaneValueRaw[];
  condition?: ConditionInput | null;
  notes?: string[];
  /** Presente sólo en la familia `STACK_DECAY_BUFF` (mismo contrato que `ModStatRaw`,
   *  `contracts/mod-overrides.ts`) — cap de stacks; `base_value` sigue total-a-máximo. */
  max_stacks?: number;
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

        // Guarda: upgrade_type sin mapeo → se omite en silencio (a diferencia de Incarnon/Mod, que
        // warnean: acá la ausencia es un gap ESPERADO —familia Merciless, status resists—, no una anomalía).
        const upgradeEntry = resolveUpgradeEntry(val.upgrade_type);
        if (!upgradeEntry) return;

        const idx = Math.max(0, Math.min(rank, val.base_value.length - 1));
        const rawValue = val.base_value[idx];
        const value = decodeUpgradeValue(upgradeEntry, rawValue);

        // Cascadia Flare (STACK_DECAY_BUFF, arch-decisions §11 + CAS-1,
        // .working/investigacion-source-state-cascadia-flare.md): `stat.max_stacks` presente → el
        // dato es total-a-máximo, el motor deriva perStackPct = value/max_stacks acá. Mismo patrón
        // que ModRepository (Galvanized [Arma]) — primer arcano que lo ejerce. `condition` se
        // descarta igual que en ModRepository: C1-declarado, no gate de esta familia.
        if (stat.max_stacks) {
          modifiers.push({
            id: `arcane:${uniqueName}:s${statIdx}:v${valIdx}:${upgradeEntry.attr}`,
            source_id: `Arcane:${uniqueName}`,
            target_entity: targetId,
            target_channel: upgradeEntry.target_channel,
            target_attribute: upgradeEntry.attr,
            operation: 'STACK_DECAY_BUFF',
            value: value / stat.max_stacks,
            stack_decay_factors: { stacks_var: `stack_decay:${uniqueName}`, cap: stat.max_stacks },
          });
          return;
        }

        modifiers.push(makeModifier(
          {
            id: `arcane:${uniqueName}:s${statIdx}:v${valIdx}:${upgradeEntry.attr}`,
            source_id: `Arcane:${uniqueName}`,
            target_entity: targetId,
            target_channel: upgradeEntry.target_channel,
            target_attribute: upgradeEntry.attr,
            ...(stat.condition ? { condition: stat.condition } : {}),
          },
          upgradeEntry.op,
          value,
        ));
      });
    });

    return modifiers;
  }
}
