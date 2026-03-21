import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import classNames from "classnames";
import type { Kind } from "@lib/types";
import { FilterBar } from "@shared/components/FilterBar";
import type { ItemCategory } from "@lib/i18n/category-icons";

type Category = Kind | "all";

type InventoryToolbarProps = {
  category: Category;
  onCategoryChange: (c: Category) => void;
  search: string;
  onSearchChange: (s: string) => void;
  order: string;
  onOrderChange: (o: string) => void;
};

const EQUIPMENT_CATEGORIES: (ItemCategory | 'all')[] = [
  'all', 'warframe', 'primary', 'secondary', 'melee',
];

const InventoryToolbar = ({
  category,
  onCategoryChange,
  search,
  onSearchChange,
  order,
  onOrderChange,
}: InventoryToolbarProps) => {
  const orderList = ["A-Z", "Z-A", "Newest", "Oldest"];

  return (
    <div className="flex items-center justify-between gap-2 px-2">
      <FilterBar
        categories={EQUIPMENT_CATEGORIES}
        value={category as ItemCategory | 'all'}
        onChange={(v) => onCategoryChange(v as Category)}
      />
      <Listbox value={order} onChange={onOrderChange}>
        <ListboxButton className="w-22 px-4 py-1 border-b border-ui-primary text-xs outline-none">
          {order}
        </ListboxButton>
        <ListboxOptions
          className={classNames("w-(--button-width)")}
          anchor="bottom"
        >
          {orderList.map((o) => (
            <div
              key={o}
              className={classNames(
                "group border border-transparent hover:border-ui-primary/40 hover:border-b-ui-accent bg-black/50",
              )}
            >
              <ListboxOption
                className="px-2 text-ui-primary hover:text-ui-accent bg-black/30 hover:bg-linear-to-t hover:from-ui-accent/60 hover:via-ui-accent/20 hover:to-transparent hover:to-70%"
                value={o}
              >
                <span>{o}</span>
              </ListboxOption>
            </div>
          ))}
        </ListboxOptions>
      </Listbox>

      <div className="flex items-center gap-2">
        <input
          placeholder="SEARCH..."
          className="px-2 py-1 border-b border-ui-primary text-xs outline-none"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default InventoryToolbar;
