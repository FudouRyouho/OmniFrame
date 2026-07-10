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
 * **Anemia visible:** hoy `resolveHit` toma un `damageMap` pelado — no carga bucket②/crit/metadata
 * (instance medio-nacido, §14/O5). Lo que el harness NO puede inyectar aún se registra como `todo`
 * en los per-effect tests; el harness expone el hueco, no lo esconde.
 */
import { EnemyState } from "../../simulate/enemies/EnemyState";
import { CombatSimulator, type HitResolution } from "../../simulate/combat/CombatSimulator";
import { BASELINE_GAME_LAWS } from "../../contracts";
import type { EnemyStatusState, GameLaws } from "../../contracts";
import type { ScaledEnemy } from "../../simulate/enemies/EnemyRepository";

/** Facción sentinela ausente de `FACTION_BONUS` → matriz③ = ×1.0 para todo tipo (faction diferido). */
export const ISOLATED_FACTION = "Isolated";

export interface IsolatedTargetSpec {
  health?: number;   // default 1000
  armor?: number;    // default 0 (sin armor → sin DR)
  shields?: number;  // default 0 (sin shields → todo hit va a salud)
  /** Status pre-declarado (C1): el consumidor fija N stacks por efecto, sin timeline. */
  stacks?: Partial<EnemyStatusState>;
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
  if (spec.stacks) Object.assign(state.stacks, spec.stacks);
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
