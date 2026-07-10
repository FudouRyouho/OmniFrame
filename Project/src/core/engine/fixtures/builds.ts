/**
 * Catálogo de build-fixtures: intenciones (`EnsembleIntention`) verificadas en partida,
 * hogar único de los builds del engine. Consumidas por dos adaptadores hermanos sobre la
 * MISMA entrada: los tests (que les adosan expectativas y asertan) y el CLI oráculo (que
 * las inspecciona e imprime). Mismo input, distinto acto — ninguno invade el rol del otro.
 *
 * `BUILDS` (al final) es el registro que el oráculo recorre por nombre: `npm run oracle -- <build>`
 * (o `all`). Cada entrada es una invocación representativa de su factory.
 *
 * Las factories quedan verbatim de sus tests (migración fiel, sin re-abstraer el skeleton de
 * slots). Ubicación provisional (`fixtures/` mezcla bootstrap + builds) — ver OQ-ENGINE-9.
 */
import type { EnsembleIntention } from '@shared/types/ensemble';

/** Entorno base compartido (target nivel 1, sin Steel Path). */
export const BASE_ENV = { targetLevel: 1, targetFaction: null, isSteelPath: false };

// ─── Lanka (sniper de carga, proyectil) ──────────────────────────────────────────

export const LANKA = '/Lotus/Weapons/ClanTech/Energy/Railgun';

const LANKA_MOD = {
  SHRED:             '/Lotus/Upgrades/Mods/Rifle/DualStat/ShredMod',
  TERMINAL_VELOCITY: '/Lotus/Upgrades/Mods/Rifle/WeaponProjectileSpeedMod',          // +60% projectile speed (level 3)
  VILE_PRECISION:    '/Lotus/Upgrades/Mods/Rifle/DualStat/CorruptedRecoilFireRateRifle', // −90% recoil / −36% fire rate (level 5)
};

/** Lanka. `profile` = `'charged_shot'` | `'partially_charged_shot'`. */
export function lanka(profile: string): EnsembleIntention {
  return {
    items: {
      warframe:         { itemId: null, rank: 30, shards: [] },
      primary:          { itemId: LANKA, rank: 30, active_profile: profile },
      secondary:        { itemId: null, rank: 30 },
      melee:            { itemId: null, rank: 30 },
      companion:        { itemId: null, rank: 30 },
      companion_weapon: { itemId: null, rank: 30 },
      archwing:         { itemId: null, rank: 30 },
      archgun:          { itemId: null, rank: 30 },
      archmelee:        { itemId: null, rank: 30 },
      necramech:        { itemId: null, rank: 30 },
    },
    mods: { primary: {
      0: { itemId: LANKA_MOD.SHRED,             rank: 30, level: 5 },
      1: { itemId: LANKA_MOD.TERMINAL_VELOCITY, rank: 30, level: 3 },
      2: { itemId: LANKA_MOD.VILE_PRECISION,    rank: 30, level: 5 },
    } },
    environment: BASE_ENV,
  };
}

// ─── Cedo Prime (escopeta multi-pellet, flag on_kill) ─────────────────────────────

export const CEDO_PRIME = '/Lotus/Weapons/Tenno/LongGuns/PrimeCedo/PrimeCedoWeapon';

const CEDO_MOD = {
  TOXIC_BARRAGE:      '/Lotus/Upgrades/Mods/Shotgun/DualStat/PoisonEventShotgunMod',
  SHOTGUN_BARRAGE:    '/Lotus/Upgrades/Mods/Shotgun/WeaponFireRateMod',
  CRITICAL_DECEL:     '/Lotus/Upgrades/Mods/Shotgun/DualStat/CorruptedCritChanceFireRateShotgun',
  PRIMED_CHILLING:    '/Lotus/Upgrades/Mods/Shotgun/Expert/WeaponFreezeDamageModExpert',
  PRIMED_POINT_BLANK: '/Lotus/Upgrades/Mods/Shotgun/Expert/WeaponDamageAmountModExpert',
  GALVANIZED_SAVVY:   '/Lotus/Upgrades/Mods/Shotgun/WeaponStatusChanceSPMod',
  GALVANIZED_HELL:    '/Lotus/Upgrades/Mods/Shotgun/WeaponFireIterationsSPMod',
  PRIMED_RAVAGE:      '/Lotus/Upgrades/Mods/Shotgun/Expert/WeaponCritDamageModExpert',
};

