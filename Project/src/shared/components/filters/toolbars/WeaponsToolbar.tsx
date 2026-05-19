import { useFilterContext } from "../context";
import { useFilterLogic } from "../hooks/use-filter-logic";
import type { ViewFilterConfig } from "../types";
import FilterIcon from "../FilterIcon";

const config: ViewFilterConfig = {
  categories: [
    { key: "all", label: "All", icon: "/assets/ui/Category/All.png" },
    {
      key: "primary",
      label: "Primary",
      icon: "/assets/ui/Category/Primary.png",
      subcategories: [
        { key: "rifle", label: "Rifle", icon: "/assets/ui/Category/Primary/Rifle.png" },
        { key: "shotgun", label: "Shotgun", icon: "/assets/ui/Category/Primary/Shotgun.png" },
        { key: "bow", label: "Bow", icon: "/assets/ui/Category/Primary/Bow.png" },
        { key: "launcher", label: "Launcher", icon: "/assets/ui/Category/Primary/Launcher.png" },
        { key: "sniper", label: "Sniper", icon: "/assets/ui/Category/Primary/Sniper.png" },
      ],
    },
    {
      key: "secondary",
      label: "Secondary",
      icon: "/assets/ui/Category/Secondary.png",
      subcategories: [
        { key: "pistol", label: "Pistol", icon: "/assets/ui/Category/Secondary/Pistol.png" },
        { key: "dual pistols", label: "Dual Pistols", icon: "/assets/ui/Category/Secondary/SMG.png" },
        { key: "thrown", label: "Thrown", icon: "/assets/ui/Category/Secondary/Throwable.png" },
      ],
    },
    {
      key: "melee",
      label: "Melee",
      icon: "/assets/ui/Category/Melee.png",
      subcategories: [
        { key: "sword", label: "Sword", icon: "/assets/ui/Category/Melee/LightBlade.png" },
        { key: "polearm", label: "Polearm", icon: "/assets/ui/Category/Melee/Polearm.png" },
        { key: "hammer", label: "Hammer", icon: "/assets/ui/Category/Melee/Hammer.png" },
        { key: "dagger", label: "Dagger", icon: "/assets/ui/Category/Melee/LightBlade.png" },
      ],
    },
  ],
};

const WeaponsToolbar = () => {
  const filterState = useFilterContext();
  const { setHovered } = filterState;

  const {
    categories,
    selected,
    selectCategory,
    selectedCategory,
    activeSubcategory,
    setActiveSubcategory,
    hasSubcategories,
  } = useFilterLogic(config, filterState);

  return (
    <div className="flex items-center gap-2">
      {hasSubcategories && (
        <>
          <FilterIcon
            cat={{
              key: "all-sub",
              label: "All",
              icon: "/assets/ui/Category/All.png",
            }}
            active={activeSubcategory === null}
            onClick={() => setActiveSubcategory(null)}
            onHover={() => setHovered("All")}
            onLeave={() => setHovered(null)}
          />
          {selectedCategory?.subcategories?.map((sub) => (
            <FilterIcon
              key={sub.key}
              cat={sub}
              active={activeSubcategory === sub.key}
              onClick={() => setActiveSubcategory(sub.key)}
              onHover={() => setHovered(sub.label)}
              onLeave={() => setHovered(null)}
            />
          ))}
        </>
      )}

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

export default WeaponsToolbar;
