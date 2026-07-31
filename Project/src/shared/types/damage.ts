/**
 * @domain Shared / Types / Damage
 * @SSoT docs/semantic/damage-types.md
 */
export type DamageType =
  | 'impact' | 'puncture' | 'slash'
  | 'heat' | 'cold' | 'electricity' | 'toxin'
  | 'blast' | 'corrosive' | 'gas' | 'magnetic' | 'radiation' | 'viral'
  | 'void' | 'tau' | 'true' | 'none';

/**
 * Vocabulario canónico de EFECTOS de status (procs). Faceta target-side del tipo de daño:
 * `instancia [DamageType] → resolución vs target → estado [StatusEffect]`. Identidad 1:1 fija con
 * el tipo (Arista 1), pero concepto distinto: es lo que MATERIALIZA en el target, agnóstico a la
 * resolución. SSoT del NOMBRE; la LEY (qué hace N stacks) es mecánica y vive en
 * `engine/formulas/status/` (eje ortogonal). Ver `docs/semantic/damage-types.md §Arista 1`.
 */
export type StatusEffect =
  | 'stagger' | 'weakened' | 'bleed'
  | 'ignite' | 'freeze' | 'tesla_chain' | 'poison'
  | 'detonation' | 'corrosion' | 'gas_cloud' | 'disruption' | 'confusion' | 'infection'
  | 'bullet_attraction' | 'tau';

export type DamageTypeFamily = 'physical' | 'elemental' | 'combined' | 'special' | 'none'
export type DamageIconVariant = 'colored' | 'outline'

export interface DamageTypeDefinition {
  family: DamageTypeFamily
  iconAsset: string | null
  aliases?: readonly string[]
  rawTags?: readonly string[]
  label: string
  statusLabel: string
  /** Token canónico del efecto (proc) que dispara este tipo — `null` si no dispara (true, none). */
  statusEffect: StatusEffect | null
  description: string
}

export const DAMAGE_TYPES: DamageType[] = [
  'impact', 'puncture', 'slash',
  'heat', 'cold', 'electricity', 'toxin',
  'blast', 'corrosive', 'gas', 'magnetic', 'radiation', 'viral',
  'void', 'tau', 'true', 'none',
]

export const DAMAGE_TYPE_DEFINITIONS: Record<DamageType, DamageTypeDefinition> = {
  impact: {
    family: 'physical',
    iconAsset: 'impact',
    rawTags: ['DT_IMPACT'],
    label: 'Impact',
    statusLabel: 'Stagger',
    statusEffect: 'stagger',
    description: 'Staggers the enemy and increases the health threshold for Mercy finishers.',
  },
  puncture: {
    family: 'physical',
    iconAsset: 'puncture',
    rawTags: ['DT_PUNCTURE'],
    label: 'Puncture',
    statusLabel: 'Weakened',
    statusEffect: 'weakened',
    description: 'Reduces the damage dealt by the enemy and increases critical hit chance against them.',
  },
  slash: {
    family: 'physical',
    iconAsset: 'slash',
    rawTags: ['DT_SLASH'],
    label: 'Slash',
    statusLabel: 'Bleed',
    statusEffect: 'bleed',
    description: 'Deals damage over time that bypasses armor.',
  },
  heat: {
    family: 'elemental',
    iconAsset: 'heat',
    aliases: ['fire'],
    rawTags: ['DT_HEAT', 'DT_FIRE'],
    label: 'Heat',
    statusLabel: 'Ignite',
    statusEffect: 'ignite',
    description: 'Deals fire damage over time, causes panic, and reduces enemy armor by 50%.',
  },
  cold: {
    family: 'elemental',
    iconAsset: 'cold',
    aliases: ['freeze'],
    rawTags: ['DT_COLD', 'DT_FREEZE'],
    label: 'Cold',
    statusLabel: 'Freeze',
    statusEffect: 'freeze',
    description: 'Reduces enemy movement and attack speed, while increasing critical hit damage.',
  },
  electricity: {
    family: 'elemental',
    iconAsset: 'electric',
    aliases: ['electric'],
    rawTags: ['DT_ELECTRICITY', 'DT_ELECTRIC'],
    label: 'Electricity',
    statusLabel: 'Tesla Chain',
    statusEffect: 'tesla_chain',
    description: 'Stuns the enemy and deals damage to nearby enemies in a chain.',
  },
  toxin: {
    family: 'elemental',
    iconAsset: 'toxic',
    aliases: ['poison', 'toxic'],
    rawTags: ['DT_TOXIN', 'DT_POISON'],
    label: 'Toxin',
    statusLabel: 'Poison',
    statusEffect: 'poison',
    description: 'Deals damage over time that bypasses shields.',
  },
  blast: {
    family: 'combined',
    iconAsset: 'blast',
    aliases: ['explosion'],
    rawTags: ['DT_BLAST', 'DT_EXPLOSION'],
    label: 'Blast',
    statusLabel: 'Detonation',
    statusEffect: 'detonation',
    description: 'Causes a mini-explosion that reduces enemy accuracy.',
  },
  corrosive: {
    family: 'combined',
    iconAsset: 'corrosive',
    rawTags: ['DT_CORROSIVE'],
    label: 'Corrosive',
    statusLabel: 'Corrosion',
    statusEffect: 'corrosion',
    description: 'Reduces enemy armor permanently by a percentage.',
  },
  gas: {
    family: 'combined',
    iconAsset: 'gas',
    rawTags: ['DT_GAS'],
    label: 'Gas',
    statusLabel: 'Gas Cloud',
    statusEffect: 'gas_cloud',
    description: 'Creates a cloud that deals damage over time to all enemies within.',
  },
  magnetic: {
    family: 'combined',
    iconAsset: 'magnetic',
    rawTags: ['DT_MAGNETIC'],
    label: 'Magnetic',
    statusLabel: 'Disruption',
    statusEffect: 'disruption',
    description: 'Increases damage dealt to shields and overguard, and delays shield regeneration.',
  },
  radiation: {
    family: 'combined',
    iconAsset: 'radiation',
    aliases: ['radiant'],
    rawTags: ['DT_RADIATION', 'DT_RADIANT'],
    label: 'Radiation',
    statusLabel: 'Confusion',
    statusEffect: 'confusion',
    description: 'Causes enemies to attack their own allies.',
  },
  viral: {
    family: 'combined',
    iconAsset: 'viral',
    rawTags: ['DT_VIRAL'],
    label: 'Viral',
    statusLabel: 'Infection',
    statusEffect: 'infection',
    description: 'Increases all damage dealt to the enemy health.',
  },
  void: {
    family: 'special',
    iconAsset: 'void',
    rawTags: ['DT_VOID'],
    label: 'Void',
    statusLabel: 'Bullet Attraction',
    statusEffect: 'bullet_attraction',
    description: 'Creates a bullet attraction field on the enemy.',
  },
  tau: {
    family: 'special',
    iconAsset: 'sentient',
    aliases: ['sentient'],
    rawTags: ['DT_TAU', 'DT_SENTIENT'],
    label: 'Tau',
    statusLabel: 'Tau',
    statusEffect: 'tau',
    description: 'Increases the likelihood of other status effects occurring.',
  },
  true: {
    family: 'special',
    iconAsset: 'true',
    aliases: ['finisher'],
    rawTags: ['DT_TRUE', 'DT_FINISHER'],
    label: 'True Damage',
    statusLabel: 'True Damage',
    statusEffect: null,
    description: 'Deals raw damage that ignores all forms of resistance and armor.',
  },
  none: {
    family: 'none',
    iconAsset: null,
    label: '',
    statusLabel: 'None',
    statusEffect: null,
    description: '',
  },
}

