import classNames from "classnames";
import type { BaseItem } from "@lib/types";
import CustomPopover from "@shared/components/CustomPopover";
import ItemDetailsPopover from "./details/item-details-popover";

/**
 * ItemsGrid - Migrated from App-legacy
 * 
 * BaseItem compatibility: This component is generic over BaseItem,
 * allowing it to work with any item type (Weapon, Warframe, Mod).
 * The component uses BaseItem fields (id, name, kind, image, tags)
 * for rendering and interaction, providing a unified UI for all item types.
 */
type ItemsGridProps<TItem extends BaseItem = BaseItem> = {
  items: TItem[];
  selectedId?: string | null;
  onSelect: (item: TItem) => void;
  isLoading: boolean;
};

const ItemsGrid = <TItem extends BaseItem = BaseItem>({
  items,
  selectedId,
  onSelect,
  isLoading,
}: ItemsGridProps<TItem>) => {
  return (
    <div className="h-full grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] auto-rows-max gap-2 pr-1">
      {isLoading
        ? Array.from({ length: 20 }).map((_, i) => (
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
          ))
        : items.map((item) => {
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
                    {/* Fondo Base (Oscuro) */}
                    <div className="absolute inset-0 z-0 bg-linear-to-b from-black/20 via-black/40 to-black/80" />

                    {/* Glow de Hover (Estilo Warframe) */}
                    <div className="bg-glow" />

                    {/* Contenedor de Imagen con Zoom */}
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

                    {/* Texto inferior (comparte el fondo) */}
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
