import { useState, useMemo } from "react";
import type { BaseItem, Kind, Mod, ModCategory } from "@lib/types";

/**
 * Tipos de ordenamiento soportados.
 * Se mantienen alineados con lo que espera InventoryToolbar.
 */
export type SortOrder = "A-Z" | "Z-A" | "Newest" | "Oldest";

type Category = Kind | "all";
type SubCategory = ModCategory | "robotic" | "beast" | "all";

/**
 * Filtros de compañero que operan sobre compatName en lugar de category.
 * 'robotic' → compatName incluye ROBOTIC, Sentinel, Moa, Hound (y específicos)
 * 'beast'   → compatName incluye BEAST, Kavat, Kubrow, PREDASITE, VULPAPHYLA (y específicos)
 */
const ROBOTIC_COMPAT = new Set(['ROBOTIC', 'Sentinel', 'Moa', 'Hound']);
const BEAST_COMPAT   = new Set(['BEAST', 'Kavat', 'Kubrow', 'PREDASITE', 'VULPAPHYLA',
  'Helminth Charger',
  'Adarza Kavat', 'Smeeta Kavat', 'Vasca Kavat',
  'Chesa Kubrow', 'Huras Kubrow', 'Raksa Kubrow', 'Sahasa Kubrow', 'Sunika Kubrow',
  'Medjay Predasite', 'Pharaoh Predasite', 'Vizier Predasite',
  'Crescent Vulpaphyla', 'Panzer Vulpaphyla', 'Sly Vulpaphyla',
]);

interface UseItemsFiltersProps {
  items: BaseItem[];
  initialCategory?: Category;
  initialSubCategory?: SubCategory;
  /** Kinds to exclude from results regardless of category filter (e.g. ['mod']) */
  excludeKinds?: Kind[];
  /** ModCategories to exclude (e.g. ['riven', 'focus']) */
  excludeSubCategories?: ModCategory[];
  limit?: number;
}

/**
 * Hook para gestionar el filtrado, búsqueda y ordenamiento de items.
 * Soporta filtrado por kind (equipment) y por category (mods).
 *
 * SubCategory especiales para compañeros:
 * - 'robotic' → filtra por compatName dentro del grupo robótico
 * - 'beast'   → filtra por compatName dentro del grupo bestia
 * Ambos operan sobre mods con category === 'companion'.
 */
export const useItemsFilters = ({
  items,
  initialCategory = "all",
  initialSubCategory = "all",
  excludeKinds = [],
  excludeSubCategories = [],
  limit = 400,
}: UseItemsFiltersProps) => {
  const [category, setCategory] = useState<Category>(initialCategory);
  const [subCategory, setSubCategory] = useState<SubCategory>(initialSubCategory);
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState<SortOrder>("A-Z");
  const [selected, setSelected] = useState<BaseItem | null>(null);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    const base = items.filter((item) => {
      const matchCategory = category === "all" || item.kind === category;
      const matchSearch = !query || item.name.toLowerCase().includes(query);
      const matchExclude = excludeKinds.length === 0 || !excludeKinds.includes(item.kind);

      // SubCategory filter — aplica solo a mods
      if (item.kind !== 'mod') {
        return matchCategory && matchSearch && matchExclude;
      }

      const mod = item as Mod;
      const modCategory = mod.category;

      const matchExcludeSub = excludeSubCategories.length === 0
        || !excludeSubCategories.includes(modCategory);

      // Filtros de grupo de compañero — operan sobre compatName
      if (subCategory === 'robotic') {
        const compat = mod.compatName ?? '';
        const matchRobotic = modCategory === 'companion'
          && (ROBOTIC_COMPAT.has(compat) || compat === 'COMPANION');
        return matchCategory && matchSearch && matchExclude && matchExcludeSub && matchRobotic;
      }

      if (subCategory === 'beast') {
        const compat = mod.compatName ?? '';
        const matchBeast = modCategory === 'companion'
          && (BEAST_COMPAT.has(compat) || compat === 'COMPANION');
        return matchCategory && matchSearch && matchExclude && matchExcludeSub && matchBeast;
      }

      const matchSubCategory = subCategory === "all" || modCategory === subCategory;
      return matchCategory && matchSearch && matchExclude && matchSubCategory && matchExcludeSub;
    });

    const sorted = [...base].sort((a, b) => {
      switch (order) {
        case "A-Z": return a.name.localeCompare(b.name);
        case "Z-A": return b.name.localeCompare(a.name);
        case "Newest": return b.id.localeCompare(a.id);
        case "Oldest": return a.id.localeCompare(b.id);
        default: return 0;
      }
    });

    return sorted.slice(0, limit);
  }, [items, category, subCategory, search, order, excludeKinds, excludeSubCategories, limit]);

  return {
    category,
    subCategory,
    search,
    order,
    selected,
    filteredItems,
    setCategory,
    setSubCategory,
    setSearch,
    setOrder,
    setSelected,
    resetFilters: () => {
      setCategory("all");
      setSubCategory("all");
      setSearch("");
      setOrder("A-Z");
    },
  };
};
