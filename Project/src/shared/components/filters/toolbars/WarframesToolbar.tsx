import { useFilterContext } from "../context";
import { useFilterLogic } from "../hooks/use-filter-logic";
import type { ViewFilterConfig } from "../types";
import FilterIcon from "../FilterIcon";

const config: ViewFilterConfig = {
  categories: [
    { key: "All", label: "All", icon: "/assets/ui/Category/All.png" },
    {
      key: "Damage",
      label: "Damage",
      icon: "/assets/ui/Category/Warframe/Damage.png",
    },
    {
      key: "Crowd Control",
      label: "Crowd Control",
      icon: "/assets/ui/Category/Warframe/CrowdControl.png",
    },
    {
      key: "Support",
      label: "Support",
      icon: "/assets/ui/Category/Warframe/Support.png",
    },
    {
      key: "Survival",
      label: "Survival",
      icon: "/assets/ui/Category/Warframe/Survival.png",
    },
    {
      key: "Stealth",
      label: "Stealth",
      icon: "/assets/ui/Category/Warframe/Stealth.png",
    },
  ],
};

const WarframesToolbar = () => {
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

export default WarframesToolbar;
