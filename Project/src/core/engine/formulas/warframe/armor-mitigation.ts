/**
 * @domain Engine / Formulas / Warframe / Armor-Mitigation
 * @SSoT references/wiki/mechanics/armor.md §Tenno — `DR = Net Armor / (Net Armor + 300)`
 *
 * La mitigación por armadura del **Tenno**. Es una fórmula distinta de la del enemigo, no un
 * parámetro distinto de la misma: `armor.md` publica las dos, una al lado de la otra, y no comparten
 * forma algebraica — ningún valor de coeficiente convierte `a/(a+300)` en `0.9·√(a/2700)`. Por eso la
 * selección no puede vivir en la fórmula: vive en el **borde de resolución**, que es el único lugar
 * que sabe quién porta la armadura.
 *
 * Que un avatar mitigara con la ley del hostil estaba **medido** —`√(3·105)/100 = 0.177482` contra el
 * `0.259259` que le corresponde, coincidencia al sexto decimal con la fórmula equivocada— y es lo que
 * le dio a `OQ-ENGINE-22` el consumidor real que su condición de apertura pedía.
 */

/**
 * Damage Reduction del Tenno desde armor: `DR = armor / (armor + 300)`.
 * 300 de armor reduce el daño a la mitad; 600 deja pasar el 33%; 900 deja pasar el 25%.
 * Sin clamp: la función es asintótica a 1 y nunca lo alcanza, que es la ley — no hay techo que imponer.
 */
export function tennoDamageReductionFromArmor(armor: number): number {
  return armor / (armor + 300);
}
