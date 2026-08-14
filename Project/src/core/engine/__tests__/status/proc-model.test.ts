/**
 * Modelo unificado de proc — verificación end-to-end del camino nuevo (`damage-status-model.md
 * §Modelo unificado de proc`). Reemplaza a los tests de reconciliación Toxin/Slash (API vieja
 * `addPulse`/`dot_pools`, concepto superado): acá se aplica un proc vía `EntityState.applyProc` (que
 * rutea al behavior, que computa su snapshot del `HitContext`), se avanza con `processDots`, y se
 * asserta que la resolución de cada tick deriva del canónico (bypass/True/DR/capa).
 */
import { describe, it, expect } from "vitest";
import { advanceAndResolve } from "../../simulate/advance";
import { makeIsolatedTarget } from "./harness";
import { CombatSimulator } from "../../simulate/combat/CombatSimulator";
import type { HitContext } from "../../formulas/status/effect-behavior";
import { damageReductionFromArmor } from "../../formulas/enemy/armor-mitigation";
import { infectionLaw, stackDebuffValue } from "../../formulas/status/stack-debuff";

/** moddedBase=200 → tick de Toxin (coef 0.5) = 100, tick de Slash bleed (coef 0.35) = 70. */
const HIT_200: HitContext = { moddedBase: 200, statusDamageBonusPct: 0, elementBonusPct: {} };

describe("poison (Toxin) — bypassa shields, paga DR (as: 'toxin')", () => {
  it("armor=200 aplica DR por tick; shields intactos", () => {
    const state = makeIsolatedTarget({ health: 1000, armor: 200, shields: 500 });
    state.applyProc("poison", HIT_200, 1, 0); // pulse value = 100, 6 ticks (firstTick 1..6)
    advanceAndResolve(state, 0, 7);

    const perTick = 100 * (1 - damageReductionFromArmor(200)); // DR 24.49% → 75.5051
    expect(state.current_health).toBeCloseTo(1000 - 6 * perTick, 3);
    expect(state.current_shields).toBe(500); // Toxin bypasea shields
  });
});

describe("bleed (Slash) — True: bypassa armor/matriz, NO el multiplicador de capa (as: 'true')", () => {
  it("armor=200 NO reduce el tick (True bypasea DR)", () => {
    const state = makeIsolatedTarget({ health: 1000, armor: 200 });
    state.applyProc("bleed", HIT_200, 1, 0); // tick = 0.35 × 200 = 70
    advanceAndResolve(state, 0, 7);
    expect(state.current_health).toBeCloseTo(1000 - 6 * 70, 5); // sin DR pese a armor=200
  });

  it("Viral (Infection) SÍ amplifica un tick True — capa salud (resolución directa)", () => {
    // A nivel resolución, sin `processDots` (que decae los stacks): un tick True con Infection=5.
    const state = makeIsolatedTarget({ health: 1000, stacks: { infection: 5 } });
    const { finalDamage } = CombatSimulator.resolveDamageEvent("true", 100, state, 0);
    const mult = stackDebuffValue(infectionLaw(100, 25), 5); // ×3.0
    expect(mult).toBeCloseTo(3.0, 5);
    expect(finalDamage).toBeCloseTo(100 * mult, 5); // True bypasea armor/matriz, Viral SÍ amplifica
  });
});

describe("resolveDamageEvent — reglas derivadas del canónico por `as`", () => {
  it("True bypasea DR — 100 se queda en 100", () => {
    const state = makeIsolatedTarget({ armor: 200 });
    const { finalDamage } = CombatSimulator.resolveDamageEvent("true", 100, state, 0);
    expect(finalDamage).toBeCloseTo(100, 5);
  });

  it("Toxin paga DR y bypasea shields (va a salud) — contraste con True", () => {
    const state = makeIsolatedTarget({ armor: 200, shields: 500 });
    const { layer, finalDamage } = CombatSimulator.resolveDamageEvent("toxin", 100, state, 0);
    expect(layer).toBe("health"); // el shield lo deja pasar
    expect(finalDamage).toBeCloseTo(100 * (1 - damageReductionFromArmor(200)), 4);
  });
});

describe("corrosion — armor strip vía resolutionModifier (as del daño que golpea)", () => {
  it("5 stacks stripean armor (getEffectiveArmor derivado del behavior)", () => {
    const state = makeIsolatedTarget({ armor: 1000, stacks: { corrosion: 5 } });
    // 5 stacks → strip 50% (0.26 + 0.06×4) → armor efectivo 500
    expect(state.getEffectiveArmor(0)).toBeCloseTo(500, 0);
  });
});
