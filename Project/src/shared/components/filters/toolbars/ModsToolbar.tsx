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
    { key: "Aura", label: "Aura", icon: "/assets/ui/Category/Aura.png" },
    {
      key: "Augment",
      label: "Augment",
      icon: "/assets/ui/Category/Augment.png",
    },
    {
      key: "Primary",
      label: "Primary",
      icon: "/assets/ui/Category/Primary.png",
    },
    {
      key: "Secondary",
      label: "Secondary",
      icon: "/assets/ui/Category/Secondary.png",
    },
    { key: "Melee", label: "Melee", icon: "/assets/ui/Category/Melee.png" },
    { key: "Stance", label: "Stance", icon: "/assets/ui/Category/Stance.png" },
    { key: "Exilus", label: "Exilus", icon: "/assets/ui/Category/Exilus.png" },
    {
      key: "Vehicles",
      label: "Vehicles",
      icon: "/assets/ui/Category/Archwing.png",
    },
    {
      key: "Archgun",
      label: "Archgun",
      icon: "/assets/ui/Category/Archgun.png",
    },
    {
      key: "Archmelee",
      label: "Archmelee",
      icon: "/assets/ui/Category/Archmelee.png",
    },
    {
      key: "Robotic",
      label: "Robotic",
      icon: "/assets/ui/Category/Sentinel.png",
    },
    {
      key: "Beast",
      label: "Beast",
      icon: "/assets/ui/Category/Companion/Beast.png",
    },
  ],
};

const ModsToolbar = () => {
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

export default ModsToolbar;
