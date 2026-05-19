import { useNavigate } from "react-router";
import { useShell } from "@providers/Shell/shell-context";
import ItemsDetailsFooter from "./ItemsDetailsFooter";
import ArsenalFooter from "./ArsenalFooter";

/**
 * HubFooter — Footer persistente de la shell.
 *
 * Siempre muestra un botón Back cuando hay una zona activa.
 * Delega el contenido contextual al sub-footer correspondiente
 * según el `footerKind` derivado de ShellProvider.
 *
 * Añadir nuevos sub-footers siguiendo el mismo patrón:
 *   {footerKind === "arsenal" && <ArsenalFooter />}
 */
const HubFooter = () => {
  const navigate = useNavigate();
  const { zone, footerKind } = useShell();

  // No mostrar en la ruta raíz
  if (zone === "home") return null;

  return (
    <footer className="z-55 h-11 border-t border-ui-primary/20 bg-black/35 px-3 flex items-center gap-3">
      <div className="flex-1 flex items-center gap-2">
        {footerKind === "item-details" && <ItemsDetailsFooter />}
        {footerKind === "arsenal" && <ArsenalFooter />}
      </div>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="px-3 py-1 text-[10px] uppercase tracking-wide border border-ui-primary/35 hover:border-ui-accent hover:text-ui-accent transition-colors"
      >
        Back
      </button>
    </footer>
  );
};

export default HubFooter;
