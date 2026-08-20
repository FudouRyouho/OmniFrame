/**
 * Harness de aislamiento para la suite de status (`__tests__/status/`).
 *
 * Materializa el §14 de forma ejecutable: una **instancia de daño aislada** (damageMap por tipo)
 * se resuelve contra un **target aislado** (capas + armor + status declarado), agnóstico a source.
 * Este es el seam que (a) sobrevive la futura reescritura de `DamageInstance` (O5) — un solo lugar
 * a tocar, no N tests — y (b) es el proto-fixture que mañana se puede levantar al oráculo para
 * "instancia + target → aritmética". NO se construye el oráculo acá: solo el test lo consume.
 *
 * **Faction NEUTRALIZADO a propósito** (eje diferido, discusión aparte): el target usa una facción
 * sentinela ausente de `FACTION_BONUS`, así `targetFactionMult` devuelve ×1.0 para todo tipo y la
 * aritmética queda pura status + armor. La invariante se verifica con un tripwire en la suite.
 *
 * **Anemia visible:** hoy `resolveHit` toma un `damageMap` pelado — no carga pool②/crit/metadata
 * (instance medio-nacido, §14/O5). Lo que el harness NO puede inyectar aún se registra como `todo`
 * en los per-effect tests; el harness expone el hueco, no lo esconde.
 */
import { EntityState } from "../../simulate/EntityState";
import { CombatSimulator, type HitResolution, type DamageByType } from "../../simulate/combat/CombatSimulator";
import type { StatusEffect } from "@shared/types";
import type { UnitClass } from "../../contracts/unit-class";
import { syntheticHostile } from "../hostile-entity";
import { dotTickValue, type DotType } from "../../formulas/status/dot-tick";
import type { DotPulse } from "../../formulas/status/dot-timeline";

/** Facción sentinela ausente de `FACTION_BONUS` → matriz③ = ×1.0 para todo tipo (faction diferido). */
export const ISOLATED_FACTION = "Isolated";

export interface IsolatedTargetSpec {
  health?: number;   // default 1000
  armor?: number;    // default 0 (sin armor → sin DR)
  shields?: number;  // default 0 (sin shields → todo hit va a salud)
  /**
   * Las dos capas de arriba de la pila (`contracts/layers.ts`). Se declaran acá como cualquier otro
   * número del banco: lo que se ejerce es la LEY de consumo, no de dónde sale la cantidad.
   *
   * El Overguard **sí** tiene origen desde #38 (`HostileIntent.isEximus`, probado end-to-end en
   * `receiver-law.test.ts`); declararlo acá igual es deliberado — un número elegido a mano hace el caso
   * legible y no ata el test de LEY al dato del catálogo. `overshield` sigue sin ningún origen.
   */
  overguard?: number;
  overshield?: number;
  /** Status pre-declarado (C1): el consumidor fija N stacks por efecto, sin timeline. */
  stacks?: Partial<Record<StatusEffect, number>>;
  /**
   * Qué unidad es — la llave de los desvíos de ley del **receptor** (`arch-decisions §17`). Se declara
   * igual que todo lo demás del banco: lo que se ejerce es la ley, no de dónde salió la clase.
   */
  unitClass?: UnitClass;
  /**
   * Qué le **pasó** — la otra llave del receptor, adquirida en vez de intrínseca al molde (marca de
   * Hydroid, #8). Se declara con el mismo criterio que `overguard`: **el origen no está modelado**, y
   * lo que este banco ejerce es la ley de consumo, no de dónde salió la marca.
   */
  marks?: readonly string[];
}

/** Construye un `EntityState` aislado, faction-neutral, con status declarado. */
export function makeIsolatedTarget(spec: IsolatedTargetSpec = {}): EntityState {
  const health = spec.health ?? 1000;
  const armor = spec.armor ?? 0;
  const shields = spec.shields ?? 0;

  // Objetivo SINTÉTICO: no pasa por el catálogo. Un test de ley que dependiera del dato del juego se
  // rompería cuando ese dato cambie, y acá lo que se ejerce es el behavior, no el enemigo.
  const entity = syntheticHostile({
    uniqueName: "isolated-target",
    faction: ISOLATED_FACTION,
    health, armor, shields,
    ...(spec.unitClass ? { unitClass: spec.unitClass } : {}),
  });

  const state = new EntityState(entity);
  state.current_overguard  = spec.overguard ?? 0;
  state.current_overshield = spec.overshield ?? 0;
  if (spec.marks) state.marks = spec.marks;
  // Status pre-declarado (C1): materializa el estado de proc del modelo unificado directamente.
  // corrosion/infection/disruption = `{ count }`; ignite (Heat) = su pool + ignite stacks;
  // freeze (Cold) = contador + el reloj de la congelación.
  //
  // ⚠️ **Un efecto con estado propio tiene que declararse ENTERO acá.** `freeze` se escribía como
  // `{ count }` y su `frozenUntil` quedaba `undefined`: el behavior lo leía como "congelado" (en JS
  // `undefined !== null`), así que un target con 5 stacks declarados cobraba el `+1.0×` de la
  // congelación sólida y su contador **no decaía nunca**. El behavior ahora se defiende (`isFrozen`
  // usa `!= null`), pero el arreglo de fondo es éste: el harness FABRICA el input, y un input a
  // medias es un estado que producción no puede alcanzar.
  //
  // Declarar `freeze: 10` da **10 stacks sin congelar**, que es coherente con lo que este banco hace
  // en todos los casos: declara el contador, no el ciclo de vida. Para ejercer la congelación real se
  // usa `applyProc` por el camino del behavior (ver `freeze.test.ts`).
  if (spec.stacks) {
    for (const [effect, count] of Object.entries(spec.stacks) as Array<[StatusEffect, number]>) {
      if (!count) continue;
      if (effect === "ignite") state.effectStates.set(effect, { pool: 0, ignite: count, firstProcTime: 0 });
      else if (effect === "freeze") state.effectStates.set(effect, { count, frozenUntil: null });
      else state.effectStates.set(effect, { count });
    }
  }
  return state;
}

