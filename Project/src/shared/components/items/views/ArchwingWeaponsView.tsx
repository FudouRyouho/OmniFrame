import type { ArchwingWeapon } from "@shared/types";
import ArchwingWeaponCard from "@shared/components/items/cards/ArchwingWeaponCard";
import ItemsGrid from "../ItemsGrid";

interface ArchwingWeaponsViewProps {
  items: ArchwingWeapon[];
  isLoading: boolean;
  onClick: (item: ArchwingWeapon) => void;
  [key: string]: any;
}

/**
 * ArchwingWeaponsView — Componente agnóstico de presentación para armas de archwing.
 */
const ArchwingWeaponsView = ({
  items,
  isLoading,
  onClick,
  ...props
}: ArchwingWeaponsViewProps) => {
  return (
    <div className="h-full overflow-hidden">
      <ItemsGrid
        items={items}
        isLoading={isLoading}
        onClick={(item) => onClick(item as ArchwingWeapon)}
        renderItem={(item) => (
          <ArchwingWeaponCard
            key={item.id}
            item={item as ArchwingWeapon}
            onClick={(i) => onClick(i)}
            {...props}
          />
        )}
      />
    </div>
  );
};

export default ArchwingWeaponsView;
