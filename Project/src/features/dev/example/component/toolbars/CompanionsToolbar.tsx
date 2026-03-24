import { useDataState } from "@providers/DataState/data-state-context";
import { useEquipment } from "../../context/EquipmentContext";
import { useViewFilter, type ViewFilterConfig } from "../../hooks/useViewFilter";

const config: ViewFilterConfig = {
    categories: [
        { key: "All", label: "All", icon: "/assets/ui/Category/All.png" },
        {
            key: "Robotic", label: "Robotic", icon: "/assets/ui/Category/Companion/Robotic.png",
            subcategories: [
                { key: "Sentinel", label: "Sentinel", icon: "/assets/ui/Category/Sentinel.png" },
                { key: "MOA", label: "MOA", icon: "/assets/ui/Category/Companion/MOA.png" },
                { key: "Hound", label: "Hound", icon: "/assets/ui/Category/Companion/Hound.png" },
            ],
        },
        {
            key: "Beast", label: "Beast", icon: "/assets/ui/Category/Companion/Beast.png",
            subcategories: [
                { key: "Kubrow", label: "Kubrow", icon: "/assets/ui/Category/Companion/Kubrow.png" },
                { key: "Predasite", label: "Predasite", icon: "/assets/ui/Category/Companion/Predasite.png" },
                { key: "Kavat", label: "Kavat", icon: "/assets/ui/Category/Companion/Kavat.png" },
                { key: "Vulpaphyla", label: "Vulpaphyla", icon: "/assets/ui/Category/Companion/Vulpaphyla.png" },
            ],
        },
    ],
};

const CompanionsToolbar = () => {
    const { setHovered } = useEquipment();
    const { categories, selected, selectCategory, selectedCategory, activeSubcategory, setActiveSubcategory, hasSubcategories } = useViewFilter(config);

    return (
        <div className="flex items-center gap-2">
            {hasSubcategories && (
                <>
                    <span
                        className={`px-2 py-1 border-b text-xs outline-none cursor-pointer ${activeSubcategory === null ? "border-ui-accent text-ui-accent" : "border-ui-primary text-ui-secondary hover:text-ui-primary"}`}
                        onClick={() => setActiveSubcategory(null)}
                        onMouseEnter={() => setHovered("All")}
                        onMouseLeave={() => setHovered(null)}
                    >
                        All
                    </span>
                    {selectedCategory?.subcategories?.map((sub) => (
                        <span
                            key={sub.key}
                            className={`px-2 py-1 border-b text-xs outline-none cursor-pointer ${activeSubcategory === sub.key ? "border-ui-accent text-ui-accent" : "border-ui-primary text-ui-secondary hover:text-ui-primary"}`}
                            onClick={() => setActiveSubcategory(sub.key)}
                            onMouseEnter={() => setHovered(sub.label)}
                            onMouseLeave={() => setHovered(null)}
                            title={sub.label}
                        >
                            <img src={sub.icon} alt={sub.label} className="w-4 h-4 inline align-middle" />
                        </span>
                    ))}
                </>
            )}

            {categories.map((cat) => {
                const active = selected === cat.key;
                const ref = useDataState({active: active})
                return (
                    <span
                        key={cat.key}
                        ref={ref}
                        className={"button-bordeless"}
                        onClick={() => selectCategory(cat.key)}
                        onMouseEnter={() => setHovered(cat.label)}
                        onMouseLeave={() => setHovered(null)}
                        title={cat.label}
                    >
                        <img src={cat.icon} alt={cat.label} className="w-4 h-4 inline align-middle" />
                    </span>
                );
            })}
        </div>
    );
};

export default CompanionsToolbar;
