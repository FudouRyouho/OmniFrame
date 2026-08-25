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
  stackDebuffValue, receiverMaxStacks, receiverInitialStrip,
  infectionLaw, disruptionLaw, corrosionLaw,
  WEAKENED_CRIT_LAW, COLD_CRIT_LAW, CORROSIVE_MAX_STACKS, CORROSIVE_INITIAL_STRIP_PCT, STATUS_MAX_STACKS,
} from "./stack-debuff";
import { resolveParam } from "../common/param-deviation";

/**
 * Constante de tiempo del sangrado agregado de **Heat**, y sólo de Heat.
 *
 * Los stack-debuff dejaron de usarla: cada uno lleva su ventana en `STACK_DURATION`. Heat se queda
 * con el agregado porque la fuente lo declara así — *"los stacks se consolidan en UN solo tick/s
 * compartido; procs nuevos refrescan y suman al tick"* (`status-effects.md` §Stacks) —, o sea que acá
 * el modelo fluido es fiel y no una simplificación pendiente.
 */
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
// Stack-debuff — instancias con ventana propia (corrosion, infection, disruption, weakened, freeze).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * **La ventana es del efecto, no del sistema.** La fuente publica una duración distinta por tipo
 * (`status-effects.md` §Duración base, corregida contra las subpáginas): un solo número para los
 * cinco dejaba a Corrosive y Puncture con el valor equivocado, y nada lo detectaba — mover la
 * constante de `6.0` a `8.0` no movía un solo test de los 597.
 */
const STACK_DURATION = {
  corrosion:  8,   // Corrosive
  infection:  6,   // Viral
  disruption: 6,   // Magnetic
  weakened:  10,   // Puncture
  freeze:     6,   // Cold
} as const;

/**
 * Un stack aplicado: cuándo entró y cuánto pesa.
 *
 * `amount` es fraccional a propósito — el motor puebla los procs por VALOR ESPERADO
 * (`expectedProcEvents` → `ev.expected * pellets`), así que "un stack" puede ser `0.37`. Una lista de
 * instancias sin peso habría forzado a redondear el EV, que es cambiar el modelo de población para
 * arreglar el del ciclo de vida.
 */
interface StackInstance { at: number; amount: number; }

/**
 * ⚠️ **`count` es derivado y se conserva a propósito.** Ocho archivos de test leen el estado con un
 * cast (`effectStates.get(e) as { count: number }`), y un cast no lo atrapa `tsc`: sin este campo,
 * los que usan `?.count ?? 0` habrían devuelto `0` en silencio y **pasado en falso**. El campo es la
 * lectura pública del estado; `stacks` es su mecanismo.
 */
interface StackState { stacks?: readonly StackInstance[]; count: number; }

/** Estado a partir de sus instancias — `count` siempre coherente con `stacks`. */
function stackState(stacks: readonly StackInstance[]): StackState {
  return { stacks, count: stacks.reduce((n, s) => n + s.amount, 0) };
}

/**
 * Las instancias de un estado que puede venir **declarado sin ellas**.
 *
 * El harness de tests fabrica `{ count: 5 }` a mano: eso es el modo **input-declarado** de la
 * doctrina (`arch-decisions §8` — se declara N antes de simular de dónde sale), no un estado
 * corrupto. Se materializa como una instancia que entró en `t`, así que a partir de ahí el estado
 * declarado envejece como cualquier otro en vez de quedar congelado o desaparecer.
 */
function instancesOf(state: StackState | undefined, t: number): readonly StackInstance[] {
  if (!state) return [];
  if (state.stacks) return state.stacks;
  return state.count > 0 ? [{ at: t, amount: state.count }] : [];
}

