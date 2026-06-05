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
 * Fase 1 (aislado): este módulo NO está cableado al engine todavía. El evaluador
 * (evalCondition) y la migración del shape a obj-key son fases posteriores.
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
  'on_headshot',
  'on_critical_hit',
  'on_weakpoint_hit',
  'on_melee_hit',
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

// ─── evalCondition ───────────────────────────────────────────────────────────
// Semántica de evaluación del shape: función pura (cond, flags) → bool. No conoce
// el engine, solo el mapa de flags del SimContext.
//
// El parámetro es runtime-genérico (strings), no `ConditionExpr`: en runtime los
// flags son string-keyed, el diccionario es incremental, y los casos "falopa" viven
// como string opaco no-catalogado. `ConditionExpr` (ConditionToken) es el subtipo de
// AUTORÍA — todo `ConditionExpr` es entrada válida; lo inverso no se exige.
//
//   null/undefined → true        (sin condición; activo — D-15)
//   string         → flags[token]  (lookup; ausente → false — D-15; retrocompat bit-idéntico)
//   { any: [...] } → OR  (algún token activo)
//   { all: [...] } → AND (todos los tokens activos)

export function evalCondition(
  cond: string | { any: string[] } | { all: string[] } | null | undefined,
  flags: Record<string, boolean>,
): boolean {
  if (!cond) return true
  if (typeof cond === 'string') return !!flags[cond]
  if ('any' in cond) return cond.any.some((t) => !!flags[t])
  return cond.all.every((t) => !!flags[t])
}
