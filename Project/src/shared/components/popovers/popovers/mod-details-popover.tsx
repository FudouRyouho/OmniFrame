import type { Mod } from "@lib/types";
import {
  ItemDetailsFooter,
  ItemDetailsHeader,
} from "@shared/components/items/specs/item-details-header";
import { ModDetailsView } from "@shared/components/items/specs/mod-details-view";

/**
 * ModDetailsPopover - Popover especializado para mods.
 *
 * Reutiliza ModDetailsView existente.
 */

type ModDetailsPopoverProps = {
  item: Mod;
};

const ModDetailsPopover = ({ item }: ModDetailsPopoverProps) => {
  return (
    <div
      className={`
         border border-ui-primary/30 bg-ui-bg w-[280px] 
        shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl outline-none
      `}
      tabIndex={-1}
    >
      <ItemDetailsHeader name={item.name} selectedIndex={0} totalAttacks={1} />

      <div className="bg-linear-to-r from-black/90 from-5% via-black/40 via-50% to-black/90 to-95% min-h-[250px] flex flex-col">
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <ModDetailsView item={item} />
        </div>
      </div>

      <ItemDetailsFooter tags={item.tags ?? []} />
    </div>
  );
};

export default ModDetailsPopover;
