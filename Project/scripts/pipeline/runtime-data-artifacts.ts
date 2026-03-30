import {
  normalizeArcaneSemantics,
  type ArcaneNormalizationState,
} from '../normalization/arcanes.ts'
import {
  normalizeWeaponShotType,
  type WeaponNormalizationState,
} from '../normalization/weapons.ts'

import type {
  ArcaneCategory,
  ArcaneCompatName,
  ArchwingWeaponCategory,
  CompanionCategory,
  DamageMap,
  Kind,
  ModCategory,
  ModClass,
  VehicleKind,
  WeaponAttack,
  WeaponCategory,
} from '../../src/lib/types/index.ts'
import type { SourcePatchlogLike } from './source-change-audit.ts'

type UnknownRecord = Record<string, unknown>

type SourceIntroduced = string | { name?: string | null } | null | undefined
type SourceAura = string | string[] | null | undefined

type AbilityStatsRow = Record<string, unknown>

interface AbilityStatsLegacyRow extends AbilityStatsRow {
  name?: string
  description?: string
  imageName?: string
  icon?: string
}

interface AbilityStatsObjectEntry {
  name?: string
  description?: string
  imageName?: string
  icon?: string
  stats?: AbilityStatsRow[]
}

export type AbilityStatsDbEntry = AbilityStatsObjectEntry | AbilityStatsLegacyRow[]
export type AbilityStatsDb = Record<string, AbilityStatsDbEntry>

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
  productCategory?: string | null
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

interface GeneratedBaseFields<K extends Kind> {
  id: string
  kind: K
  uniqueName: string
  name: string
  imageName: string
  masteryReq: number
  polarities: string[]
  tags: string[]
}

interface GeneratedAbilityPointer {
  uniqueName: string
}

interface GeneratedWarframe extends GeneratedBaseFields<'warframe'> {
  description: string
  health: number
  shield: number
  armor: number
  power: number
  sprintSpeed: number
  passiveDescription: string | null
  isPrime: boolean
  aura: string | string[] | null
  sex: string | null
  introduced: string | null
  wikiaThumbnail: string | null
  wikiaUrl: string | null
  abilities: GeneratedAbilityPointer[]
  passive: string | null
  energy: number
  initialEnergy: number | null
  maxRank: number
  category: string
  playstyle: string[]
  progenitor: string | null
  subsumed: string | null
  themes: string | null
  tactical: string | null
}

interface GeneratedWeapon extends GeneratedBaseFields<'primary' | 'secondary' | 'melee'> {
  description: string
  category: WeaponCategory
  productCategory: string | null
  type: string | null
  isPrime: boolean
  tradable: boolean
  slot: number | null
  damage: DamageMap
  totalDamage: number
  criticalChance: number
  criticalMultiplier: number
  procChance: number
  fireRate: number | null
  magazineSize: number | null
  reloadTime: number | null
  multishot: number | null
  accuracy: number | null
  noise: string | null
  trigger: string | null
  disposition: number | null
  introduced: string | null
  wikiaThumbnail: string | null
  wikiaUrl: string | null
  attacks: WeaponAttack[]
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
}

interface GeneratedMod extends GeneratedBaseFields<'mod'> {
  description: string
  categoryRaw: string | null
  type: string | null
  category: ModCategory
  compatName: string | null
  baseDrain: number | null
  polarity: string | null
  rarity: string | null
  rank: number | null
  levelStats: Array<{ stats?: string[] | null }> | null
  upgradeTypes: string[]
  isExilus?: boolean
  isFlawed?: boolean
  modClass?: ModClass
  isWeaponAugment?: boolean
  incompatible?: string[]
  incompatibilityTags?: string[]
}

interface GeneratedArcane extends GeneratedBaseFields<'arcane'> {
  type: string | null
  category: ArcaneCategory
  compatName: ArcaneCompatName | null
  rarity: string | null
  tradable: boolean
  imageName: string
  maxRank: number
  levelStats: Array<{ stats?: string[] | null }>
}

interface GeneratedCompanion extends GeneratedBaseFields<'companion'> {
  description: string
  category: CompanionCategory
  health: number | null
  shield: number | null
  armor: number | null
  isPrime: boolean
  tradable: boolean
  introduced: string | null
  wikiaThumbnail: string | null
  wikiaUrl: string | null
}

