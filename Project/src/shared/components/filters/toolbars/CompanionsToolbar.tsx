import { useFilterContext } from "../context";
import { useFilterLogic } from "../hooks/use-filter-logic";
import type { ViewFilterConfig } from "../types";
import FilterIcon from "../FilterIcon";

const config: ViewFilterConfig = {
  categories: [
    { key: "All", label: "All", icon: "/assets/ui/Category/All.png" },
    {
      key: "Robotic",
      label: "Robotic",
      icon: "/assets/ui/Category/Companion/Robotic.png",
      subcategories: [
        {
          key: "Sentinel",
          label: "Sentinel",
          icon: "/assets/ui/Category/Sentinel.png",
        },
        {
          key: "MOA",
          label: "MOA",
          icon: "/assets/ui/Category/Companion/MOA.png",
        },
        {
          key: "Hound",
          label: "Hound",
          icon: "/assets/ui/Category/Companion/Hound.png",
        },
      ],
    },
    {
      key: "Beast",
      label: "Beast",
      icon: "/assets/ui/Category/Companion/Beast.png",
      subcategories: [
        {
          key: "Kubrow",
          label: "Kubrow",
          icon: "/assets/ui/Category/Companion/Kubrow.png",
        },
        {
          key: "Predasite",
          label: "Predasite",
          icon: "/assets/ui/Category/Companion/Predasite.png",
        },
        {
          key: "Kavat",
          label: "Kavat",
          icon: "/assets/ui/Category/Companion/Kavat.png",
        },
        {
          key: "Vulpaphyla",
          label: "Vulpaphyla",
          icon: "/assets/ui/Category/Companion/Vulpaphyla.png",
        },
      ],
    },
  ],
};

const CompanionsToolbar = () => {
  const { setHovered } = useFilterContext();
  const {
    categories,
    selected,
    selectCategory,
    selectedCategory,
    activeSubcategory,
    setActiveSubcategory,
    hasSubcategories,
  } = useFilterLogic(config);

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

export default CompanionsToolbar;
