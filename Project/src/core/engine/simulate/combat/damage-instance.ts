/**
 * @domain Simulation / Instance (seam C1→C2)
 * @SSoT docs/domains/engine/design/simulation-architecture.md §2.0.1
 *
 * La INSTANCIA de daño — el potencial de UN disparo (①②), construido UNA vez desde la salida de C1
 * (`SimulationEntity`, ya resuelta) y consumido por los proyectores de C2, no re-derivado 3×.
 * Principio **C1 COMPONE, C2 REALIZA**: acá C2 CONSUME lo que C1 compuso; no re-compone.
 *
 * **Target-agnóstica** (①②): NO carga facción/DR/capa (③, target) ni cadencia/mag/reload (Schedule).
 *
 * ⚠️ `elementBonusPct` se reconstruye por `final/base-1` — heredado TAL CUAL (double-cuenta Serration,
 * huella conocida). Este módulo es el **hogar único** donde ese valor se computa; el fix (que C1 lo
 * emita en su salida) es trabajo aparte — el contrato C1→C2, no esta reconciliación.
 */
import type { SimulationEntity } from "../../contracts";
import { isWeaponDamageToken, damageTypeFromToken } from "../../contracts/damage-logic";
import type { DamageType } from "@shared/types";

export interface DamageInstance {
  /** Daño modded por token de daño D-6 (por proyectil), congelado. Lo consume `resolveHit`. */
  damageByToken: Record<string, number>;
  /** El mismo daño keyeado por `DamageType` canónico. Lo consume la población de procs. */
  damageByType: Partial<Record<DamageType, number>>;
  /** Σ `damageByToken` — daño modded total (sin faction/falloff/crit). */
  moddedBase: number;
  /** +% del propio elemento por tipo (`final/base-1`). Frágil: double-cuenta Serration (huella). */
  elementBonusPct: Partial<Record<DamageType, number>>;
  critChance: number;
  critMult: number;
  /** 0..1 (ya dividido /100). */
  statusChance: number;
  statusDamageBonusPct: number;
  multishot: number;
}

/**
 * Deriva la Instancia desde la entidad resuelta de C1. Función **pura**; sin target, sin cadencia.
 * Reemplaza la re-extracción inline que hoy hacen `CombatSimulator`/`CombatCalculator`/`TimelineSimulator`.
 */
export function deriveInstance(entity: SimulationEntity): DamageInstance {
  const attrs = entity.attributes;
  const damageByToken: Record<string, number> = {};
  const damageByType: Partial<Record<DamageType, number>> = {};
  const elementBonusPct: Partial<Record<DamageType, number>> = {};

  for (const [token, node] of Object.entries(attrs)) {
    if (!isWeaponDamageToken(token)) continue;
    damageByToken[token] = node.final;
    const type = damageTypeFromToken(token);
    if (type) {
      damageByType[type] = node.final;
      if (node.base) elementBonusPct[type] = (node.final / node.base - 1) * 100;
    }
  }

  const moddedBase = Object.values(damageByToken).reduce((sum, v) => sum + v, 0);

  return {
    damageByToken,
    damageByType,
    moddedBase,
    elementBonusPct,
    critChance: attrs["WEAPON_ADD_CRIT_CHANCE"]?.final || 0,
    critMult: attrs["WEAPON_ADD_CRIT_MULT"]?.final || 1.0,
    statusChance: (attrs["WEAPON_ADD_STATUS_CHANCE"]?.final || 0) / 100,
    statusDamageBonusPct: attrs["WEAPON_ADD_STATUS_DAMAGE"]?.final ?? 0,
    multishot: attrs["WEAPON_ADD_MULTISHOT"]?.final || 1.0,
  };
}
