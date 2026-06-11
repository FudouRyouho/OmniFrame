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
import type { EnsembleIntention } from '@providers/Ensemble/ensemble.types';

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

/** Cedo Prime (Normal Attack). `withGH` añade Galvanized Hell (on_kill multishot). */
export function cedo(withGH = false): EnsembleIntention {
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
      primary:          { itemId: CEDO_PRIME, rank: 30, active_profile: 'base' },
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

// ─── Registro de builds para el oráculo (`npm run oracle -- <name>` | `all`) ───────

/** Invocación representativa de cada build. El oráculo lo recorre por nombre. */
export const BUILDS: Record<string, () => EnsembleIntention> = {
  lanka:  () => lanka('charged_shot'),
  cedo:   () => cedo(true),
  laetum: () => laetum(),
  felarx: () => felarx(),
  boltor: () => boltor({ perks: { 2: 'hunters_mantra', 4: 'commodores_fortune' }, mods: { 0: SERRATION } }),
};
