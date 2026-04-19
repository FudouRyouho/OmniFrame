import { createContext, useContext, useState, type ReactNode } from "react";
import type { FilterState, OrderDirection } from "@shared/components/filters/types";

const ArsenalSwapContext = createContext<FilterState | null>(null);

export const ArsenalSwapProvider = ({ children }: { children: ReactNode }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState<OrderDirection>("A-Z");

  return (
    <ArsenalSwapContext.Provider
      value={{ hovered, setHovered, search, setSearch, order, setOrder }}
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