const DAMAGE_TYPE_SET = new Set<DamageType>(DAMAGE_TYPES)

const DAMAGE_TYPE_ALIAS_MAP = DAMAGE_TYPES.reduce((map, type) => {
  map[type] = type

  for (const alias of DAMAGE_TYPE_DEFINITIONS[type].aliases ?? []) {
    map[alias] = type
  }

  return map
}, {} as Record<string, DamageType>)

const DAMAGE_TYPE_TAG_MAP = DAMAGE_TYPES.reduce((map, type) => {
  for (const rawTag of DAMAGE_TYPE_DEFINITIONS[type].rawTags ?? []) {
    map[rawTag] = type
  }

  return map
}, {} as Record<string, DamageType>)

export type DamageMap = Partial<Record<DamageType, number>> & { [key: string]: number | undefined }

export function isDamageType(value: string): value is DamageType {
  return DAMAGE_TYPE_SET.has(value as DamageType)
}

/** El efecto (proc) que dispara un tipo de daño — `null` si no dispara (true, none). Arista 1. */
export function effectOfDamageType(type: DamageType): StatusEffect | null {
  return DAMAGE_TYPE_DEFINITIONS[type].statusEffect
}

export function normalizeDamageType(value: string | DamageType): DamageType | null {
  const normalized = String(value).trim().toLowerCase()
  return DAMAGE_TYPE_ALIAS_MAP[normalized] ?? null
}

export function resolveDamageTypeTag(value: string): DamageType | null {
  const normalized = String(value)
    .trim()
    .toUpperCase()
    .replace(/_COLOR$|_OUTLINE$/, '')

  return DAMAGE_TYPE_TAG_MAP[normalized] ?? null
}

export function getDamageTypeDefinition(value: string | DamageType) {
  const key = normalizeDamageType(value)

  if (!key) {
    return null
  }

  return {
    key,
    ...DAMAGE_TYPE_DEFINITIONS[key],
  }
}

export function getDamageTypeIconPath(value: string | DamageType, variant: DamageIconVariant): string | null {
  const definition = getDamageTypeDefinition(value)

  if (!definition?.iconAsset) {
    return null
  }

  return `/assets/damage-type/${definition.iconAsset}-${variant}.png`
}

export type WeaponShotType = 'AoE' | 'Projectile' | 'Hit-Scan' | 'Thrown' | 'DoT' | 'unknown'

export interface WeaponAttack {
  name: string
  damage?: DamageMap
  total_damage?: number
  crit_chance?: number | null
  crit_mult?: number | null
  status_chance?: number | null
  speed?: number | null
  shot_type?: WeaponShotType | null
  flight?: number | null
  falloff?: { start: number; end: number; reduction: number } | null
  slide?: string | null
  charge_time?: number | null
  punch_through?: number | null
  /**
   * Dispersión del cono en grados, sin mods. El par —no el escalar `accuracy` del arma—
   * es el dato del que sale todo: `accuracy = 100 / ((min + max) / 2)`, una media que
   * pierde la dispersión (dos armas con el mismo `accuracy` pueden abrir muy distinto).
   *
   * Viene de `Module:Weapons/data` vía omniframe-items; el Public Export no lo publica.
   * `null` = la fuente no lo trae para este ataque, y ausente ≠ 0 (0 sería puntería
   * perfecta). Los AoE no lo llevan a propósito: no responden a modificadores de precisión.
   */
  min_spread?: number | null
  max_spread?: number | null
}
