import { useFilterContext } from "../context";
import { useFilterLogic } from "../hooks/use-filter-logic";
import type { ViewFilterConfig } from "../types";
import FilterIcon from "../FilterIcon";

const config: ViewFilterConfig<string> = {
  categories: [
    { key: "all", label: "All", icon: "/assets/ui/Category/All.png" },
    {
      key: "damage",
      label: "Damage",
      icon: "/assets/ui/Category/Warframe/Damage.png",
    },
    {
      key: "crowd control",
      label: "Crowd Control",
      icon: "/assets/ui/Category/Warframe/CrowdControl.png",
    },
    {
      key: "support",
      label: "Support",
      icon: "/assets/ui/Category/Warframe/Support.png",
    },
    {
      key: "survival",
      label: "Survival",
      icon: "/assets/ui/Category/Warframe/Survival.png",
    },
    {
      key: "stealth",
      label: "Stealth",
      icon: "/assets/ui/Category/Warframe/Stealth.png",
    },
  ],
};

const WarframesToolbar = () => {
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

export default WarframesToolbar;
