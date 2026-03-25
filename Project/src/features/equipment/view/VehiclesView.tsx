import { useItems } from "../hooks/use-items";
import ItemsGrid from "../ItemsGrid";
import VehicleCard from "./cards/VehicleCard";
import type { Vehicle } from "@lib/types";

const VehiclesView = () => {
    const { data, isLoading } = useItems(["necramech", "archwing"]);

    return (<div className="h-full overflow-hidden">
        <ItemsGrid
            items={data}
            isLoading={isLoading}
            onSelect={() => {}}
            renderItem={(item) => (
                <VehicleCard 
                    key={item.id} 
                    item={item as Vehicle}
                    onSelect={() => {}}
                />
            )}
        /></div>
    );
};

export default VehiclesView;
