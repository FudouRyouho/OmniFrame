/**
 * EL OVERGUARD DE PUNTA A PUNTA — la capa cierra su propio lazo (#11).
 *
 * `receiver-layer.test.ts` mide la LEY: qué cap sale cuando el contexto declara la capa. Éste mide el
 * **lazo**, que es otra cosa y no estaba cubierto por ninguno de los dos lados:
 *
 * ```
 * la capa tiene cantidad  →  receiverContext()  →  el cap de Cold baja a 4
 *          ↑                                                    ↓
 *   receive() la descuenta  ←  resolveHit() la elige  ←  llega daño
 * ```
 *
 * Hasta acá el Overguard se rompía con `setLayer(…, 0)` — un atajo de test. Acá se rompe **con daño
 * resuelto por el camino de producción** (`resolveHit` particiona → `receive` escribe), que es la
 * única forma de saber que las dos mitades hablan del mismo número. Son dos lecturas del mismo campo
 * escritas en archivos que no se conocen: `layerAmounts` para elegir capa, `layerAmounts` para armar
 * el contexto del receptor. Nada garantizaba que coincidieran salvo que alguien las cruzara.
 *
 * ⚠️ **Lo que este archivo NO ejerce es el ORIGEN — a propósito, no por hueco.** El origen SÍ existe
 * (#38: `HostileIntent.isEximus` → `normalizeEnemy` → `ENEMY_ADD_OVERGUARD_MAX`, probado end-to-end en
 * `receiver-law.test.ts`), pero acá se declara la cantidad a mano igual que en `layer-stack.test.ts`:
 * lo que se mide es la LEY de consumo (capa × status), no de dónde salió el número. Mezclar los dos
 * ejes en el mismo caso oscurecería cuál de los dos se rompió si el test falla.
 *
 * ⚠️ **Y no duplica `layer-stack.test.ts`**, que ya mide la mecánica de la capa por sí sola (orden de
 * la pila, Toxin que no la atraviesa, la DR del armor que no le aplica, el derrame sin gate). Acá se
 * mide sólo lo que **cruza capa × status**, que es donde #11 metió el canal nuevo.
 */
import { describe, it, expect } from 'vitest';
import { advanceAndResolve } from '../../simulate/advance';
import { makeIsolatedTarget, resolveIsolated } from './harness';
import type { Layer } from '../../contracts/layers';
import type { HitContext } from '../../formulas/status/effect-behavior';
import type { StatusEffect } from '@shared/types';

const DUMMY_HIT: HitContext = { moddedBase: 0, statusDamageBonusPct: 0, elementBonusPct: {} };
const FREEZE_DEFAULT_CAP = 9;

type Target = ReturnType<typeof makeIsolatedTarget>;

const countOf = (t: Target, effect: StatusEffect): number =>
  (t.effectStates.get(effect) as { count: number } | undefined)?.count ?? 0;

/** UN HIT POR EL CAMINO REAL: `resolveHit` particiona por capa, `receive` escribe. Sin atajos. */
function hit(target: Target, damage: Record<string, number>, t = 0): void {
  const res = resolveIsolated(damage as never, target, t);
  for (const [layer, dmg] of Object.entries(res.by_layer)) {
    if (dmg > 0) target.receive(layer as Layer, dmg, t);
  }
  target.clampVitals();
}

/** Un enemigo con Overguard: la capa arriba, armor y salud debajo para que el derrame sea observable. */
const eximusLike = () =>
  makeIsolatedTarget({ overguard: 300, armor: 500, shields: 0, health: 1000 });

describe('⭐ El lazo completo: la capa se rompe con daño y el cap del receptor vuelve solo', () => {
  it('con la capa arriba Cold topea en 4; rota POR DAÑO, vuelve a 9 — sin tocar el estado a mano', () => {
    const t = eximusLike();

    // (1) La capa está presente → el receptor habla → el cap baja.
    t.applyProc('freeze', DUMMY_HIT, 20, 0);
    expect(countOf(t, 'freeze')).toBe(4);
    expect(t.receiverContext().layers_present).toContain('overguard');

    // (2) Se la rompe por el camino de producción. 300 exactos: el Overguard los absorbe enteros
    //     —no le aplica la DR del armor— y no derrama nada a la salud.
    hit(t, { impact: 300 });
    expect(t.current_overguard).toBe(0);
    expect(t.current_health).toBe(1000);

    // (3) El contexto deja de declararla en el mismo instante, sin que nadie lo notifique.
    expect(t.receiverContext().layers_present).not.toContain('overguard');

    // (4) Y el cap vuelve al default del concepto. El contador NO se resetea: sube desde los 4 que ya
    //     tenía, que es lo que `applyStackProc` hace cuando el cap se agranda.
    t.applyProc('freeze', DUMMY_HIT, 20, 0);
    expect(countOf(t, 'freeze')).toBe(FREEZE_DEFAULT_CAP);
  });

  it('daño que NO la rompe deja el cap donde estaba — la ley mira presencia, no cantidad', () => {
    const t = eximusLike();
    hit(t, { impact: 299 });
    expect(t.current_overguard).toBe(1);

    t.applyProc('freeze', DUMMY_HIT, 20, 0);
    expect(countOf(t, 'freeze')).toBe(4);
  });

  /**
   * LA FRONTERA ES `> 0` Y NO UN UMBRAL, y conviene que esté medida: `layerFor` ya usa el mismo
   * criterio para elegir capa (*"la primera que **tiene cantidad**"*), así que si alguien cambiara uno
   * de los dos, éste es el caso que lo dice.
   */
  it('la transición es exactamente en 0: con 1 de Overguard todavía fuerza, con 0 ya no', () => {
    const casi = eximusLike();
    hit(casi, { impact: 299.5 });
    casi.applyProc('freeze', DUMMY_HIT, 20, 0);
    expect(countOf(casi, 'freeze')).toBe(4);

    const justo = eximusLike();
    hit(justo, { impact: 300 });
    justo.applyProc('freeze', DUMMY_HIT, 20, 0);
    expect(countOf(justo, 'freeze')).toBe(FREEZE_DEFAULT_CAP);
  });

  /**
   * EL MISMO LAZO POR EL OTRO CAMINO. `layer-stack.test.ts` ya fija que el hit directo y el DoT
   * escriben igual; lo que se agrega acá es que **el canal del receptor también lo ve igual**. Si el
   * DoT escribiera por un camino que no pasa por `receive`, el cap se quedaría en 4 para siempre.
   */
  it('un DoT que rompe la capa también devuelve el cap — el canal no distingue quién la rompió', () => {
    const t = eximusLike();
    t.applyProc('freeze', DUMMY_HIT, 20, 0);
    expect(countOf(t, 'freeze')).toBe(4);

    // Bleed a moddedBase 200: 6 ticks de 70 = 420, más que los 300 de la capa.
    t.applyProc('bleed', { moddedBase: 200, statusDamageBonusPct: 0, elementBonusPct: {} }, 1, 0);
    for (let time = 0; time < 8; time += 0.5) advanceAndResolve(t, time, 0.5);
    expect(t.current_overguard).toBe(0);

    t.applyProc('freeze', DUMMY_HIT, 20, 0);
    expect(countOf(t, 'freeze')).toBe(FREEZE_DEFAULT_CAP);
  });
});

