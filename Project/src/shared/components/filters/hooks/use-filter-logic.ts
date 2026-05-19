import { useState } from "react";
import type { ViewFilterConfig, FilterState } from "../types";

/**
 * Hook que encapsula la lógica de selección de categorías y subcategorías
 * dentro de una Toolbar específica y sincroniza con el estado global.
 */
export const useFilterLogic = (config: ViewFilterConfig, filterState: FilterState) => {
  const [selected, setSelected] = useState<string>(
    filterState.category !== "all" ? filterState.category : (config.categories[0]?.key ?? "All")
  );
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(
    filterState.family !== "all" ? filterState.family : null
  );

  const selectedCategory =
    config.categories.find((c) => c.key === selected) ?? null;
  const hasSubcategories = (selectedCategory?.subcategories?.length ?? 0) > 0;

  const selectCategory = (key: string) => {
    setSelected(key);
    setActiveSubcategory(null);
    filterState.setCategory(key);
    filterState.setFamily("all");
  };

  const setSubCategory = (key: string | null) => {
    setActiveSubcategory(key);
    filterState.setFamily(key ?? "all");
  };

  return {
    categories: config.categories,
    selected,
    selectCategory,
    activeSubcategory,
    setActiveSubcategory: setSubCategory,
    selectedCategory,
    hasSubcategories,
  };
};

