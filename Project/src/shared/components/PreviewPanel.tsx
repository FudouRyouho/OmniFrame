import type { ReactNode } from "react";
import { Orbit } from "lucide-react";

/**
 * Panel de preview lateral reutilizable.
 *
 * Usado en ArsenalView (preview del slot activo) y ArsenalSwapView (preview
 * del item seleccionado en el catálogo). Acepta children para slots opcionales
 * como ability nodes, archon shards, etc.
 *
 * Candidato a revisión de nombre/jerarquía en la componentización general de UI.
 */
export type PreviewPanelProps = {
  name: string;
  description: string;
  isReady: boolean;
  children?: ReactNode;
};

export default function PreviewPanel({
  name,
  description,
  isReady,
  children,
}: PreviewPanelProps) {
  return (
    <aside className="place-self-start justify-self-end w-full max-w-100 space-y-4">
      <div className="border border-ui-accent/40 py-1.5 px-1 truncate text-[15px] uppercase tracking-[0.14em] text-ui-accent">
        {name}
      </div>
      <div className="border border-ui-accent/40 py-1.5 px-1 text-[12px] text-ui-secondary leading-relaxed">
        {description}
      </div>

      {children}

      <div className="flex items-center justify-between border-t border-ui-primary/10 pt-2 text-[10px] uppercase tracking-[0.2em] text-ui-primary/55">
        <span>{isReady ? "Provider listo" : "Provider en stub"}</span>
        <span className="flex items-center gap-1.5 text-ui-primary/45">
          <Orbit className="h-3.5 w-3.5" />
          Preview
        </span>
      </div>
    </aside>
  );
}
