/**
 * WALKTHROUGH DE ARQUITECTURA — 2026-03-28
 *
 * Ejemplo completo con datos reales del override JSON.
 * Escenario: Rhino Prime con mods de warframe + Braton Prime con mods de rifle.
 *
 * PROPÓSITO: validar el flujo Loadout → B1 → Resolver → B2 → Engine → B3 → Resolver → B4
 * antes de implementar. Detectar incoherencias en los contratos.
 *
 * NO ES código de producción. Ref: Docs/domains/engine/architecture.md (C35-C37)
 *
 * NOTA: Los upgradeTypes en el override JSON son los REALES extraídos del juego.
 * Son diferentes a los que usa el engine legacy (warframe-core.ts usaba AVATAR_ARMOR_MAX,
 * AVATAR_POWER_STRENGTH, etc.). Esto es drift del engine viejo — los contratos nuevos
 * usan los upgradeTypes reales del override.
 */

// =============================================================================
// TIPOS — Boundary contracts (C35, C36, C37)
// =============================================================================

interface ModSlot    { uniqueName: string; rank: number }
interface ArcaneSlot { uniqueName: string; rank: number }

interface EntityConfig {
  label?: string
  mods:    Array<ModSlot | null>
  arcanes?: Array<ArcaneSlot | null>
}

interface EntitySlot {
  uniqueName:        string
  activeConfigIndex: number
  configs:           EntityConfig[]
}

interface LoadoutState {
  warframe?:       EntitySlot
  primaryWeapon?:  EntitySlot
  secondaryWeapon?: EntitySlot
  meleeWeapon?:    EntitySlot
}

// B1 — Loadout → Resolver
interface EquippedEntity {
  uniqueName: string
  mods:       Array<{ uniqueName: string; rank: number }>
  arcanes?:   Array<{ uniqueName: string; rank: number }>
}
interface LoadoutInput {
  warframe?:       EquippedEntity
  primaryWeapon?:  EquippedEntity
  secondaryWeapon?: EquippedEntity
  meleeWeapon?:    EquippedEntity
}

// B2 — Resolver → Engine
interface ResolvedStat {
  upgradeType: string
  value:       number
  condition:   string | null
}

interface WarframeBase {
  uniqueName:  string
  health:      number
  shield:      number
  armor:       number
  power:       number   // energy pool; 0 para Lavos (sin pool de energía — decisión: mantener number, documentar)
  sprintSpeed: number
}

// Normalizado por generate-data: trigger + shot_type → deliveryType
// El Resolver recibe el dato ya limpio — no hace mapeo de semántica del juego
type AttackDeliveryType =
  | "hitscan-single"
  | "projectile-single"
  | "projectile-charged"
  | "pellet-shot"
  | "beam-continuous"
  | "aoe"
  | "dot-secondary"
  | "thrown"
  | "unknown"

type DamageMap = Partial<Record<string, number>>

// Ataque individual — normalizado por generate-data (deliveryType incluido)
interface WeaponAttack {
  name:         string
  totalDamage:  number
  damage:       DamageMap           // distribución por tipo (impact/puncture/slash/heat/etc)
  critChance:   number
  critMult:     number
  statusChance: number
  fireRate:     number              // "speed" en el dataset crudo
  deliveryType: AttackDeliveryType
}

// Stats de nivel de arma — compartidos por todos los ataques
interface WeaponBase {
  uniqueName:   string
  magazineSize: number
  reloadTime:   number
  multishot:    number    // base del arma; el Engine aplica uniformemente a cada ataque
  attacks:      WeaponAttack[]
}

interface ResolvedChannel<TBase> {
  base:  TBase
  stats: ResolvedStat[]
}

interface ResolvedLayout {
  warframe?:       ResolvedChannel<WarframeBase>
  primaryWeapon?:  ResolvedChannel<WeaponBase>
  secondaryWeapon?: ResolvedChannel<WeaponBase>
  meleeWeapon?:    ResolvedChannel<WeaponBase>
}

interface CalculationContext {
  // v1: vacío — todas las condiciones activas
  // v1+: ConditionState[] con condiciones activas del jugador
}

// B3 — Engine → Resolver
interface WarframeStatOutput {
  health:      number
  shield:      number
  armor:       number
  power:       number
  sprintSpeed: number
  // [NOTA-A]: AVATAR_ABILITY_STRENGTH no está aquí — va en otro canal de output (ability stats)
}

