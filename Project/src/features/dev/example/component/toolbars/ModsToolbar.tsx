import { useEquipment } from "../../context/EquipmentContext";
import { useViewFilter, type ViewFilterConfig } from "../../hooks/useViewFilter";

const config: ViewFilterConfig = {
    categories: [
        { key: "All", label: "All", icon: "/assets/ui/Category/All.png" },
        { key: "Warframe", label: "Warframe", icon: "/assets/ui/Category/Warframe.png" },
        { key: "Aura", label: "Aura", icon: "/assets/ui/Category/Aura.png" },
        { key: "Augment", label: "Augment", icon: "/assets/ui/Category/Augment.png" },
        { key: "Primary", label: "Primary", icon: "/assets/ui/Category/Primary.png" },
        { key: "Secondary", label: "Secondary", icon: "/assets/ui/Category/Secondary.png" },
        { key: "Melee", label: "Melee", icon: "/assets/ui/Category/Melee.png" },
        { key: "Stance", label: "Stance", icon: "/assets/ui/Category/Stance.png" },
        { key: "Exilus", label: "Exilus", icon: "/assets/ui/Category/Exilus.png" },
        { key: "Vehicles", label: "Vehicles", icon: "/assets/ui/Category/Archwing.png" },
        { key: "Archgun", label: "Archgun", icon: "/assets/ui/Category/Archgun.png" },
        { key: "Archmelee", label: "Archmelee", icon: "/assets/ui/Category/Archmelee.png" },
        { key: "Robotic", label: "Robotic", icon: "/assets/ui/Category/Sentinel.png" },
        { key: "Beast", label: "Beast", icon: "/assets/ui/Category/Companion/Beast.png" },
    ],
};

const ModsToolbar = () => {
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
                        title={cat.label}
                    >
                        <img src={cat.icon} alt={cat.label} className="w-4 h-4 inline align-middle" />
                    </span>
                );
            })}
        </div>
    );
};

export default ModsToolbar;
