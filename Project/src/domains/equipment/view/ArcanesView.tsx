import { useNavigate } from "react-router";
import { useItems } from "../hooks/use-items";
import ItemsGrid from "../ItemsGrid";
import type { Arcane } from "@shared/types";
import { toRouteSlug } from "@lib/route-id";
import ArcaneCard from "@shared/components/items/cards/ArcaneCard";

const ArcanesView = () => {
  const { data, isLoading } = useItems("arcane");
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-hidden">
      <ItemsGrid
        items={data}
        isLoading={isLoading}
        onSelect={(item) =>
          navigate(`/equipment/arcanes/${toRouteSlug(item.name)}`, {
            state: { uniqueName: item.uniqueName },
          })
        }
        renderItem={(item) => (
          <ArcaneCard
            key={item.id}
            item={item as Arcane}
            onSelect={(a) =>
              navigate(`/equipment/arcanes/${toRouteSlug(a.name)}`, {
                state: { uniqueName: a.uniqueName },
              })
            }
          />
        )}
      />
    </div>
  );
};

export default ArcanesView;
