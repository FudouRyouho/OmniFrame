/**
 * @domain Shared / Types / Modifier
 * @SSoT docs/semantic/upgrade-tokens.md
 *
 * Vocabulario del sistema de modificadores. Aplica a cualquier fuente que
 * modifique atributos del engine: mods, pasivas, habilidades, arcanos, etc.
 *
 * El override JSON es responsable del eje semántico:
 *   upgrade_type  → "a qué atributo del engine modifica esta fuente"
 *   upgrade_by    → "con qué stat del Warframe escala este valor"
 * Ambos comparten el mismo vocabulario Upgrade.
 */

// ─── ModifierOperation ───────────────────────────────────────────────────────
// Fuente de verdad consumida por contracts/index.ts (Modifier.operation).
// Convención D-6 OPERATION token → engine op → formula bucket:
//   ADD  → ADD          → mods_add_pct   (% aditivo estándar)
//   BASE → BASE_FLAT    → base_flat      (plano pre-escala, amplificado por ADD)
//   FLAT → ADD_FLAT     → total_flat     (plano post-escala, no amplificado)
//   MULT → MULTIPLICATIVE → multiplicative (% multiplicativo, stack separado)

// Ops de ACUMULADOR: `value` ES el efecto y la operación ES el bucket (el `switch` de resolveNode).
// Contrapuestas a las ops de FAMILIA (abajo), donde el efecto lo COMPUTA una fórmula desde el
// contexto. Esta división es el discriminante de la union `Modifier` (contracts/primitives) — §10.
export type AccumulatorOperation =
  | 'ADD'
  | 'SET'
  | 'ADD_FLAT'
  | 'BASE_FLAT'
  | 'BASE_ADD_PCT'
  | 'MULTIPLICATIVE'

export type ModifierOperation =
  | AccumulatorOperation
  // Familia Condition Overload / GunCO. NO es una composición genérica: el valor emerge de
  // `coBonusPct` (formulas/weapon) y el bucket lo decide el `co_behavior` del ataque, no la
  // operación. Es la MARCA de familia (disparador del ruteo) — reemplaza el `CONTEXT_SCALE`
  // genérico que casaba operación con mecánica. Ver arch-decisions §9.
  | 'CONDITION_OVERLOAD'
  // Familia Melee Combo — heavy attack como consumidor de daño. Hermana de CONDITION_OVERLOAD
  // (misma doctrina §8/§9/§10): valor = `meleeComboMult(melee_combo_count)` (formulas/weapon/melee-combo),
  // ruteo FIJO `multiplicative` (a diferencia de CO no hay behavior que elija bucket). Disparador
  // de FAMILIA melee — NO `COMBO_MULT` genérico: el combo de sniper/incarnon es otra familia
  // (Abstracción A diferida, §10). Se sintetiza en hidratación (intrínseco), no viene de un token.
  | 'MELEE_COMBO_MULT'
  // Familia Sniper Combo — Shot Combo Counter. Hermana de MELEE_COMBO_MULT pero fórmula LOGARÍTMICA
  // (`sniperComboMult`) y necesita DOS inputs: el count (contexto) + `min_combo` (dato por-arma).
  // Ruteo FIJO `multiplicative`, pasivo (todo shot scoped, sin gate heavy). Se sintetiza en hidratación.
  | 'SNIPER_COMBO_MULT'
  // Familia Combo Scaled Add — Blood Rush / Weeping Wounds. Hermana de MELEE_COMBO_MULT (mismo
  // factor `melee_combo_factors`, misma fórmula `meleeComboMult`) pero DISTINTA en dos ejes: (1) trae
  // `value` propio (el rank del mod real, vía ModRepository — no intrínseco/sintetizado), (2) ruteo
  // FIJO `ADD` (mods_add_pct), no `multiplicative` — efecto = `value × meleeComboMult(count)`. El
  // trigger es `condition: 'per_melee_combo_multiplier'` en el dato — MISMA trampa que
  // `per_status_type_on_target` fue para CO (escala disfrazada de condición, `conditions.md`):
  // ModRepository lo reconoce y descarta el `condition` (no es gate), construye este op en su lugar.
  | 'COMBO_SCALED_ADD'
  // Familia Stack Decay Buff (arch-decisions §11) — Galvanized [Arma] (mods) + Merciless/Deadhead/
  // Dexterity/Exhilarate/Cascadia Flare (arcanos, arquitectura cerrada, aún sin código). Evento
  // discreto (on_kill/on_headshot_kill/on_melee_kill…) → +val por stack, cap Nx. `value` = perStackPct
  // YA derivado (`base_value/max_stacks` en hidratación, D-15 evolución 2026-07-10) — NO el total
  // aplanado del dato crudo. Ruteo FIJO `ADD` (todos los casos reales de esta familia son % aditivo;
  // el caso flat/BASE_FLAT — Galvanized Reflex — queda fuera, no fuerza bucket-routing genérico
  // todavía). Trigger: `stat.max_stacks` presente en el override (NO `condition === 'on_kill'` — ese
  // token es legítimo y se reusa en stats NO-stacking, ej. Galvanized Crosshairs mezcla ambos en el
  // mismo mod). `condition` se descarta al construir (mismo tratamiento que CO/COMBO_SCALED_ADD).
  | 'STACK_DECAY_BUFF'

