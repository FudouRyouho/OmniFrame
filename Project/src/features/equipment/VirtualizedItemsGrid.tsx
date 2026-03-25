import { useRef, useState, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { BaseItem } from "@lib/types";

const DEFAULT_ITEM_SIZE = 190;
const DEFAULT_OVERSCAN = 3;

type VirtualizedItemsGridProps<TItem extends BaseItem = BaseItem> = {
  items: TItem[];
  renderItem: (item: TItem) => React.ReactNode;
  itemSize?: number;
  overscan?: number;
  computeColumnCount?: (containerWidth: number) => number;
  rowGap?: number;
  columnGap?: number;
  containerClassName?: string;
  rowClassName?: string;
};

/**
 * VirtualizedItemsGrid — renderiza solo los items visibles en el viewport.
 *
 * Usa @tanstack/react-virtual para virtualización por filas, con capacidad de
 * personalizar itemSize, overscan y lógica de columnas por vista.
 */
const VirtualizedItemsGrid = <TItem extends BaseItem = BaseItem>({
  items,
  renderItem,
  itemSize = DEFAULT_ITEM_SIZE,
  overscan = DEFAULT_OVERSCAN,
  computeColumnCount,
  rowGap = 8,
  columnGap = 8,
  containerClassName = "",
  rowClassName = "",
}: VirtualizedItemsGridProps<TItem>) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(1);

  // Calcular columnas según ancho del contenedor y lógica por vista
  useEffect(() => {
    if (!parentRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      const cols = computeColumnCount
        ? computeColumnCount(width)
        : Math.max(1, Math.floor(width / itemSize));
      setColumnCount(cols);
    });

    observer.observe(parentRef.current);
    return () => observer.disconnect();
  }, [computeColumnCount, itemSize]);

  // Agrupar items en filas según columnCount
  const rows: TItem[][] = [];
  for (let i = 0; i < items.length; i += columnCount) {
    rows.push(items.slice(i, i + columnCount));
  }

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemSize,
    overscan,
  });

  return (
    <div ref={parentRef} className={`h-full overflow-y-scroll pr-1 ${containerClassName}`}>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const rowItems = rows[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              className={`grid ${rowClassName}`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: "grid",
                gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                gap: `${rowGap}px ${columnGap}px`,
                paddingBottom: "0.5rem",
              }}
            >
              {rowItems.map((item) => renderItem(item))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VirtualizedItemsGrid;
