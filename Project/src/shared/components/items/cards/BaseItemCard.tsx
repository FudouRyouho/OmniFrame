import classNames from "classnames";
import type { BaseItem } from "@shared/types";
import type { ReactNode } from "react";
import { forwardRef } from "react";
import ModFrameVisual from "../visuals/ModFrameVisual";

/**
 * BaseItemCard - Componente base para cards de items.
 *
 * Extrae la lógica compartida del ItemsGrid original:
 * - Layout del card (aspect ratio, borders, padding)
 * - Estados de hover y selección
 * - Renderizado de imagen con fallback
 * - Glow effects y transiciones
 *
 * NO incluye popover — eso es responsabilidad de cada card especializada.
 *
 * Usa forwardRef para que CustomPopover pueda agregar event listeners correctamente.
 *
 * Ownership actual (2026-04-01):
 * - permanece dentro de `domains/equipment/` aunque su lectura ya sea la de una pieza reusable fina
 * - no debe moverse a una base transversal por anticipación; la extracción física queda diferida
 *   hasta que exista un segundo consumer real y estable (por ejemplo `Arsenal > Swap`) que lo justifique
 * - los comportamientos contextuales como hover/details deben componerse por encima de esta base
 *   y no volver a mezclarse aquí por conveniencia
 */

export type BaseItemCardProps = {
  item: BaseItem;
  isSelected?: boolean;
  onClick?: () => void;
  children?: ReactNode;
};

const BaseItemCard = forwardRef<HTMLButtonElement, BaseItemCardProps>(
  ({ item, isSelected = false, onClick, children }, ref) => {
    // Renderizado Transicional: Si es mod/arcano usamos la anatomía rectangular, sino la cuadrada.
    const isMod = item.domain === "mod" || item.domain === "arcane";

    return (
      <button
        ref={ref}
        className={classNames(
          "group w-full h-full relative cursor-pointer outline-none transition-all duration-200 hover:z-50",
          !isMod && "border p-1 rounded-md",
          isSelected
            ? isMod
              ? ""
              : "border-ui-accent shadow-[0_0_10px_rgba(var(--color-ui-accent),0.3)]"
            : !isMod
              ? "border-ui-primary hover:border-b-ui-accent"
              : "",
        )}
        type="button"
        onClick={onClick}
      >
        <div
          className={classNames(
            "flex flex-col w-full relative",
            !isMod && "aspect-square overflow-hidden",
          )}
        >
          {isMod ? (
            /* --- ANATOMIA DE MOD --- */
            <ModFrameVisual
              rarity={(item as any).rarity || "common"}
              imageUrl={item.image ?? undefined}
              name={item.name}
              description={(item as any).description || ""}
              cost={(item as any).drain || (item as any).capacity || 0}
              polarity={(item as any).polarity}
              className="absolute inset-0 z-10"
            />
          ) : (
            /* --- ANATOMIA CUADRADA STANDAR --- */
            <>
              {/* Fondo Base (Oscuro) */}
              <div className="absolute inset-0 z-0 bg-linear-to-b from-black/20 via-black/40 to-black/80" />

              {/* Glow de Hover (Estilo Warframe) */}
              <div className="bg-glow" />

              {/* Contenedor de Imagen con Zoom */}
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="object-contain transition-transform duration-500 group-hover:scale-[1.25]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ui-primary/20 text-[10px] uppercase tracking-widest">
                    No Image
                  </div>
                )}
              </div>

              {/* Texto inferior (comparte el fondo) */}
              <div className="mt-auto relative z-10 w-full p-2 pt-4 text-left flex flex-row justify-between pointer-events-none">
                <div className="text-ui-accent text-[11px] font-bold tracking-wide uppercase truncate drop-shadow-md">
                  {item.name}
                </div>
                <div className="text-ui-primary/70 text-[9px] font-medium tracking-tight truncate">
                  {item.kind}
                </div>
              </div>
            </>
          )}

          {/* Slot para contenido adicional (ej: badges, overlays) */}
          <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between">
            {children}
          </div>
        </div>
      </button>
    );
  },
);

BaseItemCard.displayName = "BaseItemCard";

export default BaseItemCard;
