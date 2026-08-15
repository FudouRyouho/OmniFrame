/**
 * @domain Simulation-v2 / Contracts / Layers
 * @SSoT references/wiki/mechanics/{overguard,shield}.md — el orden de la pila y quién atraviesa qué
 *
 * **La pila defensiva del portador, y la tabla de quién la atraviesa.**
 *
 * Una **capa** es, por el test de `arch-decisions §22`, lo que *tiene cantidad que se agota* —
 * distinto de un **atributo** (armor, resistencias: se modulan, no se consumen) y de un **hecho**
 * (invulnerabilidad: no tiene cantidad, tiene duración; por eso NO está acá aunque se dibuje en la
 * misma barra).
 *
 * **Por qué la tabla es de la capa y no del daño.** Antes esto vivía como `bypassesShields(token)`:
 * un booleano absoluto que decía *"yo salteo escudos"* sin decir **cuáles**. Con una sola capa
 * salteable alcanzaba; con dos deja de alcanzar, y el caso lo da la fuente — Toxin atraviesa el
 * shield (`shield.wikitext:29`, *"Toxin damage completely ignores normal shields"*) pero **no** el
 * Overguard, que es *"neutral a todos los tipos de daño"* salvo Void y Magnetic
 * (`overguard.md:25`). La pregunta correcta no es *"¿este daño saltea escudos?"* sino **"¿esta capa
 * deja pasar este daño?"**.
 *
 * **Lo que este módulo declara es la LEY, no el ORIGEN.** De dónde sale la cantidad de cada capa es
 * otra pregunta y hoy sólo tiene respuesta para dos: health/shield salen de nodos (`vitalsOf`);
 * el Overguard nace de la clase (Eximus) o de una habilidad (Iron Skin) y el Overshield de una
 * restauración que excede el máximo. Ninguno de esos tres orígenes está modelado — y no hace falta
 * que lo esté para que la capa exista con su número en cero.
 */

import type { DamageType } from "@shared/types";

/** Las capas del portador, por el test de §22 (*cantidad que se agota*). */
export type Layer = "overguard" | "overshield" | "shield" | "health";

/**
 * La pila, **de arriba hacia abajo**: el daño busca la primera capa que tenga cantidad y lo admita.
 * `overguard.md:17` declara `Overguard → Shield → Health`; el Overshield se intercala entre los dos
 * primeros porque *"must be destroyed **before** your Warframe's shields can be damaged"*
 * (`shield.wikitext:580`).
 */
export const LAYER_STACK: readonly Layer[] = ["overguard", "overshield", "shield", "health"] as const;

/**
 * Qué atraviesa cada capa sin tocarla. **Es una propiedad de la capa**, no del daño.
 *
 * El Overshield hereda la tabla del Shield — no son capas ajenas a la regla de Toxin. La wiki dice
 * *"Toxin damage completely ignores **normal** shields"* sin nombrar overshields explícitamente,
 * pero no son un caso aparte.
 */
const BYPASSED_BY: Readonly<Record<Layer, readonly DamageType[]>> = {
  overguard:  [],           // neutral a todo tipo: nada la atraviesa (Void/Magnetic la AMPLIFICAN, que es otra cosa)
  overshield: ["toxin"],    // no es una capa ajena a la regla del shield
  shield:     ["toxin"],
  health:     [],           // la última: nada la atraviesa porque no hay debajo
};

/**
 * ¿Esta capa deja pasar este daño sin absorberlo?
 *
 * ⚠️ **Se preguntaba por token y ahora por tipo.** *"Toxin atraviesa el shield"* es una ley del **tipo**
 * —la fuente habla de Toxin, no de `WEAPON_ADD_TOXIN_DAMAGE`—, así que keyearla por token la ataba al
 * emisor. Medido: `Toxin 200` contra un target con `shields 500` caía en `{health: 200}` con el token
 * del arma y en **`{shield: 200}`** con cualquier otra familia. La capa equivocada, sin ruido.
 */
export function layerBypassedBy(layer: Layer, type: DamageType): boolean {
  return BYPASSED_BY[layer].includes(type);
}

/**
 * La capa que recibe el daño: la primera de la pila que **tiene cantidad** y **no lo deja pasar**.
 * Si ninguna califica cae en `health`, que es el piso — un portador sin capas sigue teniendo dónde
 * recibir, y que su salud esté en cero es una lectura, no un caso a resolver acá.
 */
export function layerFor(type: DamageType, amounts: Readonly<Partial<Record<Layer, number>>>): Layer {
  for (const layer of LAYER_STACK) {
    if ((amounts[layer] ?? 0) <= 0) continue;
    if (layerBypassedBy(layer, type)) continue;
    return layer;
  }
  return "health";
}