// ─── CoBehavior ────────────────────────────────────────────────────────────────
// Familia Condition Overload / GunCO: CÓMO compone un bonus "per Status Type" sobre un
// ataque. NO es un valor de stat — es ruteo de bucket (adding = junto a Serration;
// multiplying = multiplicador final aparte; none = no aplica, ej. AoE radial). Propiedad
// del ataque del arma, no del mod. SSoT única de este vocabulario, compartida por el
// contrato del engine (`MutatedDNA.co_behavior`) y la fórmula pura
// (`formulas/weapon/weapon-condition-overload.ts`). Ver arch-decisions §9.
export type CoBehavior = 'adding' | 'multiplying' | 'none'

// ─── Upgrade ─────────────────────────────────────────────────────────────────
// Convención D-6: {FAMILY}_{OPERATION}_{PREFIX}_{SUFFIX}
// Fuente de verdad: el array UPGRADES — el tipo se deriva de él (no al revés).

export type UpgradeFamily = 'WEAPON' | 'AVATAR' | 'VEHICLE' | 'GAMEPLAY'

export const UPGRADES = [
  // ── WEAPON — daño global ────────────────────────────────────────────────
  'WEAPON_ADD_DAMAGE',
  // ── WEAPON — derivados elementales y físicos ────────────────────────────
  'WEAPON_ADD_IMPACT_DAMAGE',
  'WEAPON_ADD_PUNCTURE_DAMAGE',
  'WEAPON_ADD_SLASH_DAMAGE',
  'WEAPON_ADD_HEAT_DAMAGE',
  'WEAPON_ADD_COLD_DAMAGE',
  'WEAPON_ADD_ELECTRICITY_DAMAGE',
  'WEAPON_ADD_TOXIN_DAMAGE',
  'WEAPON_ADD_BLAST_DAMAGE',
  'WEAPON_ADD_CORROSIVE_DAMAGE',
  'WEAPON_ADD_GAS_DAMAGE',
  'WEAPON_ADD_MAGNETIC_DAMAGE',
  'WEAPON_ADD_RADIATION_DAMAGE',
  'WEAPON_ADD_VIRAL_DAMAGE',
  'WEAPON_ADD_VOID_DAMAGE',
  'WEAPON_ADD_TAU_DAMAGE',
  'WEAPON_ADD_TRUE_DAMAGE',
  'WEAPON_ADD_NONE_DAMAGE',
  // ── WEAPON — stats de disparo y crítico ─────────────────────────────────
  'WEAPON_ADD_FIRE_RATE',
  'WEAPON_ADD_MULTISHOT',
  // Alias del pipeline @wfcd/items → mapea al mismo atributo que WEAPON_ADD_MULTISHOT.
  // Los mods del override JSON usan este token (Hell's Chamber, Galvanized Hell, etc.).
  // Resolución: OQ-ENGINE-6.
  'WEAPON_FIRE_ITERATIONS',
  'WEAPON_ADD_CRIT_CHANCE',
  'WEAPON_ADD_CRIT_MULT',
  'WEAPON_ADD_STATUS_CHANCE',
  // Familia Condition Overload / GunCO: +coefBase% daño directo POR tipo de status en el
  // target. Op real CONDITION_OVERLOAD (valor = coBonusPct(coefBase × activeStacks × N);
  // bucket por co_behavior del ataque). Reemplaza el legacy binario
  // WEAPON_DAMAGE_IF_VICTIM_PROC_ACTIVE (D-17). Ver references/wiki/mechanics/condition-overload.md.
  'WEAPON_ADD_DAMAGE_PER_STATUS_TYPE',
  'WEAPON_ADD_MAGAZINE_MAX',
  // Munición total del arma (pool). Distinto de WEAPON_ADD_MAGAZINE_MAX (capacidad del cargador).
  // Fuente: Ammo Drum, Ammo Chain, Trick Mag, Shell Compression.
  'WEAPON_ADD_AMMO_MAX',
  // Eficiencia de munición — reduce la tasa de consumo de munición por disparo (% aditivo).
  // D-6 compliant; resuelto por resolveToken() sin entrada en UPGRADE_MAP.
  // Fuente: Brain Storm, Zazvat-Kar (mods); Arcane Pistoleer, Akimbo Slip Shot, Eternal Logistics, Primary Crux (arcanes).
  'WEAPON_ADD_AMMO_EFFICIENCY',
  'WEAPON_ADD_RELOAD_SPEED',
  'WEAPON_ADD_STATUS_DAMAGE',
  'WEAPON_ADD_PROJECTILE_SPEED',
  'WEAPON_ADD_ACCURACY',
  'WEAPON_ADD_RECOIL',
  // Punch Through (penetración, metros flat → op ADD_FLAT vía resolveToken). Cadena de rename:
  // WEAPON_PUNCTURE_DEPTH (misnomer DE-legacy) → WEAPON_ADD_PUNCH_THROUGH (2026-06-04, intermedio)
  // → WEAPON_FLAT_PUNCH_THROUGH (2026-06-06, segmento D-6 FLAT correcto). 10 mods + 7 stats incarnon.
  // Sin consumidor de engine aún: nodo PUNCH_THROUGH ausente (Capa 4 → OQ-ENGINE-7).
  'WEAPON_FLAT_PUNCH_THROUGH',
  'WEAPON_ADD_STATUS_DURATION',
  'WEAPON_ADD_ZOOM',
  'WEAPON_ADD_FINISHER_DAMAGE',
  // Multiplicador de headshot — se aplica sobre el multiplicador base del juego (no es % aditivo al daño).
  // Fuente: Primary/Secondary Deadhead "+30% to Headshot Multiplier".
  'WEAPON_ADD_HEADSHOT_MULT',
  // ── WEAPON — perks flat incarnon (ADD_FLAT — post-escala, no amplificados) ─
  'WEAPON_FLAT_STATUS_CHANCE',
  // ── WEAPON — perks base incarnon (BASE_FLAT — se amplifican con mods ADD) ─
  'WEAPON_BASE_CRIT_CHANCE',
  'WEAPON_BASE_STATUS_CHANCE',
  'WEAPON_BASE_DAMAGE',
  'WEAPON_BASE_MAGAZINE_MAX',
  'WEAPON_BASE_CRIT_MULT',
  // ── WEAPON — melee ────────────────────────────────────────────────────────
  'WEAPON_ADD_HEAVY_CHARGE_SPEED',
  'WEAPON_BASE_HEAVY_EFFICIENCY',
  'WEAPON_ADD_SLAM_RADIUS',
  // Daño de slam attack. Distinto de WEAPON_ADD_SLAM_RADIUS (radio de AoE).
  // Fuente: Seismic Wave, Necramech Seismic Wave.
  'WEAPON_ADD_SLAM_DAMAGE',
  'WEAPON_ADD_RANGE',
  // Beam range (alcance del rayo de armas continuas). Distinto de WEAPON_ADD_RANGE (reach melee).
  // Acuñado 2026-06-03 (D-17): Sinister Reach, Ruinous Extension, Sequence Burn, Galvanized Acceleration.
  'WEAPON_ADD_BEAM_RANGE',
  'WEAPON_BASE_COMBO_DURATION',
  'WEAPON_ADD_COMBO_DURATION',
  'WEAPON_BASE_COMBO_INITIAL',
  // Chance de incrementar el combo counter por golpe. Fuente: Exodia Triumph/Valor (arcanes),
  // Guardian Derision (mod). Token cross-schema — aparece en mods y arcanes.
  'WEAPON_ADD_COMBO_COUNT_CHANCE',
  // ── WEAPON — sub-familia clase (D-6 extensión, activa 2026-05-26) ────────
  // Patrón: {FAMILY}_{SUB_FAMILY}_{OPERATION}_{PREFIX}_{SUFFIX}
  // Sin entrada en UPGRADE_MAP — pipeline deuda D-7. Engine los consumirá directamente.
  'WEAPON_PRIMARY_ADD_STATUS_CHANCE',
  'WEAPON_SECONDARY_ADD_CRIT_CHANCE',
  'WEAPON_MELEE_ADD_CRIT_MULT',
  // ── AVATAR — habilidades ─────────────────────────────────────────────────
  'AVATAR_ADD_ABILITY_STRENGTH',
  'AVATAR_ADD_ABILITY_RANGE',
  'AVATAR_ADD_ABILITY_DURATION',
  'AVATAR_ADD_ABILITY_EFFICIENCY',
  // Multiplicador directo sobre output de daño de habilidades. Distinto de ABILITY_STRENGTH
  // (que escala stats base). Fuente: Archon Shards Topaz/Violet/Emerald (condicional por status).
  'AVATAR_ADD_ABILITY_DAMAGE',
  // ── AVATAR — stats base ──────────────────────────────────────────────────
  'AVATAR_ADD_HEALTH_MAX',
  'AVATAR_ADD_SHIELD_MAX',
  'AVATAR_ADD_ARMOUR',
  'AVATAR_ADD_ENERGY_MAX',
  'AVATAR_ADD_MOVEMENT_SPEED',
  'AVATAR_ADD_SPRINT_SPEED',
  'AVATAR_ADD_CASTING_SPEED',
  'AVATAR_ADD_SHIELD_RECHARGE_RATE',
  'AVATAR_ADD_PARKOUR_VELOCITY',
  'AVATAR_ADD_HEALTH_ORB_EFFICIENCY',
  'AVATAR_ADD_ENERGY_ORB_EFFICIENCY',
  // Regeneración de salud porcentual (%HP/s). Distinto de AVATAR_FLAT_HEALTH_REGEN (HP/s plano).
  // Fuente: Arcane Grace, Arcane Victory.
  'AVATAR_ADD_HEALTH_REGEN',
  // Conversión de daño-recibido-en-salud a energía (% del daño a salud → energía).
  // Renombrado del misnomer DE-legacy AVATAR_DAMAGE_POWER_MULTIPLIER (2026-06-04).
  // Fuente: Rage, Hunter Adrenaline, Kinetic Diversion, Necramech Rage. Sin variante de escudos. Sin consumidor aún.
  'AVATAR_ADD_HEALTH_DAMAGE_TO_ENERGY',
  // ── AVATAR — planos post-escala (ADD_FLAT) ───────────────────────────────
  // Fórmula: Base × (1 + Mods%) + FLAT. Fuentes: Archon Shards Azure, Stone Skin, Arcanos de armor.
  // No se amplifican por mods — se suman después del pool multiplicativo.
  'AVATAR_FLAT_HEALTH_MAX',
  'AVATAR_FLAT_SHIELD_MAX',
  'AVATAR_FLAT_ENERGY_MAX',
  'AVATAR_FLAT_ARMOUR',
  'AVATAR_FLAT_HEALTH_REGEN',
  // Regeneración de energía plana (E/s). Análogo de AVATAR_FLAT_HEALTH_REGEN para energía.
  // Fuente: Energy Nexus (+0.6 E/s), Energy Siphon (aura), Relentless Assault.
  'AVATAR_FLAT_ENERGY_REGEN',
  // ── AVATAR — chance de resistir proc (D-6 desviación: CHANCE-family, resolveToken() no aplica)
  // Modelado C2 diferido — engine no los consume aún. Fuente: arcanes proc resist.
  // Nota: AVATAR_INJURY_BLOCK_CHANCE (resist knockdown/stagger) es un token distinto, no D-6.
  'AVATAR_CHANCE_RESIST_SLASH',
  'AVATAR_CHANCE_RESIST_PUNCTURE',
  'AVATAR_CHANCE_RESIST_IMPACT',
  'AVATAR_CHANCE_RESIST_HEAT',
  'AVATAR_CHANCE_RESIST_COLD',
  'AVATAR_CHANCE_RESIST_ELECTRICITY',
  'AVATAR_CHANCE_RESIST_TOXIN',
  'AVATAR_CHANCE_RESIST_RADIATION',
  'AVATAR_CHANCE_RESIST_CORROSIVE',
  'AVATAR_CHANCE_RESIST_GAS',
  'AVATAR_CHANCE_RESIST_MAGNETIC',
  // ── GAMEPLAY ─────────────────────────────────────────────────────────────
  'GAMEPLAY_MULT_FACTION_DAMAGE',
  // Daño de status de Toxina +N% (global: armas y habilidades, no compañeros).
  // Instancias apiladas aditivamente. Fuente: Archon Shard Emerald.
  'GAMEPLAY_ADD_TOXIN_STATUS_DAMAGE',
] as const

