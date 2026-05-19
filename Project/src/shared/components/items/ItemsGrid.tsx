import { useEffect, useRef, useState, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { BaseItem } from "@shared/types";

/**
 * ItemsGrid - Centralized Grid Component for OmniFrame.
 *
 * Soporta dos modos:
 * 1. Estándar (CSS Grid): El modo ultra-estable para listas normales.
 * 2. Virtualizado (@tanstack/react-virtual): Solo para listas masivas (> 200 items).
 */
type GridLayoutOptions = {
  minColumnWidth?: number;
  gap?: number;
  containerClassName?: string;
};

type ItemsGridProps<TItem extends BaseItem = BaseItem> = {
  items: TItem[];
  selectedId?: string | null;
  onClick: (item: TItem) => void;
  isLoading: boolean;
  renderItem: (item: TItem) => React.ReactNode;
  layout?: GridLayoutOptions;
  virtualized?: boolean;
  overscan?: number;
  rowAspectRatio?: number;
};

const ItemsGrid = <TItem extends BaseItem = BaseItem>({
  items,
  isLoading,
  renderItem,
  layout,
  virtualized: virtualizedProp,
  overscan = 5,
  rowAspectRatio = 1,
}: ItemsGridProps<TItem>) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const minColumnWidth = layout?.minColumnWidth ?? 180;
  const gap = layout?.gap ?? 8;
  const containerClassName = layout?.containerClassName ?? "";

  // Solo virtualizamos si es explícito o si la lista es realmente grande.
  const isVirtualized = virtualizedProp ?? items.length > 200;

  // Medición de ancho solo necesaria para el modo virtualizado
  useEffect(() => {
    if (!isVirtualized || !parentRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) setContainerWidth(entries[0].contentRect.width);
    });

    observer.observe(parentRef.current);
    return () => observer.disconnect();
  }, [isVirtualized]);

  const columnCount = useMemo(() => {
    if (!containerWidth) return 1;
    return Math.max(
      1,
      Math.floor((containerWidth + gap) / (minColumnWidth + gap)),
    );
  }, [containerWidth, gap, minColumnWidth]);

  const rows = useMemo(() => {
    if (!isVirtualized) return [];
    const r: TItem[][] = [];
    for (let i = 0; i < items.length; i += columnCount) {
      r.push(items.slice(i, i + columnCount));
    }
    return r;
  }, [items, columnCount, isVirtualized]);

  const estimatedRowHeight = useMemo(() => {
    const itemWidth =
      columnCount > 0
        ? (containerWidth - gap * (columnCount - 1)) / columnCount
        : minColumnWidth;

    const itemHeight = itemWidth * rowAspectRatio;

    return itemHeight + gap;
  }, [containerWidth, columnCount, gap, minColumnWidth, rowAspectRatio]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedRowHeight,
    overscan,
  });

  // 1. Render: Skeleton Loader
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
              <div className="h-3 w-3/4 bg-ui-accent/20" />
              <div className="h-2 w-1/2 bg-ui-primary/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 2. Render: Modo Virtualizado (Solo activado en > 200 items)
  if (isVirtualized) {
    return (
      <div
        ref={parentRef}
        className={`h-full overflow-y-scroll pr-1 ${containerClassName}`}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const rowItems = rows[virtualRow.index];
            if (!rowItems) return null;

            return (
              <div
                key={virtualRow.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  display: "grid",
                  gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
                  gap: `${gap}px`,
                  paddingBottom: `${gap}px`,
                  boxSizing: "border-box",
                }}
              >
                {rowItems.map((item) => (
                  <div key={item.id} className="w-full h-full">
                    {renderItem(item)}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. Render: Modo Estándar (CSS Grid nativo - MÁXIMA ESTABILIDAD)
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
