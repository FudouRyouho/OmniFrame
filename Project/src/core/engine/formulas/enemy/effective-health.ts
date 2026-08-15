/**
 * @domain Engine / Formulas / Enemy / Effective-Health
 * @SSoT armor-mitigation.ts (DR de enemigo adoptada, `√3a/100`, `OQ-ENGINE-15`)
 *
 * EHP de enemigo: compone la DR de armadura ya adoptada con health y shields.
 * `EHP = Health / (1 − DR) + Shields`. Primitiva pura — el consumidor sólo aporta los tres números.
 *
 * NO confundir con `ehp.ts` (`EHP = Health × (Armor+300)/300`): esa fórmula equivale a la DR
 * `Armor/(Armor+300)`, que `OQ-ENGINE-15` documenta como la vigente para **Tenno/jugador**, no para
 * enemigo (era vieja para enemigo, superada por la adoptada). Usar esta primitiva para enemigos.
 */
import { damageReductionFromArmor } from './armor-mitigation';

export function effectiveHealthVsEnemy(health: number, armor: number, shields: number): number {
  return health / (1 - damageReductionFromArmor(armor)) + shields;
}
