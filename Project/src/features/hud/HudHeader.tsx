import { useState } from "react";
import { useMenu } from "@providers/Menu/menu-context";
import { useDataState } from "@providers/DataState/data-state-context";

/**
 * HudHeader — HUD permanente de la aplicación.
 *
 * Montado en App.tsx fuera de <Routes>, siempre visible.
 * Replica la experiencia del orbitador de Warframe:
 *
 *   - Icono del jugador (cliqueable → abre DialogMenu / ESC)
 *   - Hint visual "ESC"
 *   - Caja de layout activo: muestra en columna el Warframe, arma primaria,
 *     secundaria, melee y compañero del layout que se está buildeando.
 *     Se expande/destaca visualmente cuando el menú ESC está abierto.
 *
 * Consume: layout-context.tsx (layout activo), MenuProvider (estado ESC)
 *
 * @see DT-8 en Docs/architecture-audit.md
 * @todo Implementación pendiente — diseño visual a cargo del usuario
 */

//Actualizar estado del todo, se ha implementado parcialmente el 'estilo', soporte para DialogMenu, texto hardcodeado del 'layout'

const HudHeader = () => {
  const { toggle, isOpen } = useMenu();
  const [isOver, setIsOver] = useState(false);
  const ref = useDataState({ hover: isOver, active: isOpen ?? false });
  return (
    <header className="z-[60] relative mt-1 mx-2">
      {/* Contenedor con relative — el expandido sale en absolute desde aquí */}
      <div
        className="relative bg-black/30 max-w-max"
        onMouseEnter={() => setIsOver(true)}
        onMouseLeave={() => setIsOver(false)}
      >
        {/* Fila fija — siempre ocupa h-[48px] en el flujo */}
        <div className="flex flex-col gap-2 group">
          <div className="flex flex-row">
            <div
              ref={ref}
              className="flex flex-col justify-center w-[48px] h-[48px] border-square relative shrink-0 group"
            >
              <button
                onClick={toggle}
                className="relative w-full h-full flex items-center justify-center outline-none"
              >
                <img
                  src="/assets/Glyph/ExcaliburUmbraGlyph-Dark.png"
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
                <span className="relative z-10 text-[9px] font-bold tracking-widest group-data-hover:text-ui-accent group-data-active:text-ui-accent">
                  ESC
                </span>
              </button>
            </div>
            {(isOpen || isOver) && (
              <div className="flex flex-col justify-center ml-2 text-[14px] pr-2">
                <span>Username</span>
                <span>Layout Name</span>
              </div>
            )}
          </div>
        </div>

        {/* Expandido — absolute, no empuja el main */}
        {isOpen && (
          <div className="absolute left-0 top-full bg-black/30 flex flex-col px-1.5 py-1 text-[16px] min-w-full">
            <span className="hover:text-ui-accent">Warframe</span>
            <span>Primary</span>
            <span>Secondary</span>
            <span>Melee</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default HudHeader;