/**
 * Aplica un proc sobre las instancias vivas. Es `applyStackProc` con el eslabón que un escalar no
 * podía expresar: **el sobre-cap refresca al más viejo** en vez de no hacer nada.
 *
 * `references/ingame-tests/status-stack-caps.md`, cinco de cinco: *"si `count ≥ cap_del_que_aplica` →
 * refresca el stack más viejo (REEMPLAZA — count no cambia)"*. El proc **siempre entra**; el cap
 * decide si suma o reemplaza. Puncture lo lleva al extremo que fija el criterio de "más viejo":
 * reemplaza al de aplicación más antigua *"aunque al viejo le quede más duración"*, así que el orden
 * es por `at` de entrada y no por vencimiento.
 */
function applyStackInstances(
  prev: readonly StackInstance[], amount: number, cap: number, t: number,
): readonly StackInstance[] {
  const count = prev.reduce((n, s) => n + s.amount, 0);
  if (count >= cap) {
    if (prev.length === 0) return prev;
    const [masViejo, ...resto] = prev;
    return [...resto, { at: t, amount: masViejo.amount }];
  }
  // Bajo el cap: entra sin pasarse — misma acotación que `applyStackProc` (`min(cap, count+amount)`).
  return [...prev, { at: t, amount: Math.min(amount, cap - count) }];
}

/**
 * Poda las instancias cuya ventana ya venció en `until`.
 *
 * **Se evalúa contra un instante ABSOLUTO, y eso es lo que arregla la fuga de `dt`.** El modelo
 * anterior sangraba el agregado (`count − (count/D)·dt`), así que re-aplicaba el decay sobre su
 * propio resultado y N pasos chicos ≠ un paso grande: el count de corrosión a 3 s valía `5.00` con
 * `dt=3` y `6.05` con `dt=1/15`, convergiendo sólo en el límite. Acá el resultado depende de `until`
 * y de nada más — mismo criterio que la poda de pulsos del DoT, que ya era invariante.
 *
 * Y llega a **cero exacto**: el decay exponencial nunca lo hacía (valía `1.78e-5` a los 60 s), así que
 * `if (count <= 0)` no cortaba nunca y el debuff contribuía para siempre con un residuo invisible.
 */
/**
 * El sangrado agregado de **Heat**. Sobrevive al paso a instancias porque Heat es la excepción que la
 * fuente declara: sus stacks se consolidan en un tick compartido, así que acá no hay instancias que
 * envejecer por separado. Los stack-debuff ya no lo usan.
 */
function decayCount(count: number, dt: number): number {
  return count > 0 ? count - (count / DECAY_DURATION) * dt : count;
}

function expireStacks(
  stacks: readonly StackInstance[], duration: number, until: number,
): readonly StackInstance[] {
  return stacks.filter((s) => s.at + duration > until);
}

