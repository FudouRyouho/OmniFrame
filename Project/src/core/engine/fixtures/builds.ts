/**
 * Catálogo de build-fixtures: escenas (`Scene`) verificadas en partida,
 * hogar único de los builds del engine. Consumidas por dos adaptadores hermanos sobre la
 * MISMA entrada: los tests (que les adosan expectativas y asertan) y el CLI oráculo (que
 * las inspecciona e imprime). Mismo input, distinto acto — ninguno invade el rol del otro.
 *
 * `BUILDS` (al final) es el registro que el oráculo recorre por nombre: `npm run oracle -- <build>`
 * (o `all`). Cada entrada es una invocación representativa de su factory.
 *
 * Las factories quedan verbatim de sus tests (migración fiel, sin re-abstraer el skeleton de
 * slots). Ubicación provisional (`fixtures/` mezcla bootstrap + builds) — ver `DC-OQ-ENGINE-9` §Pendiente.
 */
import type { Scene, HostileIntent, WarframeIntent, WeaponIntent, CompanionIntent, SlotMap, ModIntent, ArcaneIntent } from '@shared/types/scene';
import { NO_HOSTILE } from '@shared/types/scene';
import { scene, player, onPlayer, withBearer, withMods, withArcanes, withAbilities, withShards } from '@shared/types/scene-compose';



// ─── Construcción de escenas ─────────────────────────────────────────────────────

type OnfootParts = {
  warframe?: WarframeIntent; primary?: WeaponIntent; secondary?: WeaponIntent;
  melee?: WeaponIntent; companion?: CompanionIntent;
};

/** Una escena de un jugador a pie. Lo que no se declara, no existe — sin slots vacíos que llenar. */
export function onfoot(parts: OnfootParts, hostile: HostileIntent[] = NO_HOSTILE): Scene {
  const { warframe, primary, secondary, melee, companion } = parts;
  const weapons = { ...(primary && { primary }), ...(secondary && { secondary }), ...(melee && { melee }) };
  return scene({
    kind: 'onfoot',
    ...(warframe && { warframe }),
    ...(Object.keys(weapons).length > 0 && { weapons }),
    ...(companion && { companion }),
  }, hostile);
}

/** `{0: {itemId, level}}` → `SlotMap<ModIntent>`. El `rank` de los mods nunca llegaba al engine. */
export function modSlots(raw: Record<number, { itemId: string; level: number }>): SlotMap<ModIntent> {
  return Object.fromEntries(Object.entries(raw).map(([k, m]) => [k, { uniqueName: m.itemId, level: m.level }])) as SlotMap<ModIntent>;
}

/** Espejo para arcanos (`rank` SÍ es semántico: indexa `base_value[rank]`). */
export function arcaneSlots(raw: Record<number, { itemId: string; rank: number }>): SlotMap<ArcaneIntent> {
  return Object.fromEntries(Object.entries(raw).map(([k, a]) => [k, { uniqueName: a.itemId, rank: a.rank }])) as SlotMap<ArcaneIntent>;
}


// ─── Lanka (sniper de carga, proyectil) ──────────────────────────────────────────

export const LANKA = '/Lotus/Weapons/ClanTech/Energy/Railgun';

const LANKA_MOD = {
  SHRED:             '/Lotus/Upgrades/Mods/Rifle/DualStat/ShredMod',
  TERMINAL_VELOCITY: '/Lotus/Upgrades/Mods/Rifle/WeaponProjectileSpeedMod',          // +60% projectile speed (level 3)
  VILE_PRECISION:    '/Lotus/Upgrades/Mods/Rifle/DualStat/CorruptedRecoilFireRateRifle', // −90% recoil / −36% fire rate (level 5)
};