// Output por ataque individual — mismo orden y largo que WeaponBase.attacks[]
interface WeaponAttackOutput {
  name:                  string
  totalDamage:           number
  critChance:            number
  critMult:              number
  statusChance:          number
  fireRate:              number
  multishot:             number          // efectivo tras mods
  averageCritMultiplier: number          // 1 + critChance * (critMult - 1)
}

// Stats de nivel de arma + ataques calculados
interface WeaponStatOutput {
  magazineSize: number
  reloadTime:   number
  attacks:      WeaponAttackOutput[]    // mismo orden y largo que WeaponBase.attacks[]
}

interface EngineOutput {
  warframe?:      WarframeStatOutput
  primaryWeapon?: WeaponStatOutput
}


// =============================================================================
// PASO 1: LOADOUT STATE (Capa 1)
// El jugador tiene Rhino Prime + Config A con 5 mods + Braton Prime con 5 mods
// =============================================================================

const loadoutState: LoadoutState = {
  warframe: {
    uniqueName: "/Lotus/Powersuits/Rhino/RhinoPrime",
    activeConfigIndex: 0,
    configs: [
      {
        label: "Config A",
        mods: [
          { uniqueName: "/Lotus/Upgrades/Mods/Warframe/AvatarAbilityStrengthMod", rank: 5 }, // Intensify max
          { uniqueName: "/Lotus/Upgrades/Mods/Warframe/AvatarHealthMaxMod",       rank: 9 }, // Vitality max (rank 9 = 91%)
          { uniqueName: "/Lotus/Upgrades/Mods/Warframe/AvatarShieldMaxMod",       rank: 9 }, // Redirection max
          { uniqueName: "/Lotus/Upgrades/Mods/Warframe/AvatarArmourMod",          rank: 9 }, // Steel Fiber max (rank 9 = 91%)
          { uniqueName: "/Lotus/Upgrades/Mods/Warframe/AvatarPowerMaxMod",        rank: 5 }, // Flow max
          null, // slot 6 vacío
          null, // slot 7 vacío
          null, // slot 8 — exilus vacío
        ]
      }
    ]
  },

  primaryWeapon: {
    uniqueName: "/Lotus/Weapons/Tenno/Rifle/BratonPrime",
    activeConfigIndex: 0,
    configs: [
      {
        label: "Config A",
        mods: [
          { uniqueName: "/Lotus/Upgrades/Mods/Rifle/WeaponDamageAmountMod", rank: 10 }, // Serration rank 10 (+165%)
          { uniqueName: "/Lotus/Upgrades/Mods/Rifle/WeaponCritChanceMod",   rank: 5  }, // Point Strike rank 5 (+150%)
          { uniqueName: "/Lotus/Upgrades/Mods/Rifle/WeaponCritDamageMod",   rank: 5  }, // Vital Sense rank 5 (+120%)
          null,
          null,
          null,
          null,
          null,
        ]
      }
    ]
  }
}


// =============================================================================
// PASO 2: toResolverInput() — Capa 1 serializa para el Resolver (B1)
// Filtra nulls, toma config activa
// =============================================================================

function toResolverInput(state: LoadoutState): LoadoutInput {
  const result: LoadoutInput = {}

  for (const canal of ['warframe', 'primaryWeapon', 'secondaryWeapon', 'meleeWeapon'] as const) {
    const slot = state[canal]
    if (!slot) continue

    const config = slot.configs[slot.activeConfigIndex]
    result[canal] = {
      uniqueName: slot.uniqueName,
      mods: config.mods.filter((m): m is ModSlot => m !== null),
      arcanes: config.arcanes?.filter((a): a is ArcaneSlot => a !== null),
    }
  }

  return result
}

