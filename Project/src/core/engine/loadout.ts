/**
 * @domain Engine / Loadout / Metadata
 * @SSoT docs/design/sim-v2/simulation-roadmap.md
 * @status en-desarrollo
 */

export interface LoadoutIntent {
  unique_name: string;
  rank?: number;
}

/**
 * Flat Intent Record Architecture.
 * Keys are semantic Uids like:
 * - 'slot:warframe' -> The equipped entity unique_name
 * - 'slot:warframe:active_config' -> The current active configuration index
 * - 'slot:warframe:config:0:mod:0' -> The mod equipped in a specific slot
 */
export type LoadoutState = Record<string, any>;

export function equipEntity(
  state: LoadoutState,
  channel: string,
  unique_name: string,
): LoadoutState {
  return {
    ...state,
    [`slot:${channel}`]: unique_name,
    [`slot:${channel}:active_config`]: 0,
  };
}

export function unequipEntity(
  state: LoadoutState,
  channel: string,
): LoadoutState {
  const next = { ...state };
  // Limpiar todas las claves relacionadas con este canal
  const prefix = `slot:${channel}`;
  Object.keys(next).forEach(key => {
    if (key.startsWith(prefix)) {
      delete next[key];
    }
  });
  return next;
}

export function setActiveConfig(
  state: LoadoutState,
  channel: string,
  config_index: number,
): LoadoutState {
  return {
    ...state,
    [`slot:${channel}:active_config`]: config_index,
  };
}

export function setMod(
  state: LoadoutState,
  channel: string,
  slot_index: number,
  mod: LoadoutIntent | null,
  config_index: number = 0,
): LoadoutState {
  const key = `slot:${channel}:config:${config_index}:mod:${slot_index}`;
  const next = { ...state };
  if (mod === null) {
    delete next[key];
  } else {
    next[key] = mod;
  }
  return next;
}
