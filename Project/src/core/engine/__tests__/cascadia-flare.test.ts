/**
 * Cascadia Flare — primer arcano que ejerce `STACK_DECAY_BUFF` (CAS-1,
 * .working/investigacion-source-state-cascadia-flare.md).
 *
 * `ArcaneRepository.ts:62` cortaba las dos entradas de `values` (ambas `upgrade_type: null`) antes
 * de llegar a `makeModifier` — el arcano nunca producía ningún `Modifier`, pese a que R1
 * (.working/refactor-engine-2-recomposicion.md) lo citaba como forcing-case ya construido. El
 * mecanismo que sí lo resuelve (`STACK_DECAY_BUFF`) ya existía y estaba probado del lado mods
 * (Galvanized [Arma], `felarx.test.ts`/`laetum.test.ts`) — nunca se había portado a arcanos.
 *
 * `max_stacks: 40` se derivó de `val2/val1` (80/2 .. 480/12), estable en los 6 ranks — el wikitext
 * no nombra un conteo de stacks explícito, sólo la tabla "Damage per Stack"/"Max Damage Stack".
 * `upgrade_type: WEAPON_ADD_DAMAGE` porque la fuente lo trata como mod de daño genérico ("treated
 * similarly to damage mods like Hornet Strike"), no elemental — por eso el fixture usa Laetum CON
 * sus mods (incluido Hornet Strike): la aditividad es la parte del wikitext que hay que ejercer,
 * no sólo que el arcano aterrice solo.
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { laetumCascadiaFlare, LAETUM, CASCADIA_FLARE, cascadiaFlareStacksVar } from '../fixtures/builds';

await loadEngineData(new NodeAdapter());

const CF_STACKS = cascadiaFlareStacksVar(CASCADIA_FLARE);

const damage = (stacks?: number) =>
  consume(laetumCascadiaFlare(), stacks === undefined ? { flags: {} } : { variables: { [CF_STACKS]: stacks } })
    .weapon(LAETUM)
    .node('WEAPON_ADD_DAMAGE');

describe('Cascadia Flare — STACK_DECAY_BUFF portado de ModRepository (CAS-1)', () => {
  it('0 stacks (sin variable declarada): sólo Hornet Strike, +220% → base 160 × 3.20 = 512', () => {
    const d = damage();
    expect(d.mods_add_pct).toBeCloseTo(220, 1);
    expect(d.final).toBeCloseTo(512, 1);
  });

  it('1 stack: perStackPct = 480/40 = 12 (coincide con "Damage per Stack" rank5 del wikitext) → 220+12=232, final 160 × 3.32 = 531.2', () => {
    const d = damage(1);
    expect(d.mods_add_pct).toBeCloseTo(232, 1);
    expect(d.final).toBeCloseTo(531.2, 1);
  });

  it('40 stacks (cap = "Max Damage Stack" rank5, 480%): 220+480=700, final 160 × 8.00 = 1280', () => {
    const d = damage(40);
    expect(d.mods_add_pct).toBeCloseTo(700, 1);
    expect(d.final).toBeCloseTo(1280, 1);
  });

  it('el cap clampea: 999 stacks se comporta igual que 40 (STACK_DECAY_BUFF, clamp(stacks,0,cap))', () => {
    expect(damage(999).final).toBeCloseTo(damage(40).final, 1);
  });
});
