import { 
  normalizeArcaneSemantics, 
  type ArcaneNormalizationState 
} from '../normalization/arcanes.ts'
import { 
  normalizeWeaponShotType, 
  type WeaponNormalizationState 
} from '../normalization/weapons.ts'
import { 
  normalizePolarityValue, 
  type PolarityNormalizationState 
} from '../normalization/polarity.ts'
import { normalizeEntityTaxonomy } from '../normalization/entities.ts'

import type {
  ArcaneCompatName,
  DamageMap,
  ModClass,
  PolarityType,
  WeaponAttack,
} from '../../src/shared/types/index.ts'
import type { 
  ItemDomain, 
  ItemKind, 
  ItemFamily 
} from '../../src/shared/types/base.ts'
import type { 
  CombatStats, 
  LivingStats, 
  ModStats 
} from '../../src/shared/types/stats.ts'

import type { SourcePatchlogLike } from './source-change-audit.ts'

type UnknownRecord = Record<string, unknown>

type SourceIntroduced = string | { name?: string | null } | null | undefined
type SourceAura = string | string[] | null | undefined

interface PassiveEntry {
  name: string
  description: string
}

export type PassivesDb = Record<string, PassiveEntry>

interface SourceAbilityRef {
  uniqueName?: string | null
  name?: string | null
  description?: string | null
  imageName?: string | null
}

interface SourceAttack {
  name?: string | null
  damage?: UnknownRecord | null
  crit_chance?: number | null
  crit_mult?: number | null
  status_chance?: number | null
  speed?: number | null
  shot_type?: string | null
  flight?: number | null
  shot_speed?: number | null
  falloff?: WeaponAttack['falloff']
  slide?: string | null
  charge_time?: number | null
}

export interface SourceItem {
  category?: string | null
  productCategory?: string | null
  uniqueName?: string | null
  name?: string | null
  description?: string | null
  imageName?: string | null
  masteryReq?: number | null
  polarities?: string[] | null
  tags?: string[] | null
  type?: string | null
  introduced?: SourceIntroduced
  wikiaThumbnail?: string | null
  wikiaUrl?: string | null
  isPrime?: boolean | null
  tradable?: boolean | null

  health?: number | null
  shield?: number | null
  armor?: number | null
  power?: number | null
  sprintSpeed?: number | null
  passiveDescription?: string | null
  aura?: SourceAura
  sex?: string | null
  abilities?: SourceAbilityRef[] | null
  energy?: number | null
  initialEnergy?: number | null
  maxRank?: number | null
  playstyle?: string[] | null
  progenitor?: string | null
  subsumed?: string | null
  themes?: string | null
  tactical?: string | null
  slot?: number | null
  totalDamage?: number | null
  criticalChance?: number | null
  criticalMultiplier?: number | null
  procChance?: number | null
  fireRate?: number | null
  magazineSize?: number | null
  reloadTime?: number | null
  multishot?: number | null
  accuracy?: number | null
  noise?: string | null
  trigger?: string | null
  disposition?: number | null
  attacks?: SourceAttack[] | null
  range?: number | null
  attackSpeed?: number | null
  comboDuration?: number | null
  followThrough?: number | null
  blockingAngle?: number | null
  slamAttack?: number | null
  slamRadialDamage?: number | null
  slamRadius?: number | null
  heavyAttackDamage?: number | null
  heavySlamAttack?: number | null
  heavySlamRadialDamage?: number | null
  heavySlamRadius?: number | null
  slideAttack?: number | null
  windUp?: number | null
  stancePolarity?: string | null

  compatName?: string | null
  baseDrain?: number | null
  polarity?: string | null
  rarity?: string | null
  fusionLimit?: number | null
  upgradeTypes?: string[] | null
  isExilus?: boolean | null
  isFlawed?: boolean | null
  modClass?: ModClass | null
  isWeaponAugment?: boolean | null
  incompatible?: string[] | null
  incompatibilityTags?: string[] | null
  patchlogs?: SourcePatchlogLike[] | null
  levelStats?: Array<{ stats?: string[] | null }> | null
  damage?: UnknownRecord | null
}

