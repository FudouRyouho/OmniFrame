import type { Warframe } from "@lib/types";
import CustomPopover from "@shared/components/CustomPopover";
import BaseItemCard from "./BaseItemCard";
import WarframeDetailsPopover from "@shared/components/popovers/popovers/warframe-details-popover";

/**
 * WarframeCard - Card especializada para warframes.
 *
 * Composición:
 * - BaseItemCard para layout y estilos
 * - WarframeDetailsPopover para el popover especializado
 * - CustomPopover para el comportamiento de hover
 */

type WarframeCardProps = {
  item: Warframe;
  isSelected?: boolean;
  onSelect?: (item: Warframe) => void;
};

const WarframeCard = ({
  item,
  isSelected = false,
  onSelect,
}: WarframeCardProps) => {
  return (
    <CustomPopover
      popover={<WarframeDetailsPopover item={item} />}
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

export default WarframeCard;
