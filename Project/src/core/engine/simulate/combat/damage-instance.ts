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
import { isWeaponDamageToken, damageTypeFromToken, damageTokenFromType } from "../../contracts/damage-logic";
import { scaleDotBase } from "../../formulas/status/dot-base-scaling";
import { LAW_PARAM_TOKENS, type EmitterDeviations } from "../../contracts/law-params";
import { modifies, type ParamDeviation } from "../../formulas/common/param-deviation";
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
  /**
   * Los **desvíos de ley del emisor** — lo único de esta interfaz que no es output.
   *
   * `arch-decisions §17` lo nombraba como el hueco estructural del cuarto eslabón: la instancia
   * llevaba *"el **output** del emisor y **no** sus desvíos de ley"*, y por eso podía resolver el
   * desvío del receptor y no el del emisor — *"el del emisor nunca llegó"*. Ausente = el emisor no
   * declara nada y rige el default del concepto.
   */
  lawDeviations?: EmitterDeviations;
}

/**
 * Lo que un emisor tiene que aportar para que exista una instancia. **Sin nada del emisor adentro**:
 * ni su identidad, ni su familia de tokens, ni de qué capa salió.
 */
export interface InstanceContent {
  /** El daño por tipo. Es lo único obligatorio: una instancia sin daño no es una instancia. */
  damageByType: Partial<Record<DamageType, number>>;
  /** Default `moddedBase` (Σ del daño). Un arma lo baja porque su DoT no ve los mods de elemento. */
  dotModdedBase?: number;
  ownElementBonusPct?: Partial<Record<DamageType, number>>;
  critChance?: number;
  critMult?: number;
  /** 0..1. Default **0**: quien no declara chance, no proquea (`ausencia ≠ 0` — no es "siempre"). */
  statusChance?: number;
  statusDamageBonusPct?: number;
  /** Default 1. Un emisor sin multishot emite una vez, que no es lo mismo que emitir cero. */
  multishot?: number;
  lawDeviations?: EmitterDeviations;
}

/**
 * EL CONSTRUCTOR DE LA INSTANCIA — **el punto donde el emisor deja de importar**.
 *
 * Antes esto no existía como función: fabricar una instancia y *leer los nodos `WEAPON_*` de un arma*
 * eran el mismo bloque de código, así que "poder emitir" y "ser un arma" eran la misma cosa.
 *
 * El corte de `damage-logic.ts` volvió agnóstica la **resolución**; éste vuelve agnóstica la
 * **construcción**. Lo que queda atado al arma es sólo `deriveInstance`, que es donde corresponde:
 * leer nodos `WEAPON_*` **es** el trabajo del camino del arma — #1.
 *
 * `damageByToken` se deriva acá por la tabla canónica y existe para el consumidor que todavía habla
 * en tokens; la resolución ya no lo usa.
 */
export function makeInstance(content: InstanceContent): DamageInstance {
  const damageByToken: Record<string, number> = {};
  for (const [type, value] of Object.entries(content.damageByType) as Array<[DamageType, number]>) {
    damageByToken[damageTokenFromType(type)] = value;
  }
  const moddedBase = Object.values(content.damageByType).reduce((sum, v) => sum + (v ?? 0), 0);

  return {
    damageByToken,
    damageByType: content.damageByType,
    moddedBase,
    dotModdedBase: content.dotModdedBase ?? moddedBase,
    ownElementBonusPct: content.ownElementBonusPct ?? {},
    critChance: content.critChance ?? 0,
    critMult: content.critMult ?? 1,
    statusChance: content.statusChance ?? 0,
    statusDamageBonusPct: content.statusDamageBonusPct ?? 0,
    multishot: content.multishot ?? 1,
    ...(content.lawDeviations ? { lawDeviations: content.lawDeviations } : {}),
  };
}

/**
 * Deriva la Instancia desde la entidad resuelta de C1. Función **pura**; sin target, sin cadencia.
 * Reemplaza la re-extracción inline que hoy hacen `CombatSimulator`/`CombatCalculator`/`TimelineSimulator`.
 *
 * **Es el camino del ARMA, y ahora lo dice.** Lee nodos `WEAPON_*` y delega el ensamblado a
 * `makeInstance`. Que una entidad sin esos nodos produzca una instancia vacía dejó de ser el
 * comportamiento del motor para pasar a ser el comportamiento de *esta función* — hay otro camino,
 * sin construir todavía para familias no-`WEAPON_` — #1.
 */
export function deriveInstance(entity: SimulationEntity): DamageInstance {
  const attrs = entity.attributes;
  const damageByType: Partial<Record<DamageType, number>> = {};
  let moddedBase = 0;

  for (const [token, node] of Object.entries(attrs)) {
    if (!isWeaponDamageToken(token)) continue;
    const type = damageTypeFromToken(token);
    if (type) { damageByType[type] = node.final; moddedBase += node.final; }
  }

  // `modded_base` del DoT = base innato × factor de base-damage (Serration), NO el compuesto — el DoT no
  // cuenta el daño de mods de elemento (empírico, `ingame-tests`). Primitiva `scaleDotBase` (P3, §16).
  const dot = entity.dot_scaling;

  // Los desvíos de ley que el emisor declara. **Ya compuestos por el grafo**: tres Tauforged Emerald
  // son tres modifiers `ADD_FLAT` sobre el mismo nodo, así que el `+9` sale del acumulador —el mismo
  // que suma Serration— y no de aritmética escrita acá. El nodo existe **sólo si alguien lo declaró**
  // (`contracts/law-params.ts`): ausente ⇒ el emisor calla, que no es lo mismo que declarar 0.
  const lawDeviations: EmitterDeviations = {};
  for (const [token, param] of Object.entries(LAW_PARAM_TOKENS)) {
    const node = attrs[token];
    if (!node) continue;
    const declared: ParamDeviation[] = [modifies.add(node.final)];
    lawDeviations[param] = declared;
  }

  return makeInstance({
    damageByType,
    dotModdedBase: dot ? scaleDotBase(dot.innateBaseTotal, attrs["WEAPON_ADD_DAMAGE"]) : moddedBase,
    ownElementBonusPct: dot?.ownElementBonusPct ?? {},
    ...(Object.keys(lawDeviations).length > 0 ? { lawDeviations } : {}),
    critChance: attrs["WEAPON_ADD_CRIT_CHANCE"]?.final || 0,
    critMult: attrs["WEAPON_ADD_CRIT_MULT"]?.final || 1.0,
    statusChance: (attrs["WEAPON_ADD_STATUS_CHANCE"]?.final || 0) / 100,
    statusDamageBonusPct: attrs["WEAPON_ADD_STATUS_DAMAGE"]?.final ?? 0,
    multishot: attrs["WEAPON_ADD_MULTISHOT"]?.final || 1.0,
  });
}
