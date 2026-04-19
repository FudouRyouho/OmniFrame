import { useParams } from "react-router";

/**
 * Vista de selección de entidad para un slot del Arsenal (Swap).
 *
 * Ruta: /arsenal/swap/:category
 * :category actúa como guard de dominio — define qué tipo de entidad
 * se está seleccionando (warframe, primaryWeapon, secondaryWeapon, meleeWeapon,
 * companion, etc.) y filtrará el catálogo cuando se implemente el contenido.
 *
 * Estado: stub de flujo — placeholder mínimo con navegación funcional.
 * El catálogo y el panel de preview se implementan cuando shared/equipment
 * tenga los componentes componentizados para reutilización.
 * El Back lo maneja el footer del shell (HubFooter).
 *
 * Referencia: Docs/domains/builder-engine/status.md (Dirección de UI de Arsenal)
 */
export default function ArsenalSwapView() {
  const { category } = useParams<{ category: string }>();

  return (
    <div className="h-full w-full flex flex-col px-4 py-3 gap-4">
      {/* Placeholder — catálogo y panel de preview pendientes */}
      <div className="flex-1 flex items-center justify-center text-[11px] uppercase tracking-[0.2em] text-ui-primary/30">
        Swap · {category} · pendiente de implementación
      </div>
    </div>
  );
}
