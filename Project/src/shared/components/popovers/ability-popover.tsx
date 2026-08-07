import type { Ability } from "@shared/types";

/**
 * AbilityPopover - Componente compartido para mostrar abilities.
 *
 * Usado por:
 * - Warframes (4 abilities)
 * - Necramechs (abilities)
 * - Archwings (abilities)
 *
 * Placeholder: Solo muestra descripción de la habilidad.
 * UI completa (stats, upgradeBy, etc.) se implementará posteriormente.
 *
 * No se integra en ningún popover aún — componente standalone para desarrollo futuro.
 */

type AbilityPopoverProps = {
  abilities: Ability[];
};

const AbilityPopover = ({ abilities }: AbilityPopoverProps) => {
  if (!abilities || abilities.length === 0) {
    return (
      <div className="p-4 text-center text-ui-primary/30 text-[10px] italic">
        NO_ABILITIES
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {abilities.map((ability, index) => (
        <div key={ability.unique_name || index} className="space-y-1">
          {/* Nombre de la habilidad */}
          <div className="flex items-center gap-2">
            <span className="text-ui-accent text-[11px] font-bold uppercase tracking-wide">
              {ability.name || "Unknown Ability"}
            </span>
            <span className="text-ui-primary/30 text-[9px]">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          {/* Descripción */}
          {ability.description && (
            <p className="text-ui-primary/70 text-[10px] leading-relaxed italic">
              {ability.description}
            </p>
          )}

          {/* Separador entre abilities */}
          {index < abilities.length - 1 && (
            <div className="h-px bg-ui-primary/10 mt-2" />
          )}
        </div>
      ))}
    </div>
  );
};

export default AbilityPopover;
