/**
 * @domain Engine / Formulas / Status / Behaviors
 * @SSoT docs/domains/engine/design/damage-status-model.md §Modelo unificado de proc
 *
 * Las fórmulas-estrategia por efecto (`EffectBehavior`), + el registro `EFFECT_BEHAVIORS`. Cada una
 * posee su acumulación, su ciclo de vida y su contribución; reusa la LEY ya extraída (`dot-tick`,
 * `dot-timeline`, `stack-debuff`). `EnemyState` las itera; no las conoce por dentro.
 *
 * Fidelidad: bleed/poison/corrosion/infection/disruption son wraps FIELES del comportamiento actual.
 * `ignite` (Heat) cambia: su tick ahora RESUELVE como `heat` (matriz③/DR/capa) en vez de ser un pool
 * crudo sin resolver — el modelo viejo estaba roto (`StatusEngine`), ningún test fija su valor.
 */

import type { DamageType, StatusEffect } from "@shared/types";
import type { EffectBehavior, HitContext, Resolucion } from "./effect-behavior";
import { dotTickValue, type DotType } from "./dot-tick";
import { tickTimes, type DotPulse } from "./dot-timeline";
import { stackDebuffValue, infectionLaw, disruptionLaw, corrosionLaw } from "./stack-debuff";

/** Duración fija del decay lineal (el `duration = 6.0` del viejo `processDots`). */
const DECAY_DURATION = 6.0;
const DOT_SHAPE = { ticks: 6, procDelay: 1, interval: 1 } as const;

// ─────────────────────────────────────────────────────────────────────────────
// DoT — instancias independientes (bleed, poison). Estado = lista de pulsos.
// ─────────────────────────────────────────────────────────────────────────────

interface DotState { pulses: DotPulse[]; }