/** Cedo Prime. `withGH` añade Galvanized Hell (on_kill multishot). `profile` = perfil de
 *  ataque: 'base'/'normal_attack' (Hit-Scan), 'alt-fire_glaive' (Projectile), 'glaive_radial_attack' (AoE). */
export function cedo(withGH = false, profile = 'base'): EnsembleIntention {
  const mods: Record<number, { itemId: string; rank: number; level: number }> = {
    0: { itemId: CEDO_MOD.TOXIC_BARRAGE,      rank: 30, level: 3  },
    1: { itemId: CEDO_MOD.SHOTGUN_BARRAGE,    rank: 30, level: 5  },
    2: { itemId: CEDO_MOD.CRITICAL_DECEL,     rank: 30, level: 5  },
    3: { itemId: CEDO_MOD.PRIMED_CHILLING,    rank: 30, level: 10 },
    4: { itemId: CEDO_MOD.PRIMED_POINT_BLANK, rank: 30, level: 10 },
    5: { itemId: CEDO_MOD.GALVANIZED_SAVVY,   rank: 30, level: 10 },
    7: { itemId: CEDO_MOD.PRIMED_RAVAGE,      rank: 30, level: 10 },
  };
  if (withGH) mods[6] = { itemId: CEDO_MOD.GALVANIZED_HELL, rank: 30, level: 10 };
  return {
    items: {
      warframe:         { itemId: null, rank: 30, shards: [] },
      primary:          { itemId: CEDO_PRIME, rank: 30, active_profile: profile },
      secondary:        { itemId: null, rank: 30 },
      melee:            { itemId: null, rank: 30 },
      companion:        { itemId: null, rank: 30 },
      companion_weapon: { itemId: null, rank: 30 },
      archwing:         { itemId: null, rank: 30 },
      archgun:          { itemId: null, rank: 30 },
      archmelee:        { itemId: null, rank: 30 },
      necramech:        { itemId: null, rank: 30 },
    },
    mods: { primary: mods },
    environment: BASE_ENV,
  };
}

// ─── Laetum (pistola single + radial, perk condicional) ───────────────────────────

export const LAETUM = '/Lotus/Weapons/Tenno/Zariman/Pistols/HeavyPistol/ZarimanHeavyPistol';

const LAETUM_MOD = {
  PISTOL_PESTILENCE:    '/Lotus/Upgrades/Mods/Pistol/DualStat/PoisonEventPistolMod',
  ICE_STORM:            '/Lotus/Upgrades/Mods/Pistol/DualStat/IceStormMod',
  GALVANIZED_SHOT:      '/Lotus/Upgrades/Mods/Pistol/WeaponStatusChanceSPMod',
  GALVANIZED_DIFFUSION: '/Lotus/Upgrades/Mods/Pistol/WeaponFireIterationsSPMod',
  LETHAL_TORRENT:       '/Lotus/Upgrades/Mods/Pistol/DualStat/GrinderMod',
  HORNET_STRIKE:        '/Lotus/Upgrades/Mods/Pistol/WeaponDamageAmountMod',
  GUNSLINGER:           '/Lotus/Upgrades/Mods/Pistol/WeaponFireRateMod',
  PRIMED_HEATED_CHARGE: '/Lotus/Upgrades/Mods/Pistol/Expert/WeaponFireDamageModExpert',
};
const LAETUM_PERKS = { 2: 'rapid_wrath', 3: 'lethal_rearmament', 4: 'elemental_excess', 5: 'devouring_attrition' };

