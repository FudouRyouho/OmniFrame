import React from "react";
import { StatRow } from "./stat-row";
import type { StatEntry } from "@lib/format/stat-entry";

// SSoT del tipo en lib/format/stat-entry. Re-exportado acá por compat de imports previos.
export type { StatEntry };

interface StatPanelProps {
  stats: StatEntry[];
  title?: string;
  className?: string;
}

/**
 * StatPanel — Componente genérico para mostrar listas de estadísticas (SSoT Visual R-01).
 * Reutilizable en Popovers, DetailViews y el Arsenal.
 */
export const StatPanel: React.FC<StatPanelProps> = ({ stats, title, className }) => {
  return (
    <div className={`space-y-0.5 ${className}`}>
      {title && (
        <div className="text-ui-accent text-[11px] font-bold px-3 py-2 bg-white/5 tracking-widest uppercase mb-1">
          {title}
        </div>
      )}

      <div className="flex flex-col">
        {stats?.map((entry, index) => {
          if (entry.isSectionHeader) {
            return (
              <div
                key={entry.key}
                className="text-ui-accent text-[9px] font-bold px-3 py-2 opacity-60 tracking-[0.2em] pt-4 uppercase"
              >
                {entry.label}
              </div>
            );
          }

          return (
            <StatRow
              key={entry.key}
              label={entry.label}
              value={entry.value}
              isOdd={index % 2 !== 0}
              valueTone={entry.valueTone}
            />
          );
        })}
      </div>
    </div>
  );
};
