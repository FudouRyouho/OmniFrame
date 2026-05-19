import type { Mod } from "@shared/types";

/**
 * All known mod_class values from the dataset.
 * Each maps to a `data-*` attribute used for CSS targeting in mods.css.
 */
export type ModClass =
  | "amalgam"
  | "antivirus"
  | "archon"
  | "galvanized"
  | "madurai"
  | "naramon"
  | "peculiar"
  | "potency"
  | "primed"
  | "requiem"
  | "riven"
  | "unairu"
  | "vazarin"
  | "zenurik";

/**
 * Rarity values used for base data-state flags (only when no special class
 * overrides the visual hierarchy).
 */
export type ModRarity = "common" | "uncommon" | "rare" | "legendary";

/**
 * Classes that use "large frame" assets and need the expanded-state
 * description container to grow via flex (group-data-hover:grow).
 */
export const LARGE_FRAME_CLASSES: ReadonlySet<ModClass> = new Set([
  "amalgam",
  "antivirus",
  "archon",
  "galvanized",
  "requiem",
  "riven",
  "madurai",
  "zenurik",
  "vazarin",
  "naramon",
  "unairu",
]);

/**
 * Derives the lowercased mod_class string, or undefined if absent / blank.
 */
export const getModClass = (mod: Mod): ModClass | undefined => {
  const raw = mod.mod_class?.trim().toLowerCase();
  return raw ? (raw as ModClass) : undefined;
};

/**
 * Derives the lowercased rarity string, or undefined if absent.
 */
export const getModRarity = (mod: Mod): ModRarity | undefined => {
  return (mod.rarity?.toLowerCase() as ModRarity) ?? undefined;
};

/**
 * Returns the full data-state object for useDataState().
 * Special classes suppress the base rarity flags to avoid visual conflicts.
 */
export const getModDataState = (
  mod: Mod,
  hover: boolean,
  selected: boolean,
): Record<string, boolean> => {
  const modClass = getModClass(mod);
  const rarity = getModRarity(mod);

  const isFocus =
    modClass === "madurai" ||
    modClass === "zenurik" ||
    modClass === "vazarin" ||
    modClass === "naramon" ||
    modClass === "unairu";

  // Special classes that COMPLETELY override base rarity visuals
  const hasOverridingClass =
    modClass === "amalgam" ||
    modClass === "archon" ||
    modClass === "galvanized" ||
    modClass === "riven" ||
    modClass === "requiem";

  return {
    hover,
    selected,
    // Base rarities fire if no override, OR if it's a Focus mod (which uses rarity internally)
    common: rarity === "common" && (!hasOverridingClass || isFocus),
    uncommon: rarity === "uncommon" && (!hasOverridingClass || isFocus),
    rare: rarity === "rare" && (!hasOverridingClass || isFocus),
    legendary: rarity === "legendary" && !hasOverridingClass,
    // Special class flags
    amalgam: modClass === "amalgam",
    antivirus: modClass === "antivirus",
    archon: modClass === "archon",
    galvanized: modClass === "galvanized",
    madurai: modClass === "madurai",
    naramon: modClass === "naramon",
    peculiar: modClass === "peculiar",
    potency: modClass === "potency",
    primed: modClass === "primed",
    requiem: modClass === "requiem",
    riven: modClass === "riven",
    unairu: modClass === "unairu",
    vazarin: modClass === "vazarin",
    zenurik: modClass === "zenurik",
    focus: isFocus,
  };
};

/**
 * Returns true when the mod's description container should grow on hover
 * (i.e., for large-frame mod classes that need the extra vertical space).
 */
export const needsExpandedDescription = (mod: Mod): boolean => {
  const modClass = getModClass(mod);
  if (!modClass) return false;
  return LARGE_FRAME_CLASSES.has(modClass);
};
