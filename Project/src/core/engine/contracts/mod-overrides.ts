/**
 * @domain Simulation-v2 / Contracts / Data
 * @SSoT docs/data/schemas/mods/mods-schema.md
 * @status activo
 */

import type { ConditionInput } from '@shared/types/condition';

/** Shape de cada valor por rango dentro de un stat de mod, tal como aparece en mod-stats.override.json. */
export interface ModStatValueRaw {
  base_value: number[];
  upgrade_type: string;
}

/** Shape de un stat individual de mod en mod-stats.override.json. */
export interface ModStatRaw {
  label: string;
  values: ModStatValueRaw[];
  condition: ConditionInput | null;
  note?: string | null;
  /**
   * Presente SOLO en stats de la familia `STACK_DECAY_BUFF` (D-15 evolución, 2026-07-10):
   * cap de stacks. `base_value` sigue siendo total-a-máximo (D-15 §2, sin tocar) — el motor
   * deriva `perStackPct = base_value/max_stacks` en hidratación. Ausente = stat normal (ADD +
   * condition evaluado por `evalCondition`, camino genérico sin cambios).
   */
  max_stacks?: number;
}

/** Shape de una entrada completa en mod-stats.override.json, indexada por uniqueName. */
export interface ModOverrideEntry {
  name: string;
  stats: ModStatRaw[];
}
