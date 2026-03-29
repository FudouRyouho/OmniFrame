import { useState } from "react";
import { useMenu } from "@providers/Menu/menu-context";
import { useDataState } from "@providers/DataState/data-state-context";
import { useLoadout } from "@providers/Loadout/loadout-context";
import { useShell } from "@providers/Shell/shell-context";

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
 * Consume: LoadoutProvider (layout activo), ShellProvider (título/zona), MenuProvider (estado ESC)
 *
 * @see DT-8 en Docs-legacy/architecture/architecture-audit.md
 * @todo Implementación pendiente — diseño visual a cargo del usuario
 */

// El wiring real del layout vive en LoadoutProvider; este header ya no depende del contexto legacy.

const CHANNELS = [
  { key: "warframe", label: "Warframe" },
  { key: "primaryWeapon", label: "Primary" },
  { key: "secondaryWeapon", label: "Secondary" },
  { key: "meleeWeapon", label: "Melee" },
] as const;

function formatEntityLabel(uniqueName?: string): string {
  if (!uniqueName) {
    return "Vacío";
  }

  const tail = uniqueName.split("/").filter(Boolean).pop() ?? uniqueName;
  return tail.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

const HudHeader = () => {
  const { toggle, isOpen } = useMenu();
  const { pageTitle } = useShell();
  const { loadout, activeChannelCount } = useLoadout();
  const [isOver, setIsOver] = useState(false);
  const ref = useDataState({ hover: isOver, active: isOpen ?? false });

  const showUserOverlay = isOpen || isOver;

  return (
    <header className="z-60 relative mt-1 mx-2 h-12 flex items-center gap-3">
      {/* Contenedor base fijo: el panel contextual sale en absolute sin empujar layout */}
      <div className="relative h-12 w-60 shrink-0">
        <div
          ref={ref}
          className="flex flex-col justify-center w-12 h-12 border-square relative"
          onMouseEnter={() => setIsOver(true)}
          onMouseLeave={() => setIsOver(false)}
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

        {showUserOverlay && (
          <div className="absolute left-0 top-0 min-w-60 bg-black/70 border border-ui-primary/25 shadow-[0_8px_24px_rgba(0,0,0,0.45)] pointer-events-none">
            <div className="h-12 grid grid-cols-[48px_1fr_auto] items-center border-b border-ui-primary/20">
              <div className="h-12 w-12" />

              <div className="pl-2 leading-tight">
                <span className="block text-[11px] text-ui-primary/95 truncate">User</span>
                <span className="block text-[11px] text-ui-accent/90 truncate">
							{activeChannelCount > 0 ? `Loadout activo (${activeChannelCount}/4)` : "Sin loadout activo"}
						</span>
              </div>
            </div>

            {isOpen && (
              <div className="px-2 py-1 text-[13px] leading-tight text-ui-primary/95 flex flex-col gap-0.5">
						{CHANNELS.map((channel) => (
							<span key={channel.key} className="truncate">
								{channel.label}: {formatEntityLabel(loadout[channel.key]?.uniqueName)}
							</span>
						))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 text-[18px] uppercase tracking-widest text-ui-primary/90 truncate">
        {pageTitle}
      </div>
    </header>
  );
};

export default HudHeader;
