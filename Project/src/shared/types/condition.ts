/**
 * @domain Shared / Types / Condition
 * @SSoT docs/semantic/condition-nature.md (naturaleza facetada + reglas de composición)
 *       docs/data/rules/overrides.md §Prototipo de condition (shape obj-key)
 *
 * Vocabulario endógeno (D-19) de condiciones: "bajo qué circunstancia aplica el
 * modifier de un stat". A diferencia de Upgrade —que hereda su universo de DE—
 * condition lo inventa el proyecto: este diccionario ES su ancla canónica.
 *
 * Diccionario incremental: se puebla por familia, de a poco. NO incluye todo el
 * vocabulario capturado. Los casos relacionales / secuenciales ("falopa") quedan
 * como string opaco en el override, fuera de este diccionario tipado — ver
 * overrides.md §Prototipo. Lo que no encaja en una familia no se fuerza.
 *
 * `evalCondition` ya está cableado — `SimulationEngine.ts` lo usa para gatear `Modifier.condition`
 * contra `context.flags` en la resolución del grafo. Lo que sigue sin construir es la migración del
 * shape a obj-key en el resto de los overrides, y el mismo mecanismo para familias de tipo que no
 * pasan por el grafo (`AbilityEmission`/`DamageInstance` — `getEmissions()` no recibe `flags` ni
 * tiene un punto de re-evaluación diferida análogo, ver `docs/governance/decision-frontier.md` §G-a).
 */

// ─── ConditionToken ──────────────────────────────────────────────────────────
// Diccionario de tokens atómicos. La naturaleza se DERIVA del prefijo
// (ver getConditionNature) — no se reifica aquí; el prefijo ya la carga.
// Fuente de verdad: el array CONDITIONS — el tipo se deriva de él, no al revés.
//
// Primer lote (2026-06-05): familia de hits — eventos puntuales, scope jugador/arma.

export const CONDITIONS = [
  // ── Evento — hits (on_) ─────────────────────────────────────────────────
  'on_hit',
  // on_headshot ⊂ on_weakpoint_hit: la cabeza es UN weak point, y un efecto redactado sobre
  // "headshot" NO aplica a los demás. No colapsan — ver condition-nature.md §subsunción.
  'on_headshot',
  'on_critical_hit',
  'on_weakpoint_hit',
  'on_melee_hit',
  // ── Estado — movimiento / postura del jugador (while_) ───────────────────
  // Familia de maniobra. Exclusiones mutuas en condition-nature.md (airborne↔grounded,
  // aim_gliding↔sliding) — base del futuro linter de `all` imposible.
  'while_aiming',
  'while_aim_gliding',
  'while_airborne',
  'while_sliding',
  'while_crouching',
  'while_blocking',
  // ── Estado — status del target (while_target_affected_by_*) ──────────────
  // Scope target (ortogonal a la naturaleza estado — ver condition-nature.md).
  'while_target_affected_by_cold',
  'while_target_affected_by_electricity',
  'while_target_affected_by_puncture',
  'while_target_affected_by_slash',
  'while_target_affected_by_toxin',
  // ── Evento — break defensivo del target (on_*_break) ─────────────────────
  'on_shield_break',
  'on_overguard_break',
  // ── Evento — maniobra de parkour del jugador (on_*) ──────────────────────
  'on_dodge',
  'on_double_jump',
  'on_bullet_jump',
  // ── STUB — compuesto no descompuesto (semántica diferida, NO migrar el dato) ──
  // on_hit_incarnon_form (Devastation Cascade): sería {all:[<hit>, while_incarnon_form]} pero <hit>
  // sigue incierto por UN eje: "fully charged blast" podría ser scope del efecto o un
  // on_charged_blast_hit propio. El otro eje ya está cerrado — on_headshot y on_weakpoint_hit son
  // dos mecánicas, no una (ver arriba). Catalogado como flag-paraguas (evalCondition lo trata como
  // token único) hasta verificar en juego.
  'on_hit_incarnon_form',
] as const

