import { Outlet } from "react-router";
import { EquipmentProvider, useEquipment } from "./context/EquipmentContext";
import OmniToolbar from "@shared/components/filters/OmniToolbar";
import { FilterProvider } from "@shared/components/filters/context";
import type { ToolbarTab } from "@shared/components/filters/types";

// Toolbars específicas
import WarframesToolbar from "@shared/components/filters/toolbars/WarframesToolbar";
import WeaponsToolbar from "@shared/components/filters/toolbars/WeaponsToolbar";
import CompanionsToolbar from "@shared/components/filters/toolbars/CompanionsToolbar";
import ModsToolbar from "@shared/components/filters/toolbars/ModsToolbar";
import ArcanesToolbar from "@shared/components/filters/toolbars/ArcanesToolbar";
import VehiclesToolbar from "@shared/components/filters/toolbars/VehiclesToolbar";
import ArchwingWeaponsToolbar from "@shared/components/filters/toolbars/ArchwingWeaponsToolbar";

const BASE = "/equipment";

const tabs: ToolbarTab[] = [
  { path: `${BASE}/warframes`, label: "Warframes", icon: "/assets/ui/Category/Warframe.png" },
  { path: `${BASE}/weapons`, label: "Weapons", icon: "/assets/ui/Category/Primary.png" },
  { path: `${BASE}/companions`, label: "Companions", icon: "/assets/ui/Category/Sentinel.png" },
  { path: `${BASE}/mods`, label: "Mods", icon: "/assets/ui/Category/Mod.png" },
  { path: `${BASE}/arcanes`, label: "Arcanes", icon: "/assets/ui/Category/Arcane.png" },
  { path: `${BASE}/vehicles`, label: "Vehicles", icon: "/assets/ui/Category/Archwing.png" },
  { path: `${BASE}/archwing-weapons`, label: "Archwing Weapons", icon: "/assets/ui/Category/Archgun.png" },
];

const toolbarMap: Record<string, React.ReactNode> = {
  [`${BASE}/warframes`]: <WarframesToolbar />,
  [`${BASE}/weapons`]: <WeaponsToolbar />,
  [`${BASE}/companions`]: <CompanionsToolbar />,
  [`${BASE}/mods`]: <ModsToolbar />,
  [`${BASE}/arcanes`]: <ArcanesToolbar />,
  [`${BASE}/vehicles`]: <VehiclesToolbar />,
  [`${BASE}/archwing-weapons`]: <ArchwingWeaponsToolbar />,
};

const EquipmentLayoutContent = () => {
  const equipmentState = useEquipment();

  return (
    <FilterProvider value={equipmentState}>
      <div className="h-full flex flex-col overflow-hidden">
        <OmniToolbar tabs={tabs} toolbarMap={toolbarMap} />
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </FilterProvider>
  );
};

const EquipmentLayout = () => {
  return (
    <EquipmentProvider>
      <EquipmentLayoutContent />
    </EquipmentProvider>
  );
};

export default EquipmentLayout;
