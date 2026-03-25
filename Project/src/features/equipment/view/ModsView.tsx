import { useItems } from "../hooks/use-items";
import ItemsGrid from "../ItemsGrid";
import ModCard from "./cards/ModCard";
import type { Mod } from "@lib/types";

const ModsView = () => {
    const { data, isLoading } = useItems("mod");

    return (<div className="h-full overflow-hidden">
        <ItemsGrid
            items={data}
            isLoading={isLoading}
            onSelect={() => {}}
            virtualization={{
                enabled: true,
                threshold: 80,
                itemSize: 190,
                overscan: 5,
                rowGap: 10,
                columnGap: 10,
            }}
            renderItem={(item) => (
                <ModCard 
                    key={item.id} 
                    item={item as Mod}
                    onSelect={() => {}}
                />
            )}
        /></div>
    );
};

export default ModsView;
