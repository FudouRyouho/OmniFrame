/**
 * @domain Engine / Formulas / Enemy / Armor-Mitigation
 * @SSoT references/wiki/mechanics/armor.md §Reducción de daño — ⚠️ divergencia deliberada: el código adopta `√3a/100` (OQ-ENGINE-15, ver abajo)
 *
 * Ley de mitigación por armadura (Damage Reduction). Matemática pura: número→número.
 *
 * ⚠️ MIGRACIÓN PENDIENTE (gate = 2º consumidor de DR): hoy vive bajo `enemy/` porque el único
 * caso ejercitado es el enemigo (`√3a/100`), pero DR NO es enemy-specific — es una **primitiva del
 * ciclo de la entidad, indiferente a dónde aplica**. Cuando existan consumidores de DR
 * (player/companion), verificar si esto sube a scope `entity/` derivando por entidad
 * (`entity → player | enemy | companion`), p.ej. `player = armor/(armor+300)`. En ese momento se
 * decide también si el primitivo debe componer una tabla de datos intrínseca (como los coeficientes
 * de `enemy-scaling.ts`). Sin framework polimórfico hasta entonces (YAGNI).
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