// B1 — output real:
const loadoutInput: LoadoutInput = {
  warframe: {
    uniqueName: "/Lotus/Powersuits/Rhino/RhinoPrime",
    mods: [
      { uniqueName: "/Lotus/Upgrades/Mods/Warframe/AvatarAbilityStrengthMod", rank: 5 },
      { uniqueName: "/Lotus/Upgrades/Mods/Warframe/AvatarHealthMaxMod",       rank: 9 },
      { uniqueName: "/Lotus/Upgrades/Mods/Warframe/AvatarShieldMaxMod",       rank: 9 },
      { uniqueName: "/Lotus/Upgrades/Mods/Warframe/AvatarArmourMod",          rank: 9 },
      { uniqueName: "/Lotus/Upgrades/Mods/Warframe/AvatarPowerMaxMod",        rank: 5 },
    ]
  },
  primaryWeapon: {
    uniqueName: "/Lotus/Weapons/Tenno/Rifle/BratonPrime",
    mods: [
      { uniqueName: "/Lotus/Upgrades/Mods/Rifle/WeaponDamageAmountMod", rank: 10 },
      { uniqueName: "/Lotus/Upgrades/Mods/Rifle/WeaponCritChanceMod",   rank: 5  },
      { uniqueName: "/Lotus/Upgrades/Mods/Rifle/WeaponCritDamageMod",   rank: 5  },
    ]
  }
}


// =============================================================================
// PASO 3: Resolver forward — lookup en override + dataset (B1 → B2)
// =============================================================================

// --- Lookup warframe base stats (del itemDataset) ---
// Rhino Prime (valores aproximados del juego):
const rhinoPrimeBase: WarframeBase = {
  uniqueName:  "/Lotus/Powersuits/Rhino/RhinoPrime",
  health:      450,   // base Rhino Prime
  shield:      225,
  armor:       275,
  power:       225,
  sprintSpeed: 0.95,
}

// --- Lookup mods de warframe en mod-stats.override.json ---
// Intensify rank 5:     AVATAR_ABILITY_STRENGTH  baseValue[5] = 30
// Vitality rank 9:      AVATAR_HEALTH_MAX         baseValue[9] = 91
// Redirection rank 9:   AVATAR_SHIELD_MAX         baseValue[9] = 91
// Steel Fiber rank 9:   AVATAR_ARMOUR             baseValue[9] = 91
// Flow rank 5:          AVATAR_POWER_MAX          baseValue[5] = 100

// --- Lookup weapon base stats (del itemDataset — generate-data ya normalizó deliveryType) ---
// Braton Prime — valores reales de weapons.json (públicamente verificados):
const bratonPrimeBase: WeaponBase = {
  uniqueName:   "/Lotus/Weapons/Tenno/Rifle/BratonPrime",
  magazineSize: 75,
  reloadTime:   2.15,
  multishot:    1,
  attacks: [
    {
      name:         "Normal Attack",
      totalDamage:  35,
      damage:       { impact: 1.75, puncture: 12.25, slash: 21 },
      critChance:   0.12,
      critMult:     2.0,
      statusChance: 0.26,
      fireRate:     9.58,
      deliveryType: "hitscan-single",  // trigger: "Auto" + shot_type: "Hit-Scan" → generate-data
    },
    {
      name:         "Incarnon Form",
      totalDamage:  70,
      damage:       { impact: 28, puncture: 2.8, slash: 39.2 },
      critChance:   0.30,
      critMult:     3.0,
      statusChance: 0.30,
      fireRate:     5.67,
      deliveryType: "hitscan-single",
    },
    {
      name:         "Incarnon Form AoE",
      totalDamage:  70,
      damage:       { heat: 70 },
      critChance:   0.30,
      critMult:     3.0,
      statusChance: 0.30,
      fireRate:     5.67,
      deliveryType: "aoe",             // shot_type: "AoE" → generate-data
    },
  ]
}

// --- Lookup mods de arma ---
// Serration rank 10:    WEAPON_DAMAGE_AMOUNT  baseValue[10] = 165
// Point Strike rank 5:  WEAPON_CRIT_CHANCE    baseValue[5]  = 150
// Vital Sense rank 5:   WEAPON_CRIT_DAMAGE    baseValue[5]  = 120

