/**
 * "Elemental Damage Bonus" — el nombre que la propia wiki usa para el mecanismo de #30: un tipo de
 * daño combinado (Viral/Corrosive/Blast/Gas/Magnetic/Radiation) sumado en PARALELO al que el arma
 * ya componga por sus propios mods, sin fusionarse con esa composición
 * (`references/wiki/mods/{fireball-frenzy,freeze-force,...}.wikitext`, patch 38: "added parallel to
 * your weapon's Elemental Damage, instead of creating Combined Elemental Damage types").
 *
 * `DamageCombiner` sólo materializa estos 6 nodos a partir de los mods PROPIOS del arma
 * (`StaticHydrator.ts`) — una fuente externa (arcano/habilidad) que apunte a un tipo que el arma no
 * compone hoy no aterrizaba: `resolveNode` corta en `if (!node) return` antes de mirar el modifier
 * (`[Hydration] Token conocido sin nodo`). `isCombinedDamageToken` (`damage-logic.ts`) generaliza el
 * sembrado condicional que ya existía sólo para parámetros de ley (`StaticHydrator.ts`, molde 3 de
 * `.working/investigacion-nodo-huerfano-composicion-elemental.md`) — el nodo nace en `base:0` sólo
 * si algo externo lo apunta, y la fuente escribe en `total_flat` (no `mods_add_pct`: un `%` sobre
 * `base:0` daría siempre 0 — el pool paralelo es un monto ABSOLUTO, `%/100 × innateBaseTotal`).
 *
 * Dos fuentes, dos repositorios, mismo mecanismo:
 * - Melee Exposure (arcano) — `ArcaneRepository`, siempre self-target, requiere `entity` directa
 *   (corre ANTES de `entities.push(entity)` en `StaticHydrator.hydrate()`).
 * - Nourish (habilidad, Grendel) — `AbilityRepository`, fan-out cross-entity, `entities[]` completo
 *   (corre en el post-loop, después de que todas las armas ya existen).
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { laetumMeleeExposure, LAETUM, grendelNourish, TIBERON_PRIME } from '../fixtures/builds';

await loadEngineData(new NodeAdapter());

describe('Melee Exposure (arcano) — Corrosive paralelo sobre Laetum (#30)', () => {
  // `condition: "on_ability_cast"` (arcane-stats.override.json) — gate pre-existente, sin relación
  // con #30. El stacking real (per-stack, cap 240%) queda sin modelar (sin `max_stacks` en el dato,
  // los propios `engine:note` de la entrada lo marcan pendiente) — este test ejerce el nodo
  // materializándose y aterrizando el valor de UN stack (rank 5 = 60%), no el mecanismo de stacking.
  it('sin el cast activo, no aterriza nada (gate pre-existente, no #30)', () => {
    const d = consume(laetumMeleeExposure(), { flags: {} }).weapon(LAETUM).node('WEAPON_ADD_CORROSIVE_DAMAGE');
    expect(d.final).toBeCloseTo(0, 1);
  });

  it('Laetum no compone Corrosive por sus propios mods (Cold+Toxin → Viral, no Corrosive) — el nodo nace del arcano', () => {
    const d = consume(laetumMeleeExposure(), { flags: { on_ability_cast: true } }).weapon(LAETUM).node('WEAPON_ADD_CORROSIVE_DAMAGE');
    // rank 5 = 60% (arcane-stats.override.json), innateBaseTotal de Laetum = 160 (Impact 64 + Slash 96, sin elemento)
    expect(d.total_flat).toBeCloseTo(96, 1);
    expect(d.mods_add_pct).toBeCloseTo(0, 1); // no un % — el pool paralelo no toca este bucket
    // `.final` NO es 96: Laetum trae Hornet Strike (+220% WEAPON_ADD_DAMAGE, `cascadia-flare.test.ts`
    // ya lo mide) y `calculateCurrentValue` multiplica CUALQUIER nodo de daño-arma por ese bucket
    // (`SimulationEngine.ts:390-394`) — el pool paralelo hereda el mismo factor que el resto,
    // confirmando lo que Valence Formation declara explícito ("multiplicative to Faction Damage
    // bonuses" — mismo mecanismo, Serration/Hornet Strike es el otro pool global): 96 × 3.20 = 307.2.
    expect(d.final).toBeCloseTo(307.2, 1);
  });
});

describe('Nourish (habilidad, Grendel) — Viral paralelo sobre Tiberon Prime (#30)', () => {
  it('Tiberon Prime sin mods no compone Viral (Impact/Slash/Puncture puro) — el nodo nace de la habilidad', () => {
    const d = consume(grendelNourish(), { flags: {} }).weapon(TIBERON_PRIME).node('WEAPON_ADD_VIRAL_DAMAGE');
    // "Damage Increase: 75% Viral" (ability-stats.override.json), innateBaseTotal de Tiberon = 48 (Impact 14.4 + Slash 14.4 + Puncture 19.2)
    expect(d.total_flat).toBeCloseTo(36, 1);
    expect(d.mods_add_pct).toBeCloseTo(0, 1);
    expect(d.final).toBeCloseTo(36, 1);
  });
});
