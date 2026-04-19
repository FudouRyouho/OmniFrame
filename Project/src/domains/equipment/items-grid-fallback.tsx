import classNames from "classnames";
import type { BaseItem } from "@lib/types";
import CustomPopover from "@shared/components/CustomPopover";
import ItemDetailsPopover from "@shared/components/items/specs/item-details-popover";

type GridLayoutOptions = {
  minColumnWidth?: number;
  gap?: number;
  containerClassName?: string;
};

type ItemsGridFallbackProps<TItem extends BaseItem = BaseItem> = {
  items: TItem[];
  selectedId?: string | null;
  onSelect: (item: TItem) => void;
  layout?: GridLayoutOptions;
};

/**
 * Fallback archivado del grid previo a las cards especializadas.
 * Mantener fuera del runtime principal; sirve como referencia transicional.
 */
const ItemsGridFallback = <TItem extends BaseItem = BaseItem>({
  items,
  selectedId,
  onSelect,
  layout,
}: ItemsGridFallbackProps<TItem>) => {
  const minColumnWidth = layout?.minColumnWidth ?? 160;
  const gap = layout?.gap ?? 8;
  const containerClassName = layout?.containerClassName ?? "";

  return (
    <div
      className={`h-full grid auto-rows-max pr-1 overflow-y-scroll ${containerClassName}`}
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${minColumnWidth}px, 1fr))`,
        gap: `${gap}px`,
      }}
    >
      {items.map((item) => {
        const isSelected = selectedId != null && selectedId === item.id;
        return (
          <CustomPopover
            key={item.id}
            popover={<ItemDetailsPopover item={item} />}
          >
            <button
              className={classNames(
                "group relative border outline-none transition-all duration-200",
                isSelected
                  ? "border-ui-accent shadow-[0_0_10px_rgba(var(--color-ui-accent),0.3)]"
                  : "border-ui-primary hover:border-b-ui-accent",
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

export default ItemsGridFallback;
