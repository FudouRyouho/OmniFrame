/**
 * El compañero — **primer participante que no sale del loadout de armas**, y el consumidor que
 * prueba el ruteo por MARCA.
 *
 * Antes, `resolveFamilyEntities` preguntaba `e.domain === 'warframe'`: un buff `AVATAR_*` alcanzaba
 * a los warframes y a nadie más. No era una decisión de modelado — era que el ruteo preguntaba
 * *qué es* la entidad en vez de *a quién alcanza* el efecto, y todo lo que no fuera pieza de loadout
 * quedaba afuera por construcción.
 *
 * Ahora la entidad porta `routes`, y un compañero (`domain: 'companion'`) lleva la marca `avatar`.
 * El buff le llega sin que Warcry, `AbilityRepository` ni el grafo sepan que existe un compañero.
 *
 * Fidelidad: `references/wiki/warframes/valkyr/warcry.md` — el aura alcanza a "otros Warframes,
 * **compañeros**, rehenes, objetivos de Defense, Shadows y Specters".
 *
 * Valores verificados con `npm run oracle -- nodes valkyr_warcry_pet` ANTES de asertar.
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { scene, player, withBearer } from '@shared/types/scene-compose';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { valkyr, valkyrWarcry, valkyrWarcryCompanion, ADARZA_KAVAT, VALKYR } from '../fixtures/builds';

await loadEngineData(new NodeAdapter());

const pet = (b = valkyrWarcryCompanion()) => consume(b, { flags: {} }).weapon(ADARZA_KAVAT);

// ─── El compañero existe ───────────────────────────────────────────────────────────

describe('Compañero — la entidad', () => {
  it('entra al espacio y trae sus stats del dataset', () => {
    expect(pet().node('AVATAR_ADD_HEALTH_MAX').final).toBe(310);
    expect(pet().node('AVATAR_ADD_SHIELD_MAX').final).toBe(270);
    expect(pet().node('AVATAR_ADD_ARMOUR').base).toBe(300);
  });

  it('sin compañero declarado, el espacio tiene una entidad menos', () => {
    expect(consume(valkyrWarcry(), { flags: {} }).snapshot()).toHaveLength(2);
    expect(consume(valkyrWarcryCompanion(), { flags: {} }).snapshot()).toHaveLength(3);
  });
});

// ─── El buff cruza sin que nadie lo declare ────────────────────────────────────────

describe('Warcry sobre el compañero — el ruteo por marca', () => {
  it('armor: +50% al compañero — 300 × 1.5 = 450', () => {
    const armor = pet().node('AVATAR_ADD_ARMOUR');
    expect(armor.mods_add_pct).toBe(50);   // el MISMO bucket que en el warframe
    expect(armor.final).toBe(450);
  });

  it('el warframe recibe el suyo en paralelo — un buff, dos destinos', () => {
    const wf = consume(valkyrWarcryCompanion(), { flags: {} }).weapon(VALKYR);
    expect(wf.node('AVATAR_ADD_ARMOUR').final).toBe(1282.5);   // 855 × 1.5
    expect(pet().node('AVATAR_ADD_ARMOUR').final).toBe(450);   // 300 × 1.5
  });

  it('sin la habilidad, el compañero no se mueve', () => {
    const sinWarcry = scene(withBearer(player(valkyr()), 'companion', { uniqueName: ADARZA_KAVAT, rank: 30 }));
    expect(pet(sinWarcry).node('AVATAR_ADD_ARMOUR').final).toBe(300);
  });
});

// ─── Borde ─────────────────────────────────────────────────────────────────────────

describe('Compañero — borde', () => {
  /**
   * Antes `normalizeCompanion` reusaba el molde de warframe entero, y el `?? 0` le materializaba
   * nodos que un pet no tiene: energía y movement speed nacían en 0, y los cuatro stats de habilidad
   * en 100. Un buff de movimiento aterrizaba sobre base 0 y devolvía 0 — un número falso, no un
   * no-efecto. Ahora el molde deriva por entidad (núcleo vital) y gatea por presencia: mismo criterio
   * que `flight != null` en projectile speed, ausencia ≠ 0.
   */
  it('los nodos que un pet no tiene están ausentes, no en base 0', () => {
    expect(() => pet().node('AVATAR_ADD_ENERGY_MAX')).toThrow();
    expect(() => pet().node('AVATAR_ADD_ABILITY_STRENGTH')).toThrow();
    expect(() => pet().node('AVATAR_ADD_MOVEMENT_SPEED')).toThrow();
  });
  // El arma del compañero YA es un participante propio del espacio (canal `companion_weapon`): se
  // declara adentro del compañero —no existe sin él— y se hidrata como cualquier arma, con sus
  // propios mods y su propio daño. Cobertura en `unlanded-modifiers.test.ts`, incluido que el
  // fan-out ALL-scope de Roar la alcanza igual que a la primaria.
  it.todo('el daño propio del compañero como portador, no su arma — #13');
  // Qué buffs propagan y cuáles no es un hueco de la FUENTE, no del modelo: Eclipse declara que
  // NO alcanza a compañeros sin su augment. Medición pendiente en `ingame-tests/pending.md` P-5.
  it.todo('qué buffs NO propagan al compañero — gated por medición (P-5)');
});

