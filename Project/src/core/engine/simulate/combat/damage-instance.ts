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
 * **Escalado del DoT (`dotModdedBase` + `ownElementBonusPct`):** el DoT NO escala con el daño COMPUESTO
 * (que incluye los mods de elemento) sino con el **base innato × base-damage-mods**, y su `own_element`
 * sale de los mods del propio elemento — ambos vienen de `entity.dot_scaling` (que C1 preserva porque el
 * `DamageCombiner` los descarta al componer). Ya NO se reconstruye por `final/base-1` (que daba Serration
 * = double-count, bug). Fuente: `references/wiki/mechanics/status-effects.md §DoT` + `ingame-tests/dot-scaling.md`.
 */
import type { SimulationEntity } from "../../contracts";
import { isWeaponDamageToken, damageTypeFromToken } from "../../contracts/damage-logic";
import { scaleDotBase } from "../../formulas/status/dot-base-scaling";
import type { DamageType } from "@shared/types";

export interface DamageInstance {
  /** Daño modded por token de daño D-6 (por proyectil), congelado. Lo consume `resolveHit`. */
  damageByToken: Record<string, number>;
  /** El mismo daño keyeado por `DamageType` canónico. Lo consume la población de procs. */
  damageByType: Partial<Record<DamageType, number>>;
  /** Σ `damageByToken` — daño modded TOTAL (para el HIT directo; incluye mods de elemento). */
  moddedBase: number;
  /** `modded_base` del DoT: base innato × base-damage-mods, **SIN** los mods de elemento (el DoT no los ve
   *  como daño, solo por `ownElementBonusPct`). Ver `entity.dot_scaling`. */
  dotModdedBase: number;
  /** +% de mods del propio elemento por tipo (Hellfire→heat). Físicos NO cuentan; Slash → 0/ausente. */
  ownElementBonusPct: Partial<Record<DamageType, number>>;
  critChance: number;
  critMult: number;
  // SUGERENCIA (diferida — ver `formulas-integration.md §2`): materializar acá el status-spec
  // (`procWeights` por tipo) como único camino observable del seam, en vez de derivarlo on-the-fly en cada
  // proyector vía `expectedProcEvents(damageByType, statusChance)`. Diferido a sabiendas: la ley ya es única
  // (todos llaman la misma función, sin duplicación) → el valor es observabilidad, no un fix. El consumidor
  // nace en el oráculo/CLI (D2) cuando D consuma la distribución de proc; se construye ahí, no antes.
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

  for (const [token, node] of Object.entries(attrs)) {
    if (!isWeaponDamageToken(token)) continue;
    damageByToken[token] = node.final;
    const type = damageTypeFromToken(token);
    if (type) damageByType[type] = node.final;
  }

  const moddedBase = Object.values(damageByToken).reduce((sum, v) => sum + v, 0);

  // `modded_base` del DoT = base innato × factor de base-damage (Serration), NO el compuesto — el DoT no
  // cuenta el daño de mods de elemento (empírico, `ingame-tests`). Primitiva `scaleDotBase` (P3, §16).
  const dot = entity.dot_scaling;
  const dotModdedBase = dot ? scaleDotBase(dot.innateBaseTotal, attrs["WEAPON_ADD_DAMAGE"]) : moddedBase;
  const ownElementBonusPct = dot?.ownElementBonusPct ?? {};

  return {
    damageByToken,
    damageByType,
    moddedBase,
    dotModdedBase,
    ownElementBonusPct,
    critChance: attrs["WEAPON_ADD_CRIT_CHANCE"]?.final || 0,
    critMult: attrs["WEAPON_ADD_CRIT_MULT"]?.final || 1.0,
    statusChance: (attrs["WEAPON_ADD_STATUS_CHANCE"]?.final || 0) / 100,
    statusDamageBonusPct: attrs["WEAPON_ADD_STATUS_DAMAGE"]?.final ?? 0,
    multishot: attrs["WEAPON_ADD_MULTISHOT"]?.final || 1.0,
  };
}
