/**
 * Galvanized Chamber — familia STACK_DECAY_BUFF, primer código real (ladrillo #4, roadmap C1).
 *
 * Arquitectura cerrada desde 2026-07-09 (`arch-decisions.md §11`, arcanos Merciless/Deadhead/etc.)
 * pero CERO código hasta hoy — ni para arcanos ni para mods. Galvanized Chamber es el primer
 * vehículo real: confirma que la familia generaliza cross-schema (arcanos conceptual, mods real).
 *
 * El dato NO estaba roto — D-15 §2 (VIGENTE) ya documentaba `base_value` como total-a-máximo-
 * stacks por diseño. Lo que faltaba era un campo ESTRUCTURADO para el cap (`max_stacks`, D-15
 * evolución 2026-07-10): antes solo vivía como texto libre en `notes[]`. El motor deriva
 * `perStackPct = base_value/max_stacks` en hidratación — verificado contra el "per_stack" ya
 * capturado en la nota (150/5 = 30, exacto).
 *
 * Galvanized Chamber tiene DOS stats sobre el MISMO nodo (`WEAPON_ADD_MULTISHOT`):
 *   - plana "+80% Multishot" (rank 10, sin condición) → camino genérico, sin tocar.
 *   - "On Kill: +150% Multishot for 20s" (rank 10, stacks 5x) → STACK_DECAY_BUFF, perStackPct=30.
 * Total mods_add_pct = 80 (plana) + 30×clamp(stacks,0,5) (stack decay).
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { boltor, BOLTOR_PRIME, GALVANIZED_CHAMBER, galvanizedStacksVar } from '../fixtures/builds';

await loadEngineData(new NodeAdapter());

const STACKS_VAR = galvanizedStacksVar(GALVANIZED_CHAMBER);

const chamber = (stacks: number) =>
  consume(boltor({ mods: { 0: GALVANIZED_CHAMBER } }), { flags: {}, variables: { [STACKS_VAR]: stacks } })
    .weapon(BOLTOR_PRIME);

const chamberNoDeclare = () =>
  consume(boltor({ mods: { 0: GALVANIZED_CHAMBER } }), { flags: {} }).weapon(BOLTOR_PRIME);

const baseline = () => consume(boltor({}), { flags: {} }).weapon(BOLTOR_PRIME);

describe('Galvanized Chamber — familia STACK_DECAY_BUFF', () => {
  it('línea base sin el mod: mods_add_pct = 0 en WEAPON_ADD_MULTISHOT', () => {
    expect(baseline().node('WEAPON_ADD_MULTISHOT').mods_add_pct).toBeCloseTo(0, 1);
  });

  it('0 stacks: solo la parte plana (+80%), el stack decay aporta 0', () => {
    expect(chamber(0).node('WEAPON_ADD_MULTISHOT').mods_add_pct).toBeCloseTo(80, 1);
  });

  it('3 stacks: 80 + 30×3 = 170 (escalar, no identidad)', () => {
    expect(chamber(3).node('WEAPON_ADD_MULTISHOT').mods_add_pct).toBeCloseTo(170, 1);
  });

  it('cap 5x: 6 stacks declarados → clamp a 5 → 80 + 150 = 230 (no 260)', () => {
    expect(chamber(6).node('WEAPON_ADD_MULTISHOT').mods_add_pct).toBeCloseTo(230, 1);
  });

  it('sin declarar stacks → 0 (no dropea el mod entero, solo el stack decay): 80', () => {
    expect(chamberNoDeclare().node('WEAPON_ADD_MULTISHOT').mods_add_pct).toBeCloseTo(80, 1);
  });

  it('condition on_kill descartado: NO requiere context.flags.on_kill para aplicar', () => {
    // flags:{} activo (sin on_kill) y aun así la parte plana + stacks declarados aplican.
    expect(chamber(2).node('WEAPON_ADD_MULTISHOT').mods_add_pct).toBeCloseTo(80 + 60, 1);
  });
});
