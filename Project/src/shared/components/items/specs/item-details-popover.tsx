import React, { useEffect, useRef } from "react";
import type { BaseItem } from "@shared/types";
import { isMod, isWeapon } from "@shared/types";
import { AttackProfilePanel } from "./attack-profile-panel";
import { ModDetailsView } from "./mod-details-view";
import { ItemDetailsHeader, ItemDetailsFooter } from "./item-details-header";
import { useItemDetails } from "@domains/equipment/hooks/use-item-details";

interface ItemDetailsPopoverProps {
  item: BaseItem;
}

const ItemDetailsPopover: React.FC<ItemDetailsPopoverProps> = ({ item }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    selectedAttack,
    hasMultipleAttacks,
    selectedIndex,
    totalAttacks,
    cycleAttack,
  } = useItemDetails({ item });

  // Handle Tab key to cycle through attacks like in-game
  useEffect(() => {
    if (!hasMultipleAttacks) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        cycleAttack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasMultipleAttacks, cycleAttack]);

  return (
    <div
      ref={containerRef}
      className={`
         border border-ui-primary/30 bg-ui-bg w-[280px] 
        shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl outline-none
      `}
      tabIndex={-1}
    >
      <ItemDetailsHeader
        name={item.name}
        selectedIndex={selectedIndex}
        totalAttacks={totalAttacks}
      />

      <div className="bg-linear-to-r from-black/90 from-5% via-black/40 via-50% to-black/90 to-95% min-h-[250px] flex flex-col">
        {isMod(item) ? (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <ModDetailsView item={item} />
          </div>
        ) : isWeapon(item) && selectedAttack ? (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <AttackProfilePanel
              weapon={item}
              attack={selectedAttack}
              showTitle={true}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center opacity-20 text-[10px] italic">
            CONTENIDO_MISSING
          </div>
        )}
      </div>

      <ItemDetailsFooter tags={item.tags ?? []} />
    </div>
  );
};

export default ItemDetailsPopover;