interface GeneratedArchwingWeapon extends GeneratedBaseFields<'archgun' | 'archmelee'> {
  description: string
  category: ArchwingWeaponCategory
  isPrime: boolean
  tradable: boolean
  introduced: string | null
  wikiaThumbnail: string | null
  wikiaUrl: string | null
  damage: DamageMap
  totalDamage: number
  criticalChance: number
  criticalMultiplier: number
  procChance: number
  attacks: WeaponAttack[]
}

interface GeneratedVehicle extends GeneratedBaseFields<VehicleKind> {
  description: string
  category: string
  health: number | null
  shield: number | null
  armor: number | null
  isPrime: boolean
  tradable: boolean
  introduced: string | null
  wikiaThumbnail: string | null
  wikiaUrl: string | null
  abilities: GeneratedAbilityPointer[]
}

export interface RuntimeDataArtifacts {
  warframes: GeneratedWarframe[]
  abilityStatsDb: AbilityStatsDb
  passivesDb: PassivesDb
  weapons: GeneratedWeapon[]
  mods: GeneratedMod[]
  arcanes: GeneratedArcane[]
  companions: GeneratedCompanion[]
  archwingWeapons: GeneratedArchwingWeapon[]
  vehicles: GeneratedVehicle[]
  necramechCount: number
  archwingCount: number
}

const WEAPON_CATEGORIES = ['Primary', 'Secondary', 'Melee'] as const satisfies readonly WeaponCategory[]
const COMPANION_CATEGORIES = ['Pets', 'Sentinels'] as const satisfies readonly CompanionCategory[]
const ARCHWING_WEAPON_CATEGORIES = ['Arch-Gun', 'Arch-Melee'] as const satisfies readonly ArchwingWeaponCategory[]

const NECRAMECH_UNIQUE = new Set<string>([
  '/Lotus/Powersuits/EntratiMech/ThanoTech',
  '/Lotus/Powersuits/EntratiMech/NechroTech',
])

const EXCLUDED_WARFRAME_UNIQUE = new Set<string>([
  '/Lotus/Powersuits/Infestation/Helminth',
  '/Lotus/Powersuits/PowersuitAbilities/Helminth',
])

const MOD_TYPE_TO_CATEGORY = {
  'Warframe Mod': 'warframe',
  'Primary Mod': 'primary',
  'Shotgun Mod': 'primary',
  'Secondary Mod': 'secondary',
  'Melee Mod': 'melee',
  'Stance Mod': 'melee',
  'Companion Mod': 'companion',
  'Posture Mod': 'companion',
  'Arch-Gun Mod': 'archgun',
  'Arch-Melee Mod': 'archmelee',
  'Archwing Mod': 'archwing',
  'Focus Way': 'focus',
  'Plexus Mod': 'railjack',
  'Railjack Mod': 'railjack',
  'Necramech Mod': 'necramech',
  'K-Drive Mod': 'kdrive',
  'Parazon Mod': 'parazon',
  'Tektolyst Artifact Mod': 'tektolyst',
  'Mod Set Mod': 'modset',
  'Transmutation Mod': 'transmutation',
  'Peculiar Mod': 'peculiar',
  'Rifle Riven Mod': 'riven',
  'Shotgun Riven Mod': 'riven',
  'Pistol Riven Mod': 'riven',
  'Melee Riven Mod': 'riven',
  'Kitgun Riven Mod': 'riven',
  'Zaw Riven Mod': 'riven',
  'Arch-Gun Riven Mod': 'riven',
  'Companion Weapon Riven Mod': 'riven',
} as const satisfies Record<string, ModCategory>

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

function buildBaseFields<K extends Kind>(raw: SourceItem, kind: K): GeneratedBaseFields<K> {
  return {
    id: resolveId(raw),
    kind,
    uniqueName: resolveUniqueName(raw),
    name: resolveName(raw),
    imageName: resolveImageName(raw),
    masteryReq: raw.masteryReq ?? 0,
    polarities: raw.polarities ?? [],
    tags: raw.tags ?? [],
  }
}

