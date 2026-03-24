import { useDataState } from "@providers/DataState/data-state-context";
import { useEquipment } from "../../context/EquipmentContext";
import { useViewFilter, type ViewFilterConfig } from "../../hooks/useViewFilter";

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

export default ArchwingWeaponsToolbar;