export type Upgrade = (typeof UPGRADES)[number]

const UPGRADE_SET = new Set<Upgrade>(UPGRADES)

export function isUpgrade(value: string): value is Upgrade {
  return UPGRADE_SET.has(value as Upgrade)
}

export function getUpgradeFamily(upgrade: Upgrade): UpgradeFamily {
  if (upgrade.startsWith('WEAPON_')) return 'WEAPON'
  if (upgrade.startsWith('AVATAR_')) return 'AVATAR'
  if (upgrade.startsWith('VEHICLE_')) return 'VEHICLE'
  return 'GAMEPLAY'
}

// ─── UPGRADE_MAP ─────────────────────────────────────────────────────────────
// [D-7 Fase 3, 2026-06-14] Encogido a su núcleo irreducible. `resolveToken()` cubre
// las identidades (attr=token) y los acumuladores propios (FLAT/BASE que NO convergen);
// UPGRADE_MAP retiene solo lo que la sintaxis NO deriva: aliases, flags y la
// convergencia FLAT/BASE → nodo del par ADD.
// Consumo: `resolveUpgradeEntry(token)` (definida más abajo) — usada por los
// 4 repos de hydration (Mod/Arcane/Incarnon/Shard).
//
// Tokens sin entrada = resueltos por `resolveToken` — no es un error de runtime.

