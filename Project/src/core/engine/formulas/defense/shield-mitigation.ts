/**
 * @domain Engine / Formulas / Defense — la DR inherente de la capa de escudo
 *
 * **LA LEY:** el escudo mitiga una fracción fija del daño que recibe, y esa fracción es del
 * **portador**, no del daño. `references/wiki/mechanics/shield.md` §Reducción de daño inherente:
 * *"**50 % de DR**, pero **no para todos**"* — la reciben *"Warframes · Operators · Archwings ·
 * Railjacks · Necramechs"* y **no** los *"Companions"*.
 *
 * **Es el caso que prueba por qué la llave de ley es la clase de unidad** (`contracts/unit-class.ts`):
 * esta lista y la del shield gate **no coinciden** —el gate sí alcanza al compañero (`shield-gate.ts`)—
 * así que ninguna marca única puede contestar las dos. Una sola marca `avatar` le daba al compañero
 * una mitigación que la fuente le niega por nombre.
 *
 * ⚠️ **El enemigo no figura, y no es un hueco:** `shield.md` no le atribuye DR de escudo en ningún
 * lado — su escudo absorbe 1:1, y lo que sí tiene es su propio gate (5 % de fuga, 0.1 s).
 *
 * ⚠️ **El overshield comparte esta ley con el escudo.** No es simetría asumida: la fuente lo trata
 * como *"an extra layer of protection on your existing shield"* y no le declara mitigación propia.
 */
import { TENNO_CHANNELS, byChannel, forChannels } from "../../contracts/unit-class";

/** Fracción del daño que el escudo absorbe de más. `0.5` = el escudo aguanta el doble de su valor. */
export const TENNO_SHIELD_DR = 0.5;

const SHIELD_DR_BY_CLASS: Readonly<Record<string, number>> = {
  ...forChannels(TENNO_CHANNELS, TENNO_SHIELD_DR),
  // `companion` ausente = sin DR, que es lo que la fuente dice. `enemy` ausente por lo mismo.
};

/**
 * La DR de escudo de una clase, o `0` si esa clase no la tiene.
 *
 * **`0` no es un hueco** —a diferencia de `armorMitigationFor`, que tira—: *"este portador no mitiga
 * con el escudo"* es una respuesta que la fuente da explícitamente para los compañeros, no una
 * ausencia de conocimiento.
 */
export function shieldDamageReductionFor(channel: string | undefined): number {
  return byChannel(SHIELD_DR_BY_CLASS, channel) ?? 0;
}

/**
 * Cuánto **daño** hace falta para vaciar una capa de escudo que tiene `puntos` disponibles.
 *
 * Con DR 0.5, vaciar 455 de escudo cuesta 910 de daño. Es la dirección que importa: la capa se mide
 * en puntos y el evento en daño, y confundirlas hace que el escudo aguante la mitad de lo que debe.
 */
export function damageToDeplete(puntos: number, dr: number): number {
  return dr >= 1 ? Infinity : puntos / (1 - dr);
}