/** Lanka. `profile` = `'charged_shot'` | `'partially_charged_shot'`. */
export function lanka(profile: string): Scene {
  return onfoot({
    primary: { uniqueName: LANKA, rank: 30, activeProfile: profile, mods: modSlots({
      0: { itemId: LANKA_MOD.SHRED, level: 5 },
      1: { itemId: LANKA_MOD.TERMINAL_VELOCITY, level: 3 },
      2: { itemId: LANKA_MOD.VILE_PRECISION, level: 5 },
    }) },
  }, NO_HOSTILE);;
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
export function cedo(withGH = false, profile = 'base'): Scene {
  const mods: Record<number, { itemId: string; level: number }> = {
    0: { itemId: CEDO_MOD.TOXIC_BARRAGE, level: 3  },
    1: { itemId: CEDO_MOD.SHOTGUN_BARRAGE, level: 5  },
    2: { itemId: CEDO_MOD.CRITICAL_DECEL, level: 5  },
    3: { itemId: CEDO_MOD.PRIMED_CHILLING, level: 10 },
    4: { itemId: CEDO_MOD.PRIMED_POINT_BLANK, level: 10 },
    5: { itemId: CEDO_MOD.GALVANIZED_SAVVY, level: 10 },
    7: { itemId: CEDO_MOD.PRIMED_RAVAGE, level: 10 },
  };
  if (withGH) mods[6] = { itemId: CEDO_MOD.GALVANIZED_HELL, level: 10 };
  return onfoot({
    primary: { uniqueName: CEDO_PRIME, rank: 30, activeProfile: profile, mods: modSlots(mods) },
  }, NO_HOSTILE);;
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
export function laetum(profile = 'base'): Scene {
  return onfoot({
    secondary: { uniqueName: LAETUM, rank: 30, activeProfile: profile, evolutionPerks: LAETUM_PERKS, mods: modSlots({
        0: { itemId: LAETUM_MOD.PISTOL_PESTILENCE, level: 10 },
        1: { itemId: LAETUM_MOD.ICE_STORM, level: 10 },
        2: { itemId: LAETUM_MOD.GALVANIZED_SHOT, level: 10 },
        3: { itemId: LAETUM_MOD.GALVANIZED_DIFFUSION, level: 10 },
        4: { itemId: LAETUM_MOD.LETHAL_TORRENT, level: 10 },
        5: { itemId: LAETUM_MOD.HORNET_STRIKE, level: 10 },
        6: { itemId: LAETUM_MOD.GUNSLINGER, level: 10 },
        7: { itemId: LAETUM_MOD.PRIMED_HEATED_CHARGE, level: 10 },
      }) },
  }, NO_HOSTILE);;
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
export const FELARX_PERKS = { 2: 'attuned_accuracy', 3: 'evolved_autoloader', 4: 'racking_wrath', 5: 'devastating_attrition' };

/** Skeleton de canales de Felarx (primary + perks). Reusado por `felarx()` y por el `felarxStatus` del test. */
/** Felarx — build completa verificada. `profile` = `'base'` | `'incarnon_form'`. */
export function felarx(profile = 'base'): Scene {
  const mods = {
    0: { itemId: FELARX_MOD.PRIMED_CHILLING, level: 10 },
    1: { itemId: FELARX_MOD.CONTAGIOUS_SPREAD, level: 5  },
    2: { itemId: FELARX_MOD.GALVANIZED_HELL, level: 10 },
    3: { itemId: FELARX_MOD.GALVANIZED_SAVVY, level: 10 },
    4: { itemId: FELARX_MOD.PRIMED_CHARGED, level: 10 },
    5: { itemId: FELARX_MOD.PRIMED_CLEANSE, level: 10 },
    6: { itemId: FELARX_MOD.PRIMED_AMMO_STOCK, level: 10 },
    7: { itemId: FELARX_MOD.PRIMED_POINT_BLANK, level: 10 },
  };
  return onfoot({
    primary: { uniqueName: FELARX, rank: 30, activeProfile: profile, evolutionPerks: FELARX_PERKS, mods: modSlots(mods) },
  });
}

// ─── Boltor Prime (proyectil single, Incarnon Genesis) ────────────────────────────

export const BOLTOR_PRIME = '/Lotus/Weapons/Tenno/LongGuns/PrimeBoltor/PrimeBoltor';
export const SERRATION    = '/Lotus/Upgrades/Mods/Rifle/WeaponDamageAmountMod';
/** Heavy Caliber — +165% daño / −55% precisión. El mod emblemático del token `WEAPON_ADD_ACCURACY`. */
export const HEAVY_CALIBER = '/Lotus/Upgrades/Mods/Rifle/DualStat/CorruptedDamageRecoilRifle';
export const GALVANIZED_CHAMBER = '/Lotus/Upgrades/Mods/Rifle/WeaponFireIterationsSPMod'; // STACK_DECAY_BUFF (ladrillo #4)
export const GALVANIZED_HELL = '/Lotus/Upgrades/Mods/Shotgun/WeaponFireIterationsSPMod'; // STACK_DECAY_BUFF (Cedo/Felarx)
export const GALVANIZED_DIFFUSION = '/Lotus/Upgrades/Mods/Pistol/WeaponFireIterationsSPMod'; // STACK_DECAY_BUFF (Laetum)
/** Variable de contexto que declara stacks C1 para un Galvanized [Arma] (`stack_decay:<unique_name>`). */
export const galvanizedStacksVar = (uniqueName: string) => `stack_decay:${uniqueName}`;

/** Boltor Prime con perks/mods/perfil variables. Perfil por defecto: `'base'`. */
export function boltor(opts: { perks?: Record<number, string>; mods?: Record<number, string>; profile?: string } = {}): Scene {
  return onfoot({
    primary: { uniqueName: BOLTOR_PRIME, rank: 30, activeProfile: opts.profile ?? 'base', evolutionPerks: opts.perks, mods: modSlots(Object.fromEntries(Object.entries(opts.mods ?? {}).map(([s, id]) => [s, { itemId: id, level: 10 }]))) },
  }, NO_HOSTILE);;
}

// ─── Soma Prime (rifle Incarnon, perk CO fatal_affliction) ────────────────────────

export const SOMA_PRIME = '/Lotus/Weapons/Tenno/LongGuns/PrimeSoma/PrimeSomaRifle';

/** Soma Prime con perks de evolución variables. Vehículo del perk CO incarnon (fatal_affliction). */
export function soma(opts: { perks?: Record<number, string>; profile?: string } = {}): Scene {
  return onfoot({
    primary: { uniqueName: SOMA_PRIME, rank: 30, activeProfile: opts.profile ?? 'base', evolutionPerks: opts.perks },
  }, NO_HOSTILE);;
}

// ─── Boar Prime (escopeta Incarnon — el par de dispersión más extremo del dataset) ─

export const BOAR_PRIME = '/Lotus/Weapons/Tenno/Shotgun/PrimeBoar';

/** Boar Prime, sin mods. Vehículo del contraste de dispersión: la escopeta abre {10, 30}
 *  y su forma Incarnon no abre nada ({0, 0}) — dos extremos en la misma arma. */
export function boar(profile = 'base'): Scene {
  return onfoot({
    primary: { uniqueName: BOAR_PRIME, rank: 30, activeProfile: profile },
  }, NO_HOSTILE);;
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
  FURY:                  '/Lotus/Upgrades/Mods/Melee/WeaponFireRateMod',                 // MELEE_ADD_ATTACK_SPEED (+30% a rank 5)
};

/** Nikana Prime — primer melee. Va en el slot `melee` del ensemble. Mods básicos genéricos
 *  (damage/crit/status), sin nada combo-dependiente. `profile`: 'base'/'normal_attack',
 *  'slam_attack', 'heavy_slam_attack'. `withCO` añade Condition Overload (el mod CO melee).
 *  `withBloodRush` añade Blood Rush (familia `COMBO_SCALED_ADD`, `melee-combo.md §4`). */
export function nikana(
  withMods = true,
  profile = 'base',
  withCO = false,
  withBloodRush = false,
  withFury = false,
): Scene {
  const mods: Record<number, { itemId: string; level: number }> = withMods ? {
    0: { itemId: NIKANA_MOD.PRIMED_PRESSURE_POINT, level: 10 },
    1: { itemId: NIKANA_MOD.TRUE_STEEL, level: 10 },
    2: { itemId: NIKANA_MOD.ORGAN_SHATTER, level: 10 },
    3: { itemId: NIKANA_MOD.MELEE_PROWESS, level: 10 },
  } : {};
  if (withCO) mods[4] = { itemId: NIKANA_MOD.CONDITION_OVERLOAD, level: 5 };
  if (withBloodRush) mods[5] = { itemId: NIKANA_MOD.BLOOD_RUSH, level: 10 };
  // Fury: el mod que motivó separar el token — su label dice "Attack Speed" pero su
  // `upgrade_type` decía `WEAPON_ADD_FIRE_RATE`. Vehículo de la separación (familia MELEE).
  if (withFury) mods[6] = { itemId: NIKANA_MOD.FURY, level: 5 };
  return onfoot({
    melee: { uniqueName: NIKANA_PRIME, rank: 30, activeProfile: profile, mods: modSlots(mods) },
  }, NO_HOSTILE);;
}

// ─── Arcano v0: Primary Merciless sobre Lanka (siempre-activo + guarda de null + clamp) ─

export const PRIMARY_MERCILESS = '/Lotus/Upgrades/CosmeticEnhancers/Offensive/PrimaryDamageOnKill';

/**
 * Lanka + Primary Merciless (1 arcano) — primer fixture con arcano. Verifica el flujo A→B→C:
 *   - parte siempre-activa `+30% Reload Speed` → nodo WEAPON_ADD_RELOAD_SPEED (base 100) → 130;
 *   - parte `On Kill +5% Damage` con base_value:null + upgrade_type:null → OMITIDA (stacking, OQ-DATA-4);
 *   - rank:5 sobre serie de 1 valor → clampado a idx 0 (los arcanos no son todos 0-5).
 */
export function lankaArcane(profile = 'charged_shot'): Scene {
  return scene(withArcanes(player(lanka(profile)), 'primary', arcaneSlots({ 0: { itemId: PRIMARY_MERCILESS, rank: 5 } })));
}

// ─── Rhino (warframe net-new, fixture_01 Tier 1: base + mods + shards) ─────────────

export const RHINO = '/Lotus/Powersuits/Rhino/Rhino';

/**
 * Amalgam Serration — mod de RIFLE que emite un token de warframe (`AVATAR_ADD_SPRINT_SPEED`)
 * además del suyo. Es el caso real que justifica el salto arma→warframe del ruteo; sin él, ese
 * salto sería una regla sin ejercicio. Cuatro hermanos de PvE en el dataset (el otro Amalgam,
 * Dispatch Overdrive, Resolute Focus) más doce de Conclave.
 */
export const AMALGAM_SERRATION = '/Lotus/Upgrades/Mods/DualSource/Rifle/SerratedRushMod';

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
  uniqueName: '/Lotus/Types/Gameplay/NarmerSorties/ArchonCrystalBoreal',
  effectId: 'azure-armor',
  isTauforged: true,
};

/**
 * Rhino fixture_01 (Tier 1, base reproducible). Mide los ejes 1+2: dato base del warframe
 * + mods que componen sobre los nodos AVATAR_*. Sin habilidades (Roar/Iron Skin = paso 2).
 * Esperado (a verificar con el oráculo): str 254%, range 145%, dur 127.5%, eff 45%,
 * armor = 240 × (1 + 0%) + 2×225 = 690 (sin mod % de armadura en Tier 1; shards = flat).
 */
export function rhino(): Scene {
  return onfoot({
    warframe: { uniqueName: RHINO, rank: 30, shards: [{ ...AZURE_ARMOR_TAU }, { ...AZURE_ARMOR_TAU }], mods: modSlots({
      0: { itemId: RHINO_MOD.BLIND_RAGE, level: 10 },
      1: { itemId: RHINO_MOD.TRANSIENT_FORTITUDE, level: 10 },
      2: { itemId: RHINO_MOD.PRIMED_CONTINUITY, level: 10 },
      3: { itemId: RHINO_MOD.STRETCH, level: 5  },
    }) },
  }, NO_HOSTILE);;
}

// ─── Sicarus Prime (perk incarnon Feigned Retreat — vehículo de EnemySnapshot, ladrillo #2) ─

export const SICARUS_PRIME = '/Lotus/Weapons/Tenno/Pistols/PrimeSicarus/PrimeSicarusPistol';

/** Sicarus Prime con perks de evolución variables. Vehículo de `while_enemy_below_half_health`. */
export function sicarus(opts: { perks?: Record<number, string>; profile?: string } = {}): Scene {
  return onfoot({
    secondary: { uniqueName: SICARUS_PRIME, rank: 30, activeProfile: opts.profile ?? 'base', evolutionPerks: opts.perks },
  }, NO_HOSTILE);;
}

// ─── Registro de builds para el oráculo (`npm run oracle -- <name>` | `all`) ───────

/** Invocación representativa de cada build. El oráculo lo recorre por nombre. */
// ─── Tiberon Prime (rifle semi) — reproduce el test in-game `references/ingame-tests/dot-scaling.md` ──
export const TIBERON_PRIME = '/Lotus/Weapons/Tenno/LongGuns/PrimeTiberon/PrimeTiberonRifle';
const THERMITE_ROUNDS = '/Lotus/Upgrades/Mods/Rifle/DualStat/FireEventRifleMod'; // +Heat + status chance

/** Tiberon Prime + Serration. `heat=true` agrega Thermite Rounds (+Heat). Rifle Aptitude se omite:
 *  es status chance, no cambia el valor del tick de DoT (que se computa determinista de la Instancia). */
export function tiberon(heat = false): Scene {
  const mods: Record<number, { itemId: string; level: number }> = {
    0: { itemId: SERRATION, level: 10 },
  };
  if (heat) mods[1] = { itemId: THERMITE_ROUNDS, level: 10 };
  return onfoot({
    primary: { uniqueName: TIBERON_PRIME, rank: 30, mods: modSlots(mods) },
  }, NO_HOSTILE);;
}

// ─── Rhino + Roar (Fase 1b — habilidad real, verbo muta-state cross-entity) ───────

export const RHINO_ROAR = '/Lotus/Powersuits/PowersuitAbilities/RhinoRoarAbility';

/**
 * Rhino (strength 254%, mismos mods que fixture_01) + Roar activo + un arma simple
 * (Tiberon Prime, sin mods). El buff nace en el warframe (source) y aterriza en el
 * pool de facción del arma (target): +127% = 50% × strength(2.54). Es fixture_03/04
 * pero por HIDRATACIÓN REAL — el modifier lo produce `AbilityRepository` desde el
 * `ability-stats.override` (upgrade_type poblado), NO hand-built. Cierra Fase 1b.
 */
export function rhinoRoar(): Scene {
  let p = withAbilities(player(rhino()), [{ uniqueName: RHINO_ROAR }]);
  p = withBearer(p, 'primary', { uniqueName: TIBERON_PRIME, rank: 30, activeProfile: 'base' });
  return scene(p);
}

// ─── Volt + Speed (2ª habilidad hidratada — buff a un nodo de arma YA materializado) ──

export const VOLT = '/Lotus/Powersuits/Volt/Volt';
export const VOLT_SPEED = '/Lotus/Powersuits/PowersuitAbilities/SpeedAbility';

/**
 * Volt limpio (sin mods → strength 100%) + Tiberon Prime sin mods. Baseline para aislar
 * el aporte de Speed: `WEAPON_ADD_RELOAD_SPEED` queda en su base 100 (no-op).
 */
export function volt(): Scene {
  return onfoot({
    warframe: { uniqueName: VOLT, rank: 30, mods: modSlots({}) },
    primary: { uniqueName: TIBERON_PRIME, rank: 30, activeProfile: 'base' },
  }, NO_HOSTILE);;
}

/**
 * Volt + Speed activo. Segunda habilidad que el motor consume por hidratación real
 * (la 1ª fue Roar). Diferencia con Roar: el destino NO es un pool de daño sino un nodo
 * de utilidad del arma que ya existía materializado (`WEAPON_ADD_RELOAD_SPEED`, base 100),
 * y el token `$$` se resuelve por SINTAXIS (`resolveToken`: WEAPON+ADD → op ADD), sin
 * entrada en `UPGRADE_MAP`. Cero código nuevo: sólo la anotación en el `.md`.
 *
 * Wiki (`references/wiki/warframes/volt/speed.md`): el buff de reload **stackea
 * ADITIVAMENTE** con los mods de reload — `Speed(25%) × Intensify(1.3) + Quickdraw(48%)`.
 * Por eso aterriza en `mods_add_pct`, junto a los mods, y no en un bucket propio.
 *
 * Los otros dos buffs de Speed (`references/wiki/mechanics/movement-speed.md`) aterrizan en
 * entidades distintas y por eso el ruteo sale del token, no de la pertenencia: Movement Speed
 * (`AVATAR_*`) vuelve al warframe que castea, Melee Attack Speed (`MELEE_*`) alcanza sólo la
 * melee equipada. Los tres salen de DOS renglones del `.md` porque la UI del juego colapsa
 * movement y melee attack speed en un solo `Speed Multiplier: 1,75x`.
 *
 * @param strength si se pasa, agrega Blind Rage (+99% str) para ejercer el escalado.
 * @param melee    si se pasa, equipa la Nikana Prime — necesario para ejercer el buff `MELEE_*`.
 */
export function voltSpeed(opts: { strength?: boolean, melee?: boolean } = {}): Scene {
  let p = withAbilities(player(volt()), [{ uniqueName: VOLT_SPEED }]);
  if (opts.melee) p = withBearer(p, 'melee', { uniqueName: NIKANA_PRIME, rank: 30, activeProfile: 'base' });
  if (opts.strength) p = withMods(p, 'warframe', modSlots({ 0: { itemId: RHINO_MOD.BLIND_RAGE, level: 10 } }));
  return scene(p);
}

// Cristal ámbar (Nira), efecto Parkour Velocity: `AVATAR_ADD_PARKOUR_VELOCITY` +15% (+22.5%
// tauforjado). A diferencia del azul de Rhino —que es FLAT sobre armadura— éste es porcentual
// y compone en `mods_add_pct` sobre una base sintética de 100.
const AMBER_PARKOUR = {
  uniqueName: '/Lotus/Types/Gameplay/NarmerSorties/ArchonCrystalNira',
  effectId: 'amber-parkour-velocity',
  isTauforged: false,
};

/**
 * Volt + un shard ámbar de Parkour Velocity. No lleva la habilidad: el eje que ejerce es el
 * nodo `AVATAR_ADD_PARKOUR_VELOCITY`, que existía como token sin nodo materializado — o sea
 * un dato del juego que el motor cargaba y perdía en silencio, porque el modifier resolvía y
 * no tenía dónde aterrizar. Es el mismo modo de falla que el ruteo por canal (`voltChannelArcanes`),
 * visto desde el otro lado: allá faltaba el canal, acá falta el nodo.
 *
 * @param tau si se pasa, el cristal es tauforjado (+22.5% en vez de +15%).
 */
export function voltParkour(opts: { tau?: boolean } = {}): Scene {
  return scene(withShards(player(volt()), [{ ...AMBER_PARKOUR, isTauforged: opts.tau ?? false }]));
}

export const MOBILIZE = '/Lotus/Upgrades/Mods/Warframe/ParkourTwoMod';

/**
 * Volt + Mobilize (rank 3, máximo). El mod canónico de la familia parkour, y el caso que ejerce
 * los DOS nodos de movimiento en un solo modifier-set: `+20% Parkour Velocity` y
 * `+20% Aim Glide/Wall Latch Duration`. Sus 12 hermanos (Lightning Dash, Firewalker, Piercing
 * Step…) traen exactamente el mismo par.
 *
 * Interesa porque los dos stats **no comparten unidad**: uno es porcentaje sobre base sintética
 * 100, el otro segundos sobre una base real de 3 (`maneuvers §Aim Glide`). El mismo `+20%` produce
 * `120` y `3.6`.
 */
export function voltMobilize(): Scene {
  return scene(withMods(player(volt()), 'warframe', modSlots({ 0: { itemId: MOBILIZE, level: 3 } })));
}

// ─── Arcanos de WARFRAME con canal (ruteo por sub-familia, S2-A/S2-B) ────────────────

export const ARCANE_RAGE          = '/Lotus/Upgrades/CosmeticEnhancers/Offensive/LongGunDamageOnHeadshot';
export const ARCANE_BLADE_CHARGER = '/Lotus/Upgrades/CosmeticEnhancers/Offensive/MeleeDmgOnRifleKill';

/**
 * Volt limpio + Tiberon Prime (primaria) + Nikana Prime (melee), con DOS arcanos montados en
 * el **warframe** cuyo efecto aterriza en **armas distintas**:
 *
 *   Arcane Rage          `WEAPON_PRIMARY_ADD_DAMAGE` +180% @rank5  → canal directo  → Tiberon
 *   Arcane Blade Charger `WEAPON_MELEE_ADD_DAMAGE`   +300% @rank5  → canal CRUZADO  → Nikana
 *                        (su trigger es un kill con rifle; el destino es el melee)
 *
 * Es el caso que sólo el ruteo por canal resuelve: los dos modifiers nacen con
 * `target_entity` = Volt, que no tiene nodo `WEAPON_ADD_DAMAGE`. Sin `channel-routing` se
 * pierden en silencio — el token resuelve y el modifier no aterriza en ningún lado.
 *
 * ⚠️ Uptime asumido 100%. Ambos son condicionales en el juego (`on_headshot` proc 15% / 24s,
 * `on_primary_weapon_kill` proc 30% / 12s). C1 los proyecta siempre-activos, misma doctrina que
 * Roar (`arch-decisions §15`); el `condition` viaja en el modifier sin evaluarse. La fidelidad
 * del *cuándo* es otro eje — ver el registro de inexpresables.
 */
export function voltChannelArcanes(): Scene {
  let p = withBearer(player(volt()), 'melee', { uniqueName: NIKANA_PRIME, rank: 30, activeProfile: 'base' });
  p = withArcanes(p, 'warframe', arcaneSlots({
    0: { itemId: ARCANE_RAGE,          rank: 5 },
    1: { itemId: ARCANE_BLADE_CHARGER, rank: 5 },
  }));
  return scene(p);
}

// ─── Valkyr ──────────────────────────────────────────────────────────────────────────

export const VALKYR        = '/Lotus/Powersuits/Berserker/Berserker';
export const VALKYR_WARCRY = '/Lotus/Powersuits/PowersuitAbilities/BerserkerScreamAbility';

/**
 * Valkyr limpia + Nikana Prime, sin mods. Baseline para aislar el aporte de Warcry.
 *
 * Trae la melee de entrada porque los DOS ejes de Warcry la necesitan o la rozan: el attack
 * speed aterriza en ella, y el armor es el único stat base que participa de la aritmética que
 * el test verifica (855 — el más alto del juego, contra 240 de Rhino y 105 de Volt).
 */
export function valkyr(): Scene {
  return onfoot({
    warframe: { uniqueName: VALKYR, rank: 30, mods: modSlots({}) },
    melee: { uniqueName: NIKANA_PRIME, rank: 30, activeProfile: 'base' },
  }, NO_HOSTILE);;
}

/**
 * Valkyr + Warcry activo. Tercera habilidad que el motor consume por hidratación real
 * (Roar, Speed, Warcry) y la primera que toca **dos entidades distintas con dos ejes
 * distintos**: el armor vuelve al warframe que castea, el attack speed alcanza la melee.
 *
 * Lo que agrega sobre Speed —y la razón de que sea el candidato siguiente— es el eje de
 * **armadura porcentual desde una habilidad**. Rhino ya ejerce `AVATAR_ADD_ARMOUR`, pero
 * sólo con shards FLAT: su `mods_add_pct` queda en `0`. Warcry es la primera fuente que lo
 * puebla, y la wiki precisa que compone ahí y no en un bucket propio — el `+50%` "stackea
 * aditivamente con mods como Steel Fiber", o sea multiplica la base junto a ellos
 * (`references/wiki/mechanics/buff-debuff.md` §Defense · `armor.md`).
 *
 * Los dos stats salen de DOS renglones del `.md` de la UI, sin colapso: a diferencia del
 * `Speed Multiplier: 1,75x` de Volt —un renglón, dos stats—, acá el juego ya los muestra
 * separados.
 *
 * @param strength si se pasa, agrega Blind Rage (+99% str) para ejercer el escalado.
 */
export function valkyrWarcry(opts: { strength?: boolean } = {}): Scene {
  let p = withAbilities(player(valkyr()), [{ uniqueName: VALKYR_WARCRY }]);
  if (opts.strength) p = withMods(p, 'warframe', modSlots({ 0: { itemId: RHINO_MOD.BLIND_RAGE, level: 10 } }));
  return scene(p);
}

/** Adarza Kavat — compañero de armadura 300, el primer participante que no sale del loadout. */
export const ADARZA_KAVAT = '/Lotus/Types/Game/CatbrowPet/MirrorCatbrowPetPowerSuit';

/**
 * Deconstructor Prime — el arma de un sentinel. Participante propio del espacio (canal
 * `companion_weapon`), no un campo del compañero: es `domain: weapon` en `weapons.json`, con sus
 * propios slots de mod y su propio daño.
 */
export const DECONSTRUCTOR_PRIME = '/Lotus/Types/Sentinels/SentinelWeapons/DeconstructorPrime/PrimeHeliosGlaiveWeapon';

/**
 * Valkyr + Warcry + un compañero equipado. Ejerce el ruteo por MARCA: el compañero no es un
 * warframe (`domain: 'companion'`) y aun así porta `avatar`, así que el buff de armadura le llega
 * — que es lo que la fuente declara (`references/wiki/warframes/valkyr/warcry.md`).
 */
export function valkyrWarcryCompanion(): Scene {
  return scene(withBearer(player(valkyrWarcry()), 'companion', { uniqueName: ADARZA_KAVAT, rank: 30 }));
}

/** Bombard Grineer — el objetivo como PARTICIPANTE del espacio, no como parámetro del cálculo. */
export const BOMBARD = '/Lotus/Types/Enemies/Grineer/AIWeek/Avatars/RocketBombardAvatar';

/** Corrosive Projection — aura de warframe que le quita armadura al ENEMIGO (−18% a rank 5). */
export const CORROSIVE_PROJECTION = '/Lotus/Upgrades/Mods/Aura/EnemyArmorReductionAuraMod';

/**
 * Un escenario que declara SÓLO un hostil, sin nada del lado del Squad.
 *
 * Es el camino corto para los tests de C2 que necesitan un objetivo real del catálogo y no un
 * loadout alrededor. Se puede escribir porque B dejó de inventar participantes: sin ítems
 * declarados, el escenario tiene exactamente uno.
 */
export function hostileOnly(uniqueName: string, level: number): Scene {
  return { squad: [{ kind: 'onfoot' }], hostile: [{ uniqueName, level }] };
}

/**
 * Valkyr + Warcry + compañero + un enemigo declarado.
 *
 * El objetivo entra por `hostile` —A2, el grupo Hostil— y no por `items`, que es A1: un enemigo se
 * declara, no se equipa. Declara **nivel 100**, que es lo que compone su frame-0: sus tres vitales
 * nacen escalados por la curva-S, no en el valor de catálogo.
 */
export function valkyrWarcryTarget(): Scene {
  return { ...valkyrWarcryCompanion(), hostile: [{ uniqueName: BOMBARD, level: 100 }] };
}

/**
 * Rhino + Roar + un enemigo declarado. Contra-caso del anterior: Roar buffea el pool GLOBAL de
 * daño (`GAMEPLAY_MULT_FACTION_DAMAGE`, ALL-scope) y el enemigo **materializa ese mismo nodo**
 * (`createBaseEntity` lo siembra en todo lo que no sea warframe). Ejerce que la marca de ruteo, y
 * no la ausencia de nodo, sea lo que impide que un buff del jugador aterrice sobre el objetivo.
 */
export function rhinoRoarTarget(): Scene {
  return { ...rhinoRoar(), hostile: [{ uniqueName: BOMBARD, level: 100 }] };
}

/**
 * La misma build con Corrosive Projection en el aura del warframe: un debuff que sale de UNA
 * entidad y tiene que aterrizar en OTRA de familia distinta. Forcing-case del ruteo cross-entity
 * hacia `ENEMY_*`.
 */
export function corrosiveProjectionTarget(): Scene {
  return onPlayer(valkyrWarcryTarget(), p =>
    withMods(p, 'warframe', modSlots({ 0: { itemId: CORROSIVE_PROJECTION, level: 5 } })));
}

// ─── Harrow ──────────────────────────────────────────────────────────────────────────

export const HARROW         = '/Lotus/Powersuits/Priest/Priest';
export const HARROW_PENANCE = '/Lotus/Powersuits/PowersuitAbilities/PriestPenanceAbility';

/** Harrow limpio + Tiberon Prime sin mods. Baseline para aislar el aporte de Penance. */
export function harrow(): Scene {
  return onfoot({
    warframe: { uniqueName: HARROW, rank: 30, mods: modSlots({}) },
    primary: { uniqueName: TIBERON_PRIME, rank: 30, activeProfile: 'base' },
  }, NO_HOSTILE);;
}

/**
 * Harrow + Penance activa. Cuarta habilidad por hidratación real, y la que **estrena
 * `WEAPON_ADD_FIRE_RATE`**: el nodo existía materializado y ninguna habilidad lo había ejercido
 * — sólo mods. El reload (+70%) reusa el mismo nodo que Volt Speed, así que la build también
 * contrasta dos fuentes distintas cayendo en el mismo bucket.
 *
 * Los dos buffs van a la MISMA entidad (el arma), a diferencia de Warcry —que reparte entre
 * warframe y melee— y de Speed, que reparte entre tres.
 *
 * ⚠️ Lo que la fuente NO da: la wiki atribuye a Penance un tercer buff de **melee attack speed**
 * y consigna su valor como `??%` en los cuatro rangos; la descripción oficial de la habilidad no
 * lo menciona y la UI del juego tampoco lo publica. Sin número no hay qué anotar
 * (`references/wiki/warframes/harrow/penance.md`).
 *
 * El resto de Penance —costo del shield entero, curación inicial, life steal en Affinity Range,
 * duración derivada del shield drenado— no tiene nodo: son efectos de sustain y de duración, que
 * C1 no computa.
 *
 * @param strength si se pasa, agrega Blind Rage (+99% str) para ejercer el escalado.
 */
export function harrowPenance(opts: { strength?: boolean } = {}): Scene {
  let p = withAbilities(player(harrow()), [{ uniqueName: HARROW_PENANCE }]);
  if (opts.strength) p = withMods(p, 'warframe', modSlots({ 0: { itemId: RHINO_MOD.BLIND_RAGE, level: 10 } }));
  return scene(p);
}

export const BUILDS: Record<string, () => Scene> = {
  volt_channel_arcanes: () => voltChannelArcanes(),
  harrow:             () => harrow(),
  harrow_penance:     () => harrowPenance(),
  harrow_penance_str: () => harrowPenance({ strength: true }),
  valkyr:            () => valkyr(),
  valkyr_warcry:     () => valkyrWarcry(),
  valkyr_warcry_str: () => valkyrWarcry({ strength: true }),
  valkyr_warcry_pet:  () => valkyrWarcryCompanion(),
  valkyr_warcry_tgt:  () => valkyrWarcryTarget(),
  corrosive_projection_tgt: () => corrosiveProjectionTarget(),
  rhino_roar_tgt: () => rhinoRoarTarget(),
  nikana:      () => nikana(false),
  nikana_fury: () => nikana(false, 'base', false, false, true),
  volt:       () => volt(),
  volt_speed: () => voltSpeed(),
  volt_speed_str: () => voltSpeed({ strength: true }),
  volt_speed_melee: () => voltSpeed({ melee: true }),
  volt_parkour:     () => voltParkour(),
  volt_parkour_tau: () => voltParkour({ tau: true }),
  volt_mobilize:    () => voltMobilize(),
  tiberon:      () => tiberon(false),
  tiberon_heat: () => tiberon(true),
  lanka:  () => lanka('charged_shot'),
  cedo:   () => cedo(true),
  laetum: () => laetum(),
  felarx: () => felarx(),
  boltor: () => boltor({ perks: { 2: 'hunters_mantra', 4: 'commodores_fortune' }, mods: { 0: SERRATION } }),
  lanka_arcane: () => lankaArcane(),
  rhino:  () => rhino(),
  rhino_roar: () => rhinoRoar(),
  sicarus: () => sicarus({ perks: { 2: 'feigned_retreat' } }),
};
