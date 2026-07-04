/**
 * Perks incarnon CO (familia Condition Overload) — cierre del frente CO de armas.
 *
 * Los 8 perks incarnon con "Direct Damage per Status Type" (Angstrum, Burston, Despair,
 * Lato, Soma, Zylok, Dual Toxocyst, Latron) se vincularon 2026-07-04: se les añadió
 * `upgrade_type: WEAPON_ADD_DAMAGE_PER_STATUS_TYPE` (antes AUSENTE → dropeados) y el
 * IncarnonRepository ahora propaga `co_factors`.
 *
 * Diferencia con los mods galvanizados: los perks son **1x (sin stacks)** — el label no dice
 * "Stacks up to Nx". Así que coefBase=40 NO está bakeado (no hay drift de dato) y `activeStacks`
 * no se declara → el motor usa el default 1. El bonus escala solo con N: coBonusPct = 40 × 1 × N.
 *
 * Vehículo: Soma Prime + Fatal Affliction (tier 4). Fully Spooled = Hit-Scan → co_behavior
 * 'adding' (el bonus compone en mods_add_pct). El perk no tiene condición → siempre activo.
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { soma, SOMA_PRIME } from '../fixtures/builds';

await loadEngineData(new NodeAdapter());

/** Soma + Fatal Affliction, N declarado. Sin active_stacks → stacks=1 (perk es 1x). */
const conPerk = (n: number) =>
  consume(soma({ perks: { 4: 'fatal_affliction' } }), { variables: { status_type_count: n } }).weapon(SOMA_PRIME);
/** Soma + Fatal Affliction pero sin declarar N → factor ausente → CO no aplica. */
const sinN = () => consume(soma({ perks: { 4: 'fatal_affliction' } })).weapon(SOMA_PRIME);
/** Soma sin el perk → línea base de mods_add_pct (para el delta). */
const sinPerk = (n: number) =>
  consume(soma({}), { variables: { status_type_count: n } }).weapon(SOMA_PRIME);

describe('Perk incarnon CO (Soma / Fatal Affliction) — 1x, escala solo con N', () => {
  it('N=3, sin stacks declarados → bonus +120% (40×1×3) en mods_add_pct (adding)', () => {
    const delta = conPerk(3).node('WEAPON_ADD_DAMAGE').mods_add_pct
                - sinPerk(3).node('WEAPON_ADD_DAMAGE').mods_add_pct;
    expect(delta).toBeCloseTo(120, 0);
  });

  it('linealidad en N (1x, sin stacks): N=1 → +40, N=5 → +200', () => {
    const base = sinPerk(1).node('WEAPON_ADD_DAMAGE').mods_add_pct;
    expect(conPerk(1).node('WEAPON_ADD_DAMAGE').mods_add_pct - base).toBeCloseTo(40, 0);
    expect(conPerk(5).node('WEAPON_ADD_DAMAGE').mods_add_pct - base).toBeCloseTo(200, 0);
  });

  it('sin declarar N → el perk no aplica (mods_add_pct = línea base)', () => {
    expect(sinN().node('WEAPON_ADD_DAMAGE').mods_add_pct)
      .toBeCloseTo(sinPerk(0).node('WEAPON_ADD_DAMAGE').mods_add_pct, 0);
  });
});
