import type { Warframe } from "@shared/types";
import WarframeCard from "@shared/components/items/cards/WarframeCard";
import ItemsGrid from "../ItemsGrid";

interface WarframesViewProps {
  items: Warframe[];
  isLoading: boolean;
  onClick: (item: Warframe) => void;
  [key: string]: any;
}

/**
 * WarframesView — Componente agnóstico de presentación para warframes.
 */
const WarframesView = ({
  items,
  isLoading,
  onClick,
  ...props
}: WarframesViewProps) => {
  return (
    <div className="h-full overflow-hidden">
      <ItemsGrid
        items={items}
        isLoading={isLoading}
        onClick={(item) => onClick(item as Warframe)}
        renderItem={(item) => (
          <WarframeCard
            key={item.id}
            item={item as Warframe}
            onClick={(i) => onClick(i)}
            {...props}
          />
        )}
      />
    </div>
  );
};

export default WarframesView;
