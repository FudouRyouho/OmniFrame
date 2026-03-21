// Tipos del builder — basados en @wfcd/items pero enfocados en lo que necesita el builder

// ── BaseItem Type System ──────────────────────────────────────────────────────

export type Kind = 'warframe' | 'primary' | 'secondary' | 'melee' | 'mod';

export interface BaseItem {
  id: string;              // uniqueName ?? name
  name: string;
  kind: Kind;              // Lowercase category
  image: string | null;    // Full CDN URL
  uniqueName: string;
  type?: string | null;
  masteryReq: number;
  polarities?: string[];
  tags?: string[];
}

export const isWeapon = (item: BaseItem): item is Weapon =>
  item.kind === 'primary' || item.kind === 'secondary' || item.kind === 'melee';

export const isWarframe = (item: BaseItem): item is Warframe =>
  item.kind === 'warframe';

export const isMod = (item: BaseItem): item is Mod =>
  item.kind === 'mod';

// ── Ability Schema (nuevo — groups[]) ────────────────────────────────────────
// Ver Docs/analysis/ability-schema-examples.md para la especificación completa.

/**
 * Variable del engine que escala el valor base de un stat de habilidad.
 * Usa los identificadores canónicos del engine (mismos que upgradeTypes[] en mods).
 */
export type AbilityUpgradeBy =
  | 'AVATAR_ABILITY_STRENGTH'    // escala con Ability Strength
  | 'AVATAR_ABILITY_RANGE'       // escala con Ability Range
  | 'AVATAR_ABILITY_DURATION'    // escala con Ability Duration
  | 'AVATAR_ABILITY_EFFICIENCY'  // escala con Ability Efficiency (raro — usar ENERGY_COST)
  | 'ENERGY_COST'                // coste de activación (Drain en UI): (2-EFF)*base
  | 'ENERGY_DRAIN'               // drain por segundo (Energy/s en UI): (2-EFF)*base/DUR
  | 'NONE';                      // valor fijo, no escala
  // Nota: patrones con TARGET (Oberon Renewal) y COMBO (Atlas Landslide) usan
  // ENERGY_DRAIN como upgradeBy — el multiplicador dinámico es responsabilidad del motor.

export interface AbilityStatValue {
  baseValue: number;
  upgradeBy: AbilityUpgradeBy;
  /** Solo para buff abilities: qué stat externo modifica (WEAPON_DAMAGE_AMOUNT, ARMOR_BONUS, etc.) */
  upgradeType?: string;
  /** Cap máximo tras escalar — (STR * 80), 95 en el módulo */
  cap?: number;
  capMin?: number;
  helminthBase?: number;
  helminthCap?: number;
  inverse?: boolean;
}

export interface AbilityStatEntry {
  label: string;
  values: AbilityStatValue[];
}

/**
 * Grupo de stats de una habilidad.
 * Sin `id` = grupo base, siempre activo, sin header.
 * Con `id` = sección con toggle (elemento, forma, mote, etc.)
 */
export interface AbilityGroup {
  id?: string;
  label?: string;
  defaultActive?: boolean;
  /** true = radio (solo uno activo a la vez) | false = checkbox (varios simultáneos) */
  exclusive?: boolean;
  stats: AbilityStatEntry[];
}

export interface AbilityStatsData {
  name: string;
  description: string;
  icon: string;
  groups: AbilityGroup[];
}

// ── Ability Scaling (legacy) ──────────────────────────────────────────────────
/** @deprecated Usar AbilityUpgradeBy. Mantenido para compatibilidad con el editor durante migración. */
export type AbilityScaling =
  | 'STRENGTH' | 'RANGE' | 'DURATION' | 'EFFICIENCY' | 'ENERGY_DRAIN' | 'NONE';

/** @deprecated */
export type AbilityModifier = AbilityScaling;

