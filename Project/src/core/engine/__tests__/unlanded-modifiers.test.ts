/**
 * Tripwire de modifiers sin aterrizar — el reporte del estado "acuñado sin nodo".
 *
 * Un token puede estar en `UPGRADES` y no tener nodo en ninguna entidad
 * (`semantic/upgrade-tokens.md §Acuñado sin nodo`). Ese estado es DELIBERADO: acuñar da lenguaje,
 * materializar compromete un modelo. El problema es que `SimulationEngine.resolveNode` hace
 * `if (!node) return` — sin este reporte, "conocido y no modelado" se ve igual que un bug.
 *
 * Lo que estos tests fijan NO es que el engine sepa qué hace un slide: es que **diga en voz alta
 * lo que NO está haciendo**. El motor no infiere ni inventa el nodo faltante; sólo devuelve el
 * feedback del token que le llegó.
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { consume } from '../output/consume';
import { volt, VOLT, voltChannelArcanes, rhinoRoar } from '../fixtures/builds';

await loadEngineData(new NodeAdapter());

const MAGLEV = '/Lotus/Upgrades/Mods/Warframe/AvatarSlideBoostMod';

/** Corre una build capturando lo que la hidratación reporta por consola. */
const warningsOf = (intention: ReturnType<typeof volt>): string[] => {
  const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  consume(intention, { flags: {} });
  const out = spy.mock.calls.map(c => String(c[0]));
  spy.mockRestore();
  return out;
};

const unlanded = (intention: ReturnType<typeof volt>) =>
  warningsOf(intention).filter(w => w.includes('Token conocido sin nodo'));

afterEach(() => vi.restoreAllMocks());

describe('Modifiers sin aterrizar — el engine declara lo que no modela', () => {
  it('una build sin huecos no reporta nada (el tripwire no es ruido de fondo)', () => {
    expect(unlanded(volt())).toEqual([]);
  });

  it('Maglev reporta sus DOS facetas por separado — el par SLIDE está acuñado, no modelado', () => {
    const build: any = volt();
    build.mods = { warframe: { 0: { itemId: MAGLEV, rank: 5, level: 5 } } };
    const avisos = unlanded(build);

    expect(avisos).toHaveLength(2);
    expect(avisos.some(w => w.includes('AVATAR_ADD_SLIDE_SPEED'))).toBe(true);
    expect(avisos.some(w => w.includes('AVATAR_ADD_SLIDE_FRICTION'))).toBe(true);
    // El reporte nombra la fuente: sin eso el aviso no es accionable.
    expect(avisos.every(w => w.includes(MAGLEV))).toBe(true);
  });

  // ─── El caso que puede romperlo ───────────────────────────────────────────────
  //
  // Un buff cross-entity nace en el warframe apuntando a un nodo que el warframe NO tiene
  // (`WEAPON_ADD_DAMAGE`), y sólo el ruteo por canal lo redirige al arma. Si el tripwire corriera
  // antes de esa pasada, gritaría sobre el caso legítimo — que es justamente el que el motor sí
  // resuelve bien. Estos dos tests son la razón de que el reporte viva al final de `hydrate()`.

  it('Roar no dispara el tripwire: el ruteo por canal ya lo aterrizó', () => {
    expect(unlanded(rhinoRoar())).toEqual([]);
  });

  it('los arcanos con canal cruzado tampoco lo disparan', () => {
    expect(unlanded(voltChannelArcanes())).toEqual([]);
  });
});
