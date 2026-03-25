import { useItems } from "../hooks/use-items";
import ItemsGrid from "../ItemsGrid";
import WarframeCard from "./cards/WarframeCard";
import type { Warframe } from "@lib/types";

const WarframesView = () => {
    const { data, isLoading } = useItems("warframe");

    return (
        <div className="h-full overflow-hidden">
        <ItemsGrid
            items={data}
            isLoading={isLoading}
            onSelect={() => {}}
            virtualization={{
                enabled: false,
                threshold: 250,
            }}
            renderItem={(item) => (
                <WarframeCard 
                    key={item.id} 
                    item={item as Warframe}
                    onSelect={() => {}}
                />
            )}
        />
         </div>
    );
};

export default WarframesView;
