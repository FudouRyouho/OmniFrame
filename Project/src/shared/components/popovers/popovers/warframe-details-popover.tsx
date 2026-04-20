import type { Warframe } from "@shared/types";
import {
  ItemDetailsHeader,
  ItemDetailsFooter,
} from "@shared/components/items/specs/item-details-header";

/**
 * WarframeDetailsPopover - Popover especializado para warframes.
 *
 * Placeholder: reutiliza la estructura de ItemDetailsPopover existente.
 * Se expandirá con contenido específico de warframes en iteraciones futuras.
 *
 * Estructura reutilizada:
 * - ItemDetailsHeader (nombre + tabs si aplica)
 * - Contenido central (placeholder por ahora)
 * - ItemDetailsFooter (tags)
 */

type WarframeDetailsPopoverProps = {
  item: Warframe;
};

const WarframeDetailsPopover = ({ item }: WarframeDetailsPopoverProps) => {
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
          {/* Placeholder: contenido específico de warframe se añadirá aquí */}
          <div className="space-y-2 text-[11px]">
            <div className="text-ui-accent uppercase tracking-wide">
              Warframe
            </div>
            <div className="text-ui-primary/70">
              {item.description || "No description"}
            </div>

            {/* Stats básicos */}
            <div className="mt-4 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-ui-primary/50">Health</span>
                <span className="text-ui-accent">{item.health}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ui-primary/50">Shield</span>
                <span className="text-ui-accent">{item.shield}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ui-primary/50">Armor</span>
                <span className="text-ui-accent">{item.armor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ui-primary/50">Energy</span>
                <span className="text-ui-accent">{item.energy}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ItemDetailsFooter tags={item.tags ?? []} />
    </div>
  );
};

export default WarframeDetailsPopover;