/** Laetum. `profile` = `'base'` | `'incarnon_form'` | `'auto_radial_attack'`. */
export function laetum(profile = 'base'): EnsembleIntention {
  return {
    items: {
      warframe:         { itemId: null, rank: 30, shards: [] },
      secondary:        { itemId: LAETUM, rank: 30, active_profile: profile, evolution_perks: LAETUM_PERKS },
      primary:          { itemId: null, rank: 30 },
      melee:            { itemId: null, rank: 30 },
      companion:        { itemId: null, rank: 30 },
      companion_weapon: { itemId: null, rank: 30 },
      archwing:         { itemId: null, rank: 30 },
      archgun:          { itemId: null, rank: 30 },
      archmelee:        { itemId: null, rank: 30 },
      necramech:        { itemId: null, rank: 30 },
    },
    mods: {
      secondary: {
        0: { itemId: LAETUM_MOD.PISTOL_PESTILENCE,    rank: 30, level: 10 },
        1: { itemId: LAETUM_MOD.ICE_STORM,            rank: 30, level: 10 },
        2: { itemId: LAETUM_MOD.GALVANIZED_SHOT,      rank: 30, level: 10 },
        3: { itemId: LAETUM_MOD.GALVANIZED_DIFFUSION, rank: 30, level: 10 },
        4: { itemId: LAETUM_MOD.LETHAL_TORRENT,       rank: 30, level: 10 },
        5: { itemId: LAETUM_MOD.HORNET_STRIKE,        rank: 30, level: 10 },
        6: { itemId: LAETUM_MOD.GUNSLINGER,           rank: 30, level: 10 },
        7: { itemId: LAETUM_MOD.PRIMED_HEATED_CHARGE, rank: 30, level: 10 },
      },
    },
    environment: BASE_ENV,
  };
}

// ─── Felarx (escopeta multi-pellet + incarnon, flat ÷ multishot) ──────────────────

export const FELARX = '/Lotus/Weapons/Tenno/Zariman/LongGuns/PumpShotgun/ZarimanPumpShotgun';
/** Mods que el test referencia en cuerpos (sets ad-hoc de `felarxStatus`). */
export const GALVANIZED_SAVVY = '/Lotus/Upgrades/Mods/Shotgun/WeaponStatusChanceSPMod';
export const TOXIC_BARRAGE    = '/Lotus/Upgrades/Mods/Shotgun/DualStat/PoisonEventShotgunMod';

const FELARX_MOD = {
  PRIMED_CHILLING:    '/Lotus/Upgrades/Mods/Shotgun/Expert/WeaponFreezeDamageModExpert',
  CONTAGIOUS_SPREAD:  '/Lotus/Upgrades/Mods/Shotgun/WeaponToxinDamageMod',
  GALVANIZED_HELL:    '/Lotus/Upgrades/Mods/Shotgun/WeaponFireIterationsSPMod',
  GALVANIZED_SAVVY:   GALVANIZED_SAVVY,
  PRIMED_CHARGED:     '/Lotus/Upgrades/Mods/Shotgun/Expert/WeaponElectricityDamageModExpert',
  PRIMED_CLEANSE:     '/Lotus/Upgrades/Mods/Shotgun/Expert/WeaponShotgunFactionDamageCorruptedExpert',
  PRIMED_AMMO_STOCK:  '/Lotus/Upgrades/Mods/Shotgun/Expert/WeaponClipMaxModExpert',
  PRIMED_POINT_BLANK: '/Lotus/Upgrades/Mods/Shotgun/Expert/WeaponDamageAmountModExpert',
};
const FELARX_PERKS = { 2: 'attuned_accuracy', 3: 'evolved_autoloader', 4: 'racking_wrath', 5: 'devastating_attrition' };

/** Skeleton de canales de Felarx (primary + perks). Reusado por `felarx()` y por el `felarxStatus` del test. */
export function felarxItems(profile: string) {
  return {
    warframe:         { itemId: null, rank: 30, shards: [] },
    primary:          { itemId: FELARX, rank: 30, active_profile: profile, evolution_perks: FELARX_PERKS },
    secondary:        { itemId: null, rank: 30 },
    melee:            { itemId: null, rank: 30 },
    companion:        { itemId: null, rank: 30 },
    companion_weapon: { itemId: null, rank: 30 },
    archwing:         { itemId: null, rank: 30 },
    archgun:          { itemId: null, rank: 30 },
    archmelee:        { itemId: null, rank: 30 },
    necramech:        { itemId: null, rank: 30 },
  };
}

