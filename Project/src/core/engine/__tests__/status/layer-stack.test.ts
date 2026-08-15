/**
 * @domain Engine / C2 — la pila defensiva y quién la atraviesa
 *
 * **Qué cambió de forma.** El ruteo de capa era una propiedad del DAÑO: `bypassesShields(token)`,
 * un booleano absoluto que decía *"yo salteo escudos"* sin decir **cuáles**. Con una sola capa
 * salteable alcanzaba. Deja de alcanzar en cuanto hay dos, y el caso lo declara la fuente: Toxin
 * atraviesa el shield (`shield.wikitext:29`) pero **no** el Overguard, que es *"neutral a todos los
 * tipos de daño"* (`overguard.md:25`). Con la forma vieja eso es **inexpresable** — la misma bandera
 * tendría que decir sí y no a la vez.
 *
 * Ahora la tabla es **de la capa** (`contracts/layers.ts`) y el daño recorre la pila preguntando.
 *
 * **Lo que estos tests NO ejercen: el origen.** El Overguard nace de la clase (Eximus) o de una
 * habilidad (Iron Skin), el Overshield de una restauración que excede el máximo — ninguno de los tres
 * está modelado, y las cantidades acá se declaran a mano. Es el uso para el que existe este harness
 * (*"un banco de pruebas con números elegidos a mano"*): lo que se mide es la LEY.
 */
import { describe, it, expect } from 'vitest';
import { advanceAndResolve } from '../../simulate/advance';
import { makeIsolatedTarget, resolveIsolated } from './harness';
import type { Layer } from '../../contracts/layers';
import { CombatSimulator } from '../../simulate/combat/CombatSimulator';
import { LAYER_STACK, layerFor } from '../../contracts/layers';
import { damageReductionFromArmor } from '../../formulas/enemy/armor-mitigation';

const TOXIN = 'toxin';
const IMPACT = 'impact';