const corrosionBehavior: EffectBehavior<StackState> = {
  effect: "corrosion",
  applyProc(state, { hit, receiver }, amount, t) {
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
    return stackState(applyStackInstances(instancesOf(state, t), amount, cap, t));
  },
  advance(state, t, dt) {
    const vivas = expireStacks(instancesOf(state, t), STACK_DURATION.corrosion, t + dt);
    return { state: stackState(vivas), damage: [] };
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
  applyProc(state, _ctx, amount, t) {
    return stackState(applyStackInstances(instancesOf(state, t), amount, STATUS_MAX_STACKS, t));
  },
  advance(state, t, dt) {
    const vivas = expireStacks(instancesOf(state, t), STACK_DURATION.infection, t + dt);
    return { state: stackState(vivas), damage: [] };
  },
  resolutionModifier(state) {
    if (state.count <= 0) return {};
    return { layerMult: { health: stackDebuffValue(infectionLaw(), state.count) } };
  },
};

const disruptionBehavior: EffectBehavior<StackState> = {
  effect: "disruption",
  applyProc(state, _ctx, amount, t) {
    return stackState(applyStackInstances(instancesOf(state, t), amount, STATUS_MAX_STACKS, t));
  },
  advance(state, t, dt) {
    const vivas = expireStacks(instancesOf(state, t), STACK_DURATION.disruption, t + dt);
    return { state: stackState(vivas), damage: [] };
  },
  resolutionModifier(state) {
    if (state.count <= 0) return {};
    // UNA sola ley para las dos capas — `DC-OQ-ENGINE-O4`. La fuente las nombra en la misma frase
    // (*"the Shields and Overguard of the afflicted target"*) y el changelog de DE lo confirma
    // (*"similar to how Magnetic affects Shields"*): no hay dos tablas. `overshield` NO entra —
    // ahí la fuente calla, y eso es ausencia de dato, no de decisión.
    const mult = stackDebuffValue(disruptionLaw(), state.count);
    return { layerMult: { shield: mult, overguard: mult } };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Crit-buff-por-stack — el target debilitado sube el crit del ATACANTE (`DC-OQ-ENGINE-12`).
// Mismo molde que corrosion (instancias con ventana propia), pero contribuye vía `critModifier`
// (stage del hit) en vez de `resolutionModifier` (stage de mitigación).
//
// ⚠️ AUSENCIAS DIFERIDAS (no simplificaciones — dato/mecánica que hoy NO existe):
//   · Freeze cap 4 stacks en Overguard — LEY, CANAL Y UN ORIGEN CONSTRUIDOS (#11, #38): la capa entra
//     por `ReceiverContext.layers_present` y `receiverMaxStacks` la compone con la clase; el Eximus
//     (`HostileIntent.isEximus`) sube `current_overguard` desde el escenario. Los otros dos orígenes
//     posibles (habilidad del jugador, "un enemigo se lo da a otro") siguen sin construir. El lazo de
//     bajada está medido end-to-end: romper la capa con daño devuelve el cap (`overguard-e2e.test.ts`).
//     "Bosses" queda afuera por otra razón: `arch-decisions §22` lo veta — no pasa el test de tres vías.
//   · Freeze 10º stack — CONSTRUIDO (#12): congelación sólida 3s, crit recibido fijo en +1.0× durante
//     la ventana, colapso a 3 residuales al expirar, sin aceptar nuevos stacks mientras dura. Lo que NO
//     modela — "sin acciones" (control de input, fuera del dominio del motor) y "niega recarga de
//     shields" (no hay sistema de regen de shields en absoluto, ni con ni sin este proc) — son gaps del
//     motor entero, no de este behavior.
//   · Puncture no aplica a AoE / habilidades de warframe — gratis hoy (el modelo son hits de arma),
//     gateado hasta que exista AoE (`OQ-ENGINE-12`).
// El decay ya no es fluido: cada stack lleva su ventana (`STACK_DURATION`), que es lo que la fuente
// declara (*"timer independiente por stack/instancia en casi todos"*) y lo que "refresca el más viejo"
// necesitaba para poder expresarse — #10. `OQ-ENGINE-16` sigue abierta y NO la contesta esto: aquélla
// pregunta si declarar N es FIEL (input de C1), no cómo envejece el estado ya aplicado.
// ─────────────────────────────────────────────────────────────────────────────

const WEAKENED_MAX_STACKS = 5;
/**
 * El cap real (`damage-cold-damage.wikitext:18`, *"stacks to a maximum of **10**"*), no la
 * simplificación de 9 que regía antes de #12. `COLD_CRIT_LAW.cap = 0.5 = f(9)` sigue siendo el techo
 * de la fórmula CONTINUA (1er..9º stack) — el 10º no la extiende, dispara el umbral de abajo.
 */
const FREEZE_MAX_STACKS = 10;
/** 10º stack: congelación sólida, sin acciones (status-effects.md §Cold). */
const COLD_FREEZE_DURATION = 3;
/** Al descongelar, el conteo no vuelve a 0: cae a estos residuales (status-effects.md §Cold). */
const COLD_FREEZE_RESIDUAL_STACKS = 3;
/** Crit recibido durante la congelación — fijo, no la fórmula continua (status-effects.md §Cold). */
const COLD_FREEZE_CRIT_ADD = 1.0;

const weakenedBehavior: EffectBehavior<StackState> = {
  effect: "weakened",
  applyProc(state, _ctx, amount, t) {
    return stackState(applyStackInstances(instancesOf(state, t), amount, WEAKENED_MAX_STACKS, t));
  },
  advance(state, t, dt) {
    const vivas = expireStacks(instancesOf(state, t), STACK_DURATION.weakened, t + dt);
    return { state: stackState(vivas), damage: [] };
  },
  critModifier(state) {
    if (state.count <= 0) return {};
    return { critChanceAdd: stackDebuffValue(WEAKENED_CRIT_LAW, state.count) };
  },
};

/**
 * Estado propio de `freeze` — `StackState` + el reloj de la congelación sólida. `frozenUntil` es
 * `null` fuera de la congelación; con valor, es el instante en que expira (mismo patrón que
 * `HeatState.firstProcTime` para timestamps discretos sobre un contenedor por lo demás fluido).
 */
interface FreezeState extends StackState { frozenUntil: number | null; }

/**
 * ¿Está congelado en este instante? **`!= null` y no `!== null`, a propósito:** el estado también
 * puede llegar de un fabricante que declara sólo el contador (el harness de tests escribe `{ count }`),
 * y `undefined !== null` es `true` — con la comparación estricta, un target con 5 stacks declarados
 * cobraba el `+1.0×` de la congelación y **nunca decaía**. Medido antes de corregirlo.
 */
function isFrozen(state: FreezeState): boolean {
  return state.frozenUntil != null;
}

/**
 * Si el freeze ya venció para `t`, lo asienta (colapsa a los residuales). Idempotente.
 *
 * Los residuales nacen **como instancias que entran en `t`**, no como un contador heredado: al
 * descongelar, los 3 que quedan son stacks nuevos y su ventana de 6 s corre desde ahí. Un contador
 * escalar no distinguía eso — heredaba la edad de los stacks que ya se habían consumido en la
 * congelación.
 */
function settleFreeze(state: FreezeState, t: number): FreezeState {
  if (isFrozen(state) && t >= state.frozenUntil!) {
    return { ...stackState([{ at: t, amount: COLD_FREEZE_RESIDUAL_STACKS }]), frozenUntil: null };
  }
  return state;
}

const freezeBehavior: EffectBehavior<FreezeState> = {
  effect: "freeze",
  applyProc(state, { receiver }, amount, t) {
    const settled = settleFreeze(state ?? { count: 0, frozenUntil: null }, t);
    // "Congelado no recibe más stacks de Cold" (status-effects.md §Cold) — el proc no se pierde
    // silencioso: simplemente no hay contador que subir mientras `frozenUntil` siga vigente.
    if (isFrozen(settled)) return settled;
    // El segundo consumidor de la cadena de §17, y el primero cuyo desvío es una CAPA. Sin emisor:
    // ninguna fuente conocida sube el cap de Cold, así que este parámetro sólo tiene lado receptor —
    // que es una respuesta medida, no un hueco (`stack-debuff.ts`, la nota sobre los caps `f(maxStacks)`).
    const cap = resolveParam(FREEZE_MAX_STACKS, { receiver: receiverMaxStacks(receiver, "freeze") });
    const vivas = applyStackInstances(instancesOf(settled, t), amount, cap, t);
    const next = stackState(vivas);
    const frozenUntil = next.count >= FREEZE_MAX_STACKS ? t + COLD_FREEZE_DURATION : null;
    return { ...next, frozenUntil };
  },
  advance(state, t, dt) {
    const settled = settleFreeze(state, t + dt);
    // Asentó en ESTE paso: los residuales que acaban de nacer entran con `at = t+dt`, así que su
    // ventana corre desde el descongelamiento y no heredan la edad de los stacks consumidos.
    if (settled !== state) return { state: settled, damage: [] };
    // Congelado, sin vencer todavía: el contador no decae mientras dura.
    if (isFrozen(state)) return { state, damage: [] };
    const vivas = expireStacks(instancesOf(state, t), STACK_DURATION.freeze, t + dt);
    return { state: { ...stackState(vivas), frozenUntil: null }, damage: [] };
  },
  critModifier(state) {
    if (isFrozen(state)) return { critMultAdd: COLD_FREEZE_CRIT_ADD };
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
