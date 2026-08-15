/**
 * Composición de escenas — las primitivas que derivan un participante de otro.
 *
 * EL BUG QUE ESTOS TESTS FIJAN, y que salió de medir el corpus y no de leer código:
 *
 * De las nueve derivadas de `builds.ts`, **una sola mergeaba** los mods con los de su base
 * (`corrosiveProjectionTarget`: `{ ...(base.mods.warframe ?? {}), 0: CORROSIVE_PROJECTION }`). Las
 * otras ocho —`voltSpeed`, `valkyrWarcry`, `harrowPenance` y compañía— escribían
 * `mods: { warframe: { 0: BLIND_RAGE } }`, **reemplazando la tabla entera**.
 *
 * Hoy eso no rompe nada, y por una sola razón: `volt()`, `valkyr()` y `harrow()` no traen mods. El
 * día que una base los traiga, desaparecen sin un warning. No es un bug latente teórico — es la misma
 * convención reconstruida a mano 24 veces, donde una de las copias quedó distinta y nadie lo notó.
 *
 * Que la primitiva mergee lo cierra para siempre, y estos tests son lo que impide que vuelva.
 */
import { describe, it, expect } from 'vitest';
import { scene, player, onPlayer, withBearer, withMods, withArcanes, withAbilities, withShards } from '@shared/types/scene-compose';
import type { PlayerIntent } from '@shared/types/scene';

const WF = '/Lotus/Powersuits/Volt/Volt';
const SERRATION = '/Lotus/Upgrades/Mods/Rifle/WeaponDamageAmountMod';
const BLIND_RAGE = '/Lotus/Upgrades/Mods/Warframe/AvatarAbilityStrengthMod';
const NIKANA = '/Lotus/Weapons/Tenno/Melee/Swords/PrimeKatana/PrimeNikana';

const base = (): PlayerIntent => ({
  kind: 'onfoot',
  warframe: { uniqueName: WF, rank: 30, mods: { 0: { uniqueName: SERRATION, level: 10 } } },
});

describe('withMods — MERGEA, y por eso derivar no pierde lo de la base', () => {
  it('sumar un mod conserva los que ya estaban', () => {
    const p = withMods(base(), 'warframe', { 1: { uniqueName: BLIND_RAGE, level: 10 } });
    const mods = (p as Extract<PlayerIntent, { kind: 'onfoot' }>).warframe!.mods!;
    expect(Object.keys(mods).sort()).toEqual(['0', '1']);
    expect(mods[0].uniqueName).toBe(SERRATION);   // ← lo que las ocho derivadas perdían
    expect(mods[1].uniqueName).toBe(BLIND_RAGE);
  });

  it('el mismo slot SÍ se pisa — merge no es "no se puede reemplazar"', () => {
    const p = withMods(base(), 'warframe', { 0: { uniqueName: BLIND_RAGE, level: 10 } });
    expect((p as Extract<PlayerIntent, { kind: 'onfoot' }>).warframe!.mods![0].uniqueName).toBe(BLIND_RAGE);
  });

  it('no muta la base — derivar dos veces del mismo participante da resultados independientes', () => {
    const original = base();
    const a = withMods(original, 'warframe', { 1: { uniqueName: BLIND_RAGE, level: 10 } });
    const b = withMods(original, 'warframe', { 2: { uniqueName: BLIND_RAGE, level: 5 } });
    const mods = (x: PlayerIntent) => Object.keys((x as Extract<PlayerIntent, { kind: 'onfoot' }>).warframe!.mods!);
    expect(mods(original)).toEqual(['0']);
    expect(mods(a).sort()).toEqual(['0', '1']);
    expect(mods(b).sort()).toEqual(['0', '2']);
  });
});

describe('withArcanes — mismo criterio de merge', () => {
  it('suma sin pisar los existentes', () => {
    const p0 = withArcanes(base(), 'warframe', { 0: { uniqueName: 'arc:a', rank: 5 } });
    const p1 = withArcanes(p0, 'warframe', { 1: { uniqueName: 'arc:b', rank: 5 } });
    expect(Object.keys((p1 as Extract<PlayerIntent, { kind: 'onfoot' }>).warframe!.arcanes!).sort()).toEqual(['0', '1']);
  });
});

describe('El portador tiene que existir — no se inventa uno para poder componer', () => {
  it('componer sobre un slot vacío TIRA en vez de crear un portador fantasma', () => {
    expect(() => withMods({ kind: 'onfoot' }, 'warframe', { 0: { uniqueName: SERRATION, level: 10 } }))
      .toThrow(/no hay portador en "warframe"/);
  });

  it('withBearer es la única que crea — después ya se puede componer', () => {
    const p = withMods(
      withBearer({ kind: 'onfoot' }, 'melee', { uniqueName: NIKANA, rank: 30 }),
      'melee',
      { 0: { uniqueName: SERRATION, level: 10 } },
    );
    expect((p as Extract<PlayerIntent, { kind: 'onfoot' }>).weapons!.melee!.mods![0].uniqueName).toBe(SERRATION);
  });
});

describe('Escena ⊥ participante', () => {
  it('onPlayer conserva lo que no es el jugador — los hostiles no se pierden al derivar', () => {
    const s = scene(base(), [{ uniqueName: 'enemy:x', level: 100 }]);
    const derived = onPlayer(s, p => withAbilities(p, [{ uniqueName: 'ability:y' }]));
    expect(derived.hostile).toEqual([{ uniqueName: 'enemy:x', level: 100 }]);
    expect((player(derived) as Extract<PlayerIntent, { kind: 'onfoot' }>).warframe!.abilities)
      .toEqual([{ uniqueName: 'ability:y' }]);
  });

  it('withShards y withAbilities son del warframe, y no se pisan entre sí', () => {
    const p = withShards(
      withAbilities(base(), [{ uniqueName: 'ability:y' }]),
      [{ uniqueName: 'shard:z', effectId: 'e', isTauforged: true }],
    );
    const wf = (p as Extract<PlayerIntent, { kind: 'onfoot' }>).warframe!;
    expect(wf.abilities).toHaveLength(1);
    expect(wf.shards).toHaveLength(1);
    expect(wf.mods![0].uniqueName).toBe(SERRATION);  // y el resto del portador sobrevive
  });
});
