import {
  DAMAGE_TYPES,
  DAMAGE_TYPE_DEFINITIONS,
  type DamageType,
} from '../../shared/types'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type DamageLabels       = Record<Exclude<DamageType, 'none'>, string>
type StatusEffectNames  = Record<DamageType, string>
type DamageDescriptions = Record<DamageType, string>

const DAMAGE_TYPES_WITH_LABEL = DAMAGE_TYPES.filter(
  (type): type is Exclude<DamageType, 'none'> => type !== 'none',
)

function buildDamageLabels(): DamageLabels {
  return Object.fromEntries(
    DAMAGE_TYPES_WITH_LABEL.map((type) => [type, DAMAGE_TYPE_DEFINITIONS[type].label]),
  ) as DamageLabels
}

function buildStatusEffectLabels(): StatusEffectNames {
  return Object.fromEntries(
    DAMAGE_TYPES.map((type) => [type, DAMAGE_TYPE_DEFINITIONS[type].statusLabel]),
  ) as StatusEffectNames
}

function buildDamageDescriptions(): DamageDescriptions {
  return Object.fromEntries(
    DAMAGE_TYPES.map((type) => [type, DAMAGE_TYPE_DEFINITIONS[type].description]),
  ) as DamageDescriptions
}

// ── Nombres de tipos de daño ──────────────────────────────────────────────────

export const DAMAGE_LABELS: DamageLabels = buildDamageLabels()

// ── Nombres de efectos de estado ──────────────────────────────────────────────

export const STATUS_EFFECT_LABELS: StatusEffectNames = buildStatusEffectLabels()

// ── Descripciones de tipos de daño ────────────────────────────────────────────

export const DAMAGE_DESCRIPTIONS: DamageDescriptions = buildDamageDescriptions()

// ── Lookup helpers ────────────────────────────────────────────────────────────

export const getDamageLabels = (): DamageLabels => DAMAGE_LABELS

export const getStatusEffectLabels = (): StatusEffectNames => STATUS_EFFECT_LABELS

export const getDamageDescriptions = (): DamageDescriptions => DAMAGE_DESCRIPTIONS
