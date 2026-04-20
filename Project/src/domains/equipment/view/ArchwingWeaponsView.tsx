import { useNavigate } from "react-router";
import { useItems } from "../hooks/use-items";
import ItemsGrid from "../ItemsGrid";
import ArchwingWeaponCard from "@shared/components/items/cards/ArchwingWeaponCard";
import type { ArchwingWeapon } from "@shared/types";
import { toRouteSlug } from "@lib/route-id";

const ArchwingWeaponsView = () => {
  const { data, isLoading } = useItems(["archgun", "archmelee"]);
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-hidden">
      <ItemsGrid
        items={data}
        isLoading={isLoading}
        onSelect={(item) =>
          navigate(`/equipment/archwing-weapons/${toRouteSlug(item.name)}`, {
            state: { uniqueName: item.uniqueName },
          })
        }
        renderItem={(item) => (
          <ArchwingWeaponCard
            key={item.id}
            item={item as ArchwingWeapon}
            onSelect={(aw) =>
              navigate(`/equipment/archwing-weapons/${toRouteSlug(aw.name)}`, {
                state: { uniqueName: aw.uniqueName },
              })
            }
          />
        )}
      />
    </div>
  );
};

export default ArchwingWeaponsView;
