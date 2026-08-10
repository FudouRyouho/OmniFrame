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
import { CombatSimulator } from '../../simulate/combat/CombatSimulator';
import { LAYER_STACK, layerFor } from '../../contracts/layers';
import { damageReductionFromArmor } from '../../formulas/enemy/armor-mitigation';

const TOXIN = 'WEAPON_ADD_TOXIN_DAMAGE';
const IMPACT = 'WEAPON_ADD_IMPACT_DAMAGE';

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

  it('el consumo derrama hacia abajo: lo que una capa no absorbe pasa a la siguiente que lo admita', () => {
    const s = makeIsolatedTarget({ overguard: 100, shields: 100, health: 1000 });
    // El derrame es la ley del HOSTIL. Del lado jugador el gate lo corta y abre invulnerabilidad
    // (`overguard.md`: 0.5 s al agotarse el Overguard) — medido como `it.fails` en `state-neutrality`.
    s.applyProc('bleed', { moddedBase: 100, statusDamageBonusPct: 0, elementBonusPct: {} }, 1, 0);
    for (let t = 0; t < 8; t += 0.5) advanceAndResolve(s, t, 0.5);

    // 210 de bleed: 100 se los come el overguard, 100 el shield, 10 llegan a la salud.
    expect(s.current_overguard).toBe(0);
    expect(s.current_shields).toBe(0);
    expect(s.current_health).toBeCloseTo(1000 - 10, 6);
  });

  it.todo('¿Toxin atraviesa también el OVERshield? la fuente dice "normal shields" y no lo aclara — hoy se asume que sí');
});
