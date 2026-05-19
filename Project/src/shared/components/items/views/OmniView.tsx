import React from "react";
import { useFilterContext } from "../../filters/context";
import { useItemsFilters } from "@domains/equipment/hooks/use-items-filters";
import { useLocation } from "react-router";
import { useItems } from "@shared/hooks/data/use-items";
import WarframesView from "./WarframesView";
import WeaponsView from "./WeaponsView";
import ArcanesView from "./ArcanesView";
import ModsView from "./ModsView";
import CompanionsView from "./CompanionsView";
import VehiclesView from "./VehiclesView";
import ArchwingWeaponsView from "./ArchwingWeaponsView";

interface ViewConfig {
  categories: any;
  View: React.ComponentType<any>;
}

const viewConfigs: Record<string, ViewConfig> = {
  // Entidades principales
  warframe: { categories: "warframe", View: WarframesView },
  weapon: { categories: ["primary", "secondary", "melee"], View: WeaponsView },
  arcane: { categories: "arcane", View: ArcanesView },
  mod: { categories: "mod", View: ModsView },
  companion: { categories: "companion", View: CompanionsView },
  vehicle: { categories: ["necramech", "archwing"], View: VehiclesView },
  "archwing-weapon": {
    categories: ["archgun", "archmelee"],
    View: ArchwingWeaponsView,
  },

  // Categorías de Arsenal (Granulares)
  primary: { categories: "primary", View: WeaponsView },
  secondary: { categories: "secondary", View: WeaponsView },
  melee: { categories: "melee", View: WeaponsView },
};

interface OmniViewProps {
  onClick: (item: any) => void;
  basePath: string;
  forcedCategory?: string;
  [key: string]: any;
}

/**
 * OmniView — Orquestador central de vistas de ítems (@shared).
 * Resuelve la categoría basada en la URL, carga los datos y renderiza la vista correspondiente.
 */
export const OmniView = ({
  onClick,
  basePath,
  forcedCategory,
  ...props
}: OmniViewProps) => {
  const { pathname } = useLocation();
  const filterState = useFilterContext();

  // Prioridad: 1. forcedCategory, 2. Inferencia por URL
  const activeKey =
    forcedCategory ||
    Object.keys(viewConfigs).find((key) =>
      pathname.startsWith(`${basePath}/${key}`),
    );

  const config = activeKey ? viewConfigs[activeKey] : null;

  // Resetear filtros cuando cambia la categoría (ej: de weapons a warframes)
  React.useEffect(() => {
    if (activeKey) {
      filterState.setCategory("all");
      filterState.setFamily("all");
      filterState.setSearch("");
    }
  }, [activeKey]);

  // Carga de datos centralizada
  const { data, isLoading } = useItems(config?.categories || []);

  const { filteredItems } = useItemsFilters({
    items: data,
    initial_category: filterState.category as any,
    initial_family: filterState.family as any,
    search: filterState.search,
    order: filterState.order as any,
  });

  if (!config) {
    return (
      <div className="h-full flex items-center justify-center opacity-20 text-[11px] uppercase tracking-[0.3em]">
        Select a category
      </div>
    );
  }

  const { View } = config;

  return (
    <View
      items={filteredItems}
      isLoading={isLoading}
      onClick={onClick}
      {...props}
    />
  );
};

export default OmniView;
