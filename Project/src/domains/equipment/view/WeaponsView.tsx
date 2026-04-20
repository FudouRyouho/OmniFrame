import { useNavigate } from "react-router";
import { useItems } from "../hooks/use-items";
import ItemsGrid from "../ItemsGrid";
import VirtualizedItemsGrid from "../VirtualizedItemsGrid";
import WeaponCard from "@shared/components/items/cards/WeaponCard";
import type { Weapon } from "@shared/types";
import { toRouteSlug } from "@lib/route-id";

const WEAPONS_VIRTUALIZATION_THRESHOLD = 250;
const WEAPONS_CARD_MIN_WIDTH = 180;
const WEAPONS_GRID_GAP = 12;
const WEAPONS_OVERSCAN = 4;

const WeaponsView = () => {
  const { data, isLoading } = useItems(["primary", "secondary", "melee"]);
  const navigate = useNavigate();
  const renderWeaponCard = (item: Weapon) => (
    <WeaponCard
      key={item.id}
      item={item}
      onSelect={(weapon) =>
        navigate(`/equipment/weapons/${toRouteSlug(weapon.name)}`, {
          state: { uniqueName: weapon.uniqueName },
        })
      }
    />
  );

  return (
    <div className="h-full overflow-hidden">
      {data.length > WEAPONS_VIRTUALIZATION_THRESHOLD ? (
        <VirtualizedItemsGrid
          items={data as Weapon[]}
          renderItem={renderWeaponCard}
          minColumnWidth={WEAPONS_CARD_MIN_WIDTH}
          gap={WEAPONS_GRID_GAP}
          overscan={WEAPONS_OVERSCAN}
        />
      ) : (
        <ItemsGrid
          items={data}
          isLoading={isLoading}
          onSelect={(item) =>
            navigate(`/equipment/weapons/${toRouteSlug(item.name)}`, {
              state: { uniqueName: item.uniqueName },
            })
          }
          layout={{
            minColumnWidth: WEAPONS_CARD_MIN_WIDTH,
            gap: WEAPONS_GRID_GAP,
          }}
          renderItem={(item) => renderWeaponCard(item as Weapon)}
        />
      )}
    </div>
  );
};

export default WeaponsView;
