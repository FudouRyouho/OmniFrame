import type { Mod } from "@lib/types";
import CustomPopover from "@shared/components/CustomPopover";
import BaseItemCard from "./BaseItemCard";
import ModDetailsPopover from "../../popover/popovers/mod-details-popover";

/**
 * ModCard - Card especializada para mods.
 */

type ModCardProps = {
  item: Mod;
  isSelected?: boolean;
  onSelect?: (item: Mod) => void;
};

const ModCard = ({ item, isSelected = false, onSelect }: ModCardProps) => {
  return (
    <CustomPopover 
      popover={<ModDetailsPopover item={item} />}
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

export default ModCard;
