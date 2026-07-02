/**
 * @domain Simulation-v2 / Contracts / Damage Logic
 * @status en-desarrollo
 */

export const ELEMENTAL_COMBINATIONS: Record<string, string> = {
  'WEAPON_ADD_COLD_DAMAGE+WEAPON_ADD_TOXIN_DAMAGE':        'WEAPON_ADD_VIRAL_DAMAGE',
  'WEAPON_ADD_TOXIN_DAMAGE+WEAPON_ADD_COLD_DAMAGE':        'WEAPON_ADD_VIRAL_DAMAGE',
  'WEAPON_ADD_HEAT_DAMAGE+WEAPON_ADD_TOXIN_DAMAGE':        'WEAPON_ADD_GAS_DAMAGE',
  'WEAPON_ADD_TOXIN_DAMAGE+WEAPON_ADD_HEAT_DAMAGE':        'WEAPON_ADD_GAS_DAMAGE',
  'WEAPON_ADD_ELECTRICITY_DAMAGE+WEAPON_ADD_TOXIN_DAMAGE': 'WEAPON_ADD_CORROSIVE_DAMAGE',
  'WEAPON_ADD_TOXIN_DAMAGE+WEAPON_ADD_ELECTRICITY_DAMAGE': 'WEAPON_ADD_CORROSIVE_DAMAGE',
  'WEAPON_ADD_HEAT_DAMAGE+WEAPON_ADD_COLD_DAMAGE':         'WEAPON_ADD_BLAST_DAMAGE',
  'WEAPON_ADD_COLD_DAMAGE+WEAPON_ADD_HEAT_DAMAGE':         'WEAPON_ADD_BLAST_DAMAGE',
  'WEAPON_ADD_ELECTRICITY_DAMAGE+WEAPON_ADD_COLD_DAMAGE':  'WEAPON_ADD_MAGNETIC_DAMAGE',
  'WEAPON_ADD_COLD_DAMAGE+WEAPON_ADD_ELECTRICITY_DAMAGE':  'WEAPON_ADD_MAGNETIC_DAMAGE',
  'WEAPON_ADD_HEAT_DAMAGE+WEAPON_ADD_ELECTRICITY_DAMAGE':  'WEAPON_ADD_RADIATION_DAMAGE',
  'WEAPON_ADD_ELECTRICITY_DAMAGE+WEAPON_ADD_HEAT_DAMAGE':  'WEAPON_ADD_RADIATION_DAMAGE',
};

export const PRIMARY_ELEMENTS: string[] = [
  'WEAPON_ADD_HEAT_DAMAGE',
  'WEAPON_ADD_COLD_DAMAGE',
  'WEAPON_ADD_ELECTRICITY_DAMAGE',
  'WEAPON_ADD_TOXIN_DAMAGE',
];

// Todos los tokens D-6 de tipos de daño. Fuente de filtrado en el engine.
export const WEAPON_DAMAGE_TOKENS: readonly string[] = [
  'WEAPON_ADD_IMPACT_DAMAGE',
  'WEAPON_ADD_PUNCTURE_DAMAGE',
  'WEAPON_ADD_SLASH_DAMAGE',
  'WEAPON_ADD_HEAT_DAMAGE',
  'WEAPON_ADD_COLD_DAMAGE',
  'WEAPON_ADD_ELECTRICITY_DAMAGE',
  'WEAPON_ADD_TOXIN_DAMAGE',
  'WEAPON_ADD_BLAST_DAMAGE',
  'WEAPON_ADD_CORROSIVE_DAMAGE',
  'WEAPON_ADD_GAS_DAMAGE',
  'WEAPON_ADD_MAGNETIC_DAMAGE',
  'WEAPON_ADD_RADIATION_DAMAGE',
  'WEAPON_ADD_VIRAL_DAMAGE',
  'WEAPON_ADD_VOID_DAMAGE',
  'WEAPON_ADD_TAU_DAMAGE',
  'WEAPON_ADD_TRUE_DAMAGE',
  'WEAPON_ADD_NONE_DAMAGE',
];

const _DAMAGE_TOKEN_SET = new Set(WEAPON_DAMAGE_TOKENS);

export function isWeaponDamageToken(value: string): boolean {
  return _DAMAGE_TOKEN_SET.has(value);
}

// Bridge: D-6 damage attr → clave de dot_pools/stacks usada por EnemyState.
// Renombrado en Fase 3 (campaña saneamiento @core): el sufijo `_proc` era jerga
// interna del juego source, no comunicaba nada — pasa a `_dot` (coincide con el
// nombre del campo `dot_pools` que consume). `addStacks()` deriva la clave de
// `stacks` (sin sufijo) quitando `_dot`; solo Heat existe en ambos diccionarios
// (armor-ramp en `stacks` + burn tick en `dot_pools`, mecánicas distintas que
// comparten tipo de daño — no un error, ver EnemyState.addStacks).
export const DAMAGE_ATTR_TO_DOT_KEY: Record<string, string> = {
  'WEAPON_ADD_SLASH_DAMAGE':     'damage_slash_dot',
  'WEAPON_ADD_HEAT_DAMAGE':      'damage_heat_dot',
  'WEAPON_ADD_TOXIN_DAMAGE':     'damage_toxin_dot',
  'WEAPON_ADD_CORROSIVE_DAMAGE': 'damage_corrosive_dot',
  'WEAPON_ADD_VIRAL_DAMAGE':     'damage_viral_dot',
  'WEAPON_ADD_MAGNETIC_DAMAGE':  'damage_magnetic_dot',
};
