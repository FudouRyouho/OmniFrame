import { useItems } from "../hooks/use-items";
import ItemsGrid from "../ItemsGrid";
import ArchwingWeaponCard from "./cards/ArchwingWeaponCard";
import type { ArchwingWeapon } from "@lib/types";

const ArchwingWeaponsView = () => {
    const { data, isLoading } = useItems(["archgun", "archmelee"]);

    return (
        <div className="h-full overflow-hidden">
        <ItemsGrid
            items={data}
            isLoading={isLoading}
            onSelect={() => {}}
            renderItem={(item) => (
                <ArchwingWeaponCard 
                    key={item.id} 
                    item={item as ArchwingWeapon}
                    onSelect={() => {}}
                />
            )}
        />
        </div>
    );
};

export default ArchwingWeaponsView;