function createAbilityStatsEntry(ability: SourceAbilityRef): AbilityStatsObjectEntry {
  return {
    name: ability.name ?? '',
    description: ability.description ?? '',
    imageName: ability.imageName ?? '',
    stats: [{
      label: '',
      stats: [],
      misc: [],
    }],
  }
}

function ensureAbilityPointer(
  ability: SourceAbilityRef,
  abilityStatsDb: AbilityStatsDb,
): GeneratedAbilityPointer {
  const uniqueName = ability.uniqueName ?? ''

  if (!uniqueName) {
    return { uniqueName: '' }
  }

  const currentEntry = abilityStatsDb[uniqueName]

  if (!currentEntry) {
    abilityStatsDb[uniqueName] = createAbilityStatsEntry(ability)
    return { uniqueName }
  }

  if (Array.isArray(currentEntry)) {
    const first = currentEntry[0] ?? {}
    abilityStatsDb[uniqueName] = {
      name: typeof first.name === 'string' && first.name !== '' ? first.name : (ability.name ?? ''),
      description: typeof first.description === 'string' ? first.description : (ability.description ?? ''),
      imageName: typeof first.imageName === 'string' && first.imageName !== ''
        ? first.imageName
        : (typeof first.icon === 'string' && first.icon !== '' ? first.icon : (ability.imageName ?? '')),
      stats: currentEntry.map((row) => {
        const { name, description, icon, ...rest } = row
        void name
        void description
        void icon
        return rest
      }),
    }
    return { uniqueName }
  }

  if (!currentEntry.name) currentEntry.name = ability.name ?? ''
  if (!currentEntry.description) currentEntry.description = ability.description ?? ''
  if (!currentEntry.imageName && !currentEntry.icon) currentEntry.imageName = ability.imageName ?? ''
  else if (!currentEntry.imageName && currentEntry.icon) currentEntry.imageName = currentEntry.icon

  return { uniqueName }
}

