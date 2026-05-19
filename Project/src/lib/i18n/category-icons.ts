/**
 * category-icons.ts
 *
 * Mapa canónico de categoría de item → { icon, label }
 * Patrón idéntico a damage-labels.ts / IconDamageType.tsx.
 *
 * Cubre todas las categorías — incluyendo las que no tienen icono disponible aún ('').
 * El componente consumidor decide si renderiza o no según el valor de icon.
 *
 * Usos: FilterBar, ItemCard, tooltips, breadcrumbs — cualquier cosa que
 * necesite representar una categoría visualmente.
 */

export type ItemCategory =
  // Equipment
  | "warframe"
  | "primary"
  | "secondary"
  | "melee"
  // Mods — compañeros (primera iteración del builder)
  | "companion" // universal — todos los compañeros
  | "robotic" // grupo — Sentinel, Moa, Hound
  | "beast" // grupo — Kubrow, Kavat, Predasite, Vulpaphyla
  // Mods — sistemas especiales (excluidos en primera iteración)
  | "archgun"
  | "archmelee"
  | "archwing"
  | "focus"
  | "railjack"
  | "necramech"
  | "kdrive"
  | "parazon"
  | "tektolyst"
  | "modset"
  | "transmutation"
  | "peculiar"
  | "riven"
  | "unknown";

export const categoryIconMap: Record<
  ItemCategory,
  { icon: string; label: string }
> = {
  // Equipment
  warframe: { icon: "/assets/ui/Category/Warframe.png", label: "Warframe" },
  primary: { icon: "/assets/ui/Category/Primary.png", label: "Primary" },
  secondary: { icon: "/assets/ui/Category/Secondary.png", label: "Secondary" },
  melee: { icon: "/assets/ui/Category/Melee.png", label: "Melee" },
  // Mods — compañeros
  companion: { icon: "/assets/ui/Category/Sentinel.png", label: "Companion" },
  robotic: { icon: "/assets/ui/Category/Robotic.png", label: "Robotic" },
  beast: { icon: "/assets/ui/Category/Beast.png", label: "Beast" },
  // Mods — sistemas especiales
  archgun: { icon: "/assets/ui/Category/ArchGun.png", label: "Arch-Gun" },
  archmelee: { icon: "/assets/ui/Category/ArchMelee.png", label: "Arch-Melee" },
  archwing: { icon: "/assets/ui/Category/Archwing.png", label: "Archwing" },
  focus: { icon: "/assets/ui/Category/Focus.png", label: "Focus" },
  railjack: { icon: "/assets/ui/Category/Railjack.png", label: "Railjack" },
  necramech: { icon: "/assets/ui/Category/Necramech.png", label: "Necramech" },
  kdrive: { icon: "/assets/ui/Category/KDrive.png", label: "K-Drive" },
  parazon: { icon: "/assets/ui/Category/Parazon.png", label: "Parazon" },
  tektolyst: { icon: "", label: "Tektolyst" },
  modset: { icon: "", label: "Mod Set" },
  transmutation: { icon: "", label: "Transmutation" },
  peculiar: { icon: "", label: "Peculiar" },
  riven: { icon: "", label: "Riven" },
  unknown: { icon: "", label: "Unknown" },
};

export const getCategoryIcon = (category: ItemCategory) =>
  categoryIconMap[category] ?? categoryIconMap["unknown"];
