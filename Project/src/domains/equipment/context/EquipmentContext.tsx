import { createContext, useContext, useState, type ReactNode } from "react";
import type { FilterState, OrderDirection } from "@shared/components/filters/types";

const EquipmentContext = createContext<FilterState | null>(null);

export const EquipmentProvider = ({ children }: { children: ReactNode }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState<OrderDirection>("A-Z");
  const [category, setCategory] = useState<string>("all");
  const [family, setFamily] = useState<string>("all");

  const resetFilters = () => {
    setSearch("");
    setOrder("A-Z");
    setCategory("all");
    setFamily("all");
    setHovered(null);
  };

  return (
    <EquipmentContext.Provider
      value={{ 
        hovered, setHovered, 
        search, setSearch, 
        order, setOrder,
        category, setCategory,
        family, setFamily,
        resetFilters
      }}
    >
      {children}
    </EquipmentContext.Provider>
  );
};


export const useEquipment = () => {
    const ctx = useContext(EquipmentContext);
    if (!ctx) throw new Error("useEquipment must be used within EquipmentProvider");
    return ctx;
};
