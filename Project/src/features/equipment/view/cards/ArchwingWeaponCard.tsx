import type { ArchwingWeapon } from "@lib/types";
import CustomPopover from "@shared/components/CustomPopover";
import BaseItemCard from "./BaseItemCard";
import ArchwingWeaponDetailsPopover from "../../popover/popovers/archwing-weapon-details-popover";

/**
 * ArchwingWeaponCard - Card especializada para archwing weapons.
 */

type ArchwingWeaponCardProps = {
  item: ArchwingWeapon;
  isSelected?: boolean;
  onSelect?: (item: ArchwingWeapon) => void;
};

const ArchwingWeaponCard = ({ item, isSelected = false, onSelect }: ArchwingWeaponCardProps) => {
  return (
    <CustomPopover 
      popover={<ArchwingWeaponDetailsPopover item={item} />}
      placement="right-start"
    >
      <BaseItemCard
        item={item}
        isSelected={isSelected}
        onClick={() => onSelect?.(item)}
      />
    </CustomPopover>
  );
};

export default ArchwingWeaponCard;
