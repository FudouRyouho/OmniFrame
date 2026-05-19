import type { Vehicle } from "@shared/types";
import VehicleCard from "@shared/components/items/cards/VehicleCard";
import ItemsGrid from "../ItemsGrid";

interface VehiclesViewProps {
  items: Vehicle[];
  isLoading: boolean;
  onClick: (item: Vehicle) => void;
  [key: string]: any;
}

/**
 * VehiclesView — Componente agnóstico de presentación para vehículos.
 */
const VehiclesView = ({
  items,
  isLoading,
  onClick,
  ...props
}: VehiclesViewProps) => {
  return (
    <div className="h-full overflow-hidden">
      <ItemsGrid
        items={items}
        isLoading={isLoading}
        onClick={(item) => onClick(item as Vehicle)}
        renderItem={(item) => (
          <VehicleCard
            key={item.id}
            item={item as Vehicle}
            onClick={(i) => onClick(i)}
            {...props}
          />
        )}
      />
    </div>
  );
};

export default VehiclesView;
