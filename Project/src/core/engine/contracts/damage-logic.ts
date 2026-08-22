/**
 * @domain Simulation-v2 / Contracts / Damage Logic
 * @status en-desarrollo
 */

import { DAMAGE_TYPES, isDamageType, type DamageType } from "@shared/types";
import { ELEMENT_COMBINATIONS } from "../formulas/common/status-base";

// La ley de combinación elemental (SSoT, type-keyed) vive en `formulas/common/status-base.ts`
// (`ELEMENT_COMBINATIONS` / `resolveElementalCombination` / `PRIMARY_ELEMENTS`). El token-space la
// adapta `DamageCombiner` vía el puente token↔type de abajo — sin duplicar la tabla.

/**
 * ─── LOS DOS TRABAJOS DE UNA LLAVE, Y POR QUÉ SE SEPARARON ────────────────────────────────────────
 *
 * `WEAPON_ADD_HEAT_DAMAGE` nombraba dos cosas distintas al mismo tiempo:
 *
 *   ① **el bucket de upgrade** — *dónde suma Hellfire*. Es del **arma**, y el prefijo es **fiel**: los
 *      mods de elemento sólo aterrizan en armas, y en las habilidades que el juego trata como armas
 *      (*"Weapon Damage Abilities" […] coded as "weapons"*, `references/wiki/mechanics/universal-weapon-bonuses.md`).
 *   ② **el tipo de la instancia** — *estos 400 puntos son Heat*. Eso **no es de nadie**: es del daño.
 *
 * Las leyes de RESOLUCIÓN (matriz de facción, bypass de capa, bypass de armor) usaban ① para responder
 * ②, así que un emisor que no fuera un arma las perdía **en silencio**. Medido cambiando sólo el
 * prefijo, mismo tipo y mismo target: Heat vs Infested `1500 → 1000`; Toxin vs `shields 500`
 * `{health} → {shield}`; True vs `armor 2700` `1000 → 99.99`. Ningún throw, ningún warn.
 *
 * ⇒ Las tres leyes se keyean por **`DamageType`** (`@shared/types`, sin dueño). El token queda para ①:
 * hidratación de nodos (`ItemRepository`, `DamageCombiner`, `StaticHydrator`). Es `arch-decisions §18`
 * —*una llave, dos trabajos*— resuelto por partición, no por renombre: **no se acuñó ningún token
 * nuevo**, y en particular NO existe `AVATAR_ADD_<TIPO>_DAMAGE` (0 de 116 tokens `AVATAR_*` del dato
 * real tipan daño emitido; DE tipa el daño del avatar sólo para **resistirlo**, `AVATAR_CHANCE_RESIST_*`).
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────────────
 *
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

// Los 6 tipos COMBINADOS (Viral/Corrosive/Blast/Gas/Magnetic/Radiation) — derivados de
// `ELEMENT_COMBINATIONS` (SSoT, `status-base.ts`), no listados a mano. `DamageCombiner` sólo los
// materializa a partir de los mods PROPIOS del arma; una fuente externa (ability/arcano) que apunte
// a uno de estos tokens en un arma que no lo compone hoy no aterriza — filtro del sembrado
// condicional que lo resuelve, `StaticHydrator.ts` — #30.
const _COMBINED_DAMAGE_TOKEN_SET = new Set(ELEMENT_COMBINATIONS.map(c => damageTokenFromType(c.result)));

export function isCombinedDamageToken(value: string): boolean {
  return _COMBINED_DAMAGE_TOKEN_SET.has(value);
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

export type GlobalDamagePool = typeof GLOBAL_DAMAGE_POOLS[number];

/**
 * QUÉ ENTIDAD MATERIALIZA CADA POOL, por `domain`. Vive con el conjunto porque es la otra mitad de la
 * misma SSoT: declarar un pool sin declarar quién lo porta deja la decisión al hidratador, y ahí se
 * escribe como literal suelto — que es justo lo que el conjunto existe para evitar. Agregar un 3er
 * pool sigue siendo una línea acá: la del array y la de su alcance.
 *
 * **Los dos pools NO tienen el mismo alcance, y por eso no puede ser un gate único.**
 * `WEAPON_ADD_DAMAGE` es Serration: sólo un arma lo lleva — no hay Serration de habilidad ni de
 * mordida. `GAMEPLAY_MULT_FACTION_DAMAGE` es Roar/Bane, que la fuente declara sin acotar a arma
 * (*"increases the damage any ally deals from any source"*), así que alcanza a toda fuente de daño
 * del jugador — el arma y el compañero que la porta. La misma partición ya está escrita abajo en
 * `ABILITY_ELIGIBLE_POOLS` para el consumidor de habilidad; esto es la mitad que faltaba.
 *
 * **El enemigo no aparece, y ésa es la corrección (#26):** no tiene daño de arma propio ni recibe
 * buffs de facción del jugador. Antes entraba por un gate `!isWarframe` que lo metía junto con las
 * armas; hoy no lo alcanzaba **por el ruteo** (`FAMILY_ROUTE['GAMEPLAY']` exige la marca `weapon`),
 * no por el nodo — o sea que estaba desactivado por accidente y no por declaración, el patrón que
 * `channel-routing.ts` advierte que no se sostiene solo.
 *
 * **El warframe tampoco aparece, y eso NO cambia acá:** no materializa ninguno de los dos y su
 * emisión de habilidad lee el pool de un peer (`AbilityRepository`, `resolveFamilyEntities`). Es el
 * hack de composición que el hidratador ya nombraba; sigue en pie, sin tocar.
 */
