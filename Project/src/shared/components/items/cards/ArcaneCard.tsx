import type { Arcane } from "@lib/types";
import CustomPopover from "@shared/components/CustomPopover";
import BaseItemCard from "./BaseItemCard";
import ArcaneDetailsPopover from "@shared/components/popovers/popovers/arcane-details-popover";

/**
 * ArcaneCard - Card especializada para arcanes.
 */

type ArcaneCardProps = {
  item: Arcane;
  isSelected?: boolean;
  onSelect?: (item: Arcane) => void;
};

const ArcaneCard = ({
  item,
  isSelected = false,
  onSelect,
}: ArcaneCardProps) => {
  return (
    <CustomPopover
      popover={<ArcaneDetailsPopover item={item} />}
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

export default ArcaneCard;
