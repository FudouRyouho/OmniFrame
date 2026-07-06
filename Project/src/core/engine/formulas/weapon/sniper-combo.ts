/**
 * @domain Engine / Formulas / Weapon / SniperCombo
 * @SSoT references/wiki/mechanics/sniper-combo.md
 *
 * Multiplier del Shot Combo Counter de snipers. LOGARÍTMICO (≠ el melee, que es lineal):
 *   mult = 1.5 + 0.5·⌊log₃(count / minCombo)⌋      (activo desde count ≥ minCombo)
 * Cada +0.5x pide 3× más hits. Bajo `minCombo` → counter inactivo → ×1 (identidad).
 * Necesita DOS inputs (count dinámico + minCombo por-arma) — el melee solo necesitaba count.
 * Sin cap explícito (tope teórico u32). Ver references/wiki/mechanics/sniper-combo.md.
 */
export function sniperComboMult(comboCount: number, minCombo: number): number {
	if (minCombo <= 0 || comboCount < minCombo) return 1;
	// +1e-9: guarda de precisión float — log(9)/log(3) puede dar 1.9999… y arruinar el floor
	// en las potencias exactas de 3 (los umbrales de tier).
	const tiers = Math.floor(Math.log(comboCount / minCombo) / Math.log(3) + 1e-9);
	return 1.5 + 0.5 * tiers;
}
