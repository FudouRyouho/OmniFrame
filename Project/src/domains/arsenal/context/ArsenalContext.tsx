import { createContext, useContext, useState, type ReactNode } from "react";

interface ArsenalContextState {
  activeSlot: string | null;
  configSlot: "A" | "B" | "C";
  setActiveSlot: (slot: string | null) => void;
  setConfigSlot: (config: "A" | "B" | "C") => void;
}

const ArsenalContext = createContext<ArsenalContextState | null>(null);

/**
 * ArsenalProvider — Maneja el estado de sesión y navegación del Arsenal.
 * Separa la interacción de la UI del dato puro del motor.
 */
export const ArsenalProvider = ({ children }: { children: ReactNode }) => {
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [configSlot, setConfigSlot] = useState<"A" | "B" | "C">("A");

  return (
    <ArsenalContext.Provider
      value={{
        activeSlot,
        configSlot,
        setActiveSlot,
        setConfigSlot,
      }}
    >
      {children}
    </ArsenalContext.Provider>
  );
};

export const useArsenal = () => {
  const ctx = useContext(ArsenalContext);
  if (!ctx) {
    throw new Error("useArsenal must be used within an ArsenalProvider");
  }
  return ctx;
};
