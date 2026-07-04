/**
 * @domain Engine / Hydration
 * @status en-desarrollo
 */
import type { Modifier, EntityId } from "../../contracts";
import type { ConditionInput } from "@shared/types/condition";
import { resolveUpgradeEntry } from "@shared/types/modifier";

type PerkModifierRaw = {
  upgrade_type: string | null;
  base_value?: number | Record<string, number>;
  condition?: ConditionInput;
  note?: string;
};

type PerkObject = {
  image_name?:  string;
  description?: string;
  notes?:       string[];
  stats:        PerkModifierRaw[];
};

type PerkData = PerkModifierRaw[] | PerkObject;

type GenesisEntry = {
  weapons: string | Record<string, string>;
  evolutions: Record<string, Record<string, PerkData>>;
};

type IncarnonRawData = Record<string, GenesisEntry>;

type WeaponEntry = {
  alias: string | null;
  evolutions: Record<string, Record<string, PerkData>>;
};

export class IncarnonRepository {
  private static index: Map<string, WeaponEntry> = new Map();

  public static load(data: IncarnonRawData): void {
    this.index.clear();
    for (const entry of Object.values(data)) {
      const { weapons, evolutions } = entry;
      if (typeof weapons === "string") {
        this.index.set(weapons, { alias: null, evolutions });
      } else {
        for (const [alias, uid] of Object.entries(weapons)) {
          this.index.set(uid, { alias, evolutions });
        }
      }
    }
  }

  /**
   * Resuelve los perks de evolución seleccionados a un array de Modifier[].
   * Los perks con upgrade_type: null son gaps documentados — se omiten sin warning.
   */
  public static getModifiers(
    uniqueName: string,
    evolutionPerks: Record<number, string>,
    targetId: EntityId
  ): Modifier[] {
    const entry = this.index.get(uniqueName);
    if (!entry) return [];

    const modifiers: Modifier[] = [];

    Object.entries(evolutionPerks).forEach(([tierStr, perkId]) => {
      const perkData = entry.evolutions[tierStr]?.[perkId];
      const rawMods: PerkModifierRaw[] = Array.isArray(perkData)
        ? perkData
        : (perkData as PerkObject | undefined)?.stats ?? [];
      if (rawMods.length === 0) return;

      rawMods.forEach((rawMod) => {
        if (!rawMod.upgrade_type) return;

        const token = rawMod.upgrade_type;
        const upgradeEntry = resolveUpgradeEntry(token);

        if (!upgradeEntry) {
          console.warn(`[Incarnon] upgrade_type sin mapeo: ${token} (${uniqueName})`);
          return;
        }

        const raw = rawMod.base_value ?? 0;
        const rawValue =
          typeof raw === "object"
            ? (entry.alias !== null ? (raw[entry.alias] ?? 0) : 0)
            : raw;
        const value = upgradeEntry.toPercent ? (rawValue - 1) * 100 : rawValue;

        modifiers.push({
          id: `incarnon:${uniqueName}:t${tierStr}:${perkId}:${upgradeEntry.attr}`,
          target_entity: targetId,
          target_attribute: upgradeEntry.attr,
          operation: upgradeEntry.op,
          value,
          ...(upgradeEntry.co_factors ? { co_factors: upgradeEntry.co_factors } : {}),
          ...(rawMod.condition ? { condition: rawMod.condition } : {}),
        });
      });
    });

    return modifiers;
  }
}
