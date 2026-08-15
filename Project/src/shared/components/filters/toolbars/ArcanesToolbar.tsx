import { useFilterContext } from "../context";
import { useFilterLogic } from "../hooks/use-filter-logic";
import type { ViewFilterConfig } from "../types";
import FilterIcon from "../FilterIcon";

const config: ViewFilterConfig<string> = {
  categories: [
    { key: "all", label: "All", icon: "/assets/ui/Category/All.png" },
    {
      key: "warframe",
      label: "Warframe",
      icon: "/assets/ui/Category/Warframe.png",
    },
    {
      key: "primary",
      label: "Primary",
      icon: "/assets/ui/Category/Primary.png",
    },
    {
      key: "secondary",
      label: "Secondary",
      icon: "/assets/ui/Category/Secondary.png",
    },
    {
      key: "melee",
      label: "Melee",
      icon: "/assets/ui/Category/Melee.png",
    },
    {
      key: "operator",
      label: "Operator",
      icon: "/assets/ui/Category/Operator.png",
    },
    {
      key: "amp",
      label: "Amp",
      icon: "/assets/ui/Category/Amp.png",
    },
  ],
};

const ArcanesToolbar = () => {
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

export default ArcanesToolbar;
