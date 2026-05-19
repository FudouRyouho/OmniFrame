import type { Companion } from "@shared/types";
import CustomPopover from "@shared/components/CustomPopover";
import BaseItemCard from "./BaseItemCard";
import CompanionDetailsPopover from "@shared/components/popovers/popovers/companion-details-popover";

/**
 * CompanionCard - Card especializada para companions.
 */

type CompanionCardProps = {
  item: Companion;
  isSelected?: boolean;
  onClick?: (item: Companion) => void;
};

const CompanionCard = ({
  item,
  isSelected = false,
  onClick,
}: CompanionCardProps) => {
  return (
    <CustomPopover
      popover={<CompanionDetailsPopover item={item} />}
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

export default CompanionCard;
