/**
 * @domain Engine / Formulas / Enemy / EHP
 * @SSoT references/wiki/mechanics/calculating-bonuses.md §Armor y EHP
 *
 * Effective Health por armadura: cada 300 de armor = +100% EHP (escala LINEAL, sin diminishing en EHP —
 * el diminishing está en el DR%, no en el EHP). `EHP = Health × (Armor + 300) / 300`.
 *
 * Primitiva DISPONIBLE (directiva 1: las primitivas de la wiki son el piso, se modelan antes que el
 * consumidor). Sin consumidor en el motor todavía.
 */
export function effectiveHealthFromArmor(health: number, armor: number): number {
  return (health * (armor + 300)) / 300;
}
