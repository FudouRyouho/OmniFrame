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
 * Esto NO renombra `EntityState`, y el motivo **ya no es que falte el caso**: este archivo ES el caso.
 * De sus 15 construcciones de `EntityState`, **11 no son hostiles** — un warframe del catálogo por el
 * camino real, un compañero y avatares sintéticos—, y lo que contrasta es justamente que el mismo
 * contenedor recibe **leyes distintas** según quién lo porta — y por eso la clase se llama
 * `EntityState` y no `EnemyState` (`vocabulary.md §2`). Este archivo es el caso que lo sostiene.
 */
import { describe, it, expect } from 'vitest';
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { EntityState, vitalsOf } from '../simulate/EntityState';
import { CombatSimulator } from '../simulate/combat/CombatSimulator';
import { consume } from '../output/consume';
import { volt } from '../fixtures/builds';
import { hostileEntity, syntheticAvatar, syntheticHostile } from './hostile-entity';
import type { SimulationEntity } from '../contracts';
import { advanceAndResolve } from '../simulate/advance';
import { playerGateDuration } from '../formulas/defense/shield-gate';

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
    const state = new EntityState(participante((e) => e.domain === 'warframe'));
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

  it('[weapon] un arma no tiene vitales: tira nombrando su clase, no devuelve ceros', () => {
    const arma = participante((e) => e.domain === 'weapon');
    expect(() => vitalsOf(arma)).toThrow(/no declara ninguna clase con vitales/);
    // El mensaje nombra al participante y su canal — un cero silencioso no era diagnosticable.
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

  it('[estado] el proc EMITE lo mismo sobre el avatar que sobre un hostil — la emisión SÍ es neutral', () => {
    const correr = (e: SimulationEntity) => {
      const s = new EntityState(e);
      const antes = s.current_shields;
      s.applyProc('bleed', { moddedBase: 100, statusDamageBonusPct: 0, elementBonusPct: {} }, 1, 0);
      for (let t = 0; t < 8; t += 0.5) advanceAndResolve(s, t, 0.5);
      return antes - s.current_shields;
    };

    // 6 ticks × (0.35 × 100) = 210 de DAÑO en los dos casos: el behavior no sabe a quién se lo hace.
    // Lo que difiere es cuántos PUNTOS de escudo cuesta ese daño, y eso ya es ley del receptor: el
    // avatar tiene 50% de DR de escudo (`shield.md`) y el hostil no. **La emisión es neutral, la
    // absorción no** — que es exactamente dónde este archivo pone el corte.
    expect(correr(syntheticHostile({ shields: 10_000, faction: 'Isolated' }))).toBeCloseTo(210, 6);
    expect(correr(avatar())).toBeCloseTo(105, 6);
  });

  it('[ley] el avatar mitiga con la fórmula del Tenno, no con la del hostil', () => {
    const s = new EntityState(avatar());
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
    const wf = new EntityState(avatar());
    wf.current_shields = 0;
    const armor = wf.getEffectiveArmor(0);

    const hostil = new EntityState(
      syntheticHostile({ health: 1_000_000, armor, faction: 'Isolated' }),
    );

    const dañoAlAvatar = CombatSimulator.resolveHit({ WEAPON_ADD_IMPACT_DAMAGE: 1000 }, wf, 0).health_damage;
    const dañoAlHostil = CombatSimulator.resolveHit({ WEAPON_ADD_IMPACT_DAMAGE: 1000 }, hostil, 0).health_damage;

    expect(1 - dañoAlAvatar / 1000).toBeCloseTo(armor / (armor + 300), 6);
    expect(1 - dañoAlHostil / 1000).toBeCloseTo(Math.sqrt(3 * armor) / 100, 6);
    expect(dañoAlAvatar).not.toBeCloseTo(dañoAlHostil, 3);
  });

  it('[ley] un participante sin clase conocida tira en vez de mitigar con la ley de otro', () => {
    const sinClase = { ...syntheticHostile({ armor: 100 }), channel: 'primary' };
    const s = new EntityState(syntheticHostile({ armor: 100 }));
    s.entity = sinClase;
    expect(() => CombatSimulator.resolveHit({ WEAPON_ADD_IMPACT_DAMAGE: 100 }, s, 0))
      .toThrow(/no declara ninguna clase con ley de mitigación/);
  });

  it('[ley] el escudo del Tenno aguanta el DOBLE de su valor — 50% de DR inherente', () => {
    const s = new EntityState(syntheticAvatar({ shields: 100 }));
    s.receive('shield', 150, 0);
    // 150 de daño contra 100 de escudo con DR 0.5: cuesta 75 puntos, no 150. Quedan 25.
    expect(s.current_shields).toBeCloseTo(25, 6);
    expect(s.current_health).toBe(1000);   // no derrama: el escudo no se agotó
  });

  it('[ley] el COMPAÑERO no recibe la DR de escudo — `shield.md` lo excluye por nombre', () => {
    // El caso que motiva partir la llave: los dos portan `routes: ['avatar']` —y el compañero la
    // NECESITA, para que `Enhanced Vitality` le aterrice— pero la fuente da el 50% a "Warframes ·
    // Operators · Archwings · Railjacks · Necramechs" y NO a "Companions". Misma marca, otra ley.
    const pet = new EntityState(syntheticAvatar({ shields: 100, channel: 'companion' }));
    pet.receive('shield', 150, 0);
    expect(pet.current_shields).toBe(0);   // 150 > 100: el escudo cae entero, sin mitigar

    const tenno = new EntityState(syntheticAvatar({ shields: 100 }));
    tenno.receive('shield', 150, 0);
    expect(tenno.current_shields).toBeCloseTo(25, 6);
  });

  it('[ley] el Overguard NO comparte la DR del escudo — es otra capa, no un escudo más', () => {
    const s = new EntityState(syntheticAvatar({}));
    s.current_overguard = 100;
    s.receive('overguard', 60, 0);
    expect(s.current_overguard).toBeCloseTo(40, 6);   // 1:1, no 70
  });

  it('[ley] el COMPAÑERO no hereda la mitigación del Tenno — la fuente no dice cuál le toca', () => {
    // El caso que motiva partir la llave: porta `avatar` (y debe portarlo, para que `Enhanced
    // Vitality` le aterrice) pero `armor.md` no declara su ley de DR. Heredarla en silencio era
    // producir un número creíble y falso; ahora suena.
    const pet = { ...syntheticHostile({ armor: 300 }), routes: ['avatar'], channel: 'companion' };
    const s = new EntityState(syntheticHostile({ armor: 300 }));
    s.entity = pet;
    expect(() => CombatSimulator.resolveHit({ WEAPON_ADD_IMPACT_DAMAGE: 100 }, s, 0))
      .toThrow(/no declara ninguna clase con ley de mitigación/);
  });

  it('[capas] el daño que rompe los shields del avatar NO pasa a la salud en el mismo evento', () => {
    const s = new EntityState(avatar());
    const health0 = s.current_health;
    // Pulso deliberadamente mayor que los shields: en un hostil el exceso derrama al 5% (su gate es
    // otra mecánica); en un avatar el gate corta entero. Trazado: a t=1 se van los 455 de shield y la
    // salud queda intacta.
    s.applyProc('bleed', { moddedBase: 100, statusDamageBonusPct: 0, elementBonusPct: {} }, 200, 0);
    advanceAndResolve(s, 1, 0.5);

    expect(s.current_shields).toBe(0);
    expect(s.current_health).toBe(health0);
    expect(s.isGated(1)).toBe(true);
  });

  it('[capas] …pero la ventana EXPIRA, y el tick siguiente sí llega a la salud', () => {
    // Lo que el `it.fails` anterior pedía —salud intacta tras 8 s— **no es lo que el juego hace**: la
    // ventana cubre el evento que la abrió y un poco más, no el bleed entero. Sostener lo contrario
    // convertía una ventana en invulnerabilidad permanente.
    //
    // La duración sale del shield que había AL ROMPERSE (455) → `t(455) ≈ 1.5193 s`, así que la
    // ventana va de t=1 a t≈2.52 y se come el tick de t=2. Con la formulación vieja —"repuestos desde
    // el último gate", que arranca en 0— habría durado el mínimo (0.33 s) y el tick de t=2 habría
    // matado: **un warframe con 455 de shield recibía la protección de uno con 0**.
    const s = new EntityState(avatar());
    const shieldsAlRomperse = s.current_shields;
    s.applyProc('bleed', { moddedBase: 100, statusDamageBonusPct: 0, elementBonusPct: {} }, 200, 0);
    advanceAndResolve(s, 1, 0.5);

    expect(s.isGated(1)).toBe(true);
    expect(s.isGated(2)).toBe(true);                                    // 1 + 1.5193 > 2
    expect(s.isGated(1 + playerGateDuration(shieldsAlRomperse))).toBe(false);

    advanceAndResolve(s, 2, 0.5);
    expect(s.current_health).toBe(270);                                 // el tick de t=2 no pasa
    advanceAndResolve(s, 3, 0.5);
    expect(s.current_health).toBe(0);                                   // el de t=3 sí
  });

  it('[capas] reponer shields durante la ventana la CIERRA — el `until` conjuntivo, ejecutable', () => {
    // `shield.md`: *"recuperar shields durante la invulnerabilidad la termina de inmediato — cualquier
    // cantidad, de cualquier fuente, incluida la regeneración natural"*. La ventana cierra por tiempo
    // **o** por este predicado, lo que ocurra primero (`time-model.md §3`).
    const s = new EntityState(avatar());
    s.applyProc('bleed', { moddedBase: 100, statusDamageBonusPct: 0, elementBonusPct: {} }, 200, 0);
    advanceAndResolve(s, 1, 0.5);
    expect(s.isGated(1.1)).toBe(true);

    s.replenishShields(1, 1.1);            // un solo punto alcanza: no depende de la magnitud
    expect(s.isGated(1.1)).toBe(false);
  });

  it('[capas] la ventana escala con los shields REPUESTOS, no con el máximo', () => {
    // El argumento de la duración es `S` = repuesto desde el último gate. Un avatar que no repuso nada
    // recibe el mínimo (1/3 s) aunque tenga 455 de shield máximo — que es justo la trampa que el
    // comentario viejo advertía y el test no ejercía.
    expect(playerGateDuration(0)).toBeCloseTo(1 / 3, 9);               // piso declarado: 0.33 s
    expect(playerGateDuration(455)).toBeCloseTo(Math.pow(455 / 350, 0.65) + 1 / 3, 9);
    expect(playerGateDuration(2000)).toBe(2.5);                        // techo declarado
    expect(playerGateDuration(53)).toBeGreaterThan(playerGateDuration(52));
  });

  it('[capas] ⚠️ la fórmula de la fuente NO es monótona en su propio corte', () => {
    // Medido: la rama continua evaluada en su último punto da 2.500086 — **por encima del cap de
    // 2.5**, así que un punto más de shield repuesto ACORTA la ventana en 0.86 décimas de milésima.
    //
    // Es artefacto de los coeficientes de la wiki (0.65 y /350 son ajustes, no álgebra exacta), no un
    // bug del port: reproducirlo fiel es lo correcto. Queda fijado para que nadie lo "arregle"
    // creyendo que es un error de transcripción, y para que se note si la fuente se corrige.
    expect(playerGateDuration(1150)).toBeCloseTo(2.500086, 6);
    expect(playerGateDuration(1151)).toBe(2.5);
    expect(playerGateDuration(1150)).toBeGreaterThan(playerGateDuration(1151));
  });

  it.todo('[clase] la ley la elige la marca de ruteo del portador, como `vitalsOf` con el vocabulario — sin forma todavía [OQ-ENGINE-22]');
  it.todo('[caído] el bleedout del avatar es un hecho con ventana, no una capa — fuera de scope, sin medición');
});
