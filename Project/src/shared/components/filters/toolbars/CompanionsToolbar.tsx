import { useFilterContext } from "../context";
import { useFilterLogic } from "../hooks/use-filter-logic";
import type { ViewFilterConfig } from "../types";
import FilterIcon from "../FilterIcon";

const config: ViewFilterConfig = {
  categories: [
    { key: "all", label: "All", icon: "/assets/ui/Category/All.png" },
    {
      key: "robotic",
      label: "Robotic",
      icon: "/assets/ui/Category/Companion/Robotic.png",
      subcategories: [
        {
          key: "sentinel",
          label: "Sentinel",
          icon: "/assets/ui/Category/Sentinel.png",
        },
        {
          key: "moa",
          label: "MOA",
          icon: "/assets/ui/Category/Companion/MOA.png",
        },
        {
          key: "hound",
          label: "Hound",
          icon: "/assets/ui/Category/Companion/Hound.png",
        },
      ],
    },
    {
      key: "beast",
      label: "Beast",
      icon: "/assets/ui/Category/Companion/Beast.png",
      subcategories: [
        {
          key: "kubrow",
          label: "Kubrow",
          icon: "/assets/ui/Category/Companion/Kubrow.png",
        },
        {
          key: "predasite",
          label: "Predasite",
          icon: "/assets/ui/Category/Companion/Predasite.png",
        },
        {
          key: "kavat",
          label: "Kavat",
          icon: "/assets/ui/Category/Companion/Kavat.png",
        },
        {
          key: "vulpaphyla",
          label: "Vulpaphyla",
          icon: "/assets/ui/Category/Companion/Vulpaphyla.png",
        },
      ],
    },
  ],
};

const CompanionsToolbar = () => {
  const filterState = useFilterContext();
  const { setHovered } = filterState;
  
  // En este dominio, 'selected' mapea a Family y 'activeSubcategory' a Kind
  // Redefinimos los setters para que coincidan con la taxonomía de Compañeros
  const {
    categories,
    selected,
    selectCategory,
    selectedCategory,
    activeSubcategory,
    setActiveSubcategory,
    hasSubcategories,
  } = useFilterLogic(config, {
    ...filterState,
    setCategory: (kind) => filterState.setCategory(kind),
    setFamily: (family) => filterState.setFamily(family)
  });

  const handleCategorySelect = (key: string) => {
    selectCategory(key);
    filterState.setFamily(key); // El nivel superior es Familia (Robotic/Beast)
    filterState.setCategory("all"); // Reset Kind
  };

  const handleSubSelect = (key: string | null) => {
    setActiveSubcategory(key);
    filterState.setCategory(key ?? "all"); // El nivel inferior es Kind (Sentinel/etc)
  };

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
            onClick={() => handleSubSelect(null)}
            onHover={() => setHovered("All")}
            onLeave={() => setHovered(null)}
          />
          {selectedCategory?.subcategories?.map((sub) => (
            <FilterIcon
              key={sub.key}
              cat={sub}
              active={activeSubcategory === sub.key}
              onClick={() => handleSubSelect(sub.key)}
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
          onClick={() => handleCategorySelect(cat.key)}
          onHover={() => setHovered(cat.label)}
          onLeave={() => setHovered(null)}
        />
      ))}
    </div>
  );
};

export default CompanionsToolbar;

