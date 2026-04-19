import { useState } from "react";
import type { ViewFilterConfig } from "../types";

/**
 * Hook que encapsula la lógica de selección de categorías y subcategorías
 * dentro de una Toolbar específica.
 */
export const useFilterLogic = (config: ViewFilterConfig) => {
  const [selected, setSelected] = useState<string>(
    config.categories[0]?.key ?? "All"
  );
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(
    null
  );

  const selectedCategory =
    config.categories.find((c) => c.key === selected) ?? null;
  const hasSubcategories = (selectedCategory?.subcategories?.length ?? 0) > 0;

  const selectCategory = (key: string) => {
    setSelected(key);
    setActiveSubcategory(null); // reset subcategoría al cambiar categoría principal
  };

  return {
    categories: config.categories,
    selected,
    selectCategory,
    activeSubcategory,
    setActiveSubcategory,
    selectedCategory,
    hasSubcategories,
  };
};
