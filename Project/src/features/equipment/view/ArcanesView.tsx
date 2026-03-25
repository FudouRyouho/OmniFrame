import { useItems } from "../hooks/use-items";
import ItemsGrid from "../ItemsGrid";
import ArcaneCard from "./cards/ArcaneCard";
import type { Arcane } from "@lib/types";

const ArcanesView = () => {
    const { data, isLoading } = useItems("arcane");

    return (
        <div className="h-full overflow-hidden">
        <ItemsGrid
            items={data}
            isLoading={isLoading}
            onSelect={() => {}}
            renderItem={(item) => (
                <ArcaneCard 
                    key={item.id} 
                    item={item as Arcane}
                    onSelect={() => {}}
                />
            )}
        />
        </div>
    );
};

export default ArcanesView;