// ── Mod Modifiers ─────────────────────────────────────────────────────────────
// @deprecated ModModifier fue diseñado antes de tener upgradeTypes[] en el JSON.
// Es redundante e inferior a la fuente canónica. No usar en código nuevo.
// El builder consume upgradeTypes[] directamente desde el JSON de mods.
// Mantenido solo para compatibilidad con archivos de override legacy (mod.*.stats.json).
export type ModModifier =
  | 'DAMAGE_BASE' | 'DAMAGE_COLD' | 'DAMAGE_HEAT' | 'DAMAGE_ELECTRICITY' | 'DAMAGE_TOXIN'
  | 'DAMAGE_IMPACT' | 'DAMAGE_PUNCTURE' | 'DAMAGE_SLASH'
  | 'DAMAGE_BLAST' | 'DAMAGE_CORROSIVE' | 'DAMAGE_GAS' | 'DAMAGE_MAGNETIC' | 'DAMAGE_RADIATION' | 'DAMAGE_VIRAL' | 'DAMAGE_VOID'
  | 'DAMAGE_FACTION_CORPUS' | 'DAMAGE_FACTION_GRINEER' | 'DAMAGE_FACTION_INFESTED' | 'DAMAGE_FACTION_MURMUR' | 'DAMAGE_FACTION_OROKIN'
  | 'CRIT_CHANCE' | 'CRIT_DAMAGE' | 'STATUS_CHANCE' | 'STATUS_DURATION'
  | 'MULTISHOT' | 'FIRE_RATE' | 'RELOAD_SPEED' | 'MAGAZINE_CAPACITY' | 'AMMO_MAX'
  | 'PUNCH_THROUGH' | 'PROJECTILE_SPEED' | 'ACCURACY' | 'ZOOM' | 'RECOIL'
  | 'ABILITY_STRENGTH' | 'ABILITY_DURATION' | 'ABILITY_EFFICIENCY' | 'ABILITY_RANGE'
  | 'HEALTH' | 'SHIELD' | 'ARMOR' | 'ENERGY_MAX' | 'SPRINT_SPEED'
  | 'CONDITIONAL' | 'UNIQUE' | '';

export type DamageType = 
  | 'impact' | 'puncture' | 'slash' 
  | 'heat' | 'cold' | 'electricity' | 'toxin' 
  | 'blast' | 'corrosive' | 'gas' | 'magnetic' | 'radiation' | 'viral' 
  | 'void' | 'tau' | 'true' | 'none';

export const DAMAGE_TYPES: DamageType[] = [
  'impact', 'puncture', 'slash', 
  'heat', 'cold', 'electricity', 'toxin', 
  'blast', 'corrosive', 'gas', 'magnetic', 'radiation', 'viral', 
  'void', 'tau', 'true', 'none'
]

export type DamageMap = Partial<Record<DamageType, number>> & { [key: string]: number | undefined };

/** @deprecated Usar AbilityStatValue */
export interface Stat {
  value: number;
  modifier: AbilityScaling;
  maxCap?: number;
  minCap?: number;
  helminthValues?: number[];
  type?: string;
}

/** @deprecated */
export interface Misc extends Omit<Stat, 'maxCap' | 'minCap' | 'helminthValues' | 'modifier'> {
  label: string;
  modifier?: string;
}

/** @deprecated Usar AbilityGroup */
export interface AbilityStat {
  label?: string;
  mode?: string;
  stats: Stat[];
  misc: Misc[];
  helminthValues?: number[];
}

export interface Ability {
  uniqueName: string;
  name: string;
  description: string;
  imageName: string;
  key?: number;
  cost?: number;
  costType?: 'energy' | 'shield' | 'time';
  powersuit?: string;
  introduced?: string;
  subsumable?: boolean;
  augments?: string[];
  weapon?: string;
  cardImage?: string;
  icon?: string;
  preview?: string;
  previewFallback?: string;
  /** Numeric gameplay stats from Module:Ability/data/stats */
  stats?: AbilityStatsData;
}

// ── Damage ────────────────────────────────────────────────────────────────────