describe('Lo que el corpus declara sobre la capa × status, medido contra el motor', () => {
  /**
   * *"On enemies, they **can receive** Status Effects"* (`overguard.wikitext:37`) — el opuesto exacto
   * del lado jugador, que *"negate **all** Status Effects"*. El motor no distingue lado y por eso esto
   * pasa; lo que el caso fija es que **no se le agregue** un bloqueo por simetría con el jugador.
   */
  it('el enemigo recibe status con la capa activa: Corrosive entra y stripea el armor', () => {
    const t = eximusLike();
    t.applyProc('corrosion', DUMMY_HIT, 1, 0);
    expect(countOf(t, 'corrosion')).toBe(1);
    // *"Los enemigos sí pueden sufrir strip de shields y de armor mientras su Overguard está activo"*.
    expect(t.getEffectiveArmor(0)).toBeCloseTo(500 * (1 - 0.26), 5);
    expect(t.current_overguard).toBe(300);   // y el strip no toca la capa
  });

  /**
   * *"Fixed Overguard counting as Health and taking damage from Viral Status Effect"*
   * (`overguard.wikitext:393`). En el motor eso no es un caso especial: Viral (`infection`) declara
   * `layerMult: { health }`, así que el multiplicador **no existe** para la capa. El caso mide la
   * consecuencia, que es lo observable.
   */
  it('Viral NO amplifica el daño al Overguard — su layerMult es de la salud', () => {
    const t = eximusLike();
    t.applyProc('infection', DUMMY_HIT, 10, 0);   // Viral a stacks llenos

    expect(t.getDamageMultiplier('overguard', 0)).toBe(1);
    expect(t.getDamageMultiplier('health', 0)).toBeGreaterThan(1);

    hit(t, { impact: 100 });
    expect(t.current_overguard).toBe(200);        // 100 exactos, sin amplificar
  });

  /**
   * Este caso existía al revés —fijaba la AUSENCIA, escrito para romperse el día que O4 cerrara— y
   * cerró: `DC-OQ-ENGINE-O4`. `overguard.wikitext:30` no daba "otra tabla"; era la fila de la tabla de
   * shields, y `damage-magnetic-damage.wikitext:23` nombra las dos capas en una sola frase.
   *
   * Acá se mide el **consumo**, no el multiplicador (eso ya lo cubre `disruption.test.ts`): 100 de
   * daño con Disrupt a 10 stacks tienen que sacarle 425 al Overguard, no 100.
   */
  it('Magnetic amplifica el Overguard con la misma ley que el shield — y el consumo lo refleja', () => {
    const t = makeIsolatedTarget({ overguard: 1000, shields: 300, health: 1000 });
    t.applyProc('disruption', DUMMY_HIT, 10, 0);

    expect(t.getDamageMultiplier('overguard', 0)).toBeCloseTo(4.25, 5);
    expect(t.getDamageMultiplier('overguard', 0)).toBeCloseTo(t.getDamageMultiplier('shield', 0), 5);

    hit(t, { impact: 100 });
    expect(t.current_overguard).toBeCloseTo(1000 - 425, 5);   // amplificado, no los 100 nominales
  });

  /**
   * *"Enemies do not have any invulnerability gating when their Overguard is depleted"*
   * (`overguard.wikitext:39`) — contra los 0.5 s del jugador. El exceso pasa a la capa de abajo **en
   * el mismo hit**, sin ventana.
   */
  it('sin gate al agotarse: el exceso derrama en el mismo hit, sin ventana', () => {
    const t = makeIsolatedTarget({ overguard: 300, shields: 0, armor: 0, health: 1000 });
    hit(t, { impact: 500 });
    expect(t.current_overguard).toBe(0);
    expect(t.current_health).toBe(800);          // los 200 de exceso, enteros
  });
});
