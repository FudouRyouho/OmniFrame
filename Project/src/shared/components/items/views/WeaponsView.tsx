import type { Weapon } from "@shared/types";
import WeaponCard from "@shared/components/items/cards/WeaponCard";
import ItemsGrid from "../ItemsGrid";

interface WeaponsViewProps {
  items: Weapon[];
  isLoading: boolean;
  onClick: (item: Weapon) => void;
  // Opciones extra para el futuro (ej: isDraggable)
  [key: string]: any;
}

/**
 * WeaponsView — Componente agnóstico de presentación para armas.
 * Reutilizable en cualquier dominio inyectando datos y acciones.
 */
const WeaponsView = ({
  items,
  isLoading,
  onClick,
  ...props
}: WeaponsViewProps) => {
  return (
    <div className="h-full overflow-hidden">
      <ItemsGrid
        items={items}
        isLoading={isLoading}
        onClick={(item) => onClick(item as Weapon)}
        layout={{
          minColumnWidth: 180,
        }}
        renderItem={(item) => (
          <WeaponCard
            key={item.id}
            item={item as Weapon}
            onClick={(w) => onClick(w)}
            {...props}
          />
        )}
      />
    </div>
  );
};

export default WeaponsView;