export interface WeaponAttack {
  name: string
  damage?: DamageMap
  totalDamage?: number
  /** Decimal format (0.32 = 32%), normalized from @wfcd/items integer format to match Warframe Wiki canonical format */
  crit_chance?: number | null
  crit_mult?: number | null
  /** Decimal format (0.18 = 18%), normalized from @wfcd/items integer format to match Warframe Wiki canonical format */
  status_chance?: number | null
  /** Fire rate (ranged) or attack speed (melee). Absent in some attacks (e.g. Lanka) — always optional. */
  speed?: number | null
  /** Semantic attack type: "Hit-Scan" | "Projectile" | "AoE" | "Thrown" */
  shot_type?: string | null
  /** Projectile speed in m/s. Canonical field from @wfcd/items. null when not applicable or instantaneous. */
  flight?: number | null
  falloff?: { start: number; end: number; reduction: number } | null
  /** Slide attack damage value (melee Normal Attack only). String in source — parse to number for display. */
  slide?: string | null
  /** Charge time in seconds. Present on bows, snipers, gunblades, glaive charged throws. */
  charge_time?: number | null
  /**
   * @gap punchThrough
   * Some attacks have base punch through (e.g. Dread Charged Shot: 2.5m, Glaive Charged Throw: 1.0m).
   * The official wiki exposes this per-attack in its internal JSON, but @wfcd/items does NOT include
   * punchThrough in attacks[] — confirmed exhaustively across all weapons.
   * Pending: determine if an override file (similar to ability-stats.json) is needed.
   * Not mapped for now — field does not exist in the primary source.
   */
}

// ── Weapon ────────────────────────────────────────────────────────────────────

export type WeaponCategory = 'Primary' | 'Secondary' | 'Melee'

export interface Weapon extends BaseItem {
  kind: 'primary' | 'secondary' | 'melee';
  description: string
  imageName: string
  category: WeaponCategory
  productCategory?: string
  masteryReq: number
  isPrime: boolean
  tradable: boolean
  slot?: number
  // Combat stats
  damage: DamageMap
  totalDamage: number
  criticalChance: number
  criticalMultiplier: number
  procChance: number
  fireRate?: number
  magazineSize?: number
  reloadTime?: number
  multishot?: number
  accuracy?: number
  noise?: string
  trigger?: string
  disposition?: number
  // Melee-specific
  range?: number
  attackSpeed?: number
  comboDuration?: number
  followThrough?: number
  blockingAngle?: number
  slamAttack?: number
  slamRadialDamage?: number
  slamRadius?: number
  heavyAttackDamage?: number
  heavySlamAttack?: number
  heavySlamRadialDamage?: number
  heavySlamRadius?: number
  slideAttack?: number
  windUp?: number
  stancePolarity?: string
  // Meta
  introduced?: string
  wikiaThumbnail?: string
  wikiaUrl?: string
  attacks?: WeaponAttack[]
}

// ── Warframe ──────────────────────────────────────────────────────────────────

export interface Warframe extends BaseItem {
  kind: 'warframe';
  description: string;
  imageName: string;
  health: number;
  shield: number;
  armor: number;
  power: number;
  sprintSpeed: number;
  passiveDescription?: string;
  passive?: string | { name: string, description: string }; // Pointer to passives.json or hydrated object
  abilities: Ability[];
  aura?: string;
  sex?: string;
  introduced?: string;
  wikiaThumbnail?: string;
  wikiaUrl?: string;
  isPrime: boolean;
  // Stats from Module:Warframes/data
  energy?: number;
  initialEnergy?: number;
  healthRank30?: number;
  shieldRank30?: number;
  armorRank30?: number;
  energyRank30?: number;
  maxRank?: number;
  category?: 'Warframes' | 'Archwings' | 'Necramechs' | 'Operators';
  playstyle?: string[];
  progenitor?: string;
  subsumed?: string;
  themes?: string;
  tactical?: string;
}


// ── Mod ────────────────────────────────────────────────────────────────────────

