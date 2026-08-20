/**
 * @domain Engine / Formulas / Enemy / Effective-Health
 * @SSoT armor-mitigation.ts (DR de enemigo adoptada, `√3a/100`, `OQ-ENGINE-15`) ·
 *       contracts/layers.ts (`LAYER_STACK`, la pila de capas del portador)
 *
 * EHP de enemigo: compone la DR de armadura ya adoptada con TODA capa presente en `LAYER_STACK`, no
 * con un subconjunto enumerado a mano (#55 — el término `overguard` faltaba y nadie lo notó mientras
 * la capa nacía en 0). `armor` no es capa —se modula, no se consume (`contracts/layers.ts`)— así que
 * entra aparte, como el factor que reduce `health`. Una capa sin origen construido (overshield, hoy)
 * vale 0 por default y no participa; el día que reciba origen, este cómputo la suma sin tocar esta
 * función.
 *
 * `EHP = Σ_capa cantidad(capa) × factor(capa)`, con `factor(health) = 1/(1−DR)` y `factor(resto) = 1`.
 *
 * NO confundir con `ehp.ts` (`EHP = Health × (Armor+300)/300`): esa fórmula equivale a la DR
 * `Armor/(Armor+300)`, que `OQ-ENGINE-15` documenta como la vigente para **Tenno/jugador**, no para
 * enemigo (era vieja para enemigo, superada por la adoptada). Usar esta primitiva para enemigos.
 *
 * ⚠️ Snapshot estático, no predicción de `ttk`. Este número reproduce el panel del calculador del
 * wiki (`t=0`, sin bypass por tipo de daño, sin gate, sin derrame) — es OTRO cómputo que
 * `computeCombatMetrics`/`EntityState.receive()`, que sí modelan eso (`contracts/layers.ts`,
 * `layerFor`). Con Overguard > 0 divergen a propósito: no son la misma pregunta con dos caminos, y
 * uno no valida al otro.
 */
import { LAYER_STACK, type Layer } from '../../contracts/layers';
import { damageReductionFromArmor } from './armor-mitigation';

export function effectiveHealthVsEnemy(
  armor: number,
  layers: Readonly<Partial<Record<Layer, number>>>,
): number {
  const dr = damageReductionFromArmor(armor);
  return LAYER_STACK.reduce((total, layer) => {
    const amount = layers[layer] ?? 0;
    return total + (layer === 'health' ? amount / (1 - dr) : amount);
  }, 0);
}
