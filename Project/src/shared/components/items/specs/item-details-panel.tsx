import type { BaseItem } from "@shared/types";
import { isMod, isWeapon } from "@shared/types";
import { AttackProfilePanel } from "./attack-profile-panel";
import { ModDetailsView } from "./mod-details-view";
import { ItemDetailsHeader, ItemDetailsFooter } from "./item-details-header";

const ItemDetailsPanel = ({ item }: { item: BaseItem }) => {
  return (
    <div className="item-details-panel-container flex flex-col h-full border border-ui-primary bg-ui-bg overflow-hidden">
      <ItemDetailsHeader name={item.name} />

      <div className="flex-1 overflow-y-auto bg-linear-to-r from-black/80 from-10% via-black/30 via-50% to-black/80 to-90%">
        {isMod(item) ? (
          <ModDetailsView item={item} />
        ) : isWeapon(item) ? (
          item.stats.attacks?.map((attack: any, index: number) => (
            <AttackProfilePanel
              key={`${attack.name}-${index}`}
              weapon={item}
              attack={attack}
              showTitle={true}
            />
          ))
        ) : null}

      </div>

      <ItemDetailsFooter tags={item.tags} />
    </div>
  );
};

export default ItemDetailsPanel;
