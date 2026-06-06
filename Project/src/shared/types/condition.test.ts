import { describe, it, expect } from 'vitest'
import { evalCondition, conditionTokens } from './condition'

/**
 * Fase 2 — validación del evaluador del shape de condition.
 * Casos reales del corpus (overrides), token-agnósticos: la mecánica OR/AND es la
 * misma para cualquier token. Los tokens de movimiento/stalker entran como string
 * (aún no catalogados en CONDITIONS — eso es Fase 3/4); evalCondition es runtime-genérico.
 */
describe('evalCondition', () => {
  it('sin condición → activo (D-15 default)', () => {
    expect(evalCondition(undefined, {})).toBe(true)
    expect(evalCondition(null, {})).toBe(true)
  })

  it('string → lookup de flag (retrocompat, bit-idéntico al comportamiento previo)', () => {
    expect(evalCondition('on_hit', { on_hit: true })).toBe(true)
    expect(evalCondition('on_hit', {})).toBe(false) // ausente → inactivo (D-15)
    expect(evalCondition('on_hit', { on_hit: false })).toBe(false)
  })

  // ── Casos reales del corpus ────────────────────────────────────────────────

  it('{any} = OR — movimiento (while_sliding_or_aim_gliding)', () => {
    const cond = { any: ['while_sliding', 'while_aim_gliding'] }
    expect(evalCondition(cond, { while_sliding: true })).toBe(true)
    expect(evalCondition(cond, { while_aim_gliding: true })).toBe(true)
    expect(evalCondition(cond, { while_sliding: true, while_aim_gliding: true })).toBe(true)
    expect(evalCondition(cond, {})).toBe(false)
  })

  it('{all} = AND — evento∧estado (on_hit_while_target_affected_by_electricity)', () => {
    const cond = { all: ['on_hit', 'while_target_affected_by_electricity'] }
    expect(evalCondition(cond, { on_hit: true, while_target_affected_by_electricity: true })).toBe(true)
    expect(evalCondition(cond, { on_hit: true })).toBe(false) // falta el estado → inactivo
    expect(evalCondition(cond, { while_target_affected_by_electricity: true })).toBe(false)
    expect(evalCondition(cond, {})).toBe(false)
  })

  it('{all} = AND — par stalker co-ocurrente (while_dread_and_hate_equipped)', () => {
    const cond = { all: ['while_dread_equipped', 'while_hate_equipped'] }
    expect(evalCondition(cond, { while_dread_equipped: true, while_hate_equipped: true })).toBe(true)
    expect(evalCondition(cond, { while_dread_equipped: true })).toBe(false)
  })

  it('un solo flag falso colapsa el AND; un solo flag verdadero satisface el OR', () => {
    expect(evalCondition({ all: ['a', 'b', 'c'] }, { a: true, b: true, c: false })).toBe(false)
    expect(evalCondition({ any: ['a', 'b', 'c'] }, { a: false, b: false, c: true })).toBe(true)
  })
})

describe('conditionTokens', () => {
  it('null/undefined → []', () => {
    expect(conditionTokens(undefined)).toEqual([])
    expect(conditionTokens(null)).toEqual([])
  })

  it('string → [token]', () => {
    expect(conditionTokens('on_hit')).toEqual(['on_hit'])
  })

  it('{any|all} → la lista de átomos', () => {
    expect(conditionTokens({ any: ['while_sliding', 'while_aim_gliding'] })).toEqual([
      'while_sliding',
      'while_aim_gliding',
    ])
    expect(conditionTokens({ all: ['on_hit', 'while_incarnon_form'] })).toEqual([
      'on_hit',
      'while_incarnon_form',
    ])
  })

  it('integración modo estático: setear cada átomo → {all} y {any} cumplen', () => {
    const cond = { all: ['while_dread_equipped', 'while_hate_equipped'] }
    const flags: Record<string, boolean> = {}
    for (const t of conditionTokens(cond)) flags[t] = true
    expect(evalCondition(cond, flags)).toBe(true)
  })
})
