import { createContext, useContext, useState, type ReactNode } from "react";

interface EquipmentContextValue {
    // Label que se muestra en la toolbar (hover o selected activo)
    hovered: string | null;
    setHovered: (label: string | null) => void;

    // Búsqueda y orden — compartidos entre toolbar y vistas
    search: string;
    setSearch: (s: string) => void;
    order: "A-Z" | "Z-A";
    setOrder: (o: "A-Z" | "Z-A") => void;
}

const EquipmentContext = createContext<EquipmentContextValue | null>(null);

export const EquipmentProvider = ({ children }: { children: ReactNode }) => {
    const [hovered, setHovered] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [order, setOrder] = useState<"A-Z" | "Z-A">("A-Z");

    return (
        <EquipmentContext.Provider value={{ hovered, setHovered, search, setSearch, order, setOrder }}>
            {children}
        </EquipmentContext.Provider>
    );
};

export const useEquipment = () => {
    const ctx = useContext(EquipmentContext);
    if (!ctx) throw new Error("useEquipment must be used within EquipmentProvider");
    return ctx;
};
