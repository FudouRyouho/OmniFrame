import { Link, useLocation } from "react-router";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { useDataState } from "@providers/DataState/data-state-context";
import { useFilterContext } from "./context";
import type { ToolbarTab, OrderDirection } from "./types";

interface OmniToolbarProps {
  tabs?: ToolbarTab[];
  toolbarMap?: Record<string, React.ReactNode>;
  showTabs?: boolean;
}

const orderList: OrderDirection[] = ["A-Z", "Z-A"];

/**
 * OmniToolbar: Sistema de navegación y filtrado genérico.
 * Se desacopla de los dominios específicos consumiendo FilterContext.
 */
const OmniToolbar = ({
  tabs = [],
  toolbarMap = {},
  showTabs = true,
}: OmniToolbarProps) => {
  const { pathname } = useLocation();
  const { hovered, search, setSearch, order, setOrder, setHovered } =
    useFilterContext();

  // Encontrar la clave activa para los filtros dinámicos (Fila 3)
  const activeKey =
    Object.keys(toolbarMap).find((key) => pathname.startsWith(key)) ?? null;

  // Label visible: hover activo o label de la pestaña actual
  const activeTab = tabs.find((t) => pathname.startsWith(t.path));
  const displayLabel = hovered ?? activeTab?.label ?? null;

  return (
    <div>
      {/* Fila 1 — hover label / status */}
      <div className="px-2 py-1 text-xs text-ui-accent uppercase tracking-widest min-h-5">
        {displayLabel}
      </div>

      {/* Fila 2 — navegación (opcional) | orden + búsqueda */}
      <div className="flex items-center justify-between gap-2 px-2">
        <nav className="flex items-center gap-2">
          {showTabs &&
            tabs.map((tab) => {
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
                    className="w-4 h-4 inline align-middle opacity-80"
                  />
                </Link>
              );
            })}
        </nav>

        <div className="flex items-center gap-2">
          {/* Ordenamiento */}
          <Listbox value={order} onChange={setOrder}>
            <ListboxButton className="w-16 px-4 py-1 border-b border-ui-primary text-xs outline-none cursor-pointer">
              {order}
            </ListboxButton>
            <ListboxOptions className="w-(--button-width) z-50" anchor="bottom">
              {orderList.map((o) => (
                <div
                  key={o}
                  className="group border border-transparent hover:border-ui-primary/40 hover:border-b-ui-accent bg-black/80 backdrop-blur-sm"
                >
                  <ListboxOption
                    className="px-2 py-1 text-ui-primary hover:text-ui-accent cursor-pointer bg-black/30 hover:bg-linear-to-t hover:from-ui-accent/60 hover:via-ui-accent/20 hover:to-transparent hover:to-70%"
                    value={o}
                  >
                    <span className="text-xs">{o}</span>
                  </ListboxOption>
                </div>
              ))}
            </ListboxOptions>
          </Listbox>

          {/* Búsqueda */}
          <input
            placeholder="SEARCH..."
            className="px-2 py-1 border-b border-ui-primary text-xs outline-none bg-transparent transition-all focus:border-ui-accent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Fila 3 — filtros dinámicos específicos */}
      <div className="flex items-center gap-2 px-2 py-1 min-h-[36px]">
        {activeKey && toolbarMap[activeKey]}
      </div>
    </div>
  );
};

export default OmniToolbar;
