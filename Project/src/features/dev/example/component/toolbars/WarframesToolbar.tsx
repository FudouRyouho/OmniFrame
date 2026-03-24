import { useEquipment } from "../../context/EquipmentContext";
import { useViewFilter, type ViewFilterConfig } from "../../hooks/useViewFilter";

const config: ViewFilterConfig = {
    categories: [
        { key: "All", label: "All", icon: "/assets/ui/Category/All.png" },
        { key: "Damage", label: "Damage", icon: "/assets/ui/Category/Warframe/Damage.png" },
        { key: "Crowd Control", label: "Crowd Control", icon: "/assets/ui/Category/Warframe/CrowdControl.png" },
        { key: "Support", label: "Support", icon: "/assets/ui/Category/Warframe/Support.png" },
        { key: "Survival", label: "Survival", icon: "/assets/ui/Category/Warframe/Survival.png" },
        { key: "Stealth", label: "Stealth", icon: "/assets/ui/Category/Warframe/Stealth.png" },
    ],
};

const WarframesToolbar = () => {
    const { setHovered } = useEquipment();
    const { categories, selected, selectCategory } = useViewFilter(config);

    return (
        <div className="flex items-center gap-2">
            {categories.map((cat) => {
                const active = selected === cat.key;
                return (
                    <span
                        key={cat.key}
                        className={`px-2 py-1 border-b text-xs outline-none cursor-pointer ${active ? "border-ui-accent text-ui-accent" : "border-ui-primary text-ui-secondary hover:text-ui-primary"}`}
                        onClick={() => selectCategory(cat.key)}
                        onMouseEnter={() => setHovered(cat.label)}
                        onMouseLeave={() => setHovered(null)}
                    >
                        <img src={cat.icon} alt={cat.label} className="w-4 h-4 inline align-middle" />
                    </span>
                );
            })}
        </div>
    );
};

export default WarframesToolbar;
