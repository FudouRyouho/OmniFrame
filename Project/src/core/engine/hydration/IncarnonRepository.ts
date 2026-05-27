/**
 * @domain Engine / Hydration
 * @status en-desarrollo
 */
import type { Modifier, EntityId } from "../contracts";
import { isUpgrade, UPGRADE_MAP, resolveToken } from "@shared/types/modifier";

type PerkModifierRaw = {
  upgrade_type: string | null;
  value?: number;
  note?: string;
};

type IncarnonData = Record<string, {
  evolutions: Record<string, Record<string, PerkModifierRaw[]>>;
}>;

export class IncarnonRepository {
  private static data: IncarnonData = {};

  public static load(data: IncarnonData): void {
    this.data = data;
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
    const weaponData = this.data[uniqueName];
    if (!weaponData?.evolutions) return [];

    const modifiers: Modifier[] = [];

    Object.entries(evolutionPerks).forEach(([tierStr, perkId]) => {
      const rawMods = weaponData.evolutions[tierStr]?.[perkId];
      if (!Array.isArray(rawMods)) return;

      rawMods.forEach((rawMod) => {
        if (!rawMod.upgrade_type) return;

        const token = rawMod.upgrade_type;
        const entry = isUpgrade(token)
          ? (UPGRADE_MAP[token] ?? resolveToken(token))
          : undefined;

        if (!entry) {
          console.warn(`[Incarnon] upgrade_type sin mapeo: ${token} (${uniqueName})`);
          return;
        }

        modifiers.push({
          id: `incarnon:${uniqueName}:t${tierStr}:${perkId}:${entry.attr}`,
          target_entity: targetId,
          target_attribute: entry.attr,
          operation: entry.op,
          value: rawMod.value ?? 0,
        });
      });
    });

    return modifiers;
  }
}
