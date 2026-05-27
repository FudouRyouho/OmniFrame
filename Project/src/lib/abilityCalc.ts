/**
 * abilityCalc.ts
 * Lógica de cálculo de stats de habilidades — compartida entre vistas dev y UI.
 * Consume AbilityStatEntry + EngineVars y devuelve el valor calculado.
 */

import type { AbilityStatEntry } from "../shared/types";

export interface EngineVars {
  STR: number; // porcentaje, ej. 100 = 100%
  RNG: number;
  DUR: number;
  EFF: number;
}

export const DEFAULT_ENGINE_VARS: EngineVars = { STR: 100, RNG: 100, DUR: 100, EFF: 100 };

export function calcStatValue(entry: AbilityStatEntry, vars: EngineVars, index = 0): number {
  const str = vars.STR / 100, rng = vars.RNG / 100, dur = vars.DUR / 100, eff = vars.EFF / 100;
  const raw = Array.isArray(entry.base_value) ? entry.base_value[index] : entry.base_value;
  // Si upgrade_by es array, usa solo [0] — índices adicionales esperan fórmulas por habilidad.
  const upgradeBy = Array.isArray(entry.upgrade_by) ? entry.upgrade_by[0] : entry.upgrade_by;
  let result: number;
  switch (upgradeBy) {
    case "AVATAR_ABILITY_STRENGTH":   result = raw * str; break;
    case "AVATAR_ABILITY_RANGE":      result = raw * rng; break;
    case "AVATAR_ABILITY_DURATION":   result = raw * dur; break;
    case "AVATAR_ABILITY_EFFICIENCY": result = raw * eff; break;
    case "ENERGY_COST":               result = (2 - eff) * raw; break;
    case "ENERGY_DRAIN":              result = ((2 - eff) * raw) / dur; break;
    default:                          result = raw; break;
  }
  if (entry.inverse) result = raw / (result / raw);
  if (entry.cap   !== undefined) result = Math.min(result, Array.isArray(entry.cap)   ? entry.cap[index]   : entry.cap);
  if (entry.floor !== undefined) result = Math.max(result, Array.isArray(entry.floor) ? entry.floor[index] : entry.floor);
  return result;
}

export function fmtStatValue(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(n < 10 ? 2 : 1);
}

/** Resuelve los placeholders |val1|, |val2|... de un label usando los valores calculados. */
export function resolveLabel(label: string, entry: AbilityStatEntry, vars: EngineVars): string {
  return label.replace(/\|val(\d+)\|/g, (_, idx) => {
    const index = Number(idx) - 1;
    const range = Array.isArray(entry.base_value);
    if (index > 0 && !range) return `|val${idx}|`;
    return fmtStatValue(calcStatValue(entry, vars, index));
  });
}