export type ModCategory =
  | 'warframe' | 'primary' | 'secondary' | 'melee' | 'companion'
  | 'archgun' | 'archmelee' | 'archwing'
  | 'focus' | 'railjack' | 'necramech' | 'kdrive' | 'parazon'
  | 'tektolyst' | 'modset' | 'transmutation' | 'peculiar' | 'riven'
  | 'unknown';

/**
 * Clase de mod — identifica mods con progresión especial.
 * Relevante para el builder: Primed/Galvanized/Archon tienen 10 rangos
 * y progresión no lineal que requiere valores explícitos por rango.
 */
export type ModClass = 'Primed' | 'Galvanized' | 'Archon' | 'Amalgam' | 'Riven';

/**
 * Identificador canónico del stat que modifica un mod.
 * Fuente: Module:Mods/data en la wiki de Warframe.
 * Ver decisions/mods-builder-analysis.md §2 para la semántica completa de cada tipo.
 *
 * Prefijos:
 * - WEAPON_   → efectos sobre armas (primaria, secundaria, melee, archgun)
 * - AVATAR_   → efectos sobre el Warframe
 * - VEHICLE_  → efectos sobre K-Drive
 * - GAMEPLAY_ → efectos de facción y gameplay general
 */
export type UpgradeType = string; // string abierto — la lista completa está en mods-builder-analysis.md §2

export interface Mod extends BaseItem {
  kind: 'mod';
  description: string;
  imageName: string;
  baseDrain: number | null;
  /** Rango máximo del mod. Fuente: wikia (más fiable que fusionLimit del API). */
  rank: number | null;
  /** Stats por rango como texto plano del juego. Suficiente para renderizar el card. */
  levelStats: Array<{ stats: string[] }> | null;
  categoryRaw: string | null;
  /** Categoría normalizada — colapsada desde mod.type en generate-data.mjs */
  category: ModCategory;
  /**
   * Compatibilidad canónica del mod — campo `compatName` de @wfcd/items.
   * Define a qué compañero(s) aplica el mod. Jerarquía de 4 niveles:
   * COMPANION > ROBOTIC/BEAST > tipo (Sentinel/Kavat/Moa...) > individuo (Carrier/Smeeta Kavat...)
   * Solo presente en mods de categoría `companion`. Ver data-audit.md §Gap: compatName.
   */
  compatName?: string | null;
  polarity?: string | null;
  rarity?: string | null;
  type?: string | null;
  introduced?: string | null;
  wikiaThumbnail?: string | null;
  wikiaUrl?: string | null;
  // ── Campos canónicos del wikia (Module:Mods/data) ──────────────────────────
  /**
   * Identificadores canónicos del stat que modifica el mod.
   * Fuente: Module:Mods/data. Cubre el ~85% de los mods de armas.
   * Vacío ([]) para augmentos UNIQUE (efectos Lua sin UpgradeType estándar).
   * Ver decisions/mods-builder-analysis.md §2 para la semántica completa.
   */
  upgradeTypes: UpgradeType[];
  /** true si el mod ocupa slot Exilus */
  isExilus?: boolean;
  /** true si es versión defectuosa (Flawed) */
  isFlawed?: boolean;
  /**
   * Clase del mod — identifica mods con progresión especial.
   * Primed/Galvanized/Archon tienen 10 rangos y progresión no lineal.
   */
  modClass?: ModClass;
  /** true si es augment de arma específica */
  isWeaponAugment?: boolean;
  /** Nombres de mods incompatibles (no se pueden equipar juntos) */
  incompatible?: string[];
  /** Tags de incompatibilidad */
  incompatibilityTags?: string[];
  /**
   * Override de datos para el builder — complemento quirúrgico para gaps canónicos.
   * Solo presente para mods con progresión no lineal (Primed/Galvanized/Archon)
   * o augmentos UNIQUE. Ver architecture/mod-stats-gap.md para el schema.
   * @future Pendiente de implementar cuando el builder lo necesite.
   */
  misc?: unknown[];
}