/** Felarx — build completa verificada. `profile` = `'base'` | `'incarnon_form'`. */
export function felarx(profile = 'base'): EnsembleIntention {
  const mods = {
    0: { itemId: FELARX_MOD.PRIMED_CHILLING,    rank: 30, level: 10 },
    1: { itemId: FELARX_MOD.CONTAGIOUS_SPREAD,  rank: 30, level: 5  },
    2: { itemId: FELARX_MOD.GALVANIZED_HELL,    rank: 30, level: 10 },
    3: { itemId: FELARX_MOD.GALVANIZED_SAVVY,   rank: 30, level: 10 },
    4: { itemId: FELARX_MOD.PRIMED_CHARGED,     rank: 30, level: 10 },
    5: { itemId: FELARX_MOD.PRIMED_CLEANSE,     rank: 30, level: 10 },
    6: { itemId: FELARX_MOD.PRIMED_AMMO_STOCK,  rank: 30, level: 10 },
    7: { itemId: FELARX_MOD.PRIMED_POINT_BLANK, rank: 30, level: 10 },
  };
  return { items: felarxItems(profile), mods: { primary: mods }, environment: BASE_ENV };
}

// ─── Boltor Prime (proyectil single, Incarnon Genesis) ────────────────────────────

export const BOLTOR_PRIME = '/Lotus/Weapons/Tenno/LongGuns/PrimeBoltor/PrimeBoltor';
export const SERRATION    = '/Lotus/Upgrades/Mods/Rifle/WeaponDamageAmountMod';

/** Boltor Prime con perks/mods/perfil variables. Perfil por defecto: `'base'`. */
export function boltor(opts: { perks?: Record<number, string>; mods?: Record<number, string>; profile?: string } = {}): EnsembleIntention {
  return {
    items: {
      warframe:         { itemId: null, rank: 30, shards: [] },
      primary:          { itemId: BOLTOR_PRIME, rank: 30, active_profile: opts.profile ?? 'base', evolution_perks: opts.perks },
      secondary:        { itemId: null, rank: 30 },
      melee:            { itemId: null, rank: 30 },
      companion:        { itemId: null, rank: 30 },
      companion_weapon: { itemId: null, rank: 30 },
      archwing:         { itemId: null, rank: 30 },
      archgun:          { itemId: null, rank: 30 },
      archmelee:        { itemId: null, rank: 30 },
      necramech:        { itemId: null, rank: 30 },
    },
    mods: opts.mods
      ? { primary: Object.fromEntries(Object.entries(opts.mods).map(([s, id]) => [s, { itemId: id, rank: 30, level: 10 }])) }
      : {},
    environment: BASE_ENV,
  };
}

// ─── Soma Prime (rifle Incarnon, perk CO fatal_affliction) ────────────────────────

export const SOMA_PRIME = '/Lotus/Weapons/Tenno/LongGuns/PrimeSoma/PrimeSomaRifle';

/** Soma Prime con perks de evolución variables. Vehículo del perk CO incarnon (fatal_affliction). */
export function soma(opts: { perks?: Record<number, string>; profile?: string } = {}): EnsembleIntention {
  return {
    items: {
      warframe:         { itemId: null, rank: 30, shards: [] },
      primary:          { itemId: SOMA_PRIME, rank: 30, active_profile: opts.profile ?? 'base', evolution_perks: opts.perks },
      secondary:        { itemId: null, rank: 30 },
      melee:            { itemId: null, rank: 30 },
      companion:        { itemId: null, rank: 30 },
      companion_weapon: { itemId: null, rank: 30 },
      archwing:         { itemId: null, rank: 30 },
      archgun:          { itemId: null, rank: 30 },
      archmelee:        { itemId: null, rank: 30 },
      necramech:        { itemId: null, rank: 30 },
    },
    mods: {},
    environment: BASE_ENV,
  };
}

// ─── Nikana Prime (MELEE — hit-base determinista, OQ-ENGINE-14 ladrillo 1) ────────

export const NIKANA_PRIME = '/Lotus/Weapons/Tenno/Melee/Swords/PrimeKatana/PrimeNikana';

const NIKANA_MOD = {
  PRIMED_PRESSURE_POINT: '/Lotus/Upgrades/Mods/Melee/Expert/WeaponMeleeDamageModExpert', // WEAPON_ADD_DAMAGE
  TRUE_STEEL:            '/Lotus/Upgrades/Mods/Melee/WeaponCritChanceMod',                // WEAPON_ADD_CRIT_CHANCE
  ORGAN_SHATTER:         '/Lotus/Upgrades/Mods/Melee/WeaponCritDamageMod',               // WEAPON_ADD_CRIT_MULT
  MELEE_PROWESS:         '/Lotus/Upgrades/Mods/Melee/WeaponStunChanceMod',               // WEAPON_ADD_STATUS_CHANCE
  CONDITION_OVERLOAD:    '/Lotus/Upgrades/Mods/Melee/WeaponDamageIfVictimProcActive',    // CONDITION_OVERLOAD (CO melee, coefBase 80, 1x)
  BLOOD_RUSH:            '/Lotus/Upgrades/Mods/Melee/Event/ComboCritChanceMod',          // COMBO_SCALED_ADD (val × meleeComboMult)
};

