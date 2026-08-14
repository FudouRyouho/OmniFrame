/**
 * Corrosion (Corrosive) — caso mínimo aislado (altitud 2: instancia → resolución → target).
 * MODELADO hoy: armor strip por stack (Familia A). Ver status-effects.md §Corrosion.
 *
 * Qué NO modelamos (todos abajo): decay/timeline real, replace-oldest sobre-cap, Corrosion sobre
 * el jugador (contenedor entidad-neutral, gate O1).
 */
import { describe, it, expect } from 'vitest';
import { makeIsolatedTarget, resolveIsolated, ISOLATED_FACTION } from './harness';
import { stackDebuffValue, corrosionLaw } from '../../formulas/status/stack-debuff';
import { CORROSIVE_INITIAL_STRIP_PCT as CIS, CORROSIVE_STACK_STRIP_PCT as CSS } from '../../formulas/status/stack-debuff';
import { targetFactionMult } from '../../contracts/damage-multipliers';
import { damageReductionFromArmor } from '../../formulas/enemy/armor-mitigation';


describe('harness — invariante de aislamiento', () => {
  it('la facción sentinela neutraliza la matriz③ (×1.0 para todo tipo)', () => {
    expect(targetFactionMult('WEAPON_ADD_CORROSIVE_DAMAGE', ISOLATED_FACTION)).toBe(1);
    expect(targetFactionMult('WEAPON_ADD_IMPACT_DAMAGE', ISOLATED_FACTION)).toBe(1);
    expect(targetFactionMult('WEAPON_ADD_VIRAL_DAMAGE', ISOLATED_FACTION)).toBe(1);
  });
});

describe('Corrosion — armor strip (MODELADO)', () => {
  it.each([
    [1, 0.26], [5, 0.50], [10, 0.80],
  ])('n=%i stripea el armor del target aislado a la fracción de la LEY (strip %f)', (n, strip) => {
    const target = makeIsolatedTarget({ armor: 1000, stacks: { corrosion: n } });
    expect(target.getEffectiveArmor(0)).toBeCloseTo(1000 * (1 - strip), 5);
    // Consistente con la LEY pura (altitud 1):
    expect(target.getEffectiveArmor(0)).toBeCloseTo(1000 * (1 - stackDebuffValue(corrosionLaw(CIS, CSS), n)), 5);
  });

  it('el strip llega a la resolución: más stacks de Corrosion → más daño a salud (menos DR)', () => {
    const damage = { WEAPON_ADD_IMPACT_DAMAGE: 100 }; // no-toxin, target sin shields → capa salud
    const noStrip = resolveIsolated(damage, makeIsolatedTarget({ armor: 1000, health: 100000 }));
    const strip5 = resolveIsolated(damage, makeIsolatedTarget({ armor: 1000, health: 100000, stacks: { corrosion: 5 } }));
    const strip10 = resolveIsolated(damage, makeIsolatedTarget({ armor: 1000, health: 100000, stacks: { corrosion: 10 } }));
    expect(strip5.health_damage).toBeGreaterThan(noStrip.health_damage);
    expect(strip10.health_damage).toBeGreaterThan(strip5.health_damage);
  });

  it('sin stacks: armor intacto', () => {
    expect(makeIsolatedTarget({ armor: 1000 }).getEffectiveArmor(0)).toBe(1000);
  });

  // Lo que NO tenemos hoy (frontera explícita — no assertar números contra maquinaria ausente):
  it.todo('decay/timeline real de Corrosion (8s, timer por stack) — C2, processDots N-timers');
  it.todo('sobre-cap: el 11º stack reemplaza al más viejo (replace-oldest) — C2');
  it.todo('Corrosion sobre el JUGADOR: misma LEY, distinto portador — gate O1 (contenedor entidad-neutral)');
});

/**
 * ESTRÉS — el strip llega al techo, ¿qué se rompe?
 *
 * No se busca que sea irrompible: se busca **saber qué pasa cuando se rompe**, y que la respuesta esté
 * escrita. El techo de la ley es `1.0` porque `armorMult = 1 − strip`, así que un strip mayor produce
 * **armadura negativa** — y ahí abajo la mitigación es `√(3·armor)/100`.
 *
 * Hay dos defensas, no una: el clamp de la ley (`corrosionLaw`) y el `Math.max(0, armor)` de
 * `getEffectiveArmor`. La segunda existe porque la primera no cubre la composición: los `armorMult` de
 * varios efectos se **multiplican**, y ninguno de ellos ve el producto.
 */
describe('Corrosion — estrés del techo', () => {
  it('a 14 stacks el armor efectivo es 0 exacto, y no cruza por debajo', () => {
    for (const n of [14, 19, 100]) {
      const t = makeIsolatedTarget({ armor: 1000, stacks: { corrosion: n } });
      expect(t.getEffectiveArmor(0)).toBe(0);
    }
  });

  it('armadura totalmente stripeada ≡ target sin armadura — el daño no se pasa de pleno', () => {
    const damage = { WEAPON_ADD_IMPACT_DAMAGE: 100 };
    const stripeado = resolveIsolated(damage, makeIsolatedTarget({ armor: 1000, health: 100000, stacks: { corrosion: 14 } }));
    const sinArmor = resolveIsolated(damage, makeIsolatedTarget({ armor: 0, health: 100000 }));
    expect(stripeado.health_damage).toBeCloseTo(sinArmor.health_damage, 10);
    expect(stripeado.health_damage).toBeCloseTo(100, 10);   // sin DR: el daño pleno, ni uno más
  });

  it('componer con la rampa de Heat tampoco cruza el piso — el producto no puede bajar de 0', () => {
    // Heat aporta su propio `armorMult` (rampa por tiempo hasta ×0.5): 0 × 0.5 sigue siendo 0.
    const t = makeIsolatedTarget({ armor: 1000, stacks: { corrosion: 14, ignite: 1 } });
    expect(t.getEffectiveArmor(3)).toBe(0);
    expect(t.getEffectiveArmor(3)).not.toBeNaN();
  });

  /**
   * QUÉ PASA SI LAS DOS DEFENSAS FALLAN — el modo de falla depende de qué fórmula de mitigación esté
   * vigente, y hoy hay tres en conflicto (`OQ-ENGINE-15`):
   *
   * | fórmula | con `armor = −100` | qué se ve |
   * |---|---|---|
   * | `√(3a)/100` — **la vigente** | `NaN` | el daño entero se vuelve `NaN`: ruidoso, imposible de no ver |
   * | `0.9·a/2700` (lineal) | DR negativa | daño amplificado ~3 %: **silencioso** |
   * | `a/(a+300)` (viejo) | DR `−0.5` | daño ×1.5: **silencioso** |
   *
   * O sea: la fórmula vigente es la única de las tres que **grita** si el clamp se cae. Si
   * `OQ-ENGINE-15` se cierra a favor de cualquiera de las otras dos, este caso deja de ser gratis y el
   * `Math.max(0, …)` de `getEffectiveArmor` pasa de higiene a requisito.
   */
  it('el piso de armor es lo único entre un strip sobre-techo y un daño sin sentido', () => {
    expect(damageReductionFromArmor(-100)).toBeNaN();
    expect(damageReductionFromArmor(0)).toBe(0);
    // Y por eso el clamp del piso vive en `getEffectiveArmor`, no en cada behavior: ningún efecto ve
    // el producto de los `armorMult`, así que ninguno puede saber si lo cruzó.
    expect(makeIsolatedTarget({ armor: 1000, stacks: { corrosion: 100 } }).getEffectiveArmor(0)).toBe(0);
  });
});
