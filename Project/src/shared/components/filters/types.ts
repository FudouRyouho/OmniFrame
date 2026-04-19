export interface FilterCategory {
  key: string;
  label: string;
  icon: string;
  subcategories?: FilterCategory[];
}

export interface ViewFilterConfig {
  categories: FilterCategory[];
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
  hovered: string | null;
  setHovered: (label: string | null) => void;
}

/**
 * Configuración para una pestaña de navegación en la Toolbar.
 */
export interface ToolbarTab {
  path: string;
  label: string;
  icon: string;
}