export interface CoFactors {
  // Nombres de las variables de contexto que aportan cada dimensión de la fórmula CO.
  // Se resuelven en modo estático (declaradas) o dinámico (emergentes del EnemyState).
  stacks_var: string;        // activeStacks (dimensión temporal del buff)
  status_count_var: string;  // N tipos de status en el target
}

export interface MeleeComboFactors {
  // Hermano de CoFactors para la familia MELEE_COMBO_MULT. MELEE-específico por nombre: el combo
  // hit de snipers y el combo de semi-exaltadas son mecánicas distintas (parecidas, no iguales) —
  // un `ComboFactors` genérico se malinterpreta. Una sola dimensión: el nombre de la variable de
  // contexto que aporta el combo counter melee. Declarada en modo estático (el consumidor pasa
  // `melee_combo_count`), emergente en dinámico (timeline del jugador — diferido). No se bakea el
  // producto: el valor lo computa `meleeComboMult` en tiempo de resolución. Ver arch-decisions §8.
  count_var: string;
}

export interface SniperComboFactors {
  // Familia SNIPER_COMBO_MULT. Shape MIXTO — nota la asimetría con CoFactors/MeleeComboFactors:
  //  - `count_var`  = NOMBRE de variable de contexto (dinámico, declarado/emergente).
  //  - `min_combo`  = VALOR literal por-arma (estático, bakeado en hidratación desde el override).
  // El producto NO se bakea (lo computa `sniperComboMult(count, min_combo)`); sí el parámetro
  // por-arma `min_combo`, igual que CO bakea `coefBase` en `mod.value`. Esta divergencia de shape
  // entre las 3 familias es la señal del cierre en el TIPO (arch-decisions §10, Abstracción A).
  count_var: string;
  min_combo: number;
}

