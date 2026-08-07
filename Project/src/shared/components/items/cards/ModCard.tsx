import type { Mod } from "@shared/types";
import CustomPopover from "@shared/components/CustomPopover";
import ModDetailsPopover from "@shared/components/popovers/popovers/mod-details-popover";
import {
  forwardRef,
  useState,
  useImperativeHandle,
  type ReactNode,
} from "react";
import classNames from "classnames";
import { FormattedText } from "@lib/presentation";
import { useDataState } from "@providers/DataState/data-state-context";
import { getModDataState } from "@lib/mod-visual";
import { createContext } from "react";
import Stage from "@shared/components/Stage";

/**
 * ModCardContext - Declarative state provider for internal mod components.
 */
interface ModCardState {
  isOver: boolean;
  isSelected: boolean;
  item: Mod;
}

const ModCardContext = createContext<ModCardState | null>(null);

/**
 * ModCard - Card especializada para mods.
 */

type ModCardProps = {
  item: Mod;
  isSelected?: boolean;
  onClick?: (item: Mod) => void;
  children?: ReactNode;
  isExtended?: boolean;
};

const ModCard = forwardRef<HTMLButtonElement, ModCardProps>(
  (
    { item, isSelected = false, onClick, isExtended = false },
    forwardedRef,
  ) => {
    const [isOver, setIsOver] = useState(isExtended);

    const dataStateRef = useDataState<HTMLButtonElement>(
      getModDataState(item, isOver, isSelected),
    );

    useImperativeHandle(forwardedRef, () => dataStateRef.current!);

    const handleMouseEnter = () => {
      if (isExtended) return;
      setIsOver(true);
    };

    const handleMouseLeave = () => {
      if (isExtended) return;
      setIsOver(false);
    };

    return (
      <ModCardContext.Provider value={{ isOver, isSelected, item }}>
        <CustomPopover
          popover={<ModDetailsPopover item={item} />}
          placement="right-start"
          disabled // for test card
        >
          <button
            ref={dataStateRef}
            className={classNames(
              "outline-none",
              "omni-mod-container",
              "top-0 relative transition-all duration-80 ease-in-out",
              "group",
              "data-hover:h-(--mod-h-expanded) transition-all duration-80 ease-in-out",
              "pointer-events-none select-none", // Bloqueamos eventos en el canvas entero
            )}
            type="button"
            onClick={() => onClick?.(item)}
            onMouseEnter={() => handleMouseEnter()}
            onMouseLeave={() => handleMouseLeave()}
          >
            {/* Capa de Fondo (Canvas 333px) */}
            <div
              className={classNames(
                "omni-mod__content",
                "absolute inset-0 overflow-hidden pointer-events-none",
              )}
            />

            {/* Capa de Cuerpo e Interacción (Card 293px) */}
            <div
              className={classNames(
                "omni-mod absolute inset-offsets flex flex-col z-10",
              )}
            >
              {/* Drenaje y Polaridad (Anclados al cuerpo del mod) */}
              <div
                className={classNames(
                  "omni-mod__drain",
                  "flex flex-nowrap z-11 absolute text-[1rem] leading-none",
                  "right-0 top-0",
                )}
              >
                {item.stats.base_drain || 0}
                {item.polarity && (
                  <i
                    className={classNames(
                      "wfic ml-1",
                      `wfic-AP_${item.polarity.toUpperCase()}`,
                    )}
                  ></i>
                )}
              </div>
              <div className="flex-1 flex flex-col px-[24px] pt-[31px] pb-[43px] min-h-0 justify-end">
                {/* Imagen del Mod */}
                <div
                  className={classNames(
                    "omni-mod__image",
                    "flex-1 grow min-h-0 items-center justify-center relative overflow-hidden",
                  )}
                >
                  {item.image ? (
                    <img
                      className={classNames(
                        "object-cover object-top grayscale-[0.8] brightness-[0.4] transition-[all_0.12s_ease] p-[2px]",
                        "group-data-hover:grayscale-0 group-data-hover:brightness-100",
                      )}
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ui-primary/20 text-[10px] uppercase tracking-widest break-all">
                      No Image
                    </div>
                  )}
                </div>

                {/* Bloque de Texto (Empuja hacia arriba) */}
                <div
                  className={classNames(
                    "flex flex-col justify-end items-center text-center w-full mb-[10px] px-[18px] shrink-0",
                    "leading-tight text-shadow-[#000_1px_1px_0] transition-all duration-200",
                  )}
                >
                  <p
                    className={classNames(
                      "omni-mod__name",
                      "font-roboto font-black tracking-tight w-full shrink-0 flex justify-center items-center",
                      "text-[calc(var(--mod-w)/16)] group-data-hover:text-[calc(var(--mod-w)/14.5)]",
                      "transition-all duration-150 ease-in-out font-bold",
                    )}
                  >
                    {item.name}
                  </p>
                  <Stage show={isOver}>
                    <div
                      className={classNames(
                        "font-roboto font-medium leading-snug w-full flex-1 flex flex-col justify-center",
                        "group-data-hover:text-[calc(var(--mod-w)/20)] transition-all duration-150 overflow-hidden",
                      )}
                    >
                      {item.stats?.level_stats?.[0]?.stats?.map((stat, idx) => (
                        <FormattedText
                          key={idx}
                          text={stat}
                          showLabel={false}
                        />
                      ))}
                    </div>
                  </Stage>
                </div>
                {/* El TAB (Ahora de 245px, encaja perfecto gracias al px-[24px]) */}
                <Stage show={isOver}>
                  <div
                    className={classNames(
                      "compatibility",
                      "w-full h-[27px] flex items-center justify-center relative", // Altura fija para que el asset no se estire
                      "opacity-0 group-data-hover:opacity-100 transition-opacity",
                    )}
                  >
                    <p className="text-[1.2rem] font-bold relative z-11">
                      {item.compat_name || "Rifle"}
                    </p>
                  </div>
                </Stage>
              </div>
              {/* Rango (Stars) Dinámico */}
              <div
                className={classNames(
                  "omni-mod__fusion",
                  "absolute left-0 w-full flex justify-center gap-0.5 z-20 transition-all duration-200",
                  "bottom-[calc(var(--mod-w)*(5/333))]",
                )}
              >
                {[...Array(item.stats.rank || 0)].map((_, i) => (
                  <i className={classNames("text-[0.8rem] not-italic")} key={i}>
                    ★
                  </i>
                ))}
              </div>
            </div>
          </button>
        </CustomPopover>
      </ModCardContext.Provider>
    );
  },
);

ModCard.displayName = "ModCard";
export default ModCard;