interface GeneratedBaseFields {
  id: string
  name: string
  image: string | null
  image_name: string
  unique_name: string
  domain: ItemDomain
  kind: ItemKind
  family?: ItemFamily
  category: string // Raw Category
  type: string | null
  mastery_req: number
  polarities: PolarityType[]
  tags: string[]
}

interface GeneratedAbilityPointer {
  unique_name: string
}

interface GeneratedWarframe extends GeneratedBaseFields {
  domain: 'warframe'
  kind: 'warframe'
  description: string
  stats: LivingStats
  passive_description: string | null
  is_prime: boolean
  aura: PolarityType | null
  sex: string | null
  introduced: string | null
  wikia_thumbnail: string | null
  wikia_url: string | null
  abilities: GeneratedAbilityPointer[]
  passive: string | null
  max_rank: number
  playstyle: string[]
  progenitor: string | null
  subsumed: string | null
  themes: string | null
  tactical: string | null
}

interface GeneratedWeapon extends GeneratedBaseFields {
  domain: 'weapon'
  kind: 'primary' | 'secondary' | 'melee' | 'archgun' | 'archmelee'
  description: string
  product_category: string | null
  is_prime: boolean
  tradable: boolean
  stats: CombatStats
  introduced: string | null
  wikia_thumbnail: string | null
  wikia_url: string | null
}

interface GeneratedMod extends GeneratedBaseFields {
  domain: 'mod'
  kind: 'mod'
  description: string
  category_raw: string | null
  stats: ModStats
  compat_name: string | null
  polarity: PolarityType | null
  rarity: string | null
  is_exilus: boolean
  is_flawed: boolean
  mod_class: ModClass | null
  is_weapon_augment: boolean
  incompatible: string[]
  incompatibility_tags: string[]
}

interface GeneratedArcane extends GeneratedBaseFields {
  domain: 'arcane'
  kind: 'arcane'
  compat_name: ArcaneCompatName | null
  rarity: string | null
  tradable: boolean
  max_rank: number
  level_stats: Array<{ stats?: string[] | null }>
}

interface GeneratedCompanion extends GeneratedBaseFields {
  domain: 'companion'
  kind: 'sentinel' | 'pet' | 'hound' | 'moa'
  description: string
  stats: LivingStats
  is_prime: boolean
  tradable: boolean
  introduced: string | null
  wikia_thumbnail: string | null
  wikia_url: string | null
}

interface GeneratedVehicle extends GeneratedBaseFields {
  domain: 'vehicle'
  kind: 'necramech' | 'archwing'
  description: string
  stats: LivingStats
  is_prime: boolean
  tradable: boolean
  abilities: GeneratedAbilityPointer[]
}


export interface RuntimeDataArtifacts {
  warframes: GeneratedWarframe[]
  passivesDb: PassivesDb
  weapons: GeneratedWeapon[]
  mods: GeneratedMod[]
  arcanes: GeneratedArcane[]
  companions: GeneratedCompanion[]
  archwingWeapons: GeneratedWeapon[]
  vehicles: GeneratedVehicle[]
  necramechCount: number
  archwingCount: number
}


const WEAPON_PRODUCT_CATEGORIES = ['LongGuns', 'Pistols', 'Melee', 'SentinelWeapons']
const COMPANION_PRODUCT_CATEGORIES = ['Pets', 'Sentinels', 'KubrowPets']
const ARCHWING_WEAPON_PRODUCT_CATEGORIES = ['SpaceGuns', 'SpaceMelee']
const VEHICLE_PRODUCT_CATEGORIES = ['Archwing', 'Necramech', 'MechSuits', 'SpaceSuits', 'CrewShipWeapons']

const NECRAMECH_UNIQUE = new Set<string>([
  '/Lotus/Powersuits/EntratiMech/ThanoTech',
  '/Lotus/Powersuits/EntratiMech/NechroTech',
])

const EXCLUDED_WARFRAME_UNIQUE = new Set<string>([
  '/Lotus/Powersuits/Infestation/Helminth',
  '/Lotus/Powersuits/PowersuitAbilities/Helminth',
])

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null
}

function resolveId(raw: Pick<SourceItem, 'uniqueName' | 'name'>): string {
  return raw.uniqueName ?? raw.name ?? ''
}

function resolveUniqueName(raw: Pick<SourceItem, 'uniqueName' | 'name'>): string {
  return raw.uniqueName ?? raw.name ?? ''
}

