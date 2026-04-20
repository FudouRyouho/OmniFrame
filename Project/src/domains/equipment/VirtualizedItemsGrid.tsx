import { useRef, useState, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { BaseItem } from "@shared/types";

const DEFAULT_MIN_COLUMN_WIDTH = 190;
const DEFAULT_GAP = 8;
const DEFAULT_OVERSCAN = 3;

type VirtualizedItemsGridProps<TItem extends BaseItem = BaseItem> = {
  items: TItem[];
  renderItem: (item: TItem) => React.ReactNode;
  minColumnWidth?: number;
  gap?: number;
  overscan?: number;
  className?: string;
};

/**
 * VirtualizedItemsGrid — renderiza solo los items visibles en el viewport.
 *
 * Usa @tanstack/react-virtual para virtualización por filas de cards cuadradas.
 * El layout es deliberadamente mínimo porque esta capa solo vive en vistas
 * transicionales donde el diseño final todavía no está cerrado.
 */
const VirtualizedItemsGrid = <TItem extends BaseItem = BaseItem>({
  items,
  renderItem,
  minColumnWidth = DEFAULT_MIN_COLUMN_WIDTH,
  gap = DEFAULT_GAP,
  overscan = DEFAULT_OVERSCAN,
  className = "",
}: VirtualizedItemsGridProps<TItem>) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);

  const computedCellWidth =
    columnCount > 0
      ? Math.max(0, (containerWidth - gap * (columnCount - 1)) / columnCount)
      : minColumnWidth;

  // Los cards son aspect-square, así que la altura real sigue el ancho de celda.
  const effectiveItemSize =
    computedCellWidth > 0 ? computedCellWidth : minColumnWidth;
  const rowSize = effectiveItemSize + gap;

  // Calcular columnas según ancho del contenedor y el ancho mínimo deseado.
  useEffect(() => {
    if (!parentRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      setContainerWidth(width);
      const cols = Math.max(
        1,
        Math.floor((width + gap) / (minColumnWidth + gap)),
      );
      setColumnCount(cols);
    });

    observer.observe(parentRef.current);
    return () => observer.disconnect();
  }, [gap, minColumnWidth]);

  // Agrupar items en filas según columnCount
  const rows: TItem[][] = [];
  for (let i = 0; i < items.length; i += columnCount) {
    rows.push(items.slice(i, i + columnCount));
  }

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowSize,
    overscan,
  });

  return (
    <div
      ref={parentRef}
      className={`h-full overflow-y-scroll pr-1 ${className}`}
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
          return (
            <div
              key={virtualRow.key}
              className="grid"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: "grid",
                gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                gap: `0px ${gap}px`,
                paddingBottom: `${gap}px`,
                boxSizing: "border-box",
                alignItems: "start",
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
