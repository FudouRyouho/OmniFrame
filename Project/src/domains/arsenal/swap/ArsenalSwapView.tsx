import { useParams } from "react-router";
import { ArsenalSwapProvider, useArsenalSwap } from "./ArsenalSwapContext";
import { FilterProvider } from "@shared/components/filters/context";
import OmniToolbar from "@shared/components/filters/OmniToolbar";
import OmniView from "@shared/components/items/views/OmniView";
import { useEnsembleActions } from "@providers/Ensemble/EnsembleProvider";
import type { EnsembleChannel } from "@providers/Ensemble/ensemble.types";

// Toolbars específicas (reutilizadas)
import WarframesToolbar from "@shared/components/filters/toolbars/WarframesToolbar";
import WeaponsToolbar from "@shared/components/filters/toolbars/WeaponsToolbar";
import ModsToolbar from "@shared/components/filters/toolbars/ModsToolbar";
// ... otras que se necesiten en el futuro

/**
 * ArsenalSwapView — Vista de intercambio de ítems para el Arsenal.
 */
const ArsenalSwapContent = () => {
  const { category } = useParams<{ category: string }>();
  const swapState = useArsenalSwap();
  const { setItem } = useEnsembleActions();

  // Mapeo de categorías de URL a Canales del Ensemble
  const channelMap: Record<string, EnsembleChannel> = {
    warframe: "warframe",
    primary_weapon: "primary",
    secondary_weapon: "secondary",
    melee_weapon: "melee",
    companion: "companion",
    companionWeapon: "companion_weapon",
    archwing: "archwing",
    archgun: "archgun",
    necramech: "necramech",
  };

  const BASE = "/arsenal/swap";

  const toolbarMap: Record<string, React.ReactNode> = {
    [`${BASE}/warframe`]: <WarframesToolbar />,
    [`${BASE}/primary`]: <WeaponsToolbar />,
    [`${BASE}/secondary`]: <WeaponsToolbar />,
    [`${BASE}/melee`]: <WeaponsToolbar />,
    [`${BASE}/mods`]: <ModsToolbar />,
  };

  return (
    <FilterProvider value={swapState}>
      <div className="h-full w-full flex flex-col px-4 py-3 gap-4 overflow-hidden">
        <OmniToolbar showTabs={false} toolbarMap={toolbarMap} />

        <div className="flex-1 overflow-hidden">
          <OmniView
            basePath="/arsenal/swap"
            onSelect={(item) => {
              const channel = channelMap[category || ""];
              if (channel) {
                // Notificar al motor (Capa A)
                setItem(channel, item.unique_name);
              }
              window.history.back();
            }}
          />
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
