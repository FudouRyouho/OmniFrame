import { useEquipment } from "../../context/EquipmentContext";
import { useViewFilter, type ViewFilterConfig } from "../../hooks/useViewFilter";

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
            {/* Subcategorías — aparecen cuando la categoría activa las tiene */}
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

            {/* Categorías principales */}
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

export default WeaponsToolbar;