// B2 — ResolvedLayout completo:
const resolvedLayout: ResolvedLayout = {
  warframe: {
    base: rhinoPrimeBase,
    stats: [
      { upgradeType: "AVATAR_ABILITY_STRENGTH", value: 30,  condition: null }, // Intensify r5
      { upgradeType: "AVATAR_HEALTH_MAX",        value: 91,  condition: null }, // Vitality r9
      { upgradeType: "AVATAR_SHIELD_MAX",        value: 91,  condition: null }, // Redirection r9
      { upgradeType: "AVATAR_ARMOUR",            value: 91,  condition: null }, // Steel Fiber r9
      { upgradeType: "AVATAR_POWER_MAX",         value: 100, condition: null }, // Flow r5
    ]
  },
  primaryWeapon: {
    base: bratonPrimeBase,
    stats: [
      { upgradeType: "WEAPON_DAMAGE_AMOUNT", value: 165, condition: null }, // Serration r10
      { upgradeType: "WEAPON_CRIT_CHANCE",   value: 150, condition: null }, // Point Strike r5
      { upgradeType: "WEAPON_CRIT_DAMAGE",   value: 120, condition: null }, // Vital Sense r5
    ]
  }
}

const context: CalculationContext = {}  // v1: vacío


// =============================================================================
// PASO 4: Engine — calculate(resolvedLayout, context) (B2 → B3)
// Agrupa, suma, aplica fórmulas. Sin acceso a JSON.
// =============================================================================

// --- Canal Warframe ---
//
// Agrupar por upgradeType y sumar:
//   AVATAR_ABILITY_STRENGTH: 30
//   AVATAR_HEALTH_MAX:        91
//   AVATAR_SHIELD_MAX:        91
//   AVATAR_ARMOUR:            91
//   AVATAR_POWER_MAX:         100
//
// Fórmula: stat_final = base * (1 + sum/100), round2
//
//   health      = 450  * (1 + 91/100)  = 450  * 1.91  = 859.5  → 859.50
//   shield      = 225  * (1 + 91/100)  = 225  * 1.91  = 429.75 → 429.75
//   armor       = 275  * (1 + 91/100)  = 275  * 1.91  = 525.25 → 525.25
//   power       = 225  * (1 + 100/100) = 225  * 2.00  = 450.00
//   sprintSpeed = 0.95 * (1 + 0/100)   = 0.95 (sin mod)
//
// [NOTA-A]: AVATAR_ABILITY_STRENGTH (30) NO afecta health/shield/armor/power/sprintSpeed.
// Es un stat separado — Ability Strength — que el Engine calcula en otro canal (abilities).
// WarframeStatOutput NO incluye abilityStrength directamente.
// El Engine necesita saber que AVATAR_ABILITY_STRENGTH va al canal de abilities, no al de stats base.
// → Esta distinción es parte del knowledge del Engine: qué upgradeType afecta qué canal de cálculo.

const warframeOutput: WarframeStatOutput = {
  health:      859.50,
  shield:      429.75,
  armor:       525.25,
  power:       450.00,
  sprintSpeed: 0.95,
  // abilityStrength: 1.30 → va en un canal de abilities separado (fuera de v1 de este ejemplo)
}

// --- Canal Weapon ---
//
// Los mods de arma son weapon-level: se agregan una vez y se aplican a cada ataque.
// El Engine hace: attacks.map(attack => calculateAttack(attack, aggregatedMods))
//
// Agregación de mods:
//   WEAPON_DAMAGE_AMOUNT: 165
//   WEAPON_CRIT_CHANCE:   150
//   WEAPON_CRIT_DAMAGE:   120
//
// Fórmula por ataque (C34): damage → multishot → crit → status → CO
//
// Attack[0] — "Normal Attack" (hitscan-single)
//   totalDamage  = 35   * (1 + 165/100) = 35   * 2.65 = 92.75
//   critChance   = 0.12 * (1 + 150/100) = 0.12 * 2.50 = 0.30
//   critMult     = 2.0  * (1 + 120/100) = 2.0  * 2.20 = 4.40
//   multishot    = 1    * (1 + 0/100)   = 1.0  (sin Split Chamber)
//   averageCrit  = 1 + 0.30 * (4.40 - 1) = 1 + 1.02 = 2.02
//   statusChance = 0.26 (sin status mods)
//   fireRate     = 9.58 (sin fire rate mods)
//
// Attack[1] — "Incarnon Form" (hitscan-single)
//   totalDamage  = 70   * 2.65 = 185.50
//   critChance   = 0.30 * 2.50 = 0.75
//   critMult     = 3.0  * 2.20 = 6.60
//   averageCrit  = 1 + 0.75 * (6.60 - 1) = 1 + 4.20 = 5.20
//   statusChance = 0.30 / fireRate = 5.67
//
// Attack[2] — "Incarnon Form AoE" (aoe)
//   totalDamage  = 70 * 2.65 = 185.50  (Serration aplica al totalDamage)
//   critChance   = 0.75 / critMult = 6.60 / averageCrit = 5.20
//   deliveryType "aoe" → multishot no crea instancias adicionales, escala el tick
//
// CO: no hay mod de CO → skip en todos

