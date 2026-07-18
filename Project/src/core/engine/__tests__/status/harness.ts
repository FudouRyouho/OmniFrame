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
import { EnemyState } from "../../simulate/enemies/EnemyState";
import { CombatSimulator, type HitResolution } from "../../simulate/combat/CombatSimulator";
import { BASELINE_GAME_LAWS } from "../../contracts";
import type { GameLaws } from "../../contracts";
import type { StatusEffect } from "@shared/types";
import type { ScaledEnemy } from "../../simulate/enemies/EnemyRepository";
import { dotTickValue, type DotType } from "../../formulas/status/dot-tick";
import type { DotPulse } from "../../formulas/status/dot-timeline";

/** Facción sentinela ausente de `FACTION_BONUS` → matriz③ = ×1.0 para todo tipo (faction diferido). */
export const ISOLATED_FACTION = "Isolated";

export interface IsolatedTargetSpec {
  health?: number;   // default 1000
  armor?: number;    // default 0 (sin armor → sin DR)
  shields?: number;  // default 0 (sin shields → todo hit va a salud)
  /** Status pre-declarado (C1): el consumidor fija N stacks por efecto, sin timeline. */
  stacks?: Partial<Record<StatusEffect, number>>;
  laws?: GameLaws;   // default BASELINE_GAME_LAWS
}

/** Construye un `EnemyState` aislado, faction-neutral, con status declarado. */
export function makeIsolatedTarget(spec: IsolatedTargetSpec = {}): EnemyState {
  const health = spec.health ?? 1000;
  const armor = spec.armor ?? 0;
  const shields = spec.shields ?? 0;

  const scaled: ScaledEnemy = {
    dna: {
      unique_name: "isolated-target",
      base_level: 1,
      health,
      health_type: "Health",
      armor,
      armor_type: "None",
      shields,
      shield_type: shields > 0 ? "Shields" : "None",
      faction: ISOLATED_FACTION,
    },
    current_level: 1,
    current_health: health,
    current_armor: armor,
    current_shields: shields,
  };

  const state = new EnemyState(scaled, spec.laws ?? BASELINE_GAME_LAWS);
  // Status pre-declarado (C1): materializa el estado de proc del modelo unificado directamente.
  // corrosion/infection/disruption = `{ count }`; ignite (Heat) = su estado de pool + ignite stacks.
  if (spec.stacks) {
    for (const [effect, count] of Object.entries(spec.stacks) as Array<[StatusEffect, number]>) {
      if (!count) continue;
      state.effectStates.set(
        effect,
        effect === "ignite" ? { pool: 0, ignite: count, firstProcTime: 0 } : { count },
      );
    }
  }
  return state;
}

/**
 * Resuelve una instancia de daño aislada (damageMap keyeado por token D-6) contra el target.
 * Delega en `CombatSimulator.resolveHit` — el punto de resolución real del motor.
 */
export function resolveIsolated(
  damage: Record<string, number>,
  target: EnemyState,
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
