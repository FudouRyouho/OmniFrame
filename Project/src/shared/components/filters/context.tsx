import { createContext, useContext, type ReactNode } from "react";
import type { FilterState } from "./types";

const FilterContext = createContext<FilterState | null>(null);

/**
 * Proveedor genérico para el sistema de filtros.
 * Se utiliza para inyectar el estado (search, order, hover) que la Toolbar
 * y sus botones consumirán.
 */
export const FilterProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: FilterState;
}) => {
  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
};

export const useFilterContext = () => {
  const ctx = useContext(FilterContext);
  if (!ctx) {
    throw new Error("useFilterContext must be used within a FilterProvider");
  }
  return ctx;
};