const weaponOutput: WeaponStatOutput = {
  magazineSize: 75,
  reloadTime:   2.15,
  attacks: [
    {
      name:                  "Normal Attack",
      totalDamage:           92.75,
      critChance:            0.30,
      critMult:              4.40,
      statusChance:          0.26,
      fireRate:              9.58,
      multishot:             1.0,
      averageCritMultiplier: 2.02,
    },
    {
      name:                  "Incarnon Form",
      totalDamage:           185.50,
      critChance:            0.75,
      critMult:              6.60,
      statusChance:          0.30,
      fireRate:              5.67,
      multishot:             1.0,
      averageCritMultiplier: 5.20,
    },
    {
      name:                  "Incarnon Form AoE",
      totalDamage:           185.50,
      critChance:            0.75,
      critMult:              6.60,
      statusChance:          0.30,
      fireRate:              5.67,
      multishot:             1.0,    // aoe: no genera instancias adicionales
      averageCritMultiplier: 5.20,
    },
  ]
}

// B3 — EngineOutput:
const engineOutput: EngineOutput = {
  warframe:      warframeOutput,
  primaryWeapon: weaponOutput,
}


// =============================================================================
// PASO 5: Resolver backward (B3 → B4) — placeholder de UI
// El contrato B4 está pendiente (Paso 14/UI).
// Por ahora: pass-through con formato de presentación mínimo.
// =============================================================================

// Política v1 de fire modes:
//
//   La UI renderiza TODOS los ataques del array en orden, sin agrupación ni selección.
//   No se necesita fireModeGroup, trigger, ni selectedIndex.
//   Cada ataque tiene sus propios stats base → cada uno tiene su propio cálculo.
//
//   Razón: un override de agrupación por arma es inviable a ~900 armas sin datos
//   estructurados de referencia (ej. overframe.gg). Se deja para v1+.
//
//   Excepción — Incarnon:
//     Los ataques con nombre que contiene "Incarnon" tienen soporte PARCIAL en v1.
//     Se calculan y se muestran, pero las evoluciones (pasivas de progresión del Incarnon)
//     NO están implementadas — no hay datos estructurados aún.
//     El cálculo de stats base del ataque Incarnon es correcto; el buff de evolución no.
//
// Ejemplo de lo que la UI necesitaría (no es el contrato final):
const uiOutput = {
  warframe: {
    "Health":       "859",
    "Shield":       "430",
    "Armor":        "525",
    "Energy":       "450",
    "Sprint Speed": "0.95",
  },
  // weapon: weapon-level stats se muestran UNA SOLA VEZ (fuera de los ataques)
  // attacks[] se renderiza como secciones separadas — cada ataque tiene su propio fireRate
  //
  // Confirmado en el dataset: magazineSize y reloadTime NO existen por ataque —
  // solo existen al nivel raíz del arma (weapon-level en warframe-items).
  // fireRate ("speed" en el dataset) SÍ existe por ataque — cada modo puede tener el suyo.
  // Ejemplos: Tiberon Burst=5/Semi=5/Auto=8.33 | Dread Uncharged=1/Charged=1/Incarnon=1.5
  weapon: {
    "Magazine": "75",   // WeaponStatOutput.magazineSize — mismo para todos los ataques
    "Reload":   "2.15s", // WeaponStatOutput.reloadTime   — mismo para todos los ataques
    attacks: [
      {
        "Attack":              "Normal Attack",
        "Damage":              "92.75",
        "Crit Chance":         "30.0%",
        "Crit Multiplier":     "4.40x",
        "Avg Crit Multiplier": "2.02x",
        "Status Chance":       "26.0%",
        "Fire Rate":           "9.58",  // WeaponAttackOutput.fireRate — por ataque
      },
      {
        "Attack":              "Incarnon Form",  // soporte parcial — evoluciones no incluidas
        "Damage":              "185.50",
        "Crit Chance":         "75.0%",
        "Crit Multiplier":     "6.60x",
        "Avg Crit Multiplier": "5.20x",
        "Status Chance":       "30.0%",
        "Fire Rate":           "5.67",  // distinto al Normal Attack — por ataque
      },
      {
        "Attack":              "Incarnon Form AoE",  // soporte parcial
        "Damage":              "185.50",
        "Crit Chance":         "75.0%",
        "Crit Multiplier":     "6.60x",
        "Avg Crit Multiplier": "5.20x",
        "Status Chance":       "30.0%",
        "Fire Rate":           "5.67",
      },
    ]
  }
}


