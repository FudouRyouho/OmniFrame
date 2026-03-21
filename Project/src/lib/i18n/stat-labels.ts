/**
 * stat-labels.ts
 * Labels de presentación para stats de armas y mods.
 * Capa de Traducción — nunca importar desde lógica de cálculo.
 *
 * Para añadir un locale nuevo: añadir una entrada en WEAPON_STAT_LABELS y MOD_STAT_LABELS
 * con las mismas keys. El selector de locale se implementará más adelante.
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

export const WEAPON_STAT_LABELS: Record<string, WeaponStatLabels> = {
  en: {
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
  },
  es: {
    speed:             'CADENCIA',
    charge_time:       'T. CARGA',
    crit_chance:       'PROB. CRÍTICA',
    crit_mult:         'MULT. CRÍTICO',
    status_chance:     'PROB. ESTADO',
    flight:            'VEL. PROYECTIL',
    slide:             'DESLIZAMIENTO',
    shot_type:         'TIPO DISPARO',
    magazineSize:      'CARGADOR',
    reloadTime:        'RECARGA',
    multishot:         'MULTISHOT',
    accuracy:          'PRECISIÓN',
    noise:             'RUIDO',
    trigger:           'DISPARO',
    range:             'ALCANCE',
    attackSpeed:       'VEL. ATAQUE',
    comboDuration:     'DUR. COMBO',
    followThrough:     'SEGUIMIENTO',
    blockingAngle:     'ÁNGULO BLOQUEO',
    windUp:            'PREPARACIÓN',
    stancePolarity:    'POL. POSTURA',
    slideAttack:       'ATAQUE DESLIZ.',
    heavyAttackDamage: 'ATAQUE PESADO',
    damage:            'DAÑO',
    totalDamage:       'TOTAL',
  },
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

export const MOD_STAT_LABELS: Record<string, ModStatLabels> = {
  en: {
    type:      'TYPE',
    rarity:    'RARITY',
    polarity:  'POLARITY',
    baseDrain: 'BASE DRAIN',
    rank:      'MAX RANK',
    effects:   'EFFECTS (MAX RANK)',
  },
  es: {
    type:      'TIPO',
    rarity:    'RAREZA',
    polarity:  'POLARIDAD',
    baseDrain: 'COSTE BASE',
    rank:      'RANGO MÁX.',
    effects:   'EFECTOS (RANGO MÁX.)',
  },
}

// ── Locale helpers ────────────────────────────────────────────────────────────

/** Default locale — change this when locale switching is implemented */
export const DEFAULT_LOCALE = 'en'

export const getWeaponStatLabels = (locale = DEFAULT_LOCALE): WeaponStatLabels =>
  WEAPON_STAT_LABELS[locale] ?? WEAPON_STAT_LABELS[DEFAULT_LOCALE]

export const getModStatLabels = (locale = DEFAULT_LOCALE): ModStatLabels =>
  MOD_STAT_LABELS[locale] ?? MOD_STAT_LABELS[DEFAULT_LOCALE]