function resolveName(raw: Pick<SourceItem, 'name' | 'uniqueName'>): string {
  return raw.name ?? raw.uniqueName ?? 'Unknown'
}

function resolveImageName(raw: Pick<SourceItem, 'imageName'>): string {
  return raw.imageName ?? ''
}

function resolveIntroduced(raw: SourceIntroduced): string | null {
  if (typeof raw === 'string') {
    return raw
  }

  if (isRecord(raw) && typeof raw.name === 'string') {
    return raw.name
  }

  return null
}

function mapDamage(raw: UnknownRecord | null | undefined): DamageMap {
  if (!isRecord(raw)) return {}

  const result: DamageMap = {}

  for (const [key, value] of Object.entries(raw)) {
    if (key === 'total') continue
    if (typeof value !== 'number' || value <= 0) continue
    result[key] = value
  }

  return result
}

function sumDamage(damage: DamageMap): number {
  return Object.values(damage).reduce<number>(
    (total, value) => total + (typeof value === 'number' ? value : 0),
    0,
  )
}

function mapAttack(raw: SourceAttack, weaponNormalizationState: WeaponNormalizationState): WeaponAttack {
  const damage = mapDamage(raw.damage)
  const total = isRecord(raw.damage) && typeof raw.damage.total === 'number'
    ? raw.damage.total
    : sumDamage(damage)

  return {
    name: raw.name ?? 'Attack',
    damage,
    total_damage: total,
    crit_chance: raw.crit_chance != null ? raw.crit_chance / 100 : null,
    crit_mult: raw.crit_mult ?? null,
    status_chance: raw.status_chance != null ? raw.status_chance / 100 : null,
    speed: raw.speed ?? null,
    shot_type: normalizeWeaponShotType(raw.shot_type, weaponNormalizationState),
    flight: raw.flight ?? ((raw.shot_speed ?? 0) > 0 ? raw.shot_speed ?? null : null),
    falloff: raw.falloff ?? null,
    slide: raw.slide ?? null,
    charge_time: raw.charge_time ?? null,
    punch_through: 0, // Placeholder if needed, or source data
  }
}

function buildBaseFields(
  raw: SourceItem,
  polarityState: PolarityNormalizationState,
): GeneratedBaseFields {
  const taxonomy = normalizeEntityTaxonomy({
    name: resolveName(raw),
    uniqueName: resolveUniqueName(raw),
    productCategory: raw.productCategory,
    category: raw.category,
    type: raw.type,
    weaponClass: (raw as any).weaponClass,
    tags: raw.tags
  })

  return {
    id: resolveId(raw),
    name: resolveName(raw),
    image: raw.imageName ? `/assets/items/${raw.imageName}.png` : null,
    image_name: resolveImageName(raw),
    unique_name: resolveUniqueName(raw),
    domain: taxonomy.domain,
    kind: taxonomy.kind,
    family: taxonomy.family,
    category: raw.category ?? 'unknown',
    type: raw.type ?? null,
    mastery_req: raw.masteryReq ?? 0,
    polarities: (raw.polarities ?? [])
      .map((p) => normalizePolarityValue(p, polarityState))
      .filter((p): p is PolarityType => p !== null),
    tags: taxonomy.tags ?? [],
  }
}

function mapWarframe(
  raw: SourceItem,
  polarityState: PolarityNormalizationState,
): GeneratedWarframe {
  const auraRaw = Array.isArray(raw.aura) ? raw.aura[0] : raw.aura
  
  return {
    ...buildBaseFields(raw, polarityState),
    domain: 'warframe',
    kind: 'warframe',
    description: raw.description ?? '',
    stats: {
      health: raw.health ?? 0,
      shield: raw.shield ?? 0,
      armor: raw.armor ?? 0,
      energy: raw.energy ?? raw.power ?? 0,
      sprint_speed: raw.sprintSpeed ?? 0,
    },
    passive_description: raw.passiveDescription ?? null,
    is_prime: raw.isPrime ?? false,
    aura: normalizePolarityValue(auraRaw, polarityState),
    sex: raw.sex ?? null,
    introduced: resolveIntroduced(raw.introduced),
    wikia_thumbnail: raw.wikiaThumbnail ?? null,
    wikia_url: raw.wikiaUrl ?? null,
    abilities: (raw.abilities ?? []).map((ability) => ({ unique_name: ability.uniqueName ?? '' })),
    passive: raw.passiveDescription ? resolveUniqueName(raw) : null,
    max_rank: raw.maxRank ?? 30,
    playstyle: (raw.playstyle ?? []).map((p: string) => p.toLowerCase()),
    progenitor: raw.progenitor ?? null,
    subsumed: raw.subsumed ?? null,
    themes: raw.themes ?? null,
    tactical: raw.tactical ?? null,
  }
}


