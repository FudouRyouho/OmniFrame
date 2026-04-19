import type { Weapon } from "@lib/types";
import CustomPopover from "@shared/components/CustomPopover";
import BaseItemCard from "./BaseItemCard";
import WeaponDetailsPopover from "@shared/components/popovers/popovers/weapon-details-popover";

/**
 * WeaponCard - Card especializada para weapons.
 */

type WeaponCardProps = {
  item: Weapon;
  isSelected?: boolean;
  onSelect?: (item: Weapon) => void;
};

const WeaponCard = ({
  item,
  isSelected = false,
  onSelect,
}: WeaponCardProps) => {
  return (
    <CustomPopover
      popover={<WeaponDetailsPopover item={item} />}
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

export default WeaponCard;