// =============================================================================
// NOTAS SOBRE GAPS DETECTADOS EN EL DRY RUN
// =============================================================================

/**
 * [NOTA-A] AVATAR_ABILITY_STRENGTH — distinguible por upgradeType, no por base
 *
 * El upgradeType "AVATAR_ABILITY_STRENGTH" no escala ningún stat base del warframe
 * (health/shield/armor/power/sprintSpeed). Afecta el multiplicador de Ability Strength
 * que el Engine aplica a las habilidades — canal completamente separado.
 *
 * El Engine necesita un mapa de routing:
 *   "AVATAR_HEALTH_MAX"        → canal: warframeBaseStats, stat: health
 *   "AVATAR_SHIELD_MAX"        → canal: warframeBaseStats, stat: shield
 *   "AVATAR_ARMOUR"            → canal: warframeBaseStats, stat: armor
 *   "AVATAR_POWER_MAX"         → canal: warframeBaseStats, stat: power
 *   "AVATAR_ABILITY_STRENGTH"  → canal: abilityModifiers, factor: abilityStrength
 *   "AVATAR_ABILITY_DURATION"  → canal: abilityModifiers, factor: abilityDuration
 *   etc.
 *
 * Esto NO es responsabilidad del Resolver — el Engine sabe a qué canal va cada upgradeType.
 * El Resolver entrega todos los stats planos sin categorizar.
 *
 * Relación con el engine legacy (warframe-core.ts):
 *   usaba "AVATAR_ARMOR_MAX" pero el override real tiene "AVATAR_ARMOUR"
 *   usaba "AVATAR_POWER_STRENGTH" pero el override real tiene "AVATAR_ABILITY_STRENGTH"
 *   → Los nombres del override ARE the source of truth. El engine legacy tenía drift.
 *
 *
 * [NOTA-B — RESUELTA] deliveryType → responsabilidad de generate-data (2026-03-28)
 *
 * El campo deliveryType no existe como campo directo en el JSON de warframe-items.
 * El engine legacy lo derivaba en el Resolver — semántica de juego que no le corresponde.
 *
 * Decisión: generate-data normaliza POR ATAQUE usando trigger (raíz del arma) + shot_type (por ataque):
 *   trigger "Held"   + shot_type "Hit-Scan"   → "beam-continuous"    (Ignis Normal Attack)
 *   trigger "Held"   + shot_type "Projectile" → "projectile-single"  (Atomos Incarnon ← cambia dentro del arma)
 *   trigger "Charge" + shot_type "Projectile" → "projectile-charged" (Paris, Dread)
 *   trigger *        + shot_type "Hit-Scan"   → "hitscan-single"
 *   trigger *        + shot_type "Projectile" → "projectile-single"
 *   trigger *        + shot_type "AoE"        → "aoe"
 *   trigger *        + shot_type "DoT"        → "dot-secondary"      (Tysis, Cryotra)
 *   trigger *        + shot_type "Thrown"     → "thrown"
 *
 * IMPORTANTE: la lógica aplica por ataque, no por arma. El trigger es del arma raíz
 * pero el shot_type puede cambiar entre ataques (caso Atomos: beam Normal → Projectile Incarnon).
 * Esto significa que deliveryType puede diferir entre ataques del mismo arma — el modelo
 * lo soporta correctamente porque deliveryType vive en WeaponAttack, no en WeaponBase.
 *
 * Validado contra 63 armas Incarnon del dataset (2026-03-28).
 * El Resolver recibe el dato ya limpio. El dataset es la fuente de verdad normalizada.
 * Pendiente: implementar la lógica en generate-data antes del Paso 15 (Resolver).
 */
