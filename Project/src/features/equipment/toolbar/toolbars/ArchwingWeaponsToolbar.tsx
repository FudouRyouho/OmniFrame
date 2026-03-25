import { useEquipment } from "../../context/EquipmentContext";
import { useViewFilter, type ViewFilterConfig } from "../../hooks/useViewFilter";
import FilterIcon from "../FilterIcon";

const config: ViewFilterConfig = {
    categories: [
        { key: "All", label: "All", icon: "/assets/ui/Category/All.png" },
        { key: "Arch-Gun", label: "Arch-Gun", icon: "/assets/ui/Category/Archgun.png" },
        { key: "Arch-Melee", label: "Arch-Melee", icon: "/assets/ui/Category/Archmelee.png" },
    ],
};

const ArchwingWeaponsToolbar = () => {
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

export default ArchwingWeaponsToolbar;
