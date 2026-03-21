import { useItems } from "@features/equipment/hooks/use-items";
import { useItemsFilters } from "@features/equipment/hooks/use-items-filters";
import { FilterBar } from "@shared/components/FilterBar";
import ItemsGrid from "@features/equipment/ItemsGrid";
import type { ItemCategory } from "@lib/i18n/category-icons";
import type { ModCategory } from "@lib/types";

/**
 * Categorías de mods visibles en la primera iteración del builder.
 * Compañeros separados en Robotic / Beast (igual que el juego).
 * Focus, Archwing, Railjack, Necramech, etc. excluidos hasta iteraciones futuras.
 */
const MOD_CATEGORIES: (ItemCategory | 'all')[] = [
  'all', 'warframe', 'primary', 'secondary', 'melee', 'robotic', 'beast',
];

const EXCLUDED_MOD_CATEGORIES: ModCategory[] = [
  'riven', 'focus', 'archwing', 'archgun', 'archmelee',
  'railjack', 'necramech', 'kdrive', 'parazon',
  'tektolyst', 'transmutation', 'peculiar', 'modset', 'unknown',
];

/**
 * ModsView — vista de mods del builder.
 * Filtra por category normalizada (generate-data.mjs).
 * Excluye sistemas especiales hasta iteraciones futuras.
 */
const ModsView: React.FC = () => {
  const { data: items, isLoading } = useItems("mod");

  const {
    subCategory,
    setSubCategory,
    search,
    setSearch,
    selected,
    setSelected,
    filteredItems,
  } = useItemsFilters({
    items,
    initialCategory: "mod",
    excludeSubCategories: EXCLUDED_MOD_CATEGORIES,
  });

  return (
    <div className="h-full p-3 flex flex-col gap-3 overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-2">
        <FilterBar
          categories={MOD_CATEGORIES}
          value={subCategory as ItemCategory | 'all'}
          onChange={(v) => setSubCategory(v as ModCategory | 'all')}
        />
        <input
          placeholder="SEARCH..."
          className="px-2 py-1 border-b border-ui-primary text-xs outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <ItemsGrid
          items={filteredItems}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ModsView;
