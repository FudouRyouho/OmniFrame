import { useParams } from "react-router";
import { ArsenalSwapProvider, useArsenalSwap } from "./ArsenalSwapContext";
import { FilterProvider } from "@shared/components/filters/context";
import OmniToolbar from "@shared/components/filters/OmniToolbar";

// Toolbars específicas (reutilizadas)
import WarframesToolbar from "@shared/components/filters/toolbars/WarframesToolbar";
import WeaponsToolbar from "@shared/components/filters/toolbars/WeaponsToolbar";
import ModsToolbar from "@shared/components/filters/toolbars/ModsToolbar";
// ... otras que se necesiten en el futuro

/**
 * Vista de selección de entidad para un slot del Arsenal (Swap).
 */
const ArsenalSwapContent = () => {
  const { category } = useParams<{ category: string }>();
  const swapState = useArsenalSwap();

  const BASE = "/arsenal/swap";

  const toolbarMap: Record<string, React.ReactNode> = {
    [`${BASE}/warframe`]: <WarframesToolbar />,
    [`${BASE}/primaryWeapon`]: <WeaponsToolbar />,
    [`${BASE}/secondaryWeapon`]: <WeaponsToolbar />,
    [`${BASE}/meleeWeapon`]: <WeaponsToolbar />,
    [`${BASE}/mods`]: <ModsToolbar />,
  };

  return (
    <FilterProvider value={swapState}>
      <div className="h-full w-full flex flex-col px-4 py-3 gap-4 overflow-hidden">
        {/* Usamos OmniToolbar sin los tabs superiores en el modo Swap */}
        <OmniToolbar showTabs={false} toolbarMap={toolbarMap} />

        {/* Placeholder del catálogo */}
        <div className="flex-1 flex items-center justify-center text-[11px] uppercase tracking-[0.2em] text-ui-primary/30 border-square">
          Catálogo · {category} · pendiente de implementación
        </div>
      </div>
    </FilterProvider>
  );
};

export default function ArsenalSwapView() {
  return (
    <ArsenalSwapProvider>
      <ArsenalSwapContent />
    </ArsenalSwapProvider>
  );
}