export const POOL_BEARER_DOMAINS: Readonly<Record<GlobalDamagePool, readonly string[]>> = {
  WEAPON_ADD_DAMAGE:            ['weapon'],
  GAMEPLAY_MULT_FACTION_DAMAGE: ['weapon', 'companion'],
};

/**
 * El subconjunto de `GLOBAL_DAMAGE_POOLS` que alcanza a una emisión de habilidad
 * (`AbilityRepository.getEmissions`). Sólo `GAMEPLAY_MULT_FACTION_DAMAGE` (Roar/Bane): la fuente lo
 * declara sin acotar a arma (*"bonus damage to all weapons and abilities"*). `WEAPON_ADD_DAMAGE`
 * (Serration/Hornet Strike) NO — no existe un slot de mod que "modde" el daño base de una habilidad;
 * el `base_value` del override ya es el equivalente al innato-más-mods de un arma, no hay Serration de
 * habilidad que sumarle. Mismo patrón que ya usa el DoT para leer un subconjunto deliberado del pool
 * (ver NB2 abajo) — una tercera aplicación del mismo criterio, no una excepción nueva.
 */
export const ABILITY_ELIGIBLE_POOLS = ['GAMEPLAY_MULT_FACTION_DAMAGE'] as const;

/**
 * SSoT de RESOLUCIÓN por tipo de daño: cómo un tipo resuelve contra las capas del objetivo.
 * La lee `CombatSimulator.resolveDamageEvent`. La emisión (hit o tick de DoT) declara CON QUÉ tipo
 * resuelve (`Resolucion.as`) y core deriva las reglas de acá — sin ambigüedad: el hit directo de
 * Slash resuelve como `slash` (paga DR), el tick de bleed emite como `true` (bypass). Por eso
 * `bypassesArmorAndMatrix` SÍ puede vivir acá keyeado por `true` (antes era un opt de instancia
 * porque el tipo de origen —slash— no bastaba para distinguir). Ver `status-effects.md §Bleed`.
 */
export interface DamageResolutionRule {
  /** Bypasea armor (DR) + matriz③ facción×elemento (True — ej. el bleed de Slash). NO bypasea el
   *  multiplicador de capa: Viral SÍ amplifica un tick True (regla de composición #1). */
  bypassesArmorAndMatrix?: boolean;
}

/**
 * ⚠️ **Acá NO va qué capas saltea un daño.** Eso es propiedad de la **capa**, no del token, y vive en
 * `layers.ts`: el mismo Toxin atraviesa el shield y NO atraviesa el Overguard, así que un booleano
 * por token no puede expresarlo. Lo que queda es lo que sí es del daño: `bypassesArmorAndMatrix` no
 * depende de contra qué capa cae.
 */
export const DAMAGE_RESOLUTION_BY_TYPE: Partial<Record<DamageType, DamageResolutionRule>> = {
  true: { bypassesArmorAndMatrix: true },
};

/** ¿Este tipo bypasea armor (DR) + matriz③? (True). Default false. */
export function bypassesArmorAndMatrix(type: DamageType): boolean {
  return DAMAGE_RESOLUTION_BY_TYPE[type]?.bypassesArmorAndMatrix ?? false;
}
