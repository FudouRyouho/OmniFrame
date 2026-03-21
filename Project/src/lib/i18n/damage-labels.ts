import type { DamageType } from '../types'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type DamageLabels       = Record<Exclude<DamageType, 'none'>, string>
type StatusEffectNames  = Record<DamageType, string>
type DamageDescriptions = Record<DamageType, string>

// ── Nombres de tipos de daño ──────────────────────────────────────────────────

export const DAMAGE_LABELS: Record<string, DamageLabels> = {
  en: {
    impact:      'Impact',
    puncture:    'Puncture',
    slash:       'Slash',
    heat:        'Heat',
    cold:        'Cold',
    electricity: 'Electricity',
    toxin:       'Toxin',
    blast:       'Blast',
    radiation:   'Radiation',
    gas:         'Gas',
    magnetic:    'Magnetic',
    viral:       'Viral',
    corrosive:   'Corrosive',
    void:        'Void',
    tau:         'Tau',
    true:        'True Damage',
  },
  es: {
    impact:      'Impacto',
    puncture:    'Perforación',
    slash:       'Cortante',
    heat:        'Calor',
    cold:        'Frío',
    electricity: 'Eléctrico',
    toxin:       'Toxina',
    blast:       'Explosivo',
    radiation:   'Radiación',
    gas:         'Gas',
    magnetic:    'Magnético',
    viral:       'Viral',
    corrosive:   'Corrosivo',
    void:        'Vacío',
    tau:         'Tau',
    true:        'Daño Verdadero',
  },
}

// ── Nombres de efectos de estado ──────────────────────────────────────────────

export const STATUS_EFFECT_LABELS: Record<string, StatusEffectNames> = {
  en: {
    impact:      'Stagger',
    puncture:    'Weakened',
    slash:       'Bleed',
    heat:        'Ignite',
    cold:        'Freeze',
    electricity: 'Tesla Chain',
    toxin:       'Poison',
    blast:       'Detonation',
    corrosive:   'Corrosion',
    gas:         'Gas Cloud',
    magnetic:    'Disruption',
    radiation:   'Confusion',
    viral:       'Infection',
    void:        'Bullet Attraction',
    tau:         'Tau',
    true:        'True Damage',
    none:        'None',
  },
  es: {
    impact:      'Tambaleo',
    puncture:    'Debilitado',
    slash:       'Sangrado',
    heat:        'Ignición',
    cold:        'Congelación',
    electricity: 'Cadena Tesla',
    toxin:       'Veneno',
    blast:       'Detonación',
    corrosive:   'Corrosión',
    gas:         'Nube de Gas',
    magnetic:    'Disrupción',
    radiation:   'Confusión',
    viral:       'Infección',
    void:        'Atracción de Proyectiles',
    tau:         'Tau',
    true:        'Daño Verdadero',
    none:        'Ninguno',
  },
}

// ── Descripciones de tipos de daño ────────────────────────────────────────────

export const DAMAGE_DESCRIPTIONS: Record<string, DamageDescriptions> = {
  en: {
    impact:      'Staggers the enemy and increases the health threshold for Mercy finishers.',
    puncture:    'Reduces the damage dealt by the enemy and increases critical hit chance against them.',
    slash:       'Deals damage over time that bypasses armor.',
    heat:        'Deals fire damage over time, causes panic, and reduces enemy armor by 50%.',
    cold:        'Reduces enemy movement and attack speed, while increasing critical hit damage.',
    electricity: 'Stuns the enemy and deals damage to nearby enemies in a chain.',
    toxin:       'Deals damage over time that bypasses shields.',
    blast:       'Causes a mini-explosion that reduces enemy accuracy.',
    corrosive:   'Reduces enemy armor permanently by a percentage.',
    gas:         'Creates a cloud that deals damage over time to all enemies within.',
    magnetic:    'Increases damage dealt to shields and overguard, and delays shield regeneration.',
    radiation:   'Causes enemies to attack their own allies.',
    viral:       'Increases all damage dealt to the enemy health.',
    void:        'Creates a bullet attraction field on the enemy.',
    tau:         'Increases the likelihood of other status effects occurring.',
    true:        'Deals raw damage that ignores all forms of resistance and armor.',
    none:        '',
  },
  es: {
    impact:      'Tambalea al enemigo y aumenta el umbral de salud para los remates de Misericordia.',
    puncture:    'Reduce el daño infligido por el enemigo y aumenta la probabilidad de golpe crítico contra él.',
    slash:       'Inflige daño con el tiempo que ignora la armadura.',
    heat:        'Inflige daño de fuego con el tiempo, causa pánico y reduce la armadura del enemigo un 50%.',
    cold:        'Reduce la velocidad de movimiento y ataque del enemigo, aumentando el daño crítico.',
    electricity: 'Aturde al enemigo e inflige daño a los enemigos cercanos en cadena.',
    toxin:       'Inflige daño con el tiempo que ignora los escudos.',
    blast:       'Causa una mini-explosión que reduce la precisión del enemigo.',
    corrosive:   'Reduce la armadura del enemigo de forma permanente en un porcentaje.',
    gas:         'Crea una nube que inflige daño con el tiempo a todos los enemigos dentro.',
    magnetic:    'Aumenta el daño a escudos y sobreguardia, y retrasa la regeneración de escudos.',
    radiation:   'Hace que los enemigos ataquen a sus propios aliados.',
    viral:       'Aumenta todo el daño infligido a la salud del enemigo.',
    void:        'Crea un campo de atracción de proyectiles sobre el enemigo.',
    tau:         'Aumenta la probabilidad de que ocurran otros efectos de estado.',
    true:        'Inflige daño bruto que ignora toda resistencia y armadura.',
    none:        '',
  },
}

// ── Default locale ────────────────────────────────────────────────────────────

/** Default locale — change this when locale switching is implemented */
export const DEFAULT_LOCALE = 'en'

export const getDamageLabels = (locale = DEFAULT_LOCALE): DamageLabels =>
  DAMAGE_LABELS[locale] ?? DAMAGE_LABELS[DEFAULT_LOCALE]

export const getStatusEffectLabels = (locale = DEFAULT_LOCALE): StatusEffectNames =>
  STATUS_EFFECT_LABELS[locale] ?? STATUS_EFFECT_LABELS[DEFAULT_LOCALE]

export const getDamageDescriptions = (locale = DEFAULT_LOCALE): DamageDescriptions =>
  DAMAGE_DESCRIPTIONS[locale] ?? DAMAGE_DESCRIPTIONS[DEFAULT_LOCALE]
