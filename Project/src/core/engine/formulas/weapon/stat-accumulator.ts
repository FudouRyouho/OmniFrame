/**
 * @domain Engine / Formulas / Weapon / Stat Accumulator
 * @SSoT docs/semantic/upgrade-tokens.md (§fórmula de referencia) + references/wiki/mechanics/calculating-bonuses.md
 *
 * El acumulador de un stat (fórmula de referencia D-6 / §4.1) + el factor del bucket de daño global.
 * Extraído de `SimulationEngine.calculateCurrentValue` (P2a, **identidad** — comportamiento idéntico).
 *
 * Vocabulario (`docs/domains/engine/design/vocabulary.md`): `base` = input · los **5 buckets** = las
 * ranuras acumuladoras · `pool` = grupo de apilado aditivo `(1+Σ)` · `final` = output.
 *
 * ⚠️ Deuda de ESTRUCTURA (no de vocabulario): el acumulador tiene un set **cerrado** de ranuras aditivas
 * (`base_add_pct`, `mods_add_pct`), sin colección abierta de pools nombrados. Por eso los pools globales
 * (base-damage/facción) se realizan como **nodos falsos** en vez de vivir dentro del nodo que escalan —
 * ver `arch-decisions §16` y `vocabulary.md §3`. La forma honesta (`Base × ∏_pools(1+Σ) + ΣFlat`, de
 * `calculating-bonuses.md`) está EN DEBATE, no decidida.
 */
import type { AttributeNode } from "../../contracts";
import { applyAdditiveBonus } from "../common/scaling-base";

/**
 * Valor resuelto de un nodo (genérico, cualquier stat): `(Base+base_flat)×(1+base_add%)` escalado por
 * `mods_add_pct`, más `total_flat` post-escala, todo por `multiplicative`. La fórmula que
 * `upgrade-tokens.md §fórmula de referencia` declara y que `SimulationEngine` calculaba inline.
 */
export function resolveStatValue(node: AttributeNode): number {
  const scaledBase = applyAdditiveBonus(node.base + node.base_flat, node.base_add_pct);
  const withMods = applyAdditiveBonus(scaledBase, node.mods_add_pct);
  return (withMods + node.total_flat) * node.multiplicative;
}

/**
 * Factor del bucket de daño global (Serration/`WEAPON_ADD_DAMAGE`): `final / base`. Es el bucket
 * **ADITIVO** (Step 1 de `calculating-bonuses.md`) expresado como multiplicador para aplicarlo a los
 * nodos de daño por-tipo — NO un bucket multiplicativo. Renombra el engañoso `globalDmgMult` (el olor
 * semántico que motivó la extracción, `arch-decisions §16`). `1.0` si no hay nodo de daño global.
 */
export function globalDamageBucketFactor(weaponDamageNode: AttributeNode | undefined): number {
  return weaponDamageNode ? weaponDamageNode.final / (weaponDamageNode.base || 100) : 1.0;
}
