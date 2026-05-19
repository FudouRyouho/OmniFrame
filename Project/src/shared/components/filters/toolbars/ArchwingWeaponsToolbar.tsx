import { useFilterContext } from "../context";
import { useFilterLogic } from "../hooks/use-filter-logic";
import type { ViewFilterConfig } from "../types";
import FilterIcon from "../FilterIcon";

const config: ViewFilterConfig<string> = {
  categories: [
    { key: "all", label: "All", icon: "/assets/ui/Category/All.png" },
    {
      key: "archgun",
      label: "Arch-Gun",
      icon: "/assets/ui/Category/Archgun.png",
    },
    {
      key: "archmelee",
      label: "Arch-Melee",
      icon: "/assets/ui/Category/Archmelee.png",
    },
  ],
};

const ArchwingWeaponsToolbar = () => {
  const filterState = useFilterContext();
  const { setHovered } = filterState;
  const { categories, selected, selectCategory } = useFilterLogic(config, filterState);


  return (
    <div className="flex items-center gap-2">
      {categories.map((cat) => (
        <FilterIcon
          key={cat.key}
          cat={cat}
          active={selected === cat.key}
          onClick={() => selectCategory(cat.key)}
          onHover={() => setHovered(cat.label)}
          onLeave={() => setHovered(null)}
        />
      ))}
    </div>
  );
};

export default ArchwingWeaponsToolbar;