function isIncludedWarframe(item: SourceItem): boolean {
  if (item.category?.toLowerCase() !== 'warframes') return false

  const uniqueName = item.uniqueName ?? ''
  const name = item.name ?? ''

  return !NECRAMECH_UNIQUE.has(uniqueName)
    && !EXCLUDED_WARFRAME_UNIQUE.has(uniqueName)
    && name !== 'Helminth'
}

function mapWeapon(
  raw: SourceItem,
  weaponNormalizationState: WeaponNormalizationState,
  polarityState: PolarityNormalizationState,
): GeneratedWeapon {
  const baseFields = buildBaseFields(raw, polarityState);
  
  const base: GeneratedWeapon = {
    ...baseFields,
    domain: 'weapon',
    kind: baseFields.kind as GeneratedWeapon['kind'],
    description: raw.description ?? '',
    product_category: raw.productCategory ?? null,
    is_prime: raw.isPrime ?? false,
    tradable: raw.tradable ?? false,
    stats: {
      damage: mapDamage(raw.damage),
      total_damage: raw.totalDamage ?? 0,
      crit_chance: raw.criticalChance ?? 0,
      crit_mult: raw.criticalMultiplier ?? 0,
      status_chance: raw.procChance ?? 0,
      fire_rate: raw.fireRate ?? undefined,
      magazine_size: raw.magazineSize ?? undefined,
      reload_time: raw.reloadTime ?? undefined,
      multishot: raw.multishot ?? undefined,
      accuracy: raw.accuracy ?? undefined,
      noise: raw.noise ?? undefined,
      trigger: raw.trigger ?? undefined,
      disposition: raw.disposition ?? undefined,
      attacks: (raw.attacks ?? []).map((attack) => mapAttack(attack, weaponNormalizationState)),
    },
    introduced: resolveIntroduced(raw.introduced),
    wikia_thumbnail: raw.wikiaThumbnail ?? null,
    wikia_url: raw.wikiaUrl ?? null,
  }

  if (raw.category === 'Melee') {
    base.stats.range = raw.range ?? undefined
    base.stats.attack_speed = raw.attackSpeed ?? undefined
    base.stats.combo_duration = raw.comboDuration ?? undefined
    base.stats.follow_through = raw.followThrough ?? undefined
    base.stats.blocking_angle = raw.blockingAngle ?? undefined
  }

  return base
}


function mapMod(raw: SourceItem, polarityState: PolarityNormalizationState): GeneratedMod {
  return {
    ...buildBaseFields(raw, polarityState),
    domain: 'mod',
    kind: 'mod',
    description: raw.description ?? '',
    category_raw: raw.category ?? null,
    stats: {
      base_drain: raw.baseDrain ?? 0,
      rank: raw.maxRank ?? raw.fusionLimit ?? 0,
      upgrade_types: raw.upgradeTypes ?? [],
      level_stats: raw.levelStats ?? undefined,
    },
    compat_name: raw.compatName ?? null,
    polarity: normalizePolarityValue(raw.polarity, polarityState),
    rarity: raw.rarity ?? null,
    is_exilus: raw.isExilus ?? false,
    is_flawed: raw.isFlawed ?? false,
    mod_class: raw.modClass ?? null,
    is_weapon_augment: raw.isWeaponAugment ?? false,
    incompatible: raw.incompatible ?? [],
    incompatibility_tags: raw.incompatibilityTags ?? [],
  }
}

