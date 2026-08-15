/**
 * Galvanized Shot (secondary) — tercer miembro de la familia CO, vinculado 2026-07-04.
 *
 * Distinción clave: `maxStacks = 3` (Savvy/Aptitude son 2). El override tenía rank-10 = 120
 * = coefBase(40) × maxStacks(3) bakeado — misma conflación de dimensiones que sus gemelos,
 * pero con el 3, no un clon del Status Chance. Corregido a coefBase 40 (÷3) contra la fuente DE.
 *
 * Vehículo: Laetum, que YA equipa Galvanized Shot en su build (slot 2). Normal Attack =
 * Projectile → co_behavior 'multiplying' (default por shot_type; el bonus cae en multiplicative).
 *
 * Lo que valida: (1) coefBase = 40, no 120; (2) el motor usa el `active_stacks` DECLARADO —
 * con stacks=3 el bonus escala a 40×3×N, probando que `stacks` es un parámetro por-mod y NO
 * un 2 hardcodeado. Fórmula: coBonusPct = 40 × activeStacks × N.
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { laetum, LAETUM } from '../fixtures/builds';

await loadEngineData(new NodeAdapter());

/** Laetum (Normal Attack) + techo declarado, modo estático (on_kill activo). */
const techo = (stacks: number, n: number) =>
  consume(laetum('base'), { variables: { active_stacks: stacks, status_type_count: n } }).weapon(LAETUM);
const sinVars = () => consume(laetum('base')).weapon(LAETUM);

describe('Galvanized Shot (secondary) — vínculo CO, maxStacks 3', () => {
  it('coefBase 40 (no 120): N=1, stacks=1 → bonus +40% → multiplicative 1.4', () => {
    expect(techo(1, 1).node('WEAPON_ADD_DAMAGE').multiplicative).toBeCloseTo(1.4, 2);
  });

  it('stacks=3 (maxStacks propio): N=3, stacks=3 → bonus +360% (40×3×3) → multiplicative 4.6', () => {
    // Prueba que el motor usa el stacks DECLARADO (3), no un 2 hardcodeado como Savvy/Aptitude.
    expect(techo(3, 3).node('WEAPON_ADD_DAMAGE').multiplicative).toBeCloseTo(4.6, 2);
  });

  it('Projectile → el bonus va a multiplicative, no a mods_add_pct', () => {
    expect(techo(3, 3).node('WEAPON_ADD_DAMAGE').multiplicative).toBeCloseTo(4.6, 2);
  });

  it('sin declarar el techo → Shot no aplica (multiplicative 1.0)', () => {
    expect(sinVars().node('WEAPON_ADD_DAMAGE').multiplicative).toBeCloseTo(1.0, 3);
  });
});
