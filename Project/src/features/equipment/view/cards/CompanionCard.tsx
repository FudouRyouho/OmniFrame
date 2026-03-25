import type { Companion } from "@lib/types";
import CustomPopover from "@shared/components/CustomPopover";
import BaseItemCard from "./BaseItemCard";
import CompanionDetailsPopover from "../../popover/popovers/companion-details-popover";

/**
 * CompanionCard - Card especializada para companions.
 */

type CompanionCardProps = {
  item: Companion;
  isSelected?: boolean;
  onSelect?: (item: Companion) => void;
};

const CompanionCard = ({ item, isSelected = false, onSelect }: CompanionCardProps) => {
  return (
    <CustomPopover 
      popover={<CompanionDetailsPopover item={item} />}
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

export default CompanionCard;
