import { useState } from "react";

export interface FilterCategory {
    key: string;
    label: string;
    icon: string;
    subcategories?: FilterCategory[];
}

export interface ViewFilterConfig {
    categories: FilterCategory[];
}

export const useViewFilter = (config: ViewFilterConfig) => {
    const [selected, setSelected] = useState<string>(config.categories[0]?.key ?? "All");
    const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);

    const selectedCategory = config.categories.find((c) => c.key === selected) ?? null;
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