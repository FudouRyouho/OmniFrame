/**
 * stat-labels.ts
 * Labels de presentación para stats de armas y mods.
 * Capa de Traducción — nunca importar desde lógica de cálculo.
 *
 * Scope actual: inglés exclusivo. No existe soporte multi-locale en runtime.
 */

// ── Weapon stat labels ────────────────────────────────────────────────────────

type WeaponStatLabels = {
  // Attack stats
  speed:             string
  charge_time:       string
  crit_chance:       string
  crit_mult:         string
  status_chance:     string
  flight:            string
  slide:             string
  shot_type:         string
  // Weapon top-level — ranged
  magazineSize:      string
  reloadTime:        string
  multishot:         string
  accuracy:          string
  noise:             string
  trigger:           string
  // Weapon top-level — melee
  range:             string
  attackSpeed:       string
  comboDuration:     string
  followThrough:     string
  blockingAngle:     string
  windUp:            string
  stancePolarity:    string
  slideAttack:       string
  heavyAttackDamage: string
  // Damage section
  damage:            string
  totalDamage:       string
}

export const WEAPON_STAT_LABELS: WeaponStatLabels = {
  speed:             'FIRE RATE',
  charge_time:       'CHARGE TIME',
  crit_chance:       'CRIT CHANCE',
  crit_mult:         'CRIT MULTIPLIER',
  status_chance:     'STATUS CHANCE',
  flight:            'FLIGHT SPEED',
  slide:             'SLIDE ATTACK',
  shot_type:         'SHOT TYPE',
  magazineSize:      'MAGAZINE',
  reloadTime:        'RELOAD',
  multishot:         'MULTISHOT',
  accuracy:          'ACCURACY',
  noise:             'NOISE',
  trigger:           'TRIGGER',
  range:             'RANGE',
  attackSpeed:       'ATTACK SPEED',
  comboDuration:     'COMBO DURATION',
  followThrough:     'FOLLOW THROUGH',
  blockingAngle:     'BLOCKING ANGLE',
  windUp:            'WIND UP',
  stancePolarity:    'STANCE POLARITY',
  slideAttack:       'SLIDE ATTACK',
  heavyAttackDamage: 'HEAVY ATTACK',
  damage:            'DAMAGE',
  totalDamage:       'TOTAL',
}

// ── Mod stat labels ───────────────────────────────────────────────────────────

type ModStatLabels = {
  type:      string
  rarity:    string
  polarity:  string
  baseDrain: string
  rank:      string
  effects:   string
}

export const MOD_STAT_LABELS: ModStatLabels = {
  type:      'TYPE',
  rarity:    'RARITY',
  polarity:  'POLARITY',
  baseDrain: 'BASE DRAIN',
  rank:      'MAX RANK',
  effects:   'EFFECTS (MAX RANK)',
}

// ── Lookup helpers ────────────────────────────────────────────────────────────

export const getWeaponStatLabels = (): WeaponStatLabels => WEAPON_STAT_LABELS

export const getModStatLabels = (): ModStatLabels => MOD_STAT_LABELS
