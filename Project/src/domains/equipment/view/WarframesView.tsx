import { useNavigate } from "react-router";
import { useItems } from "../hooks/use-items";
import ItemsGrid from "../ItemsGrid";
import WarframeCard from "@shared/components/items/cards/WarframeCard";
import type { Warframe } from "@shared/types";
import { toRouteSlug } from "@lib/route-id";

const WarframesView = () => {
  const { data, isLoading } = useItems("warframe");
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-hidden">
      <ItemsGrid
        items={data}
        isLoading={isLoading}
        onSelect={(item) =>
          navigate(`/equipment/warframes/${toRouteSlug(item.name)}`, {
            state: { uniqueName: item.uniqueName },
          })
        }
        renderItem={(item) => (
          <WarframeCard
            key={item.id}
            item={item as Warframe}
            onSelect={(w) =>
              navigate(`/equipment/warframes/${toRouteSlug(w.name)}`, {
                state: { uniqueName: w.uniqueName },
              })
            }
          />
        )}
      />
    </div>
  );
};

export default WarframesView;