/** Nikana Prime — primer melee. Va en el slot `melee` del ensemble. Mods básicos genéricos
 *  (damage/crit/status), sin nada combo-dependiente. `profile`: 'base'/'normal_attack',
 *  'slam_attack', 'heavy_slam_attack'. `withCO` añade Condition Overload (el mod CO melee).
 *  `withBloodRush` añade Blood Rush (familia `COMBO_SCALED_ADD`, `melee-combo.md §4`). */
export function nikana(withMods = true, profile = 'base', withCO = false, withBloodRush = false): EnsembleIntention {
  const mods: Record<number, { itemId: string; rank: number; level: number }> = withMods ? {
    0: { itemId: NIKANA_MOD.PRIMED_PRESSURE_POINT, rank: 30, level: 10 },
    1: { itemId: NIKANA_MOD.TRUE_STEEL,            rank: 30, level: 10 },
    2: { itemId: NIKANA_MOD.ORGAN_SHATTER,         rank: 30, level: 10 },
    3: { itemId: NIKANA_MOD.MELEE_PROWESS,         rank: 30, level: 10 },
  } : {};
  if (withCO) mods[4] = { itemId: NIKANA_MOD.CONDITION_OVERLOAD, rank: 30, level: 5 };
  if (withBloodRush) mods[5] = { itemId: NIKANA_MOD.BLOOD_RUSH, rank: 30, level: 10 };
  return {
    items: {
      warframe:         { itemId: null, rank: 30, shards: [] },
      primary:          { itemId: null, rank: 30 },
      secondary:        { itemId: null, rank: 30 },
      melee:            { itemId: NIKANA_PRIME, rank: 30, active_profile: profile },
      companion:        { itemId: null, rank: 30 },
      companion_weapon: { itemId: null, rank: 30 },
      archwing:         { itemId: null, rank: 30 },
      archgun:          { itemId: null, rank: 30 },
      archmelee:        { itemId: null, rank: 30 },
      necramech:        { itemId: null, rank: 30 },
    },
    mods: Object.keys(mods).length > 0 ? { melee: mods } : {},
    environment: BASE_ENV,
  };
}

// ─── Arcano v0: Primary Merciless sobre Lanka (siempre-activo + guarda de null + clamp) ─

export const PRIMARY_MERCILESS = '/Lotus/Upgrades/CosmeticEnhancers/Offensive/PrimaryDamageOnKill';

/**
 * Lanka + Primary Merciless (1 arcano) — primer fixture con arcano. Verifica el flujo A→B→C:
 *   - parte siempre-activa `+30% Reload Speed` → nodo WEAPON_ADD_RELOAD_SPEED (base 100) → 130;
 *   - parte `On Kill +5% Damage` con base_value:null + upgrade_type:null → OMITIDA (stacking, OQ-DATA-4);
 *   - rank:5 sobre serie de 1 valor → clampado a idx 0 (los arcanos no son todos 0-5).
 */
export function lankaArcane(profile = 'charged_shot'): EnsembleIntention {
  return {
    ...lanka(profile),
    arcanes: { primary: { 0: { itemId: PRIMARY_MERCILESS, rank: 5 } } },
  };
}

// ─── Rhino (warframe net-new, fixture_01 Tier 1: base + mods + shards) ─────────────

export const RHINO = '/Lotus/Powersuits/Rhino/Rhino';

const RHINO_MOD = {
  BLIND_RAGE:         '/Lotus/Upgrades/Mods/Warframe/DualStat/CorruptedPowerEfficiencyWarframe',           // +99% str / −55% eff (lvl 10)
  TRANSIENT_FORTITUDE:'/Lotus/Upgrades/Mods/Warframe/DualStat/CorruptedPowerStrengthPowerDurationWarframe', // +55% str / −27.5% dur (lvl 10)
  PRIMED_CONTINUITY:  '/Lotus/Upgrades/Mods/Warframe/Expert/AvatarAbilityDurationModExpert',                // +55% dur (lvl 10)
  STRETCH:            '/Lotus/Upgrades/Mods/Warframe/AvatarAbilityRangeMod',                                // +45% range (lvl 5)
};

