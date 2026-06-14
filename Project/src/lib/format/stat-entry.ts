/**
 * @domain Format / Stat projection (React-free)
 * @status en-desarrollo
 *
 * [Stage B — proyector único] SSoT del corte `StatViewModel[] → StatEntry[]`: la única
 * proyección de stats del engine a filas listas para `StatPanel`. Mata los dos gemelos
 * inline (`UpgradeView` D1 y `oracle.ts` D2) que reinventaban este mapeo cada uno.
 *
 * React-free a propósito (vive en `lib/format/*`): D2 es el oráculo CLI y corre en Node.
 *
 * Tres piezas:
 *   - `StatEntry`     — tipo de fila de presentación (SSoT; lo consumen StatPanel + item-details).
 *   - `formatStatValue` — número + unidad → string. Tabla `unit→regla`, locale-free (sin `Intl`).
 *   - `toStatEntries` — proyector. Label por lookup en `stat-presentation`; los tokens de daño
 *     (sin label en el dict) la derivan de `DAMAGE_TYPE_DEFINITIONS` (su SSoT — decisión Stage A).
 */

import { normalizeDamageType, DAMAGE_TYPE_DEFINITIONS } from "@shared/types";
import type { StatViewModel } from "@shared/view-model";
import { getPresentationMeta, type PresentationMeta } from "./stat-presentation";

/** Fila de presentación. SSoT del tipo — `StatPanel` e `item-details` lo importan. */
export interface StatEntry {
  key: string;
  label: string;
  value: string | number;
  /** Separa secciones visualmente (ej. antes del bloque de daño). */
  isSectionHeader?: boolean;
  valueTone?: "default" | "accent";
}

/**
 * Número + unidad → string de presentación. Tabla `unit→regla`, locale-free.
 * (Revisar más adelante — SSoT único a propósito, ver OQ-DATA-10.)
 */
export function formatStatValue(value: number, unit: PresentationMeta["unit"]): string {
  switch (unit) {
    case "%":
      return `${value.toFixed(1)}%`;
    case "x":
      return `${value.toFixed(2)}x`;
    case "s":
      return `${value.toFixed(1)}s`;
    case "":
    default:
      // multishot / magazine / daño: entero si es entero, si no 1 decimal.
      return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }
}

/** Token de nodo → label humana. meta.label primero; daño → SSoT; resto → humaniza el token. */
function resolveLabel(id: string, meta: PresentationMeta): string {
  if (meta.label) return meta.label;

  // Tokens de daño (`WEAPON_ADD_<TIPO>_DAMAGE`) sin label en el dict: derivar del SSoT del daño.
  const m = /^WEAPON_ADD_(.+)_DAMAGE$/.exec(id);
  if (m) {
    const dt = normalizeDamageType(m[1]);
    const label = dt ? DAMAGE_TYPE_DEFINITIONS[dt].label : "";
    if (label) return label.toUpperCase();
  }

  // Último recurso: humanizar el token (token desconocido / sin meta).
  return id.replace(/_/g, " ").toUpperCase();
}

/** Proyecta el contrato neutro del engine a filas de presentación. */
export function toStatEntries(stats: StatViewModel[]): StatEntry[] {
  return stats.map((s) => {
    const meta = getPresentationMeta(s.id);
    return {
      key: s.id,
      label: resolveLabel(s.id, meta),
      value: formatStatValue(s.value, s.unit),
    };
  });
}
