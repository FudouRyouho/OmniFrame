import { Outlet } from "react-router";

/**
 * Layout route de Arsenal.
 * Monta el contenedor base y delega el contenido a la ruta hija activa via Outlet.
 * Rutas hijas: / (ArsenalView), /swap/:category (ArsenalSwapView), /archon-shards
 */
export default function ArsenalLayout() {
  return (
    <div className="h-full w-full">
      <Outlet />
    </div>
  );
}
