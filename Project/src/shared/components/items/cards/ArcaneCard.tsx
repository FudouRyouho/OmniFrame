import type { Arcane } from "@shared/types";
import CustomPopover from "@shared/components/CustomPopover";
import BaseItemCard from "./BaseItemCard";
import ArcaneDetailsPopover from "@shared/components/popovers/popovers/arcane-details-popover";

/**
 * ArcaneCard - Card especializada para arcanes.
 */

type ArcaneCardProps = {
  item: Arcane;
  isSelected?: boolean;
  onClick?: (item: Arcane) => void;
};

const ArcaneCard = ({ item, isSelected = false, onClick }: ArcaneCardProps) => {
  return (
    <CustomPopover
      popover={<ArcaneDetailsPopover item={item} />}
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

export default ArcaneCard;
