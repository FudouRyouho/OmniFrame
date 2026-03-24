/**
 * generate-data.mjs
 * Genera los JSONs estáticos para el builder a partir de @wfcd/items.
 * Correr con: node scripts/generate-data.mjs
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import Items from '@wfcd/items'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(__dirname, '../public/data')

await fs.mkdir(outDir, { recursive: true })

const require = createRequire(import.meta.url)
let abilityStatsDb = require('../data/overrides/ability-stats.override.json')
const passivesDb = {}

const instance = new Items()



// --- Warframes ---
const warframes = instance
  .filter(i => i.category === 'Warframes')
  .map(raw => ({
    // BaseItem compatibility fields (wiki canonical format)
    id: raw.uniqueName ?? raw.name,
    kind: 'warframe', // BaseItem Kind — singular, matches types.ts
    image: raw.imageName ? `https://cdn.warframestat.us/img/${raw.imageName}` : null,
    
    uniqueName: raw.uniqueName ?? '',
    name: raw.name ?? '',
    description: raw.description ?? '',
    imageName: raw.imageName ?? '',
    health: raw.health ?? 0,
    shield: raw.shield ?? 0,
    armor: raw.armor ?? 0,
    power: raw.power ?? 0,
    sprintSpeed: raw.sprintSpeed ?? 0,
    masteryReq: raw.masteryReq ?? 0,
    passiveDescription: raw.passiveDescription ?? null,
    isPrime: raw.isPrime ?? false,
    aura: raw.aura ?? null,
    polarities: raw.polarities ?? [],
    sex: raw.sex ?? null,
    introduced: raw.introduced?.name ?? raw.introduced ?? null,
    wikiaThumbnail: raw.wikiaThumbnail ?? null,
    wikiaUrl: raw.wikiaUrl ?? null,
      abilities: (raw.abilities ?? []).map(a => {
        if (a.uniqueName) {
          const uniqueName = a.uniqueName;
          if (!abilityStatsDb[uniqueName]) {
            // New ability: initialize with metadata
            abilityStatsDb[uniqueName] = {
              name: a.name,
              description: a.description,
              icon: a.imageName,
              stats: [{
                label: "", 
                stats: [],
                misc: []
              }]
            };
          } else {
            // Convert existing array structure to object structure if needed
            if (Array.isArray(abilityStatsDb[uniqueName])) {
              const oldRows = abilityStatsDb[uniqueName];
              const first = oldRows[0] || {};
              abilityStatsDb[uniqueName] = {
                name: first.name || a.name,
                description: first.description || a.description,
                icon: first.icon || a.imageName,
                stats: oldRows.map(row => {
                  // eslint-disable-next-line no-unused-vars
                  const { name, description, icon, ...rest } = row;
                  return rest;
                })
              };
            }
            
            // Existing ability: ensure metadata is populated if missing
            const entry = abilityStatsDb[uniqueName];
            if (!entry.name) entry.name = a.name;
            if (!entry.description) entry.description = a.description;
            if (!entry.icon) entry.icon = a.imageName;
          }
          return { uniqueName };
        }
        return { uniqueName: '' };
      }),
    passive: (() => {
      if (raw.passiveDescription) {
        passivesDb[raw.uniqueName] = {
           name: raw.name + " Passive",
           description: raw.passiveDescription
        }
        return raw.uniqueName // Pointer to passives.json
      }
      return null
    })(),
    // Stats from Module:Warframes/data
    energy: raw.energy ?? raw.power ?? 0,
    initialEnergy: raw.initialEnergy ?? null,
    healthRank30: raw.healthRank30 ?? null,
    shieldRank30: raw.shieldRank30 ?? null,
    armorRank30: raw.armorRank30 ?? null,
    energyRank30: raw.energyRank30 ?? null,
    maxRank: raw.maxRank ?? 30,
    category: raw.category ?? 'Warframes',
    playstyle: raw.playstyle ?? [],
    progenitor: raw.progenitor ?? null,
    subsumed: raw.subsumed ?? null,
    themes: raw.themes ?? null,
    tactical: raw.tactical ?? null,
  }))

// --- Global Migration Check ---
// Ensure ALL entries in abilityStatsDb are in the new object format, 
// even those not processed in the Warframe loop (e.g. Archwings, Necramechs)
for (const [uniqueName, entry] of Object.entries(abilityStatsDb)) {
  if (Array.isArray(entry)) {
    const oldRows = entry;
    const first = oldRows[0] || {};
    abilityStatsDb[uniqueName] = {
      name: first.name || uniqueName.split('/').pop() || 'Unknown',
      description: first.description || '',
      icon: first.icon || '',
      stats: oldRows.map(row => {
        // eslint-disable-next-line no-unused-vars
        const { name, description, icon, ...rest } = row;
        return rest;
      })
    };
  }
}

// Save everything
await fs.writeFile(path.join(outDir, 'warframes.json'), JSON.stringify(warframes))
await fs.writeFile(path.join(outDir, 'ability-stats.override.json'), JSON.stringify(abilityStatsDb, null, 2))
await fs.writeFile(path.join(outDir, 'passives.json'), JSON.stringify(passivesDb, null, 2))

console.log(`✓ warframes.json — ${warframes.length} warframes`)

// --- Weapons (Primary, Secondary, Melee) ---
const WEAPON_CATS = ['Primary', 'Secondary', 'Melee']

const mapDamage = (raw) => {
  if (!raw || typeof raw !== 'object') return {}
  const result = {}
  for (const [k, v] of Object.entries(raw)) {
    if (k === 'total') continue
    if (typeof v !== 'number' || v <= 0) continue
    result[k] = v
  }
  return result
}

const sumDamage = (dmg) =>
  Object.values(dmg).reduce((acc, v) => acc + (typeof v === 'number' ? v : 0), 0)

const mapAttack = (a) => ({
  name:          a.name ?? 'Attack',
  damage:        mapDamage(a.damage),
  totalDamage:   a.damage?.total ?? sumDamage(mapDamage(a.damage)),
  crit_chance:   a.crit_chance != null ? a.crit_chance / 100 : null,
  crit_mult:     a.crit_mult    ?? null,
  status_chance: a.status_chance != null ? a.status_chance / 100 : null,
  speed:         a.speed        ?? null,
  shot_type:     a.shot_type    ?? null,
  // flight is canonical; shot_speed is a legacy alias — use shot_speed as fallback only if > 0
  flight:        a.flight ?? (a.shot_speed > 0 ? a.shot_speed : null),
  falloff:       a.falloff      ?? null,
  slide:         a.slide        ?? null,
  charge_time:   a.charge_time  ?? null,
})

// Mapeo canónico de mod.type → category normalizada
// Principio: colapsar variantes del mismo sistema, mantener sistemas distintos separados
const MOD_TYPE_TO_CATEGORY = {
  'Warframe Mod':               'warframe',
  'Primary Mod':                'primary',
  'Shotgun Mod':                'primary',
  'Secondary Mod':              'secondary',
  'Melee Mod':                  'melee',
  'Stance Mod':                 'melee',
  'Companion Mod':              'companion',
  'Posture Mod':                'companion',
  'Arch-Gun Mod':               'archgun',
  'Arch-Melee Mod':             'archmelee',
  'Archwing Mod':               'archwing',
  'Focus Way':                  'focus',
  'Plexus Mod':                 'railjack',
  'Railjack Mod':               'railjack',
  'Necramech Mod':              'necramech',
  'K-Drive Mod':                'kdrive',
  'Parazon Mod':                'parazon',
  'Tektolyst Artifact Mod':     'tektolyst',
  'Mod Set Mod':                'modset',
  'Transmutation Mod':          'transmutation',
  'Peculiar Mod':               'peculiar',
  // Rivens — normalizados pero excluidos en runtime via excludeKinds
  'Rifle Riven Mod':            'riven',
  'Shotgun Riven Mod':          'riven',
  'Pistol Riven Mod':           'riven',
  'Melee Riven Mod':            'riven',
  'Kitgun Riven Mod':           'riven',
  'Zaw Riven Mod':              'riven',
  'Arch-Gun Riven Mod':         'riven',
  'Companion Weapon Riven Mod': 'riven',
}

const mapMod = (raw) => ({
  id:          raw.uniqueName ?? raw.name,
  name:        raw.name ?? '',
  kind:        'mod',
  image:       raw.imageName ? `https://cdn.warframestat.us/img/${raw.imageName}` : null,
  uniqueName:  raw.uniqueName ?? null,
  categoryRaw: raw.category  ?? null,
  type:        raw.type       ?? null,
  category:    MOD_TYPE_TO_CATEGORY[raw.type] ?? 'unknown',
  compatName:  raw.compatName ?? null,
  baseDrain:   raw.baseDrain  ?? null,
  polarity:    raw.polarity   ?? null,
  rarity:      raw.rarity     ?? null,
  // maxRank del wikia es más fiable que fusionLimit del API (ej: Galvanized Chamber = 10)
  rank:        raw.maxRank    ?? raw.fusionLimit ?? null,
  levelStats:  raw.levelStats  ?? null,
  masteryReq:  raw.masteryReq  ?? 0,
  polarities:  raw.polarities  ?? [],
  tags:        raw.tags        ?? [],
  description: raw.description ?? '',
  imageName:   raw.imageName   ?? '',
  // Campos canónicos del wikia (Module:Mods/data)
  upgradeTypes:        raw.upgradeTypes        ?? [],
  isExilus:            raw.isExilus            ?? undefined,
  isFlawed:            raw.isFlawed            ?? undefined,
  modClass:            raw.modClass            ?? undefined,
  isWeaponAugment:     raw.isWeaponAugment     ?? undefined,
  incompatible:        raw.incompatible        ?? undefined,
  incompatibilityTags: raw.incompatibilityTags ?? undefined,
})

const weapons = instance
  .filter(i => WEAPON_CATS.includes(i.category))
  .map(raw => {
    const w = {
      // BaseItem compatibility fields (wiki canonical format)
      id: raw.uniqueName ?? raw.name,
      kind: raw.category.toLowerCase(), // "Primary" → "primary"
      image: raw.imageName ? `https://cdn.warframestat.us/img/${raw.imageName}` : null,
      
      uniqueName:          raw.uniqueName ?? '',
      name:                raw.name ?? '',
      description:         raw.description ?? '',
      imageName:           raw.imageName ?? '',
      category:            raw.category,
      productCategory:     raw.productCategory ?? null,
      type:                raw.type ?? null,
      masteryReq:          raw.masteryReq ?? 0,
      isPrime:             raw.isPrime ?? false,
      tradable:            raw.tradable ?? false,
      slot:                raw.slot ?? null,
      damage:              mapDamage(raw.damage),
      totalDamage:         raw.totalDamage ?? 0,
      criticalChance:      raw.criticalChance ?? 0,
      criticalMultiplier:  raw.criticalMultiplier ?? 0,
      procChance:          raw.procChance ?? 0,
      fireRate:            raw.fireRate ?? null,
      magazineSize:        raw.magazineSize ?? null,
      reloadTime:          raw.reloadTime ?? null,
      multishot:           raw.multishot ?? null,
      accuracy:            raw.accuracy ?? null,
      noise:               raw.noise ?? null,
      trigger:             raw.trigger ?? null,
      disposition:         raw.disposition ?? null,
      polarities:          raw.polarities ?? [],
      introduced:          raw.introduced?.name ?? raw.introduced ?? null,
      wikiaThumbnail:      raw.wikiaThumbnail ?? null,
      wikiaUrl:            raw.wikiaUrl ?? null,
      tags:                raw.tags ?? [],
      attacks:             (raw.attacks ?? []).map(a => mapAttack(a)),
    }
    // Melee-only fields
    if (raw.category === 'Melee') {
      Object.assign(w, {
        range:                 raw.range              ?? null,
        attackSpeed:           raw.attackSpeed        ?? null,
        comboDuration:         raw.comboDuration      ?? null,
        followThrough:         raw.followThrough      ?? null,
        blockingAngle:         raw.blockingAngle      ?? null,
        slamAttack:            raw.slamAttack         ?? null,
        slamRadialDamage:      raw.slamRadialDamage   ?? null,
        slamRadius:            raw.slamRadius         ?? null,
        heavyAttackDamage:     raw.heavyAttackDamage  ?? null,
        heavySlamAttack:       raw.heavySlamAttack    ?? null,
        heavySlamRadialDamage: raw.heavySlamRadialDamage ?? null,
        heavySlamRadius:       raw.heavySlamRadius    ?? null,
        slideAttack:           raw.slideAttack        ?? null,
        windUp:                raw.windUp             ?? null,
        stancePolarity:        raw.stancePolarity     ?? null,
      })
    }
    return w
  })

await fs.writeFile(
  path.join(outDir, 'weapons.json'),
  JSON.stringify(weapons)
)

console.log(`✓ weapons.json — ${weapons.length} weapons`)

// --- Mods ---
const mods = instance
  .filter(i => i.category === 'Mods')
  .map(mapMod)

await fs.writeFile(
  path.join(outDir, 'mods.json'),
  JSON.stringify(mods)
)

console.log(`✓ mods.json — ${mods.length} mods`)

// --- Arcanes ---
// Mapeo canónico de arcane.type → entidad a la que aplica en el Layout
const ARCANE_TYPE_TO_ENTITY = {
  'Warframe Arcane':  'warframe',
  'Primary Arcane':   'primary',
  'Secondary Arcane': 'secondary',
  'Melee Arcane':     'melee',
  'Shotgun Arcane':   'primary',   // shotguns son Primary en el layout
  'Bow Arcane':       'primary',   // bows son Primary en el layout
  'Amp Arcane':       'amp',       // v2 — Operator/Amp fuera de scope v1
  'Kitgun Arcane':    'secondary', // kitguns son Secondary en el layout
  'Zaw Arcane':       'melee',     // zaws son Melee en el layout
  'Operator Arcane':  'operator',  // v2 — Operator fuera de scope v1
  'Arcane':           'unknown',   // datos incompletos en la fuente
}

const mapArcane = (raw) => ({
  id:          raw.uniqueName,
  kind:        'arcane',
  image:       raw.imageName ? `https://cdn.warframestat.us/img/${raw.imageName}` : null,
  uniqueName:  raw.uniqueName,
  name:        raw.name ?? '',
  type:        raw.type ?? null,
  // entidad del Layout a la que aplica este arcano — inferido de type
  entity:      ARCANE_TYPE_TO_ENTITY[raw.type] ?? 'unknown',
  rarity:      raw.rarity ?? null,
  tradable:    raw.tradable ?? false,
  imageName:   raw.imageName ?? '',
  // maxRank inferido de levelStats.length — no existe campo explícito en la fuente
  // rank 0 = primer rango, rank (maxRank) = rango máximo
  maxRank:     raw.levelStats?.length ? raw.levelStats.length - 1 : null,
  levelStats:  raw.levelStats ?? [],
  // upgradeTypes no existe para arcanos — sin cobertura canónica de stat
  // los efectos numéricos vendrán de arcane-stats.json (override, pendiente GAP-DOC-2)
})

// Excluir arcanos sin levelStats (datos incompletos en la fuente — 6 entradas)
const arcanes = instance
  .filter(i => i.category === 'Arcanes' && i.levelStats?.length > 0)
  .map(mapArcane)

await fs.writeFile(
  path.join(outDir, 'arcanes.json'),
  JSON.stringify(arcanes)
)

console.log(`✓ arcanes.json — ${arcanes.length} arcanos`)
console.log('Done.')
