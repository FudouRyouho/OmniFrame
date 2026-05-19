import { useState, useMemo } from "react";
import type { BaseItem, ItemKind, ItemFamily } from "@shared/types";

export type SortOrder = "A-Z" | "Z-A" | "Newest" | "Oldest";

type CategoryFilter = ItemKind | string;
type FamilyFilter = ItemFamily | string;

interface UseItemsFiltersProps {
  items: BaseItem[];
  initial_category?: CategoryFilter;
  initial_family?: FamilyFilter;
  search?: string;
  order?: SortOrder;
  exclude_kinds?: ItemKind[];
  exclude_families?: ItemFamily[];
  limit?: number;
}


export const useItemsFilters = ({
  items,
  initial_category = "all",
  initial_family = "all",
  search: externalSearch = "",
  order: externalOrder = "A-Z",
  exclude_kinds = [],
  exclude_families = [],
  limit = 400,
}: UseItemsFiltersProps) => {
  const [selected, setSelected] = useState<BaseItem | null>(null);

  const filteredItems = useMemo(() => {
    const query = externalSearch.trim().toLowerCase();

    // Función de coincidencia semántica
    const matchSemantic = (filter: string, item: any) => {
      if (!filter || filter === "all") return true;
      
      const filterStr = filter.toLowerCase();

      // 1. Match estricto (Pilares Taxonómicos)
      if (item.kind && item.kind.toLowerCase() === filterStr) return true;
      if (item.family && item.family.toLowerCase() === filterStr) return true;
      if (item.domain && item.domain.toLowerCase() === filterStr) return true;

      // 2. Match con Playstyle (Warframes)
      if (item.playstyle && Array.isArray(item.playstyle)) {
        if (item.playstyle.some((p: string) => p.toLowerCase() === filterStr)) return true;
      }

      // 3. Match con Compatibilidad (Mods/Arcanos)
      if (item.compat_name) {
        const compat = item.compat_name.toLowerCase();
        if (compat === filterStr) return true;
        
        // Agrupaciones para Arcanos
        if (filterStr === "primary" && (compat === "shotgun" || compat === "bow")) return true;
        if (filterStr === "melee" && compat === "zaw") return true;
        if (filterStr === "operator" && compat === "amp") return true;
      }
      if (item.mod_class && item.mod_class.toLowerCase() === filterStr) return true;

      // 4. Match con Tags
      if (item.tags && Array.isArray(item.tags)) {
        if (item.tags.some((t: string) => t.toLowerCase() === filterStr || t.toLowerCase().includes(filterStr))) return true;
      }

      // 5. Hardcodes / Edge cases semánticos
      if (filterStr === "vehicle" && (item.tags?.includes("archwing") || item.tags?.includes("necramech"))) return true;
      if (filterStr === "beast" && (item.tags?.includes("kavat") || item.tags?.includes("kubrow") || item.tags?.includes("predasite") || item.tags?.includes("vulpaphyla"))) return true;
      if (filterStr === "robotic" && (item.tags?.includes("sentinel") || item.tags?.includes("hound") || item.tags?.includes("moa"))) return true;

      if (filterStr === "light blade" && (item.tags?.includes("sword") || item.tags?.includes("dagger"))) return true;
      if (filterStr === "2h blade" && item.tags?.includes("sword")) return true;
      if (filterStr === "scythe" && item.tags?.includes("polearm")) return true;
      if (filterStr === "polearm" && item.tags?.includes("polearm")) return true;
      if (filterStr === "hammer" && item.tags?.includes("hammer")) return true;

      return false;
    };

    const base = items.filter((item) => {
      // Búsqueda de texto
      const matchSearch = !query || item.name.toLowerCase().includes(query);
      
      // Exclusiones Taxonómicas (Estas se mantienen estrictas)
      const matchExcludeKind = exclude_kinds.length === 0 || !exclude_kinds.includes(item.kind);
      const matchExcludeFamily = exclude_families.length === 0 
        || (item.family && !exclude_families.includes(item.family)) 
        || !item.family;

      // Coincidencias Semánticas
      const matchCategory = matchSemantic(initial_category, item);
      const matchFamily = matchSemantic(initial_family, item);

      return matchCategory && matchFamily && matchSearch && matchExcludeKind && matchExcludeFamily;
    });

    const sorted = [...base].sort((a, b) => {
      switch (externalOrder) {
        case "A-Z": return a.name.localeCompare(b.name);
        case "Z-A": return b.name.localeCompare(a.name);
        case "Newest": return b.id.localeCompare(a.id);
        case "Oldest": return a.id.localeCompare(b.id);
        default: return 0;
      }
    });

    return sorted.slice(0, limit);
  }, [items, initial_category, initial_family, externalSearch, externalOrder, exclude_kinds, exclude_families, limit]);

  return {
    category: initial_category,
    family: initial_family,
    search: externalSearch,
    order: externalOrder,
    selected,
    filteredItems,
    setSelected,
  };
};
