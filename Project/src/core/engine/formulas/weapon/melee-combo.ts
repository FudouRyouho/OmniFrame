/**
 * @domain Engine / Formulas / Weapon / MeleeCombo
 * @SSoT docs/domains/engine/design/melee-combo.md
 *
 * Tabla estándar del combo multiplier melee (la "tabla siempre igual" del catálogo, §3).
 * MELEE-específico: NO confundir con el combo de sniper/incarnon — son familias distintas
 * (Abstracción A diferida, arch-decisions §10). Por eso el nombre `melee-combo`, no `weapon-combo`.
 *
 * Fórmula (references/wiki/mechanics/melee-combo.md, confirmada in-game vía tooltip Slam Attack):
 *   mult = 1 + floor(count / 20)   cap 12x
 *   count 0→1x · 20→2x · 60→4x · 220→12x · 240→12x (cap)
 *
 * Excepciones por pasiva (Venka 13x@240, Dex Nikana 11x@110) NO viven acá — son unique traits,
 * mecánica aparte diferida (§3). Esta es la tabla del catálogo estándar (~150 armas melee base).
 */
export function meleeComboMult(comboCount: number): number {
	return Math.min(12, Math.max(1, 1 + Math.floor(comboCount / 20)));
}
