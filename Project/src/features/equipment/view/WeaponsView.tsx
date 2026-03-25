import { useItems } from "../hooks/use-items";
import ItemsGrid from "../ItemsGrid";
import WeaponCard from "./cards/WeaponCard";
import type { Weapon } from "@lib/types";

const WeaponsView = () => {
    const { data, isLoading } = useItems(["primary", "secondary", "melee"]);

    return (<div className="h-full overflow-hidden">
        <ItemsGrid
            items={data}
            isLoading={isLoading}
            onSelect={() => {}}
            virtualization={{
                enabled: true,
                threshold: 100,
                itemSize: 175,
                overscan: 4,
                rowGap: 8,
                columnGap: 8,
            }}
            renderItem={(item) => (
                <WeaponCard 
                    key={item.id} 
                    item={item as Weapon}
                    onSelect={() => {}}
                />
            )}
        /></div>
    );
};

export default WeaponsView;
