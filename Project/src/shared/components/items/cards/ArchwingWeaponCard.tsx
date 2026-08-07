import type { ArchwingWeapon } from "@shared/types";
import CustomPopover from "@shared/components/CustomPopover";
import BaseItemCard from "./BaseItemCard";
import ArchwingWeaponDetailsPopover from "@shared/components/popovers/popovers/archwing-weapon-details-popover";

/**
 * ArchwingWeaponCard - Card especializada para archwing weapons.
 */

type ArchwingWeaponCardProps = {
  item: ArchwingWeapon;
  isSelected?: boolean;
  onClick?: (item: ArchwingWeapon) => void;
};

const ArchwingWeaponCard = ({
  item,
  isSelected = false,
  onClick,
}: ArchwingWeaponCardProps) => {
  return (
    <CustomPopover
      popover={<ArchwingWeaponDetailsPopover item={item} />}
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

export default ArchwingWeaponCard;
