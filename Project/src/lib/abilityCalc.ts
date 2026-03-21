/**
 * abilityCalc.ts
 * Lógica de cálculo de stats de habilidades — compartida entre vistas dev y UI.
 * Consume AbilityStatValue + EngineVars y devuelve el valor calculado.
 */

import type { AbilityStatValue } from "./types";

export interface EngineVars {
  STR: number; // porcentaje, ej. 100 = 100%
  RNG: number;
  DUR: number;
  EFF: number;
}

export const DEFAULT_ENGINE_VARS: EngineVars = { STR: 100, RNG: 100, DUR: 100, EFF: 100 };

export function calcStatValue(v: AbilityStatValue, vars: EngineVars): number {
  const str = vars.STR / 100, rng = vars.RNG / 100, dur = vars.DUR / 100, eff = vars.EFF / 100;
  let result: number;
  switch (v.upgradeBy) {
    case "AVATAR_ABILITY_STRENGTH":   result = v.baseValue * str; break;
    case "AVATAR_ABILITY_RANGE":      result = v.baseValue * rng; break;
    case "AVATAR_ABILITY_DURATION":   result = v.baseValue * dur; break;
    case "AVATAR_ABILITY_EFFICIENCY": result = v.baseValue * eff; break;
    case "ENERGY_COST":               result = (2 - eff) * v.baseValue; break;
    case "ENERGY_DRAIN":              result = ((2 - eff) * v.baseValue) / dur; break;
    default:                          result = v.baseValue; break;
  }
  if (v.inverse) result = v.baseValue / (result / v.baseValue);
  if (v.cap    !== undefined) result = Math.min(result, v.cap);
  if (v.capMin !== undefined) result = Math.max(result, v.capMin);
  return result;
}

export function fmtStatValue(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(n < 10 ? 2 : 1);
}

/** Resuelve los placeholders |val1|, |val2|... de un label usando los valores calculados. */
export function resolveLabel(
  label: string,
  values: AbilityStatValue[],
  vars: EngineVars
): string {
  return label.replace(/\|val(\d+)\|/g, (_, idx) => {
    const v = values[Number(idx) - 1];
    return v ? fmtStatValue(calcStatValue(v, vars)) : `|val${idx}|`;
  });
}
