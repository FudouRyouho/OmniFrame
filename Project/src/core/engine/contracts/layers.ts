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
 * ⚠️ **El Overshield hereda la tabla del Shield por asunción, no por fuente.** La wiki dice *"Toxin
 * damage completely ignores **normal** shields"* — el adjetivo distingue, pero la página no aclara
 * qué pasa con los overshields. Es un hueco de la fuente, no de nuestra captura; queda marcado acá y
 * como `todo` en la suite en vez de resolverse inventando.
 */
const BYPASSED_BY: Readonly<Record<Layer, readonly string[]>> = {
  overguard:  [],                              // neutral a todo tipo: nada la atraviesa (Void/Magnetic la AMPLIFICAN, que es otra cosa)
  overshield: ["WEAPON_ADD_TOXIN_DAMAGE"],     // ⚠️ asunción — ver arriba
  shield:     ["WEAPON_ADD_TOXIN_DAMAGE"],
  health:     [],                              // la última: nada la atraviesa porque no hay debajo
};

/** ¿Esta capa deja pasar este daño sin absorberlo? */
export function layerBypassedBy(layer: Layer, damageToken: string): boolean {
  return BYPASSED_BY[layer].includes(damageToken);
}

/**
 * La capa que recibe el daño: la primera de la pila que **tiene cantidad** y **no lo deja pasar**.
 * Si ninguna califica cae en `health`, que es el piso — un portador sin capas sigue teniendo dónde
 * recibir, y que su salud esté en cero es una lectura, no un caso a resolver acá.
 */
export function layerFor(damageToken: string, amounts: Readonly<Partial<Record<Layer, number>>>): Layer {
  for (const layer of LAYER_STACK) {
    if ((amounts[layer] ?? 0) <= 0) continue;
    if (layerBypassedBy(layer, damageToken)) continue;
    return layer;
  }
  return "health";
}