describe('La pila declara el orden; cada capa declara qué la atraviesa', () => {
  it('el orden es `overguard → overshield → shield → health`', () => {
    // `overguard.md:17` da `Overguard → Shield → Health`; el Overshield se intercala porque
    // *"must be destroyed before your Warframe's shields can be damaged"* (`shield.wikitext:580`).
    expect([...LAYER_STACK]).toEqual(['overguard', 'overshield', 'shield', 'health']);
  });

  it('⭐ Toxin atraviesa el shield pero NO el Overguard — el caso que la forma vieja no podía expresar', () => {
    const conOverguard = { overguard: 500, shield: 500, health: 1000 };
    expect(layerFor(TOXIN, conOverguard)).toBe('overguard');   // el Overguard lo absorbe
    expect(layerFor(TOXIN, { shield: 500, health: 1000 })).toBe('health'); // sin Overguard, lo saltea
  });

  it('la capa se elige por presencia: una capa en cero no participa aunque esté arriba', () => {
    expect(layerFor(IMPACT, { overguard: 0, shield: 500, health: 1000 })).toBe('shield');
    expect(layerFor(IMPACT, { overguard: 300, shield: 500, health: 1000 })).toBe('overguard');
  });

  it('al Overguard NO le aplica la DR del armor — sí a la salud', () => {
    // `overguard.md §Qué reducción de daño le aplica — y cuál no`: el armor no está en la lista.
    const conOG = makeIsolatedTarget({ armor: 200, health: 1000, overguard: 500 });
    const sinOG = makeIsolatedTarget({ armor: 200, health: 1000 });

    const alOverguard = CombatSimulator.resolveDamageEvent(IMPACT, 100, conOG, 0);
    const aLaSalud = CombatSimulator.resolveDamageEvent(IMPACT, 100, sinOG, 0);

    expect(alOverguard.layer).toBe('overguard');
    expect(alOverguard.finalDamage).toBeCloseTo(100, 6);                    // sin DR
    expect(aLaSalud.finalDamage).toBeCloseTo(100 * (1 - damageReductionFromArmor(200)), 6);
  });

  it('el daño se reparte por capa, y los atajos derivan de esa partición', () => {
    const target = makeIsolatedTarget({ shields: 500, health: 1000, armor: 0 });
    const res = resolveIsolated({ [IMPACT]: 100, [TOXIN]: 50 }, target);

    expect(res.by_layer).toEqual({ shield: 100, health: 50 });  // Impact al shield, Toxin lo atraviesa
    expect(res.shield_damage).toBe(100);
    expect(res.health_damage).toBe(50);
    expect(res.total_damage).toBe(150);
  });

  it('el consumo derrama hacia abajo — y al agotarse el SHIELD el gate corta el derrame', () => {
    const s = makeIsolatedTarget({ overguard: 100, shields: 100, health: 1000 });
    s.applyProc('bleed', { moddedBase: 100, statusDamageBonusPct: 0, elementBonusPct: {} }, 1, 0);
    for (let t = 0; t < 8; t += 0.5) advanceAndResolve(s, t, 0.5);

    // 210 de bleed en 6 ticks de 35, trazado: el Overguard se come 100 y **derrama** (el gate de
    // Overguard es del lado jugador; del lado enemigo `overguard.md` declara "ninguno"). El shield se
    // come otros 100 y al agotarse **sí** gatea: de los 10 restantes pasa el 5% del gate enemigo.
    //
    // Antes llegaban los 10 enteros a la salud, porque no había gate de ningún lado.
    expect(s.current_overguard).toBe(0);
    expect(s.current_shields).toBe(0);
    expect(s.current_health).toBeCloseTo(1000 - 10 * 0.05, 6);   // 999.5, no 990
  });

  /**
   * LA INVARIANTE QUE FALTABA — y su ausencia dejó una ley escrita dos veces.
   *
   * El DoT escribía por `receive()` (conoce las cuatro capas) y el hit directo tenía su propio
   * derrame a mano en `TimelineSimulator`, que sólo conocía shield y health. Medido: 210 de daño
   * contra `overguard 500` lo absorbía el Overguard por un camino y **lo atravesaba** por el otro.
   *
   * No alcanza con arreglar el llamador: lo que hay que fijar es que **haya un solo camino**, y eso
   * se prueba comparando los dos contra el mismo estado inicial.
   */
  it('[regresión] el hit directo y el DoT escriben IGUAL — un solo derrame, no dos', () => {
    const DMG = 210;
    const inicial = { overguard: 500, shields: 300, health: 1000, armor: 0 } as const;

    // Camino del DoT: `advance` emite → `advanceAndResolve` resuelve → `receive` escribe.
    const viaDot = makeIsolatedTarget({ ...inicial });
    viaDot.applyProc('bleed', { moddedBase: 100, statusDamageBonusPct: 0, elementBonusPct: {} }, 1, 0);
    for (let t = 0; t < 8; t += 0.5) advanceAndResolve(viaDot, t, 0.5);

    // Camino del hit: `resolveHit` particiona → `receive` escribe. Es lo que hace `simulateBurst`.
    const viaHit = makeIsolatedTarget({ ...inicial });
    const res = resolveIsolated({ [IMPACT]: DMG }, viaHit);
    for (const [layer, dmg] of Object.entries(res.by_layer)) {
      if (dmg > 0) viaHit.receive(layer as Layer, dmg);
    }
    viaHit.clampVitals();

    // El bleed total de un pulso a moddedBase 100 son exactamente 210 — el mismo número por los dos
    // caminos, así que las cuatro capas tienen que quedar idénticas.
    expect(viaHit.layerAmounts).toEqual(viaDot.layerAmounts);
    // Y no de forma trivial: el Overguard absorbió y la salud quedó intacta.
    expect(viaHit.current_overguard).toBe(500 - DMG);
    expect(viaHit.current_health).toBe(1000);
  });

  it('[regresión] `clone()` copia LAS CUATRO capas', () => {
    const s = makeIsolatedTarget({ overguard: 500, overshield: 200, shields: 300, health: 1000 });
    // Copiaba dos y las otras dos nacían en cero: un clon plausible, silenciosamente equivocado.
    expect(s.clone().layerAmounts).toEqual(s.layerAmounts);
  });

  it('Toxin también atraviesa el Overshield — no es una capa ajena a la regla del shield', () => {
    expect(layerFor(TOXIN, { overshield: 500, health: 1000 })).toBe('health');
  });

  // El tercer verbo está construido para el escudo (`shield-gate.ts` + `receive`), los dos lados.
  // Falta el del Overguard, que la fuente declara asimétrico: 0.5 s del lado jugador y NINGUNO del
  // lado enemigo (`overguard.md:61`). Es el caso que prueba que la ventana es de la CAPA y no del
  // daño — `time-model.md §9 #3`.
  it.todo('el Overguard emite su propia ventana al agotarse: 0.5 s, y SÓLO del lado jugador');

  // La ley del gate enemigo está construida (5% de fuga, 0.1 s); esta excepción no. Necesita que la
  // Resolución sepa qué parte del cuerpo golpeó — `weakpoints[]` trae 407 entradas SIN consumidor.
  // Los AoE no se benefician (su instancia se bloquea entera) pero el daño asociado sí pasa.
  it.todo('apuntar a un weak point BYPASEA el gate del enemigo — `weakpoints[]` (407) sin consumidor · `time-model.md §9 #11`');

  // La asunción que el DR de escudo dejó declarada y hoy es INOBSERVABLE: del lado jugador la fuga
  // del gate es 0, así que el derrame nunca ocurre; del lado enemigo no hay DR de escudo que
  // arrastrar. Se vuelve medible con Decaying Dragon Key (cap 0.33 s) o un build sin escudos.
  it.todo('¿el derrame arrastra la mitigación del EVENTO? — asunción vigente, inobservable hasta que un portador derrame Y mitigue');
});
