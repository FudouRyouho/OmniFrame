/**
 * Cedo Prime — Condition Overload / GunCO en MODO ESTÁTICO (techo asumido).
 *
 * Primer ladrillo de la doctrina input→simulado (arch-decisions §8): el bonus
 * "Direct Damage per Status Type" (Galvanized Savvy) evaluado con N y activeStacks
 * DECLARADOS como input (no emergentes). El número es el techo (perfect-clic), no el
 * esperado — el modo dinámico (uptime real vía RNG) es otra métrica, diferida a C2.
 *
 * Fórmula: damage × (1 + coefBase% × activeStacks × N_status_types)
 *   coefBase = 40 (Galvanized Savvy r10, fidelidad DE — drift-fix 2026-07-03: era 80).
 *   activeStacks, N = context.variables['active_stacks'], ['status_type_count'].
 *
 * Ruteo: Cedo Normal Attack = Hit-Scan → co_behavior 'adding' → el bonus compone en
 * mods_add_pct junto a Primed Point Blank (NO es un multiplicador aparte). Esto es lo
 * que distingue 'adding' de 'multiplying' — ver co-behavior-resolution.test.ts.
 *
 * Condición: el stat es on_kill; el modo estático (sin flags explícitas) lo activa.
 * Sin declarar las variables de contexto, los factores son 0 → el bonus NO aplica
 * (perfect-clic requiere declarar el techo).
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { cedo, CEDO_PRIME } from '../fixtures/builds';

await loadEngineData(new NodeAdapter());

/** Modo estático (on_kill activo) + techo declarado: activeStacks y N por context. */
const techo = (stacks: number, n: number) =>
  consume(cedo(true), { variables: { active_stacks: stacks, status_type_count: n } }).weapon(CEDO_PRIME);
/** Modo estático sin declarar el techo → factores ausentes → CO no aplica. */
const staticSinVars = () => consume(cedo(true)).weapon(CEDO_PRIME);

// ─── Ruteo 'adding': el bonus CO compone en mods_add_pct ─────────────────────────

describe('Cedo — GunCO estático: ruteo adding (Hit-Scan)', () => {
  it('N=3, stacks=2: bonus +240% entra en mods_add_pct (165 PPB + 240 CO = 405)', () => {
    const n = techo(2, 3).node('WEAPON_ADD_DAMAGE');
    expect(n.mods_add_pct).toBeCloseTo(405, 0);
    expect(n.multiplicative).toBeCloseTo(1.0, 3); // NO va a multiplicative — es 'adding'
  });

  it('N=3, stacks=2: daño final = 32 × (1 + 4.05) = 161.6', () => {
    expect(techo(2, 3).node('WEAPON_ADD_DAMAGE').final).toBeCloseTo(161.6, 1);
  });
});

// ─── Linealidad en las dos dimensiones declaradas ────────────────────────────────

describe('Cedo — GunCO estático: linealidad en N y en stacks', () => {
  it('N=1, stacks=2: bonus +80% (40×2×1) → mods_add_pct 245', () => {
    expect(techo(2, 1).node('WEAPON_ADD_DAMAGE').mods_add_pct).toBeCloseTo(245, 0);
  });
  it('N=3, stacks=1: bonus +120% (40×1×3) → mods_add_pct 285', () => {
    expect(techo(1, 3).node('WEAPON_ADD_DAMAGE').mods_add_pct).toBeCloseTo(285, 0);
  });
  it('N=0 (sin status): bonus 0 → mods_add_pct 165 (solo PPB)', () => {
    expect(techo(2, 0).node('WEAPON_ADD_DAMAGE').mods_add_pct).toBeCloseTo(165, 0);
  });
});

// ─── Honestidad: sin declarar el techo, el bonus NO se asume ──────────────────────

describe('Cedo — GunCO estático: el techo se declara, no se asume', () => {
  it('modo estático sin context vars → factores ausentes → CO no aplica (165 = base PPB)', () => {
    const n = staticSinVars().node('WEAPON_ADD_DAMAGE');
    expect(n.mods_add_pct).toBeCloseTo(165, 0);
    expect(n.final).toBeCloseTo(84.8, 1);
  });
});

// ─── Ruteo 'multiplying': Alt-Fire Glaive (Projectile) ───────────────────────────
//
// Fidelidad confirmada por el usuario (2026-07-04): el alt-fire de Cedo aplica CO
// MULTIPLICATIVAMENTE. El mismo bonus +240% (40×2×3) que en Normal Attack va a adding,
// aquí va al bucket `multiplicative` (multiplicador final aparte), no a mods_add_pct.
const techoGlaive = (stacks: number, n: number) =>
  consume(cedo(true, 'alt-fire_glaive'), { variables: { active_stacks: stacks, status_type_count: n } })
    .weapon(CEDO_PRIME);
const techoRadial = (stacks: number, n: number) =>
  consume(cedo(true, 'glaive_radial_attack'), { variables: { active_stacks: stacks, status_type_count: n } })
    .weapon(CEDO_PRIME);

describe('Cedo — GunCO estático: ruteo multiplying (Alt-Fire Glaive, Projectile)', () => {
  it('N=3, stacks=2: bonus +240% va a multiplicative (1 + 2.4 = 3.4), NO a mods_add_pct', () => {
    const n = techoGlaive(2, 3).node('WEAPON_ADD_DAMAGE');
    expect(n.multiplicative).toBeCloseTo(3.4, 2);
  });
});

// ─── Ruteo 'none': Glaive Radial Attack (AoE) ────────────────────────────────────
//
// AoE radial → CO no aplica (comportamiento "Does not apply" de la wiki).

describe('Cedo — GunCO estático: ruteo none (Glaive Radial Attack, AoE)', () => {
  it('N=3, stacks=2: CO no aplica → multiplicative queda en 1.0', () => {
    const n = techoRadial(2, 3).node('WEAPON_ADD_DAMAGE');
    expect(n.multiplicative).toBeCloseTo(1.0, 3);
  });
});