function mapArcane(
  raw: SourceItem,
  arcaneNormalizationState: ArcaneNormalizationState,
  polarityState: PolarityNormalizationState,
): GeneratedArcane {
  const semantics = normalizeArcaneSemantics(raw.type, arcaneNormalizationState)

  return {
    ...buildBaseFields(raw, polarityState),
    domain: 'arcane',
    kind: 'arcane',
    compat_name: semantics.compatName,
    rarity: raw.rarity ?? null,
    tradable: raw.tradable ?? false,
    max_rank: raw.levelStats?.length ? raw.levelStats.length - 1 : 0,
    level_stats: raw.levelStats ?? [],
  }
}

function mapCompanion(raw: SourceItem, polarityState: PolarityNormalizationState): GeneratedCompanion {
  const baseFields = buildBaseFields(raw, polarityState);
  return {
    ...baseFields,
    domain: 'companion',
    kind: baseFields.kind as GeneratedCompanion['kind'],
    description: raw.description ?? '',
    stats: {
      health: raw.health ?? 0,
      shield: raw.shield ?? 0,
      armor: raw.armor ?? 0,
    },
    is_prime: raw.isPrime ?? false,
    tradable: raw.tradable ?? false,
    introduced: resolveIntroduced(raw.introduced),
    wikia_thumbnail: raw.wikiaThumbnail ?? null,
    wikia_url: raw.wikiaUrl ?? null,
  }
}

function mapArchwingWeapon(
  raw: SourceItem,
  weaponNormalizationState: WeaponNormalizationState,
  polarityState: PolarityNormalizationState,
): GeneratedWeapon {
  const baseFields = buildBaseFields(raw, polarityState);
  return {
    ...baseFields,
    domain: 'weapon',
    kind: baseFields.kind as GeneratedWeapon['kind'],
    description: raw.description ?? '',
    product_category: raw.productCategory ?? null,
    is_prime: raw.isPrime ?? false,
    tradable: raw.tradable ?? false,
    stats: {
      damage: mapDamage(raw.damage),
      total_damage: raw.totalDamage ?? 0,
      crit_chance: raw.criticalChance ?? 0,
      crit_mult: raw.criticalMultiplier ?? 0,
      status_chance: raw.procChance ?? 0,
      attacks: (raw.attacks ?? []).map((attack) => mapAttack(attack, weaponNormalizationState)),
    },
    introduced: resolveIntroduced(raw.introduced),
    wikia_thumbnail: raw.wikiaThumbnail ?? null,
    wikia_url: raw.wikiaUrl ?? null,
  }
}

function mapVehicle(raw: SourceItem, polarityState: PolarityNormalizationState): GeneratedVehicle {
  const baseFields = buildBaseFields(raw, polarityState);
  return {
    ...baseFields,
    domain: 'vehicle',
    kind: baseFields.kind as GeneratedVehicle['kind'],
    description: raw.description ?? '',
    stats: {
      health: raw.health ?? 0,
      shield: raw.shield ?? 0,
      armor: raw.armor ?? 0,
    },
    is_prime: raw.isPrime ?? false,
    tradable: raw.tradable ?? false,
    abilities: (raw.abilities ?? []).map((ability) => ({ unique_name: ability.uniqueName ?? '' })),
  }
}


function buildWarframesArtifacts(
  sourceItems: SourceItem[],
  polarityState: PolarityNormalizationState,
): {
  warframes: GeneratedWarframe[]
  passivesDb: PassivesDb
} {
  const warframes = sourceItems
    .filter((item) => isIncludedWarframe(item))
    .map((item) => mapWarframe(item, polarityState))

  const passivesDb: PassivesDb = {}

  for (const warframe of warframes) {
    if (!warframe.passive) continue

    passivesDb[warframe.passive] = {
      name: `${warframe.name} Passive`,
      description: warframe.passive_description ?? '',
    }
  }

  return {
    warframes,
    passivesDb,
  }
}

function buildWeaponsArtifacts(
  sourceItems: SourceItem[],
  weaponNormalizationState: WeaponNormalizationState,
  polarityState: PolarityNormalizationState,
): GeneratedWeapon[] {
  return sourceItems
    .filter((item) => {
      const cat = item.category || ''
      const pCat = item.productCategory || ''
      if (cat === 'Pets' || cat === 'Sentinels' || pCat === 'Pets' || pCat === 'Sentinels') return false
      return WEAPON_PRODUCT_CATEGORIES.includes(pCat) || WEAPON_PRODUCT_CATEGORIES.includes(cat)
    })
    .map((item) => mapWeapon(item, weaponNormalizationState, polarityState))
}

