import type { Mod } from "@shared/types";
import ModCard from "@shared/components/items/cards/ModCard";
import ItemsGrid from "../ItemsGrid";

interface ModsViewProps {
  items: Mod[];
  isLoading: boolean;
  onClick: (item: Mod) => void;
  [key: string]: any;
}

/**
 * ModsView — Componente agnóstico de presentación para mods.
 */
const ModsView = ({ items, isLoading, onClick, ...props }: ModsViewProps) => {
  return (
    <div className="h-full overflow-hidden">
      <ItemsGrid
        items={items}
        isLoading={isLoading}
        onClick={(item) => onClick(item as Mod)}
        rowAspectRatio={0.5}
        virtualized={false}
        renderItem={(item) => (
          <ModCard
            key={item.id}
            item={item as Mod}
            onClick={(m) => onClick(m)}
            {...props}
          />
        )}
      />
    </div>
  );
};

export default ModsView;
