export interface FilterCategory<K extends string = string, S extends string = string> {
  key: K;
  label: string;
  icon: string;
  subcategories?: FilterCategory<S, S>[];
}

export interface ViewFilterConfig<K extends string = string, S extends string = string> {
  categories: FilterCategory<K, S>[];
}

export type OrderDirection = "A-Z" | "Z-A";

/**
 * Estado core que cualquier Toolbar debe manejar.
 */
export interface FilterState {
  search: string;
  setSearch: (s: string) => void;
  order: OrderDirection;
  setOrder: (o: OrderDirection) => void;
  category: string;
  setCategory: (c: string) => void;
  family: string;
  setFamily: (f: string) => void;
  hovered: string | null;
  setHovered: (label: string | null) => void;
  resetFilters: () => void;
}


/**
 * Configuración para una pestaña de navegación en la Toolbar.
 */
export interface ToolbarTab {
  path: string;
  label: string;
  icon: string;
}
