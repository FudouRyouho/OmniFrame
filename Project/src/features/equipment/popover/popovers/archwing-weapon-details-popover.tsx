import type { ArchwingWeapon } from "@lib/types";
import { ItemDetailsHeader, ItemDetailsFooter } from "../../details/item-details-header";

/**
 * ArchwingWeaponDetailsPopover - Popover especializado para archwing weapons.
 * 
 * Placeholder: UI específica se implementará posteriormente.
 * Nota: Similar a weapons pero con stats específicos de archwing.
 */

type ArchwingWeaponDetailsPopoverProps = {
  item: ArchwingWeapon;
};

const ArchwingWeaponDetailsPopover = ({ item }: ArchwingWeaponDetailsPopoverProps) => {
  return (
    <div
      className={`
        wf-panel-cut border border-ui-primary/30 bg-ui-bg w-[280px] 
        shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl outline-none
      `}
      tabIndex={-1}
    >
      <ItemDetailsHeader
        name={item.name}
        selectedIndex={0}
        totalAttacks={1}
      />

      <div className="bg-linear-to-r from-black/90 from-5% via-black/40 via-50% to-black/90 to-95% min-h-[250px] flex flex-col">
        <div className="animate-in fade-in zoom-in-95 duration-300 p-4">
          <div className="space-y-2 text-[11px]">
            <div className="text-ui-accent uppercase tracking-wide">{item.category}</div>
            <div className="text-ui-primary/70">{item.description || 'No description'}</div>
            
            <div className="mt-4 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-ui-primary/50">Total Damage</span>
                <span className="text-ui-accent">{item.totalDamage.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ui-primary/50">Crit Chance</span>
                <span className="text-ui-accent">{(item.criticalChance * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ui-primary/50">Crit Mult</span>
                <span className="text-ui-accent">{item.criticalMultiplier.toFixed(1)}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ui-primary/50">Status</span>
                <span className="text-ui-accent">{(item.procChance * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ItemDetailsFooter tags={item.tags ?? []} />
    </div>
  );
};

export default ArchwingWeaponDetailsPopover;
