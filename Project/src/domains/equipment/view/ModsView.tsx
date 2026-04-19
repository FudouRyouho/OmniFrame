import { useNavigate } from "react-router";
import { useItems } from "../hooks/use-items";
import ItemsGrid from "../ItemsGrid";
import VirtualizedItemsGrid from "../VirtualizedItemsGrid";
import ModCard from "@shared/components/items/cards/ModCard";
import type { Mod } from "@lib/types";
import { toRouteSlug } from "@lib/route-id";

const MODS_VIRTUALIZATION_THRESHOLD = 80;
const MODS_CARD_MIN_WIDTH = 190;
const MODS_GRID_GAP = 10;
const MODS_OVERSCAN = 5;

const ModsView = () => {
  const { data, isLoading } = useItems("mod");
  const navigate = useNavigate();
  const renderModCard = (item: Mod) => (
    <ModCard
      key={item.id}
      item={item}
      onSelect={(mod) =>
        navigate(`/equipment/mods/${toRouteSlug(mod.name)}`, {
          state: { uniqueName: mod.uniqueName },
        })
      }
    />
  );

  return (
    <div className="h-full overflow-hidden">
      {data.length > MODS_VIRTUALIZATION_THRESHOLD ? (
        <VirtualizedItemsGrid
          items={data as Mod[]}
          renderItem={renderModCard}
          minColumnWidth={MODS_CARD_MIN_WIDTH}
          gap={MODS_GRID_GAP}
          overscan={MODS_OVERSCAN}
        />
      ) : (
        <ItemsGrid
          items={data}
          isLoading={isLoading}
          onSelect={(item) =>
            navigate(`/equipment/mods/${toRouteSlug(item.name)}`, {
              state: { uniqueName: item.uniqueName },
            })
          }
          layout={{
            minColumnWidth: MODS_CARD_MIN_WIDTH,
            gap: MODS_GRID_GAP,
          }}
          renderItem={(item) => renderModCard(item as Mod)}
        />
      )}
    </div>
  );
};

export default ModsView;