export type ConditionToken = (typeof CONDITIONS)[number]

const CONDITION_SET = new Set<ConditionToken>(CONDITIONS)

export function isConditionToken(value: string): value is ConditionToken {
  return CONDITION_SET.has(value as ConditionToken)
}

// ─── ConditionNature ─────────────────────────────────────────────────────────
// Faceta de naturaleza, derivada del prefijo (espejo de getUpgradeFamily).
// Categorías canónicas y su semántica: docs/semantic/condition-nature.md.
//   event     → on_     (momento puntual; el modifier vive en la ventana del trigger)
//   state     → while_  (flag booleano continuo)
//   threshold → with_   (comparación de un stat contra N)
//   scale     → per_    (factor proporcional — naturaleza en disputa, ver condition-nature.md)

export type ConditionNature = 'event' | 'state' | 'threshold' | 'scale'

export function getConditionNature(token: ConditionToken): ConditionNature {
  if (token.startsWith('on_')) return 'event'
  if (token.startsWith('while_')) return 'state'
  if (token.startsWith('with_')) return 'threshold'
  return 'scale' // per_
}

// ─── ConditionExpr ───────────────────────────────────────────────────────────
// Shape de composición sobre tokens atómicos (prototipo — overrides.md §Prototipo).
// `any` = OR, `all` = AND: intención EXPLÍCITA del autor, no derivable de la sintaxis
// (el "and"/"or" del label es coloquial). Un nivel, sin anidar.
// Lo no expresable aquí (anidado / secuencial / relacional) → fórmula dedicada.

export type ConditionExpr =
  | ConditionToken
  | { any: ConditionToken[] }
  | { all: ConditionToken[] }

// ─── ConditionInput ──────────────────────────────────────────────────────────
// Shape runtime / dato: el evaluador y el contrato del override operan sobre strings.
// Los flags son string-keyed, el diccionario es incremental, y los casos "falopa" viven
// como string opaco no-catalogado. `ConditionExpr` (ConditionToken catalogado) es el
// subtipo de AUTORÍA: todo `ConditionExpr` es `ConditionInput` válido; lo inverso no se
// exige. Precedente: `upgrade_type: string` en el raw — `UPGRADES` cataloga aparte.

export type ConditionInput =
  | string
  | { any: string[] }
  | { all: string[] }

// ─── evalCondition ───────────────────────────────────────────────────────────
// Semántica de evaluación del shape: función pura (cond, flags) → bool. No conoce
// el engine, solo el mapa de flags del SimContext.
//   null/undefined → true        (sin condición; activo — D-15)
//   string         → flags[token]  (lookup; ausente → false — D-15; retrocompat bit-idéntico)
//   { any: [...] } → OR  (algún token activo)
//   { all: [...] } → AND (todos los tokens activos)

export function evalCondition(
  cond: ConditionInput | null | undefined,
  flags: Record<string, boolean>,
): boolean {
  if (!cond) return true
  if (typeof cond === 'string') return !!flags[cond]
  if ('any' in cond) return cond.any.some((t) => !!flags[t])
  return cond.all.every((t) => !!flags[t])
}

// ─── conditionTokens ─────────────────────────────────────────────────────────
// Extrae los tokens atómicos de un ConditionInput. Lo usa el flag-setting del
// MutatorBridge (modo estático): activa cada átomo, no la expresión completa
// (`flags[{any:[…]}]` rompería). Con todos los átomos en true, {any} y {all}
// evalúan true — "todas las condiciones cumplidas", coherente con el modo estático.
//   null/undefined → []   ·   string → [token]   ·   {any|all} → la lista

export function conditionTokens(cond: ConditionInput | null | undefined): string[] {
  if (!cond) return []
  if (typeof cond === 'string') return [cond]
  if ('any' in cond) return cond.any
  return cond.all
}
