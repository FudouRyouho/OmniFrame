import { useEffect, useRef } from "react";
import type { BaseItem } from "@shared/types";

/**
 * ItemsGrid - Migrated from App-legacy
 *
 * BaseItem compatibility: This component is generic over BaseItem,
 * allowing it to work with any item type (Weapon, Warframe, Mod).
 *
 * Usa composition pattern vía renderItem.
 * El fallback legacy quedó archivado en items-grid-fallback.tsx.
 *
 * Este componente ya no decide virtualización. Las vistas que la necesiten
 * la montan explícitamente para mantener el layout transicional bajo control local.
 */
type GridLayoutOptions = {
  minColumnWidth?: number;
  gap?: number;
  containerClassName?: string;
};

type ItemsGridProps<TItem extends BaseItem = BaseItem> = {
  items: TItem[];
  selectedId?: string | null;
  onSelect: (item: TItem) => void;
  isLoading: boolean;
  renderItem: (item: TItem) => React.ReactNode;
  layout?: GridLayoutOptions;
};

const ItemsGrid = <TItem extends BaseItem = BaseItem>({
  items,
  isLoading,
  renderItem,
  layout,
}: ItemsGridProps<TItem>) => {
  const renderStartTime = useRef<number>(0);
  const prevItemsLength = useRef<number>(0);
  const minColumnWidth = layout?.minColumnWidth ?? 160;
  const gap = layout?.gap ?? 8;
  const containerClassName = layout?.containerClassName ?? "";

  // Medir tiempo de renderizado cuando cambia la cantidad de items
  useEffect(() => {
    if (items.length !== prevItemsLength.current) {
      if (renderStartTime.current === 0) {
        renderStartTime.current = performance.now();
      } else {
        const renderTime = performance.now() - renderStartTime.current;
        console.log(
          `%c[PERF] ItemsGrid render: ${renderTime.toFixed(2)}ms (${items.length} items)`,
          "color: #a29bfe; font-weight: bold",
        );
        renderStartTime.current = 0;
      }
      prevItemsLength.current = items.length;
    }
  }, [items.length]);

  // Marcar inicio de renderizado
  if (items.length > 0 && renderStartTime.current === 0) {
    renderStartTime.current = performance.now();
  }

  // Skeleton loader — compartido entre ambos modos
  if (isLoading) {
    return (
      <div
        className={`h-full grid auto-rows-max pr-1 overflow-y-scroll ${containerClassName}`}
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${minColumnWidth}px, 1fr))`,
          gap: `${gap}px`,
        }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="w-full aspect-square border border-ui-primary/10 bg-black/20 animate-pulse relative flex flex-col justify-end p-2 gap-2"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1/2 h-1/2 bg-ui-primary/5 rounded-full blur-3xl" />
            </div>
            <div className="mt-auto relative z-10 w-full p-2 pt-4 text-left flex flex-row justify-between">
              <div className="h-3 w-3/4 bg-ui-accent/20 relative z-10" />
              <div className="h-2 w-1/2 bg-ui-primary/10 relative z-10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`h-full grid auto-rows-max pr-1 overflow-y-scroll ${containerClassName}`}
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${minColumnWidth}px, 1fr))`,
        gap: `${gap}px`,
      }}
    >
      {items.map(renderItem)}
    </div>
  );
};

export default ItemsGrid;
