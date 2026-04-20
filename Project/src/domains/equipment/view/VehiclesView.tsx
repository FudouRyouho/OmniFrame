import { useNavigate } from "react-router";
import { useItems } from "../hooks/use-items";
import ItemsGrid from "../ItemsGrid";
import VehicleCard from "@shared/components/items/cards/VehicleCard";
import type { Vehicle } from "@shared/types";
import { toRouteSlug } from "@lib/route-id";

const VehiclesView = () => {
  const { data, isLoading } = useItems(["necramech", "archwing"]);
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-hidden">
      <ItemsGrid
        items={data}
        isLoading={isLoading}
        onSelect={(item) =>
          navigate(`/equipment/vehicles/${toRouteSlug(item.name)}`, {
            state: { uniqueName: item.uniqueName },
          })
        }
        renderItem={(item) => (
          <VehicleCard
            key={item.id}
            item={item as Vehicle}
            onSelect={(v) =>
              navigate(`/equipment/vehicles/${toRouteSlug(v.name)}`, {
                state: { uniqueName: v.uniqueName },
              })
            }
          />
        )}
      />
    </div>
  );
};

export default VehiclesView;
