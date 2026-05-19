import type { Companion } from "@shared/types";
import CompanionCard from "@shared/components/items/cards/CompanionCard";
import ItemsGrid from "../ItemsGrid";

interface CompanionsViewProps {
  items: Companion[];
  isLoading: boolean;
  onClick: (item: Companion) => void;
  [key: string]: any;
}

/**
 * CompanionsView — Componente agnóstico de presentación para compañeros.
 */
const CompanionsView = ({
  items,
  isLoading,
  onClick,
  ...props
}: CompanionsViewProps) => {
  return (
    <div className="h-full overflow-hidden">
      <ItemsGrid
        items={items}
        isLoading={isLoading}
        onClick={(item) => onClick(item as Companion)}
        renderItem={(item) => (
          <CompanionCard
            key={item.id}
            item={item as Companion}
            onClick={(i) => onClick(i)}
            {...props}
          />
        )}
      />
    </div>
  );
};

export default CompanionsView;
