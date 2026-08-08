/**
 * @domain Engine / C2 — la neutralidad del contenedor de estado
 *
 * El contenedor de estado quedó **entidad-neutral por consecuencia** al nacer de la entidad resuelta de
 * C1 (`simulation-architecture.md` §El escenario consolidado). Pero esa neutralidad era **de forma y no
 * de vocabulario**: la lectura de vitales nombraba la familia `ENEMY_*` fija, así que un warframe —que
 * declara los mismos tres vitales como `AVATAR_*`— devolvía `0/0/0` y nacía `isDead()`, **en silencio**.
 *
 * La cura no es una abstracción nueva: es el mecanismo de `familyRoute` (§18) en la dirección inversa.
 * Allá el token declara a quién alcanza; acá el participante declara, por su marca de ruteo, con qué
 * nombres se lo lee. Un arma no tiene entrada y es correcto — no tiene vitales—, así que llegar ahí
 * **tira** en vez de devolver ceros creíbles.
 *
 * Esto NO renombra `EnemyState`: el rename de la clase espera un segundo portador real
 * (`OQ-ENGINE-8`). Lo que se arregla acá es una falla medida, no vocabulario sin caso.
 */
import { describe, it, expect } from 'vitest';
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { EnemyState, vitalsOf } from '../simulate/enemies/EnemyState';
import { BASELINE_GAME_LAWS } from '../contracts';
import { consume } from '../output/consume';
import { volt } from '../fixtures/builds';
import { hostileEntity } from './hostile-entity';

await loadEngineData(new NodeAdapter());

const ARID_BUTCHER = '/Lotus/Types/Enemies/Grineer/Desert/Avatars/BladeSawmanAvatar';
// Volt limpio + Tiberon sin mods: un avatar y un arma en la misma escena, sin ruido de mods.
const escena = () => consume(volt(), { flags: {} }).snapshot();
const participante = (pred: (e: ReturnType<typeof escena>[number]) => boolean) => {
  const hit = escena().find(pred);
  if (!hit) throw new Error('el fixture no trae ese participante');
  return hit;
};

describe('El estado se lee por familia de token, no por bando', () => {
  it('[avatar] el warframe lee sus vitales de `AVATAR_*` — no cero', () => {
    const wf = participante((e) => e.domain === 'warframe');
    const v = vitalsOf(wf);

    // Sin hardcodear el número del juego: lo que se exige es que lea EL nodo que el participante tiene.
    expect(v.health).toBe(wf.attributes.AVATAR_ADD_HEALTH_MAX.final);
    expect(v.health).toBeGreaterThan(0);
    expect(v.shields).toBe(wf.attributes.AVATAR_ADD_SHIELD_MAX.final);
    expect(v.armor).toBe(wf.attributes.AVATAR_ADD_ARMOUR.final);
  });

  it('[avatar] un warframe que porta estado NO nace muerto — el síntoma exacto que esto cierra', () => {
    const state = new EnemyState(participante((e) => e.domain === 'warframe'), BASELINE_GAME_LAWS);
    expect(state.isDead()).toBe(false);
    expect(state.current_health).toBeGreaterThan(0);
  });

  it('[enemy] el hostil sigue leyendo `ENEMY_*` — la familia vieja no se movió', () => {
    const enemigo = hostileEntity(ARID_BUTCHER, 215);
    const v = vitalsOf(enemigo);

    expect(v.health).toBe(enemigo.attributes.ENEMY_ADD_HEALTH_MAX.final);
    expect(v.armor).toBe(enemigo.attributes.ENEMY_ADD_ARMOUR.final);
    expect(v.armor).toBeCloseTo(200, 6); // Arid Butcher @215 — el ancla ya validada en `enemy-scaling`
  });

  it('[weapon] un arma no tiene vitales: tira nombrando sus marcas, no devuelve ceros', () => {
    const arma = participante((e) => e.domain === 'weapon');
    expect(() => vitalsOf(arma)).toThrow(/no declara ninguna familia de vitales/);
    // El mensaje nombra al participante y sus marcas — un cero silencioso no era diagnosticable.
    expect(() => vitalsOf(arma)).toThrow(new RegExp(arma.id));
  });
});