function buildCompanionsArtifacts(sourceItems: SourceItem[], polarityState: PolarityNormalizationState): GeneratedCompanion[] {
  return sourceItems
    .filter((item) => {
      const pCat = item.productCategory || ''
      const cat = item.category || ''
      return COMPANION_PRODUCT_CATEGORIES.includes(pCat) || COMPANION_PRODUCT_CATEGORIES.includes(cat)
    })
    .map((item) => mapCompanion(item, polarityState))
}

function buildModsArtifacts(sourceItems: SourceItem[], polarityState: PolarityNormalizationState): GeneratedMod[] {
  return sourceItems
    .filter((item) => item.category === 'Mods')
    .map((item) => mapMod(item, polarityState))
}

function buildArcanesArtifacts(
  sourceItems: SourceItem[],
  arcaneNormalizationState: ArcaneNormalizationState,
  polarityState: PolarityNormalizationState,
): GeneratedArcane[] {
  return sourceItems
    .filter((item) => item.category === 'Arcanes')
    .map((item) => mapArcane(item, arcaneNormalizationState, polarityState))
}

function buildArchwingWeaponsArtifacts(
  sourceItems: SourceItem[],
  weaponNormalizationState: WeaponNormalizationState,
  polarityState: PolarityNormalizationState,
): GeneratedWeapon[] {
  return sourceItems
    .filter((item) => {
      const pCat = item.productCategory || item.category || ''
      return ARCHWING_WEAPON_PRODUCT_CATEGORIES.includes(pCat)
    })
    .map((item) => mapArchwingWeapon(item, weaponNormalizationState, polarityState))
}

function buildVehiclesArtifacts(sourceItems: SourceItem[], polarityState: PolarityNormalizationState): {
  vehicles: GeneratedVehicle[]
  necramechCount: number
  archwingCount: number
} {
  const allVehicles = sourceItems
    .filter((item) => { 
      const pCat = item.productCategory || item.category || ''
      return VEHICLE_PRODUCT_CATEGORIES.includes(pCat) || NECRAMECH_UNIQUE.has(item.uniqueName ?? '')
    })
    .map((item) => mapVehicle(item, polarityState))

  const necramechs = allVehicles.filter(v => v.kind === 'necramech')
  const archwings = allVehicles.filter(v => v.kind === 'archwing')

  return {
    vehicles: allVehicles,
    necramechCount: necramechs.length,
    archwingCount: archwings.length,
  }
}


export function buildRuntimeDataArtifacts(params: {
  sourceItems: SourceItem[]
  arcaneNormalizationState: ArcaneNormalizationState
  weaponNormalizationState: WeaponNormalizationState
  polarityNormalizationState: PolarityNormalizationState
}): RuntimeDataArtifacts {
  const warframesArtifacts = buildWarframesArtifacts(
    params.sourceItems,
    params.polarityNormalizationState,
  )
  const weapons = buildWeaponsArtifacts(
    params.sourceItems,
    params.weaponNormalizationState,
    params.polarityNormalizationState,
  )
  const mods = buildModsArtifacts(params.sourceItems, params.polarityNormalizationState)
  const arcanes = buildArcanesArtifacts(
    params.sourceItems,
    params.arcaneNormalizationState,
    params.polarityNormalizationState,
  )
  const companions = buildCompanionsArtifacts(params.sourceItems, params.polarityNormalizationState)
  const archwingWeapons = buildArchwingWeaponsArtifacts(
    params.sourceItems,
    params.weaponNormalizationState,
    params.polarityNormalizationState,
  )
  const vehiclesArtifacts = buildVehiclesArtifacts(params.sourceItems, params.polarityNormalizationState)

  return {
    warframes: warframesArtifacts.warframes,
    passivesDb: warframesArtifacts.passivesDb,
    weapons,
    mods,
    arcanes,
    companions,
    archwingWeapons,
    vehicles: vehiclesArtifacts.vehicles,
    necramechCount: vehiclesArtifacts.necramechCount,
    archwingCount: vehiclesArtifacts.archwingCount,
  }
}
