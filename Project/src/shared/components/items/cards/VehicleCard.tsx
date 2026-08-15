import type { Vehicle } from "@shared/types";
import CustomPopover from "@shared/components/CustomPopover";
import BaseItemCard from "./BaseItemCard";
import VehicleDetailsPopover from "@shared/components/popovers/popovers/vehicle-details-popover";

/**
 * VehicleCard - Card especializada para vehicles (Necramech, Archwing).
 */

type VehicleCardProps = {
  item: Vehicle;
  isSelected?: boolean;
  onClick?: (item: Vehicle) => void;
};

const VehicleCard = ({
  item,
  isSelected = false,
  onClick,
}: VehicleCardProps) => {
  return (
    <CustomPopover
      popover={<VehicleDetailsPopover item={item} />}
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

export default VehicleCard;
