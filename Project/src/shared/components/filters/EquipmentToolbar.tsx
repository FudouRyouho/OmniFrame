import { Link, useLocation } from "react-router";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import WarframesToolbar from "./toolbars/WarframesToolbar";
import { useDataState } from "@providers/DataState/data-state-context";
import WeaponsToolbar from "./toolbars/WeaponsToolbar";
import CompanionsToolbar from "./toolbars/CompanionsToolbar";
import ModsToolbar from "./toolbars/ModsToolbar";
import ArcanesToolbar from "./toolbars/ArcanesToolbar";
import VehiclesToolbar from "./toolbars/VehiclesToolbar";
import ArchwingWeaponsToolbar from "./toolbars/ArchwingWeaponsToolbar";
import { useEquipment } from "src/domains/equipment/context/EquipmentContext";

const BASE = "/equipment";

const tabs = [
  {
    path: `${BASE}/warframes`,
    label: "Warframes",
    icon: "/assets/ui/Category/Warframe.png",
  },
  {
    path: `${BASE}/weapons`,
    label: "Weapons",
    icon: "/assets/ui/Category/Primary.png",
  },
  {
    path: `${BASE}/companions`,
    label: "Companions",
    icon: "/assets/ui/Category/Sentinel.png",
  },
  { path: `${BASE}/mods`, label: "Mods", icon: "/assets/ui/Category/Mod.png" },
  {
    path: `${BASE}/arcanes`,
    label: "Arcanes",
    icon: "/assets/ui/Category/Arcane.png",
  },
  {
    path: `${BASE}/vehicles`,
    label: "Vehicles",
    icon: "/assets/ui/Category/Archwing.png",
  },
  {
    path: `${BASE}/archwing-weapons`,
    label: "Archwing Weapons",
    icon: "/assets/ui/Category/Archgun.png",
  },
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

const orderList: ("A-Z" | "Z-A")[] = ["A-Z", "Z-A"];

const EquipmentToolbar = () => {
  const { pathname } = useLocation();
  const { hovered, search, setSearch, order, setOrder, setHovered } =
    useEquipment();

  const normalizedPathname = pathname.replace(/\/+$/, "") || "/";
  const isListRoute = tabs.some((tab) => normalizedPathname === tab.path);

  if (!isListRoute) {
    return null;
  }

  const activeKey =
    Object.keys(toolbarMap).find((key) => pathname.startsWith(key)) ?? null;

  // Label visible: hover activo o label de la vista actual
  const activeTab = tabs.find((t) => pathname.startsWith(t.path));
  const displayLabel = hovered ?? activeTab?.label ?? null;

  return (
    <div>
      {/* Fila 1 — hover label */}
      <div className="px-2 py-1 text-xs text-ui-accent uppercase tracking-widest min-h-5">
        {displayLabel}
      </div>

      {/* Fila 2 — tabs de navegación | orden + búsqueda */}
      <div className="flex items-center justify-between gap-2 px-2">
        <nav className="flex items-center gap-2">
          {tabs.map((tab) => {
            const ref = useDataState<HTMLAnchorElement>({
              active: pathname.startsWith(tab.path),
            });
            return (
              <Link
                className={"button-bordeless"}
                ref={ref}
                to={tab.path}
                key={tab.path}
                onMouseEnter={() => setHovered(tab.label)}
                onMouseLeave={() => setHovered(null)}
              >
                <img
                  src={tab.icon}
                  alt={tab.label}
                  className="w-4 h-4 inline align-middle"
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Listbox value={order} onChange={setOrder}>
            <ListboxButton className="w-16 px-4 py-1 border-b border-ui-primary text-xs outline-none">
              {order}
            </ListboxButton>
            <ListboxOptions className="w-(--button-width)" anchor="bottom">
              {orderList.map((o) => (
                <div
                  key={o}
                  className="group border border-transparent hover:border-ui-primary/40 hover:border-b-ui-accent bg-black/50"
                >
                  <ListboxOption
                    className="px-2 text-ui-primary hover:text-ui-accent bg-black/30 hover:bg-linear-to-t hover:from-ui-accent/60 hover:via-ui-accent/20 hover:to-transparent hover:to-70%"
                    value={o}
                  >
                    <span>{o}</span>
                  </ListboxOption>
                </div>
              ))}
            </ListboxOptions>
          </Listbox>

          <input
            placeholder="SEARCH..."
            className="px-2 py-1 border-b border-ui-primary text-xs outline-none bg-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Fila 3 — filtros dinámicos de la vista activa */}
      <div className="flex items-center gap-2 px-2 py-1">
        {activeKey && toolbarMap[activeKey]}
      </div>
    </div>
  );
};

export default EquipmentToolbar;