/**
 * Los frentes abiertos del compañero, anclados. Los tres primeros son las direcciones que
 * `OQ-ENGINE-31` §El corpus deja **sin dueño**: el corpus de 158 mods se parte por hacia dónde va el
 * efecto, y de las cinco direcciones sólo las dos de entrada están resueltas.
 *
 * Cada `it.todo` de acá nombra un gate que hoy vive únicamente en un documento. Sin este anclaje el
 * frente se pierde hasta que un caso lo cruza por accidente — que es como se descubrió que el
 * compañero heredaba tres leyes del warframe.
 */
describe('Compañero — los frentes abiertos', () => {
  // Dirección 3 (`arch-decisions §18`, nivel `dueño`): Shield Charger, Guardian, Medi-Ray, Ambush.
  // El nivel está NOMBRADO y nada lo emite; hoy un `AVATAR_*` montado en el compañero acierta la
  // marca y erra el sujeto sin que el tripwire lo reporte.
  it.todo('el compañero ESCRIBE en su dueño (Shield Charger: +Max Shields al warframe) — nivel `dueño` sin emisor');
  // El destino no es la entidad sino su subárbol: Ambush buffea "the owner's WEAPON damage".
  it.todo('el alcance `dueño` llega al ARMA del dueño, no sólo al dueño (Ambush, aditivo con Serration)');
  // Dirección 4: Cat's Eye alcanza "allies within 25m", incluidas torretas emplazadas.
  it.todo('el compañero escribe en ALIADOS más allá del dueño (Cat\'s Eye: +60pp de crit absoluto) — sin aliados como entidad');
  // Dirección 5: los 14 `*Bond`. Bidireccionales, y la condición lee estado de OTRA entidad.
  it.todo('un `*Bond` gatea por el estado del compañero y aplica en el jugador (Reinforced Bond: shields > 1200 → +fire rate)');

  it.todo('Companion Recovery Timer: base 60s + deltas — sin ciclo de muerte que la consuma — #14');
  // `[empirical]`: revivir antes de que expire el cooldown de un precept lo deja disponible. Es un
  // cierre de ventana por EVENTO, no por tiempo (`time-model.md` §3, `until` conjuntivo).
  it.todo('el revive resetea los cooldowns de los precepts — cierre de ventana por evento');

  it.todo('precept ⊥ stat mod: `mod_class` null en los 158 — #15');
  it.todo('`AVATAR_ADD_ABILITY_DURATION` sobre un compañero escala PRECEPTS, no las 4 del warframe — #15');
});
