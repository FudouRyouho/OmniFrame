import type { Arcane } from "@lib/types";
import {
  ItemDetailsFooter,
  ItemDetailsHeader,
} from "@shared/components/items/specs/item-details-header";

/**
 * ArcaneDetailsPopover - Popover especializado para arcanes.
 *
 * Placeholder: UI específica se implementará posteriormente.
 */

type ArcaneDetailsPopoverProps = {
  item: Arcane;
};

const ArcaneDetailsPopover = ({ item }: ArcaneDetailsPopoverProps) => {
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
        <div className="animate-in fade-in zoom-in-95 duration-300 p-4">
          <div className="space-y-2 text-[11px]">
            <div className="text-ui-accent uppercase tracking-wide">Arcane</div>
            <div className="text-ui-primary/70">
              {item.type || "Unknown type"}
            </div>

            <div className="mt-4 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-ui-primary/50">Category</span>
                <span className="text-ui-accent">{item.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ui-primary/50">Compatibility</span>
                <span className="text-ui-accent">
                  {item.compatName ?? "unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ui-primary/50">Max Rank</span>
                <span className="text-ui-accent">{item.maxRank}</span>
              </div>
              {item.rarity && (
                <div className="flex justify-between">
                  <span className="text-ui-primary/50">Rarity</span>
                  <span className="text-ui-accent">{item.rarity}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ItemDetailsFooter tags={item.tags ?? []} />
    </div>
  );
};

export default ArcaneDetailsPopover;
