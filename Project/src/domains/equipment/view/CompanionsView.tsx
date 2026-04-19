import { useNavigate } from "react-router";
import { useItems } from "../hooks/use-items";
import ItemsGrid from "../ItemsGrid";
import CompanionCard from "@shared/components/items/cards/CompanionCard";
import type { Companion } from "@lib/types";
import { toRouteSlug } from "@lib/route-id";

const CompanionsView = () => {
  const { data, isLoading } = useItems("companion");
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-hidden">
      <ItemsGrid
        items={data}
        isLoading={isLoading}
        onSelect={(item) =>
          navigate(`/equipment/companions/${toRouteSlug(item.name)}`, {
            state: { uniqueName: item.uniqueName },
          })
        }
        renderItem={(item) => (
          <CompanionCard
            key={item.id}
            item={item as Companion}
            onSelect={(c) =>
              navigate(`/equipment/companions/${toRouteSlug(c.name)}`, {
                state: { uniqueName: c.uniqueName },
              })
            }
          />
        )}
      />
    </div>
  );
};

export default CompanionsView;
