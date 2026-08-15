/**
 * @domain Engine / Formulas / Enemy / Armor-Mitigation
 * @SSoT references/wiki/mechanics/enemy-resistances.md §DR de armor enemigo — ⚠️ divergencia deliberada
 *      (OQ-ENGINE-15): el wiki-texto da `1−0.9·AR/2700` (lineal), el código adopta `√3a/100` (la del
 *      calculador-gadget, ver abajo). NB: `armor.md` da `AR/(AR+300)` = DR del **jugador**, no del enemigo.
 *
 * Ley de mitigación por armadura (Damage Reduction). Matemática pura: número→número.
 *
 * **El gate de migración se cumplió, y la respuesta fue NO subir a `entity/`.** Apareció el segundo
 * consumidor (un avatar portando estado, medido mitigando con esta ley cuando le corresponde la del
 * Tenno) y lo que mostró es que las dos no son la misma fórmula con otro parámetro: `a/(a+300)` y
 * `0.9·√(a/2700)` no comparten forma algebraica. Un scope `entity/` compartido no tendría qué
 * compartir. Así que **cada clase conserva su primitiva en su carpeta** —la del Tenno vive en
 * `formulas/warframe/armor-mitigation.ts`— y **quién elige es el borde de resolución**, el único que
 * sabe de quién es la armadura. Cierra el eje de forma de `OQ-ENGINE-22`.
 */

/**
 * Damage Reduction desde armor: `DR = √(3·armor)/100`. El techo de 90% NO se aplica aquí — viene
 * río arriba del clamp de `armor` a 2700 en el escalado (`scaleArmor`); esta función es la ley pura.
 * Fórmula del calculador del wiki (`ext.gadget.enemyinfoboxslider`) — la fuente más honesta hoy (la
 * que usa la wiki + la comunidad). **PROVISIONAL — `OQ-ENGINE-15`**: conflicto de 3 vías en la wiki
 * (esta vs `0.9·AR/2700` lineal vs `AR/(AR+300)` viejo); se confirma/tira contra un popup real en el
 * contraste #1.
 */
export function damageReductionFromArmor(armor: number): number {
  return Math.sqrt(3 * armor) / 100;
}
