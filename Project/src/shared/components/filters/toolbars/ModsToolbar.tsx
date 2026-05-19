import { useFilterContext } from "../context";
import { useFilterLogic } from "../hooks/use-filter-logic";
import type { ViewFilterConfig } from "../types";
import FilterIcon from "../FilterIcon";
import type { ModCategory } from "@shared/types";

type ModsToolbarKey = ModCategory | "all" | "aura" | "augment" | "stance" | "exilus" | "vehicle";

const config: ViewFilterConfig<ModsToolbarKey> = {
  categories: [
    { key: "all", label: "All", icon: "/assets/ui/Category/All.png" },
    {
      key: "warframe",
      label: "Warframe",
      icon: "/assets/ui/Category/Warframe.png",
    },
    { key: "aura", label: "Aura", icon: "/assets/ui/Category/Aura.png" },
    {
      key: "augment",
      label: "Augment",
      icon: "/assets/ui/Category/Augment.png",
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
    { key: "melee", label: "Melee", icon: "/assets/ui/Category/Melee.png" },
    { key: "stance", label: "Stance", icon: "/assets/ui/Category/Stance.png" },
    { key: "exilus", label: "Exilus", icon: "/assets/ui/Category/Exilus.png" },
    {
      key: "vehicle",
      label: "Vehicles",
      icon: "/assets/ui/Category/Archwing.png",
    },
    {
      key: "archgun",
      label: "Archgun",
      icon: "/assets/ui/Category/Archgun.png",
    },
    {
      key: "archmelee",
      label: "Archmelee",
      icon: "/assets/ui/Category/Archmelee.png",
    },
    {
      key: "companion",
      label: "Robotic",
      icon: "/assets/ui/Category/Sentinel.png",
    },
    {
      key: "companion",
      label: "Beast",
      icon: "/assets/ui/Category/Companion/Beast.png",
    },
  ],
};

const ModsToolbar = () => {
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

export default ModsToolbar;
