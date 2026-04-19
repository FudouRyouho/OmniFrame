import type { Weapon } from "@lib/types";
import {
  ItemDetailsFooter,
  ItemDetailsHeader,
} from "@shared/components/items/specs/item-details-header";
import { AttackProfilePanel } from "@shared/components/items/specs/attack-profile-panel";
import { useEffect } from "react";
import { useItemDetails } from "@domains/equipment/hooks/use-item-details";

/**
 * WeaponDetailsPopover - Popover especializado para weapons.
 *
 * Reutiliza AttackProfilePanel existente y useItemDetails para manejar múltiples ataques.
 */

type WeaponDetailsPopoverProps = {
  item: Weapon;
};

const WeaponDetailsPopover = ({ item }: WeaponDetailsPopoverProps) => {
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
        {selectedAttack ? (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <AttackProfilePanel
              weapon={item}
              attack={selectedAttack}
              showTitle={true}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center opacity-20 text-[10px] italic">
            NO_ATTACK_DATA
          </div>
        )}
      </div>

      <ItemDetailsFooter tags={item.tags ?? []} />
    </div>
  );
};

export default WeaponDetailsPopover;
