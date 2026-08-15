/**
 * Galvanized Aptitude (rifle) — gemelo de Galvanized Savvy, vinculado a la familia CO.
 *
 * Foco: el MOD, no el arma. Verifica que Aptitude, tras el drift-fix + re-map (2026-07-04),
 * se hidrata como `CONDITION_OVERLOAD` con coefBase = 40 (era 80: clon del array de Status
 * Chance, corregido contra la fuente DE) y aplica end-to-end en un rifle.
 *
 * Vehículo: Boltor Prime (Normal Attack = Projectile). Su co_behavior = 'multiplying' es el
 * DEFAULT por shot_type (heurística, NO verificado en juego para Boltor) — el bonus cae en
 * `multiplicative`. Lo que este test asegura es el mod (coefBase, token, hidratación); el
 * bucket es incidental y se corregiría con un override si la partida lo desmiente.
 *
 * Fórmula: coBonusPct = coefBase(40) × activeStacks × N. Multiplying → ×(1 + bonus/100).
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { boltor, BOLTOR_PRIME } from '../fixtures/builds';

await loadEngineData(new NodeAdapter());

const APTITUDE = '/Lotus/Upgrades/Mods/Rifle/WeaponStatusChanceSPMod';

/** Boltor + Aptitude, modo estático (on_kill activo), techo declarado. */
const techo = (stacks: number, n: number) =>
  consume(boltor({ mods: { 0: APTITUDE } }), { variables: { active_stacks: stacks, status_type_count: n } })
    .weapon(BOLTOR_PRIME);
/** Estático sin declarar el techo → factores ausentes → CO no aplica. */
const sinVars = () => consume(boltor({ mods: { 0: APTITUDE } })).weapon(BOLTOR_PRIME);

describe('Galvanized Aptitude (rifle) — vínculo CO end-to-end', () => {
  it('coefBase 40 (no 80): N=1, stacks=1 → bonus +40% → multiplicative 1.4', () => {
    expect(techo(1, 1).node('WEAPON_ADD_DAMAGE').multiplicative).toBeCloseTo(1.4, 2);
  });

  it('linealidad: N=3, stacks=2 → bonus +240% → multiplicative 3.4', () => {
    expect(techo(2, 3).node('WEAPON_ADD_DAMAGE').multiplicative).toBeCloseTo(3.4, 2);
  });

  it('Boltor es Projectile → el bonus va a multiplicative, NO a mods_add_pct', () => {
    const n = techo(2, 3).node('WEAPON_ADD_DAMAGE');
    expect(n.multiplicative).toBeCloseTo(3.4, 2);
  });

  it('sin declarar el techo → Aptitude no aplica (multiplicative 1.0)', () => {
    expect(sinVars().node('WEAPON_ADD_DAMAGE').multiplicative).toBeCloseTo(1.0, 3);
  });
});