// Cristal azul (Boreal) tauforjado, efecto armadura: AVATAR_FLAT_ARMOUR +225 c/u.
// shardType = uniqueName del cristal (la clave real del catálogo); el mapeo color→cristal
// es asunto de UI, no del engine. effectId = id del stat dentro del cristal.
const AZURE_ARMOR_TAU = {
  shardType: '/Lotus/Types/Gameplay/NarmerSorties/ArchonCrystalBoreal',
  effectId: 'azure-armor',
  isTauforged: true,
};

/**
 * Rhino fixture_01 (Tier 1, base reproducible). Mide los ejes 1+2: dato base del warframe
 * + mods que componen sobre los nodos AVATAR_*. Sin habilidades (Roar/Iron Skin = paso 2).
 * Esperado (a verificar con el oráculo): str 254%, range 145%, dur 127.5%, eff 45%,
 * armor = 240 × (1 + 0%) + 2×225 = 690 (sin mod % de armadura en Tier 1; shards = flat).
 */
export function rhino(): EnsembleIntention {
  return {
    items: {
      warframe: {
        itemId: RHINO, rank: 30,
        shards: [{ ...AZURE_ARMOR_TAU }, { ...AZURE_ARMOR_TAU }],
      },
      primary:          { itemId: null, rank: 30 },
      secondary:        { itemId: null, rank: 30 },
      melee:            { itemId: null, rank: 30 },
      companion:        { itemId: null, rank: 30 },
      companion_weapon: { itemId: null, rank: 30 },
      archwing:         { itemId: null, rank: 30 },
      archgun:          { itemId: null, rank: 30 },
      archmelee:        { itemId: null, rank: 30 },
      necramech:        { itemId: null, rank: 30 },
    },
    mods: { warframe: {
      0: { itemId: RHINO_MOD.BLIND_RAGE,          rank: 30, level: 10 },
      1: { itemId: RHINO_MOD.TRANSIENT_FORTITUDE, rank: 30, level: 10 },
      2: { itemId: RHINO_MOD.PRIMED_CONTINUITY,   rank: 30, level: 10 },
      3: { itemId: RHINO_MOD.STRETCH,             rank: 30, level: 5  },
    } },
    environment: BASE_ENV,
  };
}

// ─── Sicarus Prime (perk incarnon Feigned Retreat — vehículo de EnemySnapshot, ladrillo #2) ─

export const SICARUS_PRIME = '/Lotus/Weapons/Tenno/Pistols/PrimeSicarus/PrimeSicarusPistol';

/** Sicarus Prime con perks de evolución variables. Vehículo de `while_enemy_below_half_health`. */
export function sicarus(opts: { perks?: Record<number, string>; profile?: string } = {}): EnsembleIntention {
  return {
    items: {
      warframe:         { itemId: null, rank: 30, shards: [] },
      primary:          { itemId: null, rank: 30 },
      secondary:        { itemId: SICARUS_PRIME, rank: 30, active_profile: opts.profile ?? 'base', evolution_perks: opts.perks },
      melee:            { itemId: null, rank: 30 },
      companion:        { itemId: null, rank: 30 },
      companion_weapon: { itemId: null, rank: 30 },
      archwing:         { itemId: null, rank: 30 },
      archgun:          { itemId: null, rank: 30 },
      archmelee:        { itemId: null, rank: 30 },
      necramech:        { itemId: null, rank: 30 },
    },
    mods: {},
    environment: BASE_ENV,
  };
}

// ─── Registro de builds para el oráculo (`npm run oracle -- <name>` | `all`) ───────

/** Invocación representativa de cada build. El oráculo lo recorre por nombre. */
export const BUILDS: Record<string, () => EnsembleIntention> = {
  lanka:  () => lanka('charged_shot'),
  cedo:   () => cedo(true),
  laetum: () => laetum(),
  felarx: () => felarx(),
  boltor: () => boltor({ perks: { 2: 'hunters_mantra', 4: 'commodores_fortune' }, mods: { 0: SERRATION } }),
  lanka_arcane: () => lankaArcane(),
  rhino:  () => rhino(),
  sicarus: () => sicarus({ perks: { 2: 'feigned_retreat' } }),
};
