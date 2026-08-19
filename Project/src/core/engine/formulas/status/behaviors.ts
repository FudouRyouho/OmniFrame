/**
 * @domain Engine / Formulas / Status / Behaviors
 * @SSoT docs/domains/engine/design/damage-status-model.md §Modelo unificado de proc
 *
 * Las fórmulas-estrategia por efecto (`EffectBehavior`), + el registro `EFFECT_BEHAVIORS`. Cada una
 * posee su acumulación, su ciclo de vida y su contribución; reusa la LEY ya extraída (`dot-tick`,
 * `dot-timeline`, `stack-debuff`). `EntityState` las itera; no las conoce por dentro.
 *
 * Fidelidad: bleed/poison/corrosion/infection/disruption son wraps FIELES del comportamiento actual.
 * `ignite` (Heat) cambia: su tick ahora RESUELVE como `heat` (matriz③/DR/capa) en vez de ser un pool
 * crudo sin resolver — el modelo viejo estaba roto (`StatusEngine`), ningún test fija su valor.
 */

import type { DamageType, StatusEffect } from "@shared/types";
import type { EffectBehavior, Resolucion } from "./effect-behavior";
import { dotTickValue, type DotType } from "./dot-tick";
import { tickTimes, type DotPulse } from "./dot-timeline";
import {
  stackDebuffValue, applyStackProc, receiverMaxStacks, receiverInitialStrip,
  infectionLaw, disruptionLaw, corrosionLaw,
  WEAKENED_CRIT_LAW, COLD_CRIT_LAW, CORROSIVE_MAX_STACKS, CORROSIVE_INITIAL_STRIP_PCT, STATUS_MAX_STACKS,
} from "./stack-debuff";
import { resolveParam } from "../common/param-deviation";

/** Duración declarada del decay: 6 s. ⚠️ La fórmula de abajo NO la implementa — ver `status.md §Deudas`. */
const DECAY_DURATION = 6.0;
const DOT_SHAPE = { ticks: 6, procDelay: 1, interval: 1 } as const;

// ─────────────────────────────────────────────────────────────────────────────
// DoT — instancias independientes (bleed, poison). Estado = lista de pulsos.
// ─────────────────────────────────────────────────────────────────────────────

interface DotState { pulses: DotPulse[]; }