function normalizeAbilityStatsDb(db: AbilityStatsDb): AbilityStatsDb {
  for (const [uniqueName, entry] of Object.entries(db)) {
    if (Array.isArray(entry)) {
      const first = entry[0] ?? {}
      db[uniqueName] = {
        name: typeof first.name === 'string' && first.name !== ''
          ? first.name
          : (uniqueName.split('/').pop() ?? 'Unknown'),
        description: typeof first.description === 'string' ? first.description : '',
        imageName: typeof first.imageName === 'string' && first.imageName !== ''
          ? first.imageName
          : (typeof first.icon === 'string' ? first.icon : ''),
        stats: entry.map((row) => {
          const { name, description, icon, ...rest } = row
          void name
          void description
          void icon
          return rest
        }),
      }
      continue
    }

    if (entry.imageName == null && entry.icon) {
      entry.imageName = entry.icon
    }
    delete entry.icon
  }

  return db
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

function resolveModCategory(rawType: string | null | undefined): ModCategory {
  if (!rawType) return 'unknown'

  return rawType in MOD_TYPE_TO_CATEGORY
    ? MOD_TYPE_TO_CATEGORY[rawType as keyof typeof MOD_TYPE_TO_CATEGORY]
    : 'unknown'
}

function mapAttack(raw: SourceAttack, weaponNormalizationState: WeaponNormalizationState): WeaponAttack {
  const damage = mapDamage(raw.damage)
  const total = isRecord(raw.damage) && typeof raw.damage.total === 'number'
    ? raw.damage.total
    : sumDamage(damage)

  return {
    name: raw.name ?? 'Attack',
    damage,
    totalDamage: total,
    crit_chance: raw.crit_chance != null ? raw.crit_chance / 100 : null,
    crit_mult: raw.crit_mult ?? null,
    status_chance: raw.status_chance != null ? raw.status_chance / 100 : null,
    speed: raw.speed ?? null,
    shot_type: normalizeWeaponShotType(raw.shot_type, weaponNormalizationState),
    flight: raw.flight ?? ((raw.shot_speed ?? 0) > 0 ? raw.shot_speed ?? null : null),
    falloff: raw.falloff ?? null,
    slide: raw.slide ?? null,
    charge_time: raw.charge_time ?? null,
  }
}

function mapWarframe(raw: SourceItem, abilityStatsDb: AbilityStatsDb): GeneratedWarframe {
  return {
    ...buildBaseFields(raw, 'warframe'),
    description: raw.description ?? '',
    health: raw.health ?? 0,
    shield: raw.shield ?? 0,
    armor: raw.armor ?? 0,
    power: raw.power ?? 0,
    sprintSpeed: raw.sprintSpeed ?? 0,
    passiveDescription: raw.passiveDescription ?? null,
    isPrime: raw.isPrime ?? false,
    aura: raw.aura ?? null,
    sex: raw.sex ?? null,
    introduced: resolveIntroduced(raw.introduced),
    wikiaThumbnail: raw.wikiaThumbnail ?? null,
    wikiaUrl: raw.wikiaUrl ?? null,
    abilities: (raw.abilities ?? []).map((ability) => ensureAbilityPointer(ability, abilityStatsDb)),
    passive: raw.passiveDescription ? resolveUniqueName(raw) : null,
    energy: raw.energy ?? raw.power ?? 0,
    initialEnergy: raw.initialEnergy ?? null,
    maxRank: raw.maxRank ?? 30,
    category: raw.category ?? 'Warframes',
    playstyle: raw.playstyle ?? [],
    progenitor: raw.progenitor ?? null,
    subsumed: raw.subsumed ?? null,
    themes: raw.themes ?? null,
    tactical: raw.tactical ?? null,
  }
}

function isIncludedWarframe(item: SourceItem): boolean {
  if (item.category !== 'Warframes') return false

  const uniqueName = item.uniqueName ?? ''
  const name = item.name ?? ''

  return !NECRAMECH_UNIQUE.has(uniqueName)
    && !EXCLUDED_WARFRAME_UNIQUE.has(uniqueName)
    && name !== 'Helminth'
}

function mapWeapon(raw: SourceItem, weaponNormalizationState: WeaponNormalizationState): GeneratedWeapon {
  const base: GeneratedWeapon = {
    ...buildBaseFields(raw, (raw.category?.toLowerCase() ?? 'primary') as GeneratedWeapon['kind']),
    description: raw.description ?? '',
    category: (raw.category ?? 'Primary') as WeaponCategory,
    productCategory: raw.productCategory ?? null,
    type: raw.type ?? null,
    isPrime: raw.isPrime ?? false,
    tradable: raw.tradable ?? false,
    slot: raw.slot ?? null,
    damage: mapDamage(raw.damage),
    totalDamage: raw.totalDamage ?? 0,
    criticalChance: raw.criticalChance ?? 0,
    criticalMultiplier: raw.criticalMultiplier ?? 0,
    procChance: raw.procChance ?? 0,
    fireRate: raw.fireRate ?? null,
    magazineSize: raw.magazineSize ?? null,
    reloadTime: raw.reloadTime ?? null,
    multishot: raw.multishot ?? null,
    accuracy: raw.accuracy ?? null,
    noise: raw.noise ?? null,
    trigger: raw.trigger ?? null,
    disposition: raw.disposition ?? null,
    introduced: resolveIntroduced(raw.introduced),
    wikiaThumbnail: raw.wikiaThumbnail ?? null,
    wikiaUrl: raw.wikiaUrl ?? null,
    attacks: (raw.attacks ?? []).map((attack) => mapAttack(attack, weaponNormalizationState)),
  }

  if (raw.category === 'Melee') {
    base.range = raw.range ?? null
    base.attackSpeed = raw.attackSpeed ?? null
    base.comboDuration = raw.comboDuration ?? null
    base.followThrough = raw.followThrough ?? null
    base.blockingAngle = raw.blockingAngle ?? null
    base.slamAttack = raw.slamAttack ?? null
    base.slamRadialDamage = raw.slamRadialDamage ?? null
    base.slamRadius = raw.slamRadius ?? null
    base.heavyAttackDamage = raw.heavyAttackDamage ?? null
    base.heavySlamAttack = raw.heavySlamAttack ?? null
    base.heavySlamRadialDamage = raw.heavySlamRadialDamage ?? null
    base.heavySlamRadius = raw.heavySlamRadius ?? null
    base.slideAttack = raw.slideAttack ?? null
    base.windUp = raw.windUp ?? null
    base.stancePolarity = raw.stancePolarity ?? null
  }

  return base
}

function mapMod(raw: SourceItem): GeneratedMod {
  return {
    ...buildBaseFields(raw, 'mod'),
    description: raw.description ?? '',
    categoryRaw: raw.category ?? null,
    type: raw.type ?? null,
    category: resolveModCategory(raw.type),
    compatName: raw.compatName ?? null,
    baseDrain: raw.baseDrain ?? null,
    polarity: raw.polarity ?? null,
    rarity: raw.rarity ?? null,
    rank: raw.maxRank ?? raw.fusionLimit ?? null,
    levelStats: raw.levelStats ?? null,
    upgradeTypes: raw.upgradeTypes ?? [],
    isExilus: raw.isExilus ?? undefined,
    isFlawed: raw.isFlawed ?? undefined,
    modClass: raw.modClass ?? undefined,
    isWeaponAugment: raw.isWeaponAugment ?? undefined,
    incompatible: raw.incompatible ?? undefined,
    incompatibilityTags: raw.incompatibilityTags ?? undefined,
  }
}

function mapArcane(raw: SourceItem, arcaneNormalizationState: ArcaneNormalizationState): GeneratedArcane {
  const semantics = normalizeArcaneSemantics(raw.type, arcaneNormalizationState)

  return {
    ...buildBaseFields(raw, 'arcane'),
    type: raw.type ?? null,
    category: semantics.category,
    compatName: semantics.compatName,
    rarity: raw.rarity ?? null,
    tradable: raw.tradable ?? false,
    maxRank: raw.levelStats?.length ? raw.levelStats.length - 1 : 0,
    levelStats: raw.levelStats ?? [],
  }
}

function mapCompanion(raw: SourceItem): GeneratedCompanion {
  return {
    ...buildBaseFields(raw, 'companion'),
    description: raw.description ?? '',
    category: (raw.category ?? 'Pets') as CompanionCategory,
    health: raw.health ?? null,
    shield: raw.shield ?? null,
    armor: raw.armor ?? null,
    isPrime: raw.isPrime ?? false,
    tradable: raw.tradable ?? false,
    introduced: resolveIntroduced(raw.introduced),
    wikiaThumbnail: raw.wikiaThumbnail ?? null,
    wikiaUrl: raw.wikiaUrl ?? null,
  }
}

function mapArchwingWeapon(raw: SourceItem, weaponNormalizationState: WeaponNormalizationState): GeneratedArchwingWeapon {
  return {
    ...buildBaseFields(raw, raw.category === 'Arch-Gun' ? 'archgun' : 'archmelee'),
    description: raw.description ?? '',
    category: (raw.category ?? 'Arch-Gun') as ArchwingWeaponCategory,
    isPrime: raw.isPrime ?? false,
    tradable: raw.tradable ?? false,
    introduced: resolveIntroduced(raw.introduced),
    wikiaThumbnail: raw.wikiaThumbnail ?? null,
    wikiaUrl: raw.wikiaUrl ?? null,
    damage: mapDamage(raw.damage),
    totalDamage: raw.totalDamage ?? 0,
    criticalChance: raw.criticalChance ?? 0,
    criticalMultiplier: raw.criticalMultiplier ?? 0,
    procChance: raw.procChance ?? 0,
    attacks: (raw.attacks ?? []).map((attack) => mapAttack(attack, weaponNormalizationState)),
  }
}

function mapVehicle(raw: SourceItem, kind: VehicleKind): GeneratedVehicle {
  return {
    ...buildBaseFields(raw, kind),
    description: raw.description ?? '',
    category: raw.category ?? '',
    health: raw.health ?? null,
    shield: raw.shield ?? null,
    armor: raw.armor ?? null,
    isPrime: raw.isPrime ?? false,
    tradable: raw.tradable ?? false,
    introduced: resolveIntroduced(raw.introduced),
    wikiaThumbnail: raw.wikiaThumbnail ?? null,
    wikiaUrl: raw.wikiaUrl ?? null,
    abilities: (raw.abilities ?? []).map((ability) => ({ uniqueName: ability.uniqueName ?? '' })),
  }
}

function buildWarframesArtifacts(sourceItems: SourceItem[], abilityStatsDb: AbilityStatsDb): {
  warframes: GeneratedWarframe[]
  abilityStatsDb: AbilityStatsDb
  passivesDb: PassivesDb
} {
  const warframes = sourceItems
    .filter((item) => isIncludedWarframe(item))
    .map((item) => mapWarframe(item, abilityStatsDb))

  const passivesDb: PassivesDb = {}

  for (const warframe of warframes) {
    if (!warframe.passive) continue

    passivesDb[warframe.passive] = {
      name: `${warframe.name} Passive`,
      description: warframe.passiveDescription ?? '',
    }
  }

  return {
    warframes,
    abilityStatsDb: normalizeAbilityStatsDb(abilityStatsDb),
    passivesDb,
  }
}

function buildWeaponsArtifacts(sourceItems: SourceItem[], weaponNormalizationState: WeaponNormalizationState): GeneratedWeapon[] {
  return sourceItems
    .filter((item) => {
      const category = item.category
      return typeof category === 'string' && WEAPON_CATEGORIES.includes(category as WeaponCategory)
    })
    .map((item) => mapWeapon(item, weaponNormalizationState))
}

function buildModsArtifacts(sourceItems: SourceItem[]): GeneratedMod[] {
  return sourceItems
    .filter((item) => item.category === 'Mods' && !item.isFlawed)
    .map((item) => mapMod(item))
}

function buildArcanesArtifacts(sourceItems: SourceItem[], arcaneNormalizationState: ArcaneNormalizationState): GeneratedArcane[] {
  return sourceItems
    .filter((item) => item.category === 'Arcanes' && (item.levelStats?.length ?? 0) > 0)
    .map((item) => mapArcane(item, arcaneNormalizationState))
}

function buildCompanionsArtifacts(sourceItems: SourceItem[]): GeneratedCompanion[] {
  return sourceItems
    .filter((item) => {
      const category = item.category
      return typeof category === 'string' && COMPANION_CATEGORIES.includes(category as CompanionCategory)
    })
    .map((item) => mapCompanion(item))
}

function buildArchwingWeaponsArtifacts(sourceItems: SourceItem[], weaponNormalizationState: WeaponNormalizationState): GeneratedArchwingWeapon[] {
  return sourceItems
    .filter((item) => {
      const category = item.category
      return typeof category === 'string' && ARCHWING_WEAPON_CATEGORIES.includes(category as ArchwingWeaponCategory)
    })
    .map((item) => mapArchwingWeapon(item, weaponNormalizationState))
}

function buildVehiclesArtifacts(sourceItems: SourceItem[]): {
  vehicles: GeneratedVehicle[]
  necramechCount: number
  archwingCount: number
} {
  const necramechs = sourceItems
    .filter((item) => NECRAMECH_UNIQUE.has(item.uniqueName ?? ''))
    .map((item) => mapVehicle(item, 'necramech'))

  const archwings = sourceItems
    .filter((item) => item.category === 'Archwing')
    .map((item) => mapVehicle(item, 'archwing'))

  return {
    vehicles: [...necramechs, ...archwings],
    necramechCount: necramechs.length,
    archwingCount: archwings.length,
  }
}

export function buildRuntimeDataArtifacts(params: {
  sourceItems: SourceItem[]
  abilityStatsDb: AbilityStatsDb
  arcaneNormalizationState: ArcaneNormalizationState
  weaponNormalizationState: WeaponNormalizationState
}): RuntimeDataArtifacts {
  const warframesArtifacts = buildWarframesArtifacts(params.sourceItems, params.abilityStatsDb)
  const weapons = buildWeaponsArtifacts(params.sourceItems, params.weaponNormalizationState)
  const mods = buildModsArtifacts(params.sourceItems)
  const arcanes = buildArcanesArtifacts(params.sourceItems, params.arcaneNormalizationState)
  const companions = buildCompanionsArtifacts(params.sourceItems)
  const archwingWeapons = buildArchwingWeaponsArtifacts(params.sourceItems, params.weaponNormalizationState)
  const vehiclesArtifacts = buildVehiclesArtifacts(params.sourceItems)

  return {
    warframes: warframesArtifacts.warframes,
    abilityStatsDb: warframesArtifacts.abilityStatsDb,
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
