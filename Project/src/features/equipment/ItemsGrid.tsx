import { useEffect, useRef } from "react";
import classNames from "classnames";
import type { BaseItem } from "@lib/types";
import CustomPopover from "@shared/components/CustomPopover";
/**
 * @deprecated ItemDetailsPopover ya no se usa en el runtime.
 * Todas las vistas usan cards especializadas con popovers por tipo.
 * Este import se mantiene temporalmente para revisión manual de dependencias.
 * Eliminar tras verificar que no hay consumers activos.
 */
import ItemDetailsPopover from "./details/item-details-popover";

/**
 * ItemsGrid - Migrated from App-legacy
 * 
 * BaseItem compatibility: This component is generic over BaseItem,
 * allowing it to work with any item type (Weapon, Warframe, Mod).
 * 
 * Refactored to support composition pattern via renderItem prop.
 * When renderItem is provided, delegates rendering to specialized cards.
 * Falls back to legacy behavior for backward compatibility (deprecated path).
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
  renderItem?: (item: TItem) => React.ReactNode;
  layout?: GridLayoutOptions;
};

const ItemsGrid = <TItem extends BaseItem = BaseItem>({
  items,
  selectedId,
  onSelect,
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
          'color: #a29bfe; font-weight: bold'
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
      {renderItem
        ? items.map(renderItem)
        : items.map((item) => {
            // @deprecated Legacy fallback path - todas las vistas deben usar renderItem con cards especializadas
            const isSelected = selectedId != null && selectedId === item.id;
            return (
              <CustomPopover
                key={item.id}
                popover={<ItemDetailsPopover item={item} />}
              >
                <button
                  className={classNames(
                    "group relative border outline-none transition-all duration-200",
                    isSelected ? "border-ui-accent shadow-[0_0_10px_rgba(var(--color-ui-accent),0.3)]" : "border-ui-primary hover:border-b-ui-accent",
                  )}
                  type="button"
                  onClick={() => onSelect(item)}
                >
                  <div className="flex flex-col w-full aspect-square overflow-hidden">
                    <div className="absolute inset-0 z-0 bg-linear-to-b from-black/20 via-black/40 to-black/80" />
                    <div className="bg-glow" />
                    <div className="absolute inset-0 z-0 overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          className="w-full h-full p-8 object-contain scale-125 transition-transform duration-500 group-hover:scale-[1.35]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ui-primary/20 text-[10px] uppercase tracking-widest">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="mt-auto relative z-10 w-full p-2 pt-4 text-left flex flex-row justify-between">
                      <div className="text-ui-accent text-[11px] font-bold tracking-wide uppercase truncate drop-shadow-md">
                        {item.name}
                      </div>
                      <div className="text-ui-primary/70 text-[9px] font-medium tracking-tight truncate">
                        {item.kind}
                      </div>
                    </div>
                  </div>
                </button>
              </CustomPopover>
            );
          })}
    </div>
  );
};

export default ItemsGrid;
