/**
 * @domain Features / Arsenal
 * @SSoT docs/domains/ui-ux/shell-status.md
 * @status en-desarrollo
 * Modelo del estado de sesión UI-local del Arsenal (distinto de la Capa E /
 * presentación): hoy, el slot de archon shard seleccionado.
 */

// --- Estado UI-local de sesión del Arsenal ---

export interface ArsenalUiState {
  selectedArchonShardSlotIndex: number | null;
}

export function createDefaultArsenalUiState(): ArsenalUiState {
  return {
    selectedArchonShardSlotIndex: 0,
  };
}

export function selectArchonShardSlot(
  ui: ArsenalUiState,
  slotIndex: number | null,
): ArsenalUiState {
  return {
    ...ui,
    selectedArchonShardSlotIndex: slotIndex,
  };
}
