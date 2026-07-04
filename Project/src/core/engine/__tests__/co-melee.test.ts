/**
 * Condition Overload (melee) — ÚLTIMO mod de la familia CO, cierra el frente CO.
 *
 * Requirió el hit-base melee (OQ-ENGINE-14 estrato 1) como consumidor. Es el CO *clásico*:
 * coefBase 80 (no 40), 1x (sin stacks — el label no dice "Stacks up to Nx"). Sin drift de
 * bakeo (no hay stacks que bakear); el 80 es el coefBase real (fuente DE).
 *
 * Trabajo propio del CO melee (lo único que no venía dado):
 *  - default `co_behavior` para melee: Normal Attack tiene shot_type=None → el default por
 *    shot_type no matcheaba (gap). Añadido `kind=melee` + shot_type None → 'adding' (CO clásico
 *    melee es aditivo, confirmado in-game). El tag gatea la mecánica (data-driven).
 *  - condition `per_status_type_on_target` removida del override: era la escala N disfrazada de
 *    condición; en el modelo la escala vive en co_factors, no en condition.
 *
 * Vehículo: Nikana Prime (Normal Attack, adding). 1x → activeStacks no se declara (default 1).
 * Bonus = coBonusPct(80 × 1 × N).
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { nikana, NIKANA_PRIME } from '../fixtures/builds';

await loadEngineData(new NodeAdapter());

/** Nikana + Condition Overload (aislado, sin otros mods). N declarado; sin stacks → 1x. */
const co = (n: number) =>
  consume(nikana(false, 'base', true), { variables: { status_type_count: n } }).weapon(NIKANA_PRIME);
const coSinN = () => consume(nikana(false, 'base', true)).weapon(NIKANA_PRIME);

describe('Condition Overload (melee) — cierre del frente CO', () => {
  it('adding (melee shot_type None → default adding): N=3 → +240% en mods_add_pct', () => {
    const n = co(3).node('WEAPON_ADD_DAMAGE');
    expect(n.mods_add_pct).toBeCloseTo(240, 0);       // 80 × 1 × 3
    expect(n.multiplicative).toBeCloseTo(1.0, 3);     // NO multiplicative — es adding
  });

  it('coefBase 80 (no 40), 1x: N=1 → +80% (80 × 1 × 1)', () => {
    expect(co(1).node('WEAPON_ADD_DAMAGE').mods_add_pct).toBeCloseTo(80, 0);
  });

  it('linealidad en N (1x): N=5 → +400%', () => {
    expect(co(5).node('WEAPON_ADD_DAMAGE').mods_add_pct).toBeCloseTo(400, 0);
  });

  it('sin declarar N → el CO no aplica (mods_add_pct 0)', () => {
    expect(coSinN().node('WEAPON_ADD_DAMAGE').mods_add_pct).toBeCloseTo(0, 0);
  });
});
