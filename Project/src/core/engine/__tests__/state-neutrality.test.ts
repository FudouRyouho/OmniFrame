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
import { CombatSimulator } from '../simulate/combat/CombatSimulator';
import { BASELINE_GAME_LAWS } from '../contracts';
import { consume } from '../output/consume';
import { volt } from '../fixtures/builds';
import { hostileEntity, syntheticHostile } from './hostile-entity';
import { advanceAndResolve } from '../simulate/advance';

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

/**
 * La segunda mitad de la pregunta: leer los vitales con el nombre correcto no alcanza si después el
 * daño se resuelve con la ley del otro. Acá se mide **hasta dónde llega** la neutralidad del
 * contenedor — y el corte es nítido: el ESTADO es neutral, la RESOLUCIÓN no.
 *
 * Lo que esto le da a `OQ-ENGINE-22` (*"generalizar EHP/DR de `enemy/` a `entity/`"*) es lo único que
 * le faltaba: su condición de apertura era *"un consumidor real de DR de jugador"*, y acá hay un avatar
 * que porta estado y mitiga con la fórmula equivocada al sexto decimal.
 */
describe('La neutralidad termina donde empieza la ley — un avatar mitiga como hostil', () => {
  const avatar = () => participante((e) => e.domain === 'warframe');

  it('[estado] el proc corre sobre el avatar igual que sobre un hostil — la mecánica SÍ es neutral', () => {
    const s = new EnemyState(avatar(), BASELINE_GAME_LAWS);
    const shields0 = s.current_shields;
    s.applyProc('bleed', { moddedBase: 100, statusDamageBonusPct: 0, elementBonusPct: {} }, 1, 0);
    for (let t = 0; t < 8; t += 0.5) advanceAndResolve(s, t, 0.5);

    // 6 ticks × (0.35 × 100) = 210, el bleed exacto: el behavior no sabe a quién se lo está haciendo.
    expect(shields0 - s.current_shields).toBeCloseTo(210, 6);
  });

  it('[ley] el avatar mitiga con la fórmula del Tenno, no con la del hostil', () => {
    const s = new EnemyState(avatar(), BASELINE_GAME_LAWS);
    s.current_shields = 0;                    // el armor sólo protege la salud: hay que llegar a ella
    const armor = s.getEffectiveArmor(0);
    const { health_damage } = CombatSimulator.resolveHit({ WEAPON_ADD_IMPACT_DAMAGE: 1000 }, s, 0);
    const drAplicada = 1 - health_damage / 1000;

    // `references/wiki/mechanics/armor.md` publica las dos, una al lado de la otra:
    //   Tenno   → DR = a / (a + 300)          ← la que corresponde
    //   Enemigo → DR = 90%·√(a/2700) ≡ √(3a)/100
    // Antes de la selección por clase, Volt (armor 105) comía `0.177482` —la del hostil, exacta al
    // sexto decimal— donde le toca `0.259259`. La coincidencia con la fórmula equivocada es la que
    // hizo el diagnóstico incontestable, y por eso el test asierta contra la ley, no contra el número.
    expect(drAplicada).toBeCloseTo(armor / (armor + 300), 6);
    expect(drAplicada).not.toBeCloseTo(Math.sqrt(3 * armor) / 100, 6);
  });

  it('[ley] ⭐ misma armadura, dos portadores, dos leyes — el contraste directo', () => {
    // Un hostil sintético con EXACTAMENTE la armadura del avatar: lo único que cambia entre las dos
    // resoluciones es de quién es la armadura, así que la diferencia sólo puede venir de la ley.
    const wf = new EnemyState(avatar(), BASELINE_GAME_LAWS);
    wf.current_shields = 0;
    const armor = wf.getEffectiveArmor(0);

    const hostil = new EnemyState(
      syntheticHostile({ health: 1_000_000, armor, faction: 'Isolated' }),
      BASELINE_GAME_LAWS,
    );

    const dañoAlAvatar = CombatSimulator.resolveHit({ WEAPON_ADD_IMPACT_DAMAGE: 1000 }, wf, 0).health_damage;
    const dañoAlHostil = CombatSimulator.resolveHit({ WEAPON_ADD_IMPACT_DAMAGE: 1000 }, hostil, 0).health_damage;

    expect(1 - dañoAlAvatar / 1000).toBeCloseTo(armor / (armor + 300), 6);
    expect(1 - dañoAlHostil / 1000).toBeCloseTo(Math.sqrt(3 * armor) / 100, 6);
    expect(dañoAlAvatar).not.toBeCloseTo(dañoAlHostil, 3);
  });

  it('[ley] un participante sin familia conocida tira en vez de mitigar con la ley de otro', () => {
    const sinMarca = { ...syntheticHostile({ armor: 100 }), routes: ['weapon'] };
    const s = new EnemyState(syntheticHostile({ armor: 100 }), BASELINE_GAME_LAWS);
    s.entity = sinMarca;
    expect(() => CombatSimulator.resolveHit({ WEAPON_ADD_IMPACT_DAMAGE: 100 }, s, 0))
      .toThrow(/no declara ninguna familia con ley de mitigación/);
  });

  it.fails('[capas] el daño que rompe los shields del avatar no debería pasar a la salud en el mismo evento', () => {
    const s = new EnemyState(avatar(), BASELINE_GAME_LAWS);
    const health0 = s.current_health;
    // Pulso deliberadamente mayor que los shields: en un hostil desborda, en un avatar el shield gate
    // lo corta y abre una ventana de invulnerabilidad que este contenedor no tiene dónde poner. Su
    // duración **no** escala con el shield máximo sino con los shields REPUESTOS desde el gate anterior
    // (`references/wiki/mechanics/shield.md §Shield Gating`: 0.33 s → 2.5 s, con excepciones que
    // cambian la naturaleza — Catalyzing Shields fija 1.33 s por *cualquier* cantidad repuesta).
    s.applyProc('bleed', { moddedBase: 100, statusDamageBonusPct: 0, elementBonusPct: {} }, 200, 0);
    for (let t = 0; t < 8; t += 0.5) advanceAndResolve(s, t, 0.5);

    expect(s.current_shields).toBe(0);
    expect(s.current_health).toBe(health0);
  });

  it.todo('[clase] la ley la elige la marca de ruteo del portador, como `vitalsOf` con el vocabulario — sin forma todavía [OQ-ENGINE-22]');
  it.todo('[caído] el bleedout del avatar es un hecho con ventana, no una capa — fuera de scope, sin medición');
});
