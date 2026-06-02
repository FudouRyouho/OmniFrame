/**
 * @domain Simulation-v2 / Contracts / Data
 * @SSoT docs/data/schemas/mods/mods-schema.md
 * @status activo
 */

/** Shape de cada valor por rango dentro de un stat de mod, tal como aparece en mod-stats.override.json. */
export interface ModStatValueRaw {
  base_value: number[];
  upgrade_type: string;
}

/** Shape de un stat individual de mod en mod-stats.override.json. */
export interface ModStatRaw {
  label: string;
  values: ModStatValueRaw[];
  condition: string | null;
  note?: string | null;
}

/** Shape de una entrada completa en mod-stats.override.json, indexada por uniqueName. */
export interface ModOverrideEntry {
  name: string;
  stats: ModStatRaw[];
}
