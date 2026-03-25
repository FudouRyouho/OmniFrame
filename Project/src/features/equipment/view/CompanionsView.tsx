import { useItems } from "../hooks/use-items";
import ItemsGrid from "../ItemsGrid";
import CompanionCard from "./cards/CompanionCard";
import type { Companion } from "@lib/types";

const CompanionsView = () => {
    const { data, isLoading } = useItems("companion");

    return (<div className="h-full overflow-hidden">
        <ItemsGrid
            items={data}
            isLoading={isLoading}
            onSelect={() => {}}
            renderItem={(item) => (
                <CompanionCard 
                    key={item.id} 
                    item={item as Companion}
                    onSelect={() => {}}
                />
            )}
        />
        </div>
    );
};

export default CompanionsView;
