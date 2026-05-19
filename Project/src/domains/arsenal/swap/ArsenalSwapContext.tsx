import { createContext, useContext, useState, type ReactNode } from "react";
import type { FilterState, OrderDirection } from "@shared/components/filters/types";

const ArsenalSwapContext = createContext<FilterState | null>(null);

export const ArsenalSwapProvider = ({ children }: { children: ReactNode }) => {
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
    <ArsenalSwapContext.Provider
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
    </ArsenalSwapContext.Provider>
  );
};


export const useArsenalSwap = () => {
  const ctx = useContext(ArsenalSwapContext);
  if (!ctx) {
    throw new Error("useArsenalSwap must be used within a ArsenalSwapProvider");
  }
  return ctx;
};
