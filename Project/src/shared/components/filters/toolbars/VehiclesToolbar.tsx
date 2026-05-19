import { useFilterContext } from "../context";
import { useFilterLogic } from "../hooks/use-filter-logic";
import type { ViewFilterConfig } from "../types";
import FilterIcon from "../FilterIcon";
import type { VehicleKind } from "@shared/types";

const config: ViewFilterConfig<VehicleKind | "all"> = {
  categories: [
    { key: "all", label: "All", icon: "/assets/ui/Category/All.png" },
    {
      key: "archwing",
      label: "Archwing",
      icon: "/assets/ui/Category/Archwing.png",
    },
    {
      key: "necramech",
      label: "Necramech",
      icon: "/assets/ui/Category/Necramech.png",
    },
  ],
};

const VehiclesToolbar = () => {
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

export default VehiclesToolbar;