/**
 * Resuelve una instancia de daño aislada (damageMap keyeado por `DamageType`) contra el target.
 * Delega en `CombatSimulator.resolveHit` — el punto de resolución real del motor.
 *
 * ⚠️ Recibía `Record<string, number>`, que es asignable al tipo estricto y por lo tanto **compilaba
 * igual** tras el corte: el banco podía seguir declarando llaves que ninguna instancia real produce.
 * La firma estrecha existe para que el compilador rechace eso acá también.
 */
export function resolveIsolated(
  damage: DamageByType,
  target: EntityState,
  currentTime = 0,
): HitResolution {
  return CombatSimulator.resolveHit(damage, target, currentTime);
}

/**
 * Instancia de daño sintética (lado source) — gemelo mínimo de `IsolatedTargetSpec`. Carga SÓLO
 * los inputs que el valor del tick necesita (§14: la instancia es un dato, el tick una función
 * sobre ella). Es un proto-`DamageInstance` (O5): cuando ese tipo materialice, este spec se
 * reemplaza por él, no se conserva como gemelo. El tick es source-side (no depende del target);
 * el target entra recién en la aplicación (timeline, Slice 3).
 */
export interface IsolatedInstanceSpec {
  /** Daño base modificado TOTAL de la instancia (sin faction). */
  moddedBase: number;
  /** +% mods del propio elemento (ignorado para Slash — excepción). */
  ownElementBonusPct?: number;
  /** +% status damage. */
  statusDamageBonusPct?: number;
}

/** Computa el valor de un tick de DoT desde la instancia sintética (parte no-faction, no-timeline). */
export function tickFromInstance(type: DotType, inst: IsolatedInstanceSpec): number {
  return dotTickValue(type, inst.moddedBase, inst.ownElementBonusPct ?? 0, inst.statusDamageBonusPct ?? 0);
}

/**
 * Escenario de tiro **forzado** (100% status) — andamiaje SINTÉTICO de test (no producción): vaciar
 * `shots` balas a `fireRate`, cada una con `multishot` pellets, cada pellet una **instancia forzada**
 * de DoT (uncapped — Slash/Toxin). Fabrica una lista de pulsos DECLARADA para el tramo (a) del método
 * (composición a 100%, sin dados, número exacto). Vive acá y no en `formulas/` porque FABRICA el input
 * (como makeIsolatedTarget), no computa sobre él. La generación de eventos REAL (fire rate × status
 * chance × RNG) es el tramo (b), otra cosa. NO modela caps (fuga 4).
 */
export interface ForcedFiringScenario {
  shots: number;          // balas disparadas
  fireRate: number;       // disparos por segundo
  multishot?: number;     // pellets por disparo, cada uno instancia forzada (default 1)
  procDelay?: number;     // delay al primer tick (default 1)
  ticks: number;          // ticks por instancia (duración en ticks)
  tickValue: number;      // daño por tick (amplitud del pulso)
  tickInterval?: number;  // segundos entre ticks (default 1)
}

/** Expande el escenario forzado a la lista de pulsos DECLARADA (una por pellet por disparo). */
export function forcedFiringPulses(s: ForcedFiringScenario): DotPulse[] {
  const multishot = s.multishot ?? 1;
  const procDelay = s.procDelay ?? 1;
  const pulses: DotPulse[] = [];
  for (let shot = 0; shot < s.shots; shot++) {
    const shotTime = shot / s.fireRate;
    for (let pellet = 0; pellet < multishot; pellet++) {
      pulses.push({
        firstTick: shotTime + procDelay,
        ticks: s.ticks,
        value: s.tickValue,
        interval: s.tickInterval,
      });
    }
  }
  return pulses;
}
