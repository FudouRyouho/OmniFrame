import { useEquipment } from "../../context/EquipmentContext";
import { useViewFilter, type ViewFilterConfig } from "../../hooks/useViewFilter";
import FilterIcon from "../FilterIcon";

const config: ViewFilterConfig = {
    categories: [
        { key: "All", label: "All", icon: "/assets/ui/Category/All.png" },
        {
            key: "Primary", label: "Primary", icon: "/assets/ui/Category/Primary.png",
            subcategories: [
                { key: "Rifle", label: "Rifle", icon: "/assets/ui/Category/Primary/Rifle.png" },
                { key: "Machine Gun", label: "Machine Gun", icon: "/assets/ui/Category/Primary/MachineGun.png" },
                { key: "Precision Rifle", label: "Precision Rifle", icon: "/assets/ui/Category/Primary/Sniper.png" },
                { key: "Shotgun", label: "Shotgun", icon: "/assets/ui/Category/Primary/Shotgun.png" },
                { key: "Beam", label: "Beam", icon: "/assets/ui/Category/Primary/Beam.png" },
                { key: "Bow", label: "Bow / Crossbow", icon: "/assets/ui/Category/Primary/Bow.png" },
                { key: "Launcher", label: "Launcher", icon: "/assets/ui/Category/Primary/Launcher.png" },
                { key: "Misc", label: "Miscellaneous", icon: "/assets/ui/Category/Misc.png" },
            ],
        },
        {
            key: "Secondary", label: "Secondary", icon: "/assets/ui/Category/Secondary.png",
            subcategories: [
                { key: "Pistol", label: "Pistol", icon: "/assets/ui/Category/Secondary/Pistol.png" },
                { key: "SMG", label: "SMG", icon: "/assets/ui/Category/Secondary/SMG.png" },
                { key: "Shotgun", label: "Shotgun", icon: "/assets/ui/Category/Secondary/Shotgun.png" },
                { key: "Beam", label: "Beam", icon: "/assets/ui/Category/Secondary/Beam.png" },
                { key: "Throwable", label: "Throwable", icon: "/assets/ui/Category/Secondary/Throwable.png" },
                { key: "Misc", label: "Miscellaneous", icon: "/assets/ui/Category/Misc.png" },
            ],
        },
        {
            key: "Melee", label: "Melee", icon: "/assets/ui/Category/Melee.png",
            subcategories: [
                { key: "Light Blade", label: "Light Blade", icon: "/assets/ui/Category/Melee/LightBlade.png" },
                { key: "Fist", label: "Fist / Fans", icon: "/assets/ui/Category/Melee/FistFans.png" },
                { key: "2H Blade", label: "Two Handed Blades", icon: "/assets/ui/Category/Melee/2HBlade.png" },
                { key: "Scythe", label: "Scythe", icon: "/assets/ui/Category/Melee/Scythe.png" },
                { key: "Polearm", label: "Staff / Polearm", icon: "/assets/ui/Category/Melee/Polearm.png" },
                { key: "Hammer", label: "Hammer", icon: "/assets/ui/Category/Melee/Hammer.png" },
                { key: "Ranged", label: "Range Melee", icon: "/assets/ui/Category/Melee/Ranged.png" },
                { key: "Misc", label: "Miscellaneous", icon: "/assets/ui/Category/Misc.png" },
            ],
        },
    ],
};

const WeaponsToolbar = () => {
    const { setHovered } = useEquipment();
    const { categories, selected, selectCategory, selectedCategory, activeSubcategory, setActiveSubcategory, hasSubcategories } = useViewFilter(config);

    return (
        <div className="flex items-center gap-2">
            {/* Subcategorías dinámicas */}
            {hasSubcategories && (
                <>
                    <FilterIcon
                        cat={{ key: "all-sub", label: "All", icon: "/assets/ui/Category/All.png" }}
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

            {/* Categorías principales */}
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