function makeDotBehavior(effect: StatusEffect, dotType: DotType, as: DamageType): EffectBehavior<DotState> {
  return {
    effect,
    applyProc(state, hit, amount, t) {
      const ownElement = hit.elementBonusPct[dotType] ?? 0;   // dot-tick fuerza 0 para slash internamente
      const tickValue = dotTickValue(dotType, hit.moddedBase, ownElement, hit.statusDamageBonusPct);
      const pulse: DotPulse = {
        firstTick: t + DOT_SHAPE.procDelay,
        ticks: DOT_SHAPE.ticks,
        value: tickValue * amount,          // pre-escalado por procs esperados (compute-once)
        interval: DOT_SHAPE.interval,
      };
      return { pulses: [...(state?.pulses ?? []), pulse] };
    },
    advance(state, t, dt) {
      const windowEnd = t + dt;
      const damage: Resolucion[] = [];
      for (const p of state.pulses) {
        for (const tt of tickTimes(p)) {
          if (tt >= t && tt < windowEnd) damage.push({ value: p.value, as });
        }
      }
      const pulses = state.pulses.filter((p) => {
        const lastTick = p.firstTick + (p.ticks - 1) * (p.interval ?? 1);
        return lastTick >= windowEnd;   // podar los ya agotados (mismo criterio que tickActivePulses)
      });
      return { state: { pulses }, damage };
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Stack-debuff — contador + decay fluido (corrosion, infection, disruption).
// ─────────────────────────────────────────────────────────────────────────────

interface StackState { count: number; }

function decayCount(count: number, dt: number): number {
  return count > 0 ? count - (count / DECAY_DURATION) * dt : count;
}

const corrosionBehavior: EffectBehavior<StackState> = {
  effect: "corrosion",
  applyProc(state, _hit, amount, _t, laws) {
    return { count: Math.min(laws.corrosive_max_stacks, (state?.count ?? 0) + amount) };
  },
  advance(state, _t, dt) {
    return { state: { count: decayCount(state.count, dt) }, damage: [] };
  },
  resolutionModifier(state, _t, laws) {
    if (state.count <= 0) return {};
    const strip = stackDebuffValue(corrosionLaw(laws.corrosive_initial_strip, laws.corrosive_stack_strip), state.count);
    return { armorMult: 1 - strip };
  },
};

const infectionBehavior: EffectBehavior<StackState> = {
  effect: "infection",
  applyProc(state, _hit, amount, _t, laws) {
    return { count: Math.min(laws.status_max_stacks, (state?.count ?? 0) + amount) };
  },
  advance(state, _t, dt) {
    return { state: { count: decayCount(state.count, dt) }, damage: [] };
  },
  resolutionModifier(state, _t, laws) {
    if (state.count <= 0) return {};
    return { layerMult: { health: stackDebuffValue(infectionLaw(laws.status_initial_bonus, laws.status_stack_bonus), state.count) } };
  },
};

const disruptionBehavior: EffectBehavior<StackState> = {
  effect: "disruption",
  applyProc(state, _hit, amount, _t, laws) {
    return { count: Math.min(laws.status_max_stacks, (state?.count ?? 0) + amount) };
  },
  advance(state, _t, dt) {
    return { state: { count: decayCount(state.count, dt) }, damage: [] };
  },
  resolutionModifier(state, _t, laws) {
    if (state.count <= 0) return {};
    return { layerMult: { shields: stackDebuffValue(disruptionLaw(laws.status_initial_bonus, laws.status_stack_bonus), state.count) } };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Heat — DoT pool consolidado + rampa de armor por tiempo (frontera 1, su propia fórmula).
// ─────────────────────────────────────────────────────────────────────────────

interface HeatState { pool: number; ignite: number; firstProcTime: number | null; }

const igniteBehavior: EffectBehavior<HeatState> = {
  effect: "ignite",
  applyProc(state, hit, amount, t) {
    const s = state ?? { pool: 0, ignite: 0, firstProcTime: null };
    const tickValue = dotTickValue("heat", hit.moddedBase, hit.elementBonusPct.heat ?? 0, hit.statusDamageBonusPct);
    return {
      pool: s.pool + tickValue * amount,
      ignite: Math.min(999, s.ignite + amount),
      firstProcTime: s.ignite === 0 && amount > 0 ? t : s.firstProcTime,
    };
  },
  advance(state, _t, dt) {
    const damage: Resolucion[] = state.pool > 0 ? [{ value: state.pool * dt, as: "heat" }] : [];
    return {
      state: {
        pool: state.pool > 0 ? state.pool - (state.pool / DECAY_DURATION) * dt : state.pool,
        ignite: decayCount(state.ignite, dt),
        firstProcTime: state.firstProcTime,
      },
      damage,
    };
  },
  resolutionModifier(state, t) {
    // Rampa de armor strip por TIEMPO transcurrido desde el 1er proc (0.5s→0 … 2s→50%). No es Familia A.
    if (state.ignite > 0 && state.firstProcTime !== null) {
      const elapsed = t - state.firstProcTime;
      if (elapsed > 0.5) {
        const rampProgress = Math.min(1.0, (elapsed - 0.5) / 1.5);
        return { armorMult: 1 - 0.5 * rampProgress };
      }
    }
    return {};
  },
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Registro de behaviors — PARCIAL sobre los 15 `StatusEffect`: solo los 6 con LEY en C1 hoy. Los
 * demás (puncture/impact/cold/… ; gas/electricity = frontera 3) no tienen behavior aún. `<any>` en el
 * estado: el registro es heterogéneo (cada efecto modela su `S` distinto), opaco a core.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EFFECT_BEHAVIORS: Partial<Record<StatusEffect, EffectBehavior<any>>> = {
  bleed: makeDotBehavior("bleed", "slash", "true"),
  poison: makeDotBehavior("poison", "toxin", "toxin"),
  ignite: igniteBehavior,
  corrosion: corrosionBehavior,
  infection: infectionBehavior,
  disruption: disruptionBehavior,
};
