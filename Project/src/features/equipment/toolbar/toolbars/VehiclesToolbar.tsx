import { useEquipment } from "../../context/EquipmentContext";
import { useViewFilter, type ViewFilterConfig } from "../../hooks/useViewFilter";
import FilterIcon from "../FilterIcon";

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

export default VehiclesToolbar;