export interface StackDecayFactors {
  // Familia STACK_DECAY_BUFF (arch-decisions §11). Shape MIXTO, mismo patrón que SniperComboFactors:
  //  - `stacks_var` = NOMBRE de variable de contexto (C1-declarado, mismo escalón que activeStacks de CO).
  //  - `cap`        = VALOR literal por-mod/arcano (`max_stacks` del override), bakeado en hidratación.
  // `value` del modifier NO es el total-a-máximo del dato crudo — es el perStackPct YA derivado
  // (`base_value/max_stacks`) en hidratación; el resolver solo multiplica por `clamp(stacks,0,cap)`.
  stacks_var: string;
  cap: number;
}

export interface UpgradeMapEntry {
  attr: string;
  op: ModifierOperation;
  toPercent?: boolean;
  target_channel?: string;
  // Solo CONDITION_OVERLOAD: nombres de los factores de contexto (dos dimensiones nombradas).
  co_factors?: CoFactors;
}

// ─── OPERATION_MAP ────────────────────────────────────────────────────────────
// Deriva ModifierOperation del segmento OPERATION del token D-6.
// 4 entradas — no es un UPGRADE_MAP; es la convención del vocabulario misma.
const OPERATION_MAP: Record<string, ModifierOperation> = {
  ADD:  'ADD',
  FLAT: 'ADD_FLAT',
  BASE: 'BASE_FLAT',
  MULT: 'MULTIPLICATIVE',
}

