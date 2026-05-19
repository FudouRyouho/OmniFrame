import type { Arcane } from "@shared/types";
import ArcaneCard from "@shared/components/items/cards/ArcaneCard";
import ItemsGrid from "../ItemsGrid";

interface ArcanesViewProps {
  items: Arcane[];
  isLoading: boolean;
  onClick: (item: Arcane) => void;
  [key: string]: any;
}

/**
 * ArcanesView — Componente agnóstico de presentación para arcanos.
 */
const ArcanesView = ({
  items,
  isLoading,
  onClick,
  ...props
}: ArcanesViewProps) => {
  return (
    <div className="h-full overflow-hidden">
      <ItemsGrid
        items={items}
        isLoading={isLoading}
        onClick={(item) => onClick(item as Arcane)}
        renderItem={(item) => (
          <ArcaneCard
            key={item.id}
            item={item as Arcane}
            onClick={(a) => onClick(a)}
            {...props}
          />
        )}
      />
    </div>
  );
};

export default ArcanesView;
