import { useEquipment } from "../../context/EquipmentContext";
import { useViewFilter, type ViewFilterConfig } from "../../hooks/useViewFilter";

const config: ViewFilterConfig = {
    categories: [
        { key: "All", label: "All", icon: "/assets/ui/Category/All.png" },
        { key: "Archwing", label: "Archwing", icon: "/assets/ui/Category/Archwing.png" },
        { key: "K-Drive", label: "K-Drive", icon: "/assets/ui/Category/KDrive.png" },
        { key: "Necramech", label: "Necramech", icon: "/assets/ui/Category/Necramech.png" },
        { key: "Plexus", label: "Plexus", icon: "/assets/ui/Category/Plexus.png" },
    ],
};

const VehiclesToolbar = () => {
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

export default VehiclesToolbar;