const SUB_FAMILY_CHANNELS: Record<string, string> = {
  PRIMARY:   'primary',
  SECONDARY: 'secondary',
  MELEE:     'melee',
}

// Resuelve un token D-6 en { attr, op, target_channel? } sin consultar UPGRADE_MAP.
// Para tokens sin sub-familia: attr = token. Para tokens con sub-familia: attr = token sin sub-familia.
// Fallback de ModRepository para tokens no registrados en UPGRADE_MAP (deuda D-7).
export function resolveToken(token: Upgrade): UpgradeMapEntry | undefined {
  const parts = token.split('_')
  if (parts.length < 3) return undefined

  const subFamily = SUB_FAMILY_CHANNELS[parts[1]]
  const opIdx     = subFamily ? 2 : 1
  const op        = OPERATION_MAP[parts[opIdx]]
  if (!op) return undefined

  const attr = subFamily
    ? `${parts[0]}_${parts.slice(2).join('_')}`
    : token

  return { attr, op, ...(subFamily ? { target_channel: subFamily } : {}) }
}

export const UPGRADE_MAP: Partial<Record<Upgrade, UpgradeMapEntry>> = {
  // Solo lo que `resolveToken()` NO puede derivar. Las identidades (attr=token, todos
  // los WEAPON_ADD_*/AVATAR_ADD_*) y los acumuladores propios (AVATAR_FLAT_HEALTH_REGEN
  // → attr = sí mismo) las cubre el fallback — se quitaron en D-7 Fase 3. Quedan 3 clases:

  // ── (1) ALIAS — SUFFIX distinto del nodo destino (no es op-variante) ──────────
  WEAPON_FIRE_ITERATIONS:           { attr: 'WEAPON_ADD_MULTISHOT',             op: 'ADD' },

  // ── CONDITION_OVERLOAD — familia CO/GunCO, ruteo por co_behavior ──────────────
  // Apunta al daño global (attr WEAPON_ADD_DAMAGE). El valor = coBonusPct(coefBase ×
  // activeStacks × N); el bucket lo decide el co_behavior del ataque, NO la operación.
  // co_factors nombra las dos dimensiones de contexto. Ver arch-decisions §9.
  WEAPON_ADD_DAMAGE_PER_STATUS_TYPE: { attr: 'WEAPON_ADD_DAMAGE', op: 'CONDITION_OVERLOAD', co_factors: { stacks_var: 'active_stacks', status_count_var: 'status_type_count' } },

  // ── (2) FLAG — toPercent: JSON almacena 1.30 = +30% → 30 para mods_add_pct ────
  GAMEPLAY_MULT_FACTION_DAMAGE:     { attr: 'GAMEPLAY_MULT_FACTION_DAMAGE',     op: 'ADD', toPercent: true },

  // ── (3) CONVERGENCIA — FLAT/BASE comparten nodo con su par ADD ────────────────
  // NO derivable por sintaxis: cuál FLAT/BASE converge al nodo ADD vs cuál es
  // acumulador propio es conocimiento de dominio (ej. AVATAR_FLAT_HEALTH_REGEN —
  // regen plano HP/s — NO converge a AVATAR_ADD_HEALTH_REGEN — regen % — son stats
  // distintos). Convergencia: `Total = Base × (1 + Mods%) + Flat` (ver
  // references/wiki/mechanics/armor.md). El nodo base lo siembra getDNA() con
  // id = attr del par ADD (precedente: WEAPON_ADD_RELOAD_SPEED).
  WEAPON_FLAT_STATUS_CHANCE:        { attr: 'WEAPON_ADD_STATUS_CHANCE',         op: 'ADD_FLAT' },
  WEAPON_BASE_CRIT_CHANCE:          { attr: 'WEAPON_ADD_CRIT_CHANCE',           op: 'BASE_FLAT' },
  WEAPON_BASE_STATUS_CHANCE:        { attr: 'WEAPON_ADD_STATUS_CHANCE',         op: 'BASE_FLAT' },
  WEAPON_BASE_DAMAGE:               { attr: 'WEAPON_ADD_DAMAGE',                op: 'BASE_FLAT' },
  WEAPON_BASE_MAGAZINE_MAX:         { attr: 'WEAPON_ADD_MAGAZINE_MAX',          op: 'BASE_FLAT' },
  WEAPON_BASE_CRIT_MULT:            { attr: 'WEAPON_ADD_CRIT_MULT',             op: 'BASE_FLAT' },
  WEAPON_BASE_HEAVY_EFFICIENCY:     { attr: 'WEAPON_ADD_HEAVY_EFFICIENCY',      op: 'BASE_FLAT' },
  WEAPON_BASE_COMBO_DURATION:       { attr: 'WEAPON_ADD_COMBO_DURATION',        op: 'BASE_FLAT' },
  WEAPON_BASE_COMBO_INITIAL:        { attr: 'WEAPON_ADD_COMBO_INITIAL',         op: 'BASE_FLAT' },
  AVATAR_FLAT_HEALTH_MAX:           { attr: 'AVATAR_ADD_HEALTH_MAX',            op: 'ADD_FLAT' },
  AVATAR_FLAT_SHIELD_MAX:           { attr: 'AVATAR_ADD_SHIELD_MAX',            op: 'ADD_FLAT' },
  AVATAR_FLAT_ENERGY_MAX:           { attr: 'AVATAR_ADD_ENERGY_MAX',            op: 'ADD_FLAT' },
  AVATAR_FLAT_ARMOUR:               { attr: 'AVATAR_ADD_ARMOUR',                op: 'ADD_FLAT' },
}

// ─── resolveUpgradeEntry ──────────────────────────────────────────────────────
// Encapsula el patrón `isUpgrade` guard + `UPGRADE_MAP[token] ?? resolveToken(token)`
// que estaba duplicado literal en los 4 repos de hydration (Fase 2 Slice A,
// campaña de saneamiento `@core`). Solo resuelve el token al vocabulario — NO
// aplica `toPercent` al valor: cada caller decide `entry.toPercent ? (raw-1)*100
// : raw` sobre su propio rawValue (la extracción del rawValue difiere por repo:
// array indexado por rank, clamp, lookup por alias, etc. — no es unificable).
export function resolveUpgradeEntry(token: string | null | undefined): UpgradeMapEntry | undefined {
  if (!token || !isUpgrade(token)) return undefined
  return UPGRADE_MAP[token] ?? resolveToken(token)
}
