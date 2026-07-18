/**
 * @domain Simulation-v2 / Contracts / Damage Logic
 * @status en-desarrollo
 */

import { DAMAGE_TYPES, isDamageType, type DamageType } from "@shared/types";

// La ley de combinación elemental (SSoT, type-keyed) vive en `formulas/common/status-base.ts`
// (`ELEMENT_COMBINATIONS` / `resolveElementalCombination` / `PRIMARY_ELEMENTS`). El token-space la
// adapta `DamageCombiner` vía el puente token↔type de abajo — sin duplicar la tabla.

/**
 * Puente token D-6 ↔ tipo semántico. El engine representa cada tipo de daño como un atributo
 * `WEAPON_ADD_<TYPE>_DAMAGE` (token D-6); el vocabulario CANÓNICO de tipos vive en
 * `@shared/types/damage.ts` (`docs/semantic/damage-types.md`). Estas dos funciones son la ÚNICA
 * traducción entre ambos espacios — transform puro e invertible, NO tabla. Reemplazan al viejo
 * `WEAPON_DAMAGE_TOKEN_TO_TYPE` (17 entradas hardcodeadas = sombra del canónico) y centralizan lo
 * que `ItemRepository.mapDamage` computaba inline por su lado.
 */
export function damageTokenFromType(type: DamageType): string {
  return `WEAPON_ADD_${type.toUpperCase()}_DAMAGE`;
}

/** Inverso: token D-6 → tipo canónico. `null` si el token no pertenece al vocabulario de daño. */
export function damageTypeFromToken(token: string): DamageType | null {
  const match = /^WEAPON_ADD_(.+)_DAMAGE$/.exec(token);
  if (!match) return null;
  const candidate = match[1].toLowerCase();
  return isDamageType(candidate) ? candidate : null;
}

// Todos los tokens D-6 de daño (fuente de filtrado del engine) — DERIVADOS del vocabulario canónico
// (`DAMAGE_TYPES`), no listados a mano. Agregar un tipo nuevo = tocar SOLO `@shared/types/damage.ts`.
export const WEAPON_DAMAGE_TOKENS: readonly string[] = DAMAGE_TYPES.map(damageTokenFromType);

const _DAMAGE_TOKEN_SET = new Set(WEAPON_DAMAGE_TOKENS);

export function isWeaponDamageToken(value: string): boolean {
  return _DAMAGE_TOKEN_SET.has(value);
}

/**
 * Los pools de daño GLOBALES del arma (arch-decisions §16): grupos aditivos `(1+Σ)` que todo daño-token
 * multiplica **al resolverse como nodo** (el HIT; suman dentro, multiplican afuera). Hoy dos:
 * `WEAPON_ADD_DAMAGE` (Serration, Step 1) y `GAMEPLAY_MULT_FACTION_DAMAGE` (Roar/Bane, Step 3). SSoT única
 * del conjunto: el orden de resolución (aristas en `rebuildGraph`) y la aplicación del factor
 * (`calculateCurrentValue`) derivan de acá — no pueden divergir. Agregar un 3er pool = una línea.
 * NB: NO son daño-tokens (no matchean `isWeaponDamageToken`); son los pools que ESOS tokens leen.
 * NB2: el DoT (`dot-base-scaling`) lee DELIBERADAMENTE un subconjunto (solo el aditivo; faction gated,
 * OQ-20) — NO usa este conjunto. No "unificar" ahí sin cerrar OQ-20.
 */
export const GLOBAL_DAMAGE_POOLS = ['WEAPON_ADD_DAMAGE', 'GAMEPLAY_MULT_FACTION_DAMAGE'] as const;

/**
 * SSoT de RESOLUCIÓN por tipo de daño: cómo un token resuelve contra las capas del objetivo.
 * La lee `CombatSimulator.resolveDamageEvent`. La emisión (hit o tick de DoT) declara CON QUÉ tipo
 * resuelve (`Resolucion.as`) y core deriva las reglas de acá — sin ambigüedad: el hit directo de
 * Slash resuelve como `slash` (paga DR), el tick de bleed emite como `true` (bypass). Por eso
 * `bypassesArmorAndMatrix` SÍ puede vivir acá keyeado por el token `true` (antes era un opt de
 * instancia porque el token de origen —slash— no bastaba para distinguir). Ver `status-effects.md §Bleed`.
 */
export interface DamageResolutionRule {
  /** Bypasea shields y pega directo a salud (Toxin). `enemy-resistances.md` / `status-effects.md`. */
  bypassesShields?: boolean;
  /** Bypasea armor (DR) + matriz③ facción×elemento (True — ej. el bleed de Slash). NO bypasea el
   *  multiplicador de capa: Viral SÍ amplifica un tick True (regla de composición #1). */
  bypassesArmorAndMatrix?: boolean;
}

export const DAMAGE_RESOLUTION_BY_TOKEN: Readonly<Record<string, DamageResolutionRule>> = {
  'WEAPON_ADD_TOXIN_DAMAGE': { bypassesShields: true },
  'WEAPON_ADD_TRUE_DAMAGE':  { bypassesArmorAndMatrix: true },
};

/** Layer-targeting: ¿este token bypasea shields? (default false — pega a shields si están arriba). */
export function bypassesShields(token: string): boolean {
  return DAMAGE_RESOLUTION_BY_TOKEN[token]?.bypassesShields ?? false;
}

/** ¿Este token bypasea armor (DR) + matriz③? (True). Default false. */
export function bypassesArmorAndMatrix(token: string): boolean {
  return DAMAGE_RESOLUTION_BY_TOKEN[token]?.bypassesArmorAndMatrix ?? false;
}
