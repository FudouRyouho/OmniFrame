import type { Weapon } from "@shared/types";
import CustomPopover from "@shared/components/CustomPopover";
import BaseItemCard from "./BaseItemCard";
import WeaponDetailsPopover from "@shared/components/popovers/popovers/weapon-details-popover";

/**
 * WeaponCard - Card especializada para weapons.
 */

type WeaponCardProps = {
  item: Weapon;
  isSelected?: boolean;
  onClick?: (item: Weapon) => void;
};

const WeaponCard = ({ item, isSelected = false, onClick }: WeaponCardProps) => {
  return (
    <CustomPopover
      popover={<WeaponDetailsPopover item={item} />}
      placement="right-start"
    >
      <BaseItemCard
        item={item}
        isSelected={isSelected}
        onClick={() => onClick?.(item)}
      />
    </CustomPopover>
  );
};

export default WeaponCard;
