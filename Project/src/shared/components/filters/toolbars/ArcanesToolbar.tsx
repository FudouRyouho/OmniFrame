import { useFilterContext } from "../context";
import { useFilterLogic } from "../hooks/use-filter-logic";
import type { ViewFilterConfig } from "../types";
import FilterIcon from "../FilterIcon";

const config: ViewFilterConfig = {
  categories: [
    { key: "All", label: "All", icon: "/assets/ui/Category/All.png" },
    {
      key: "Warframe",
      label: "Warframe",
      icon: "/assets/ui/Category/Warframe.png",
    },
    {
      key: "Operator",
      label: "Operator",
      icon: "/assets/ui/Category/Operator.png",
    },
    { key: "Weapon", label: "Weapon", icon: "/assets/ui/Category/Primary.png" },
    {
      key: "Companion",
      label: "Companion",
      icon: "/assets/ui/Category/Sentinel.png",
    },
    {
      key: "Necramech",
      label: "Necramech",
      icon: "/assets/ui/Category/Necramech.png",
    },
  ],
};

const ArcanesToolbar = () => {
  const { setHovered } = useFilterContext();
  const { categories, selected, selectCategory } = useFilterLogic(config);

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

export default ArcanesToolbar;
