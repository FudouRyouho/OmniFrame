/**
 * @domain Engine / Formulas / Player / EHP (mal ubicada bajo `enemy/` — ver nota)
 * @SSoT references/wiki/mechanics/calculating-bonuses.md §Armor y EHP
 *
 * Effective Health por armadura: cada 300 de armor = +100% EHP (escala LINEAL, sin diminishing en EHP —
 * el diminishing está en el DR%, no en el EHP). `EHP = Health × (Armor + 300) / 300`.
 *
 * ⚠️ Esta fórmula equivale a `DR = Armor/(Armor+300)` — `OQ-ENGINE-15` (§precisión 2026-07-09) la
 * documenta como la vigente para **Tenno/jugador**, no para enemigo (para enemigo es la "era vieja",
 * superada por `√3a/100` en `armor-mitigation.ts`). NO usar esto para EHP de enemigo — ver
 * `effective-health.ts` (`effectiveHealthVsEnemy`), que compone la DR de enemigo ya adoptada.
 *
 * Primitiva DISPONIBLE (directiva 1: las primitivas de la wiki son el piso, se modelan antes que el
 * consumidor). Sin consumidor todavía — candidata a EHP de jugador cuando exista ese consumidor;
 * mover de carpeta en ese momento (gate = 2º consumidor, mismo criterio que `armor-mitigation.ts`).
 */
export function effectiveHealthFromArmor(health: number, armor: number): number {
  return (health * (armor + 300)) / 300;
}
