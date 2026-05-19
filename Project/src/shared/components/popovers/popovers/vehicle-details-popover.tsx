import type { Vehicle } from "@shared/types";
import {
  ItemDetailsHeader,
  ItemDetailsFooter,
} from "@shared/components/items/specs/item-details-header";

/**
 * VehicleDetailsPopover - Popover especializado para vehicles (Necramech, Archwing).
 *
 * Placeholder: UI específica se implementará posteriormente.
 * Nota: Vehicles tienen abilities — se integrará ability-popover.tsx en el futuro.
 */

type VehicleDetailsPopoverProps = {
  item: Vehicle;
};

const VehicleDetailsPopover = ({ item }: VehicleDetailsPopoverProps) => {
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
            <div className="text-ui-accent uppercase tracking-wide">
              {item.kind}
            </div>
            <div className="text-ui-primary/70">
              {item.description || "No description"}
            </div>

            <div className="mt-4 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-ui-primary/50">Health</span>
                <span className="text-ui-accent">{item.stats.health}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ui-primary/50">Shield</span>
                <span className="text-ui-accent">{item.stats.shield}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ui-primary/50">Armor</span>
                <span className="text-ui-accent">{item.stats.armor}</span>
              </div>
              {item.abilities && item.abilities.length > 0 && (
                <div className="mt-2 text-ui-primary/50">
                  {item.abilities.length} abilities
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

export default VehicleDetailsPopover;
