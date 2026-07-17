/**
 * @domain Engine / Formulas / Status / DoT base scaling
 * @SSoT references/wiki/mechanics/status-effects.md §DoT + references/ingame-tests/dot-scaling.md
 *
 * `modded_base` del DoT: base innato × el multiplicador de **base-damage** (Serration), NO el daño
 * COMPUESTO (que incluye mods de elemento). Empírico (Tiberon): el DoT escala con `innate × Serration`,
 * no con el compuesto — evita el double-count de Serration. Extraído de `deriveInstance` (P3, identidad).
 *
 * El multiplicador de base-damage ES `globalDamageBucketFactor(WEAPON_ADD_DAMAGE)` (el mismo factor del
 * pool aditivo global, P2a/§16) — se reusa para dejar explícito que el DoT hereda el factor de Serration.
 */
import type { AttributeNode } from "../../contracts";
import { globalDamageBucketFactor } from "../weapon/stat-accumulator";

export function scaleDotBase(innateBaseTotal: number, weaponDamageNode: AttributeNode | undefined): number {
  return innateBaseTotal * globalDamageBucketFactor(weaponDamageNode);
}