function makeDotBehavior(effect: StatusEffect, dotType: DotType, as: DamageType): EffectBehavior<DotState> {
  return {
    effect,
    applyProc(state, { hit }, amount, t) {
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

/**
 * ⚠️ **Escalar, y `arch-decisions §17` lo marca como arrastre:** *"reemplaza el más viejo"* opera
 * sobre instancias con timer propio, no sobre un contador. Lo que un contador puede expresar —que el
 * proc sobre-cap **no lo baja**— lo cubre `applyStackProc`; lo que no, es `OQ-ENGINE-16`.
 */
interface StackState { count: number; }

function decayCount(count: number, dt: number): number {
  return count > 0 ? count - (count / DECAY_DURATION) * dt : count;
}

const corrosionBehavior: EffectBehavior<StackState> = {
  effect: "corrosion",
  applyProc(state, { hit, receiver }, amount) {
    // LA CADENA DE §17, ENTERA Y EN UNA LÍNEA. El cap es **del que aplica**
    // (`status-stack-caps.md`), así que sale de la instancia y no de la constante: el default del
    // concepto, desviado por lo que el emisor declare — salvo que el receptor hable sobre este mismo
    // parámetro, en cuyo caso el del emisor no llega (precedencia, no dominancia).
    //
    // Los dos lados llegan en su propio idioma: el emisor por parámetro de ley, el receptor por
    // status. Traducirlos es de acá, que es el único punto que sabe cuál es su efecto.
    const cap = resolveParam(CORROSIVE_MAX_STACKS, {
      emitter: hit.lawDeviations?.["corrosive.maxStacks"],
      receiver: receiverMaxStacks(receiver, "corrosion"),
    });
    return { count: applyStackProc(state?.count ?? 0, amount, cap) };
  },
  advance(state, _t, dt) {
    return { state: { count: decayCount(state.count, dt) }, damage: [] };
  },
  resolutionModifier(state, _t, receiver) {
    if (state.count <= 0) return {};
    // El strip inicial es el segundo parámetro de esta ley con desvío conocido, y entra por el canal
    // del RECEPTOR: la marca de Hydroid (`replace(50)`), no un emisor. Antes se llamaba
    // `corrosionLaw()` a secas, con el default horneado y sin puerta por donde desviarlo — #8.
    const initialStrip = resolveParam(CORROSIVE_INITIAL_STRIP_PCT, {
      receiver: receiverInitialStrip(receiver),
    });
    const strip = stackDebuffValue(corrosionLaw(initialStrip), state.count);
    return { armorMult: 1 - strip };
  },
};

const infectionBehavior: EffectBehavior<StackState> = {
  effect: "infection",
  applyProc(state, _ctx, amount) {
    return { count: applyStackProc(state?.count ?? 0, amount, STATUS_MAX_STACKS) };
  },
  advance(state, _t, dt) {
    return { state: { count: decayCount(state.count, dt) }, damage: [] };
  },
  resolutionModifier(state) {
    if (state.count <= 0) return {};
    return { layerMult: { health: stackDebuffValue(infectionLaw(), state.count) } };
  },
};

const disruptionBehavior: EffectBehavior<StackState> = {
  effect: "disruption",
  applyProc(state, _ctx, amount) {
    return { count: applyStackProc(state?.count ?? 0, amount, STATUS_MAX_STACKS) };
  },
  advance(state, _t, dt) {
    return { state: { count: decayCount(state.count, dt) }, damage: [] };
  },
  resolutionModifier(state) {
    if (state.count <= 0) return {};
    // Magnetic amplifica shields Y overguard (`overguard.md`: 100% al 1er stack, +25%/stack, hasta
    // 325%). El overguard NO está acá: su ley es otra tabla y `OQ-ENGINE-O4` sigue abierta sobre el
    // ×3.25 vs ×4.25 — declararlo con la ley de shields sería inventar el número.
    return { layerMult: { shield: stackDebuffValue(disruptionLaw(), state.count) } };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Crit-buff-por-stack — el target debilitado sube el crit del ATACANTE (`DC-OQ-ENGINE-12`).
// Mismo molde que corrosion (StackState + decay fluido), pero contribuye vía `critModifier`
// (stage del hit) en vez de `resolutionModifier` (stage de mitigación).
//
// ⚠️ AUSENCIAS DIFERIDAS (no simplificaciones — dato/mecánica que hoy NO existe):
//   · Freeze cap 4 stacks en Overguard — el canal del receptor ya existe (`receiverMaxStacks`) y la
//     entidad ya puede declarar clase; lo que falta es el **Overguard**, que no es clase sino capa
//     presente en `t` y no tiene origen modelado (`current_overguard` nace en 0 y nada lo sube) — #11.
//     "Bosses" queda afuera por otra razón: `arch-decisions §22` lo veta — no pasa el test de tres vías.
//   · Freeze 10º stack (congelación 3 s, crit recibido +1.0×, 3 stacks residuales) — sin modelar — #12.
//   · Puncture no aplica a AoE / habilidades de warframe — gratis hoy (el modelo son hits de arma),
//     gateado hasta que exista AoE (`OQ-ENGINE-12`).
// El decay fluido (compartido con corrosion) vs los N-timers reales es SIMPLIFICACIÓN → OQ-ENGINE-16.
// ─────────────────────────────────────────────────────────────────────────────

const WEAKENED_MAX_STACKS = 5;
const FREEZE_MAX_STACKS = 9; // ⚠️ 4 con Overguard presente (ausente: la capa no tiene origen) — #11.

const weakenedBehavior: EffectBehavior<StackState> = {
  effect: "weakened",
  applyProc(state, _ctx, amount) {
    return { count: applyStackProc(state?.count ?? 0, amount, WEAKENED_MAX_STACKS) };
  },
  advance(state, _t, dt) {
    return { state: { count: decayCount(state.count, dt) }, damage: [] };
  },
  critModifier(state) {
    if (state.count <= 0) return {};
    return { critChanceAdd: stackDebuffValue(WEAKENED_CRIT_LAW, state.count) };
  },
};

const freezeBehavior: EffectBehavior<StackState> = {
  effect: "freeze",
  applyProc(state, _ctx, amount) {
    return { count: applyStackProc(state?.count ?? 0, amount, FREEZE_MAX_STACKS) };
  },
  advance(state, _t, dt) {
    return { state: { count: decayCount(state.count, dt) }, damage: [] };
  },
  critModifier(state) {
    if (state.count <= 0) return {};
    return { critMultAdd: stackDebuffValue(COLD_CRIT_LAW, state.count) };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Heat — DoT pool consolidado + rampa de armor por tiempo (frontera 1, su propia fórmula).
// ─────────────────────────────────────────────────────────────────────────────

interface HeatState { pool: number; ignite: number; firstProcTime: number | null; }

const igniteBehavior: EffectBehavior<HeatState> = {
  effect: "ignite",
  applyProc(state, { hit }, amount, t) {
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
 * Registro de behaviors — PARCIAL sobre los 15 `StatusEffect`: los que tienen LEY hoy. Los demás
 * (impact/… ; gas/electricity = frontera 3) no tienen behavior aún. `<any>` en el estado: el registro
 * es heterogéneo (cada efecto modela su `S` distinto), opaco a core. `weakened`/`freeze` acumulan
 * stacks pero NO emiten daño — solo buffean el crit del atacante vía `critModifier` (`DC-OQ-ENGINE-12`).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EFFECT_BEHAVIORS: Partial<Record<StatusEffect, EffectBehavior<any>>> = {
  bleed: makeDotBehavior("bleed", "slash", "true"),
  poison: makeDotBehavior("poison", "toxin", "toxin"),
  ignite: igniteBehavior,
  corrosion: corrosionBehavior,
  infection: infectionBehavior,
  disruption: disruptionBehavior,
  weakened: weakenedBehavior, // Puncture → +crit chance del atacante (`DC-OQ-ENGINE-12`)
  freeze: freezeBehavior,     // Cold → +crit damage del atacante (`DC-OQ-ENGINE-12`)
};
