import { useItems } from "./hooks/use-items";
import {
  useItemsFilters,
  type SortOrder,
} from "./hooks/use-items-filters";
import InventoryToolbar from "./toolbar/inventory-toolbar";
import ItemsGrid from "./ItemsGrid";
import ItemDetailsPanel from "./details/item-details-panel";

/**
 * ItemsView — única fuente de vista para items.
 * Mods excluidos por defecto via excludeKinds en useItemsFilters.
 */
const ItemsView: React.FC = () => {
  const { data: items, isLoading } = useItems("all");

  const {
    category,
    setCategory,
    search,
    setSearch,
    order,
    setOrder,
    selected,
    setSelected,
    filteredItems,
  } = useItemsFilters({
    items,
    excludeKinds: ['mod'],
  });

  return (
    <div className="h-full p-3 flex flex-col gap-3 overflow-hidden">
      <InventoryToolbar
        category={category}
        onCategoryChange={setCategory}
        search={search}
        onSearchChange={setSearch}
        order={order as SortOrder}
        onOrderChange={(o) => setOrder(o as SortOrder)}
      />

      <div className="flex-1 flex gap-3 h-0">
        <div className="flex-1 min-w-0 h-full overflow-hidden relative">
          <ItemsGrid
            items={filteredItems}
            selectedId={selected?.id ?? null}
            onSelect={setSelected}
            isLoading={isLoading}
          />
        </div>
        <div className="shrink-0 flex flex-col w-[350px]">
          {selected ? (
            <ItemDetailsPanel item={selected} />
          ) : (
            <div className="items-details-empty border border-ui-primary/30 bg-black/20 h-full p-3 text-ui-primary/70 text-xs">
              Selecciona un item para ver detalles
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemsView;
