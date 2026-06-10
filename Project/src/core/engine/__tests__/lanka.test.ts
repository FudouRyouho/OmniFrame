/**
 * Lanka (sniper de carga, proyectil) — consumidor del clic (helpers/consume).
 *
 * Modelo del que es consumidor: nodo Capa 4 (`WEAPON_FLAT_PUNCH_THROUGH`) — primer stat
 * materializado fuera de los ~8 originales (OQ-ENGINE-7, ejes a+b):
 *   - innato per-ataque vía weapon-stats.override.json (el raw expone punch_through pero
 *     vale 0 en todo el dataset; Lanka trae 5.0m SOLO en Charged Shot — el per-ataque
 *     captura el matiz "punch nato solo a carga completa" sin lógica extra),
 *   - mod ADD_FLAT post-escala (Shred +1.2m → bucket total_flat, no amplificado por %),
 *   - dual-stat: el mismo Shred aporta +30% fire rate a OTRO nodo (mods_add_pct).
 *
 * Build mínima: solo Shred (r6 max, level 5). Derivación:
 *   charged:   final = (5.0 + 1.2) × 1 = 6.2   (base innato + total_flat)
 *   partially: final = (0   + 1.2) × 1 = 1.2   (sin innato, solo el mod)
 *
 * Matiz del dato: el raw de Lanka trae `speed: null` / `fire_rate: 0` (arma de carga) →
 * el fire rate base del nodo es 0 y el final queda 0 aunque el bucket reciba +30.
 * Por eso el dual-stat se aserta por bucket (lógica), no por final.
 * Ref: references/wiki/mechanics/punch-through.md
 */
import './helpers/engine-data-setup';
import { describe, it, expect } from 'vitest';
import { consume } from './helpers/consume';
import type { EnsembleIntention } from '@providers/Ensemble/ensemble.types';

const LANKA = '/Lotus/Weapons/ClanTech/Energy/Railgun';

const MOD = {
  SHRED:             '/Lotus/Upgrades/Mods/Rifle/DualStat/ShredMod',
  TERMINAL_VELOCITY: '/Lotus/Upgrades/Mods/Rifle/WeaponProjectileSpeedMod',          // +60% projectile speed (level 3)
  VILE_PRECISION:    '/Lotus/Upgrades/Mods/Rifle/DualStat/CorruptedRecoilFireRateRifle', // −90% recoil / −36% fire rate (level 5)
};

function lanka(profile: string): EnsembleIntention {
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
      0: { itemId: MOD.SHRED,             rank: 30, level: 5 },
      1: { itemId: MOD.TERMINAL_VELOCITY, rank: 30, level: 3 },
      2: { itemId: MOD.VILE_PRECISION,    rank: 30, level: 5 },
    } },
    environment: { targetLevel: 1, targetFaction: null, isSteelPath: false },
  };
}

const charged   = () => consume(lanka('charged_shot'), { flags: {} }).weapon(LANKA);
const partially = () => consume(lanka('partially_charged_shot'), { flags: {} }).weapon(LANKA);

// ─── Lógica: el nodo Capa 4 por buckets (innato per-ataque + ADD_FLAT) ────────────

describe('Lanka — punch through por buckets (nodo Capa 4)', () => {
  it('charged: base 5.0 (innato vía override) + Shred 1.2 en total_flat → 6.2', () => {
    const pt = charged().node('WEAPON_FLAT_PUNCH_THROUGH');
    expect(pt.base).toBeCloseTo(5.0, 1);        // innato per-ataque (override, no raw)
    expect(pt.total_flat).toBeCloseTo(1.2, 1);  // ADD_FLAT: post-escala, no amplificado
    expect(pt.mods_add_pct).toBe(0);            // no existen mods % de punch through
    expect(pt.final).toBeCloseTo(6.2, 1);
  });
  it('partially charged: base 0 (punch nato solo a carga completa) → solo el mod, 1.2', () => {
    const pt = partially().node('WEAPON_FLAT_PUNCH_THROUGH');
    expect(pt.base).toBe(0);
    expect(pt.total_flat).toBeCloseTo(1.2, 1);
    expect(pt.final).toBeCloseTo(1.2, 1);
  });
});

// ─── Lógica: projectile speed — nodo Capa 4 con base m/s del raw + mod % ──────────
//
// Segundo nodo Capa 4. A diferencia de punch through, la base sale directa del raw (`flight`,
// m/s) sin override, y la op es ADD (% aditivo, no flat). Lanka tiene flight distinto por perfil.
// Terminal Velocity +60% (level 3) → mods_add_pct = 60.

describe('Lanka — projectile speed por buckets (nodo Capa 4, base del raw)', () => {
  it('charged: base 250 m/s (flight) + Terminal Velocity +60% → 400', () => {
    const ps = charged().node('WEAPON_ADD_PROJECTILE_SPEED');
    expect(ps.base).toBeCloseTo(250, 0);        // flight del raw, sin override
    expect(ps.mods_add_pct).toBeCloseTo(60, 0); // ADD (%), no ADD_FLAT
    expect(ps.total_flat).toBe(0);
    expect(ps.final).toBeCloseTo(400, 0);       // 250 × 1.60
  });
  it('partially charged: base 200 m/s (flight distinto por perfil) + 60% → 320', () => {
    const ps = partially().node('WEAPON_ADD_PROJECTILE_SPEED');
    expect(ps.base).toBeCloseTo(200, 0);
    expect(ps.final).toBeCloseTo(320, 0);       // 200 × 1.60
  });
});

// ─── Lógica: recoil — nodo Capa 4 con base sintética (% sobre el nato) ────────────
//
// Tercer nodo Capa 4, tercer molde de base: ni override (punch) ni raw (projectile) sino
// base SINTÉTICA 100 — no hay dato absoluto público de recoil (interno de DE). El final es el
// recoil relativo: Vile Precision −90% → 100 × 0.10 = 10. Nodo inerte (camera feel, no input de
// daño) hasta definir modelado/UI — OQ-ENGINE-7. Ref: references/wiki/mechanics/recoil.md.

describe('Lanka — recoil por buckets (nodo Capa 4, base sintética 100)', () => {
  it('base 100 (sintética) + Vile Precision −90% → final 10 (recoil relativo)', () => {
    const rc = charged().node('WEAPON_ADD_RECOIL');
    expect(rc.base).toBe(100);                   // sintética, incondicional (sin gate)
    expect(rc.mods_add_pct).toBeCloseTo(-90, 0); // ADD, valor negativo = reducción
    expect(rc.final).toBeCloseTo(10, 0);         // 100 × (1 − 0.90)
  });
});

// ─── Lógica: dual-stat apilado — dos mods alimentan fire rate con otra op ─────────
//
// Shred (+30) y Vile Precision (−36) son ambos dual-stat con un componente de fire rate.
// El bucket mods_add_pct los suma: 30 − 36 = −6. Demuestra stacking aditivo cross-mod.

describe('Lanka — fire rate: dos dual-stats apilados (por bucket)', () => {
  it('Shred +30 − Vile Precision 36 = −6 en mods_add_pct (base 0 → final 0, ver JSDoc)', () => {
    const fr = charged().node('WEAPON_ADD_FIRE_RATE');
    expect(fr.mods_add_pct).toBeCloseTo(-6, 0);
    expect(fr.base).toBe(0);  // matiz del dato: speed null / fire_rate 0 (arma de carga)
  });
});

// ─── Estabilidad: el resto del arma no se ve afectado (.final) ────────────────────

describe('Lanka — estabilidad (stats no tocados por la build)', () => {
  it('daño 525 Electricity (charged), crit 25%, sin mods que los toquen', () => {
    const w = charged();
    expect(w.node('WEAPON_ADD_ELECTRICITY_DAMAGE').final).toBeCloseTo(525, 0);
    expect(w.node('WEAPON_ADD_CRIT_CHANCE').final).toBeCloseTo(25, 0);
  });
  it('partially charged: daño 200 Electricity, crit 20% (perfil distinto, mismo arma)', () => {
    const w = partially();
    expect(w.node('WEAPON_ADD_ELECTRICITY_DAMAGE').final).toBeCloseTo(200, 0);
    expect(w.node('WEAPON_ADD_CRIT_CHANCE').final).toBeCloseTo(20, 0);
  });
});

// ─── Borde de C1 — preguntas abiertas (it.todo) ──────────────────────────────────
//
// El nodo computa el VALOR (metros) — eso es C1 y está cubierto arriba. Lo que el valor
// HACE (geometría de penetración) no es C1. No se fabrica respuesta: el todo acuña la pregunta.

describe('Lanka — borde de C1 (preguntas abiertas)', () => {
  it.todo('C2: resolución de penetración — cuántos blancos atraviesa, restando "grosor" por blanco [OQ-ENGINE-7 eje c; punch-through.md]');
  it.todo('C2: barreras impenetrables (Nullifier, Arctic Eximus) ignoran el valor — requiere modelo de target [punch-through.md]');
  it.todo('C2: projectile speed alimenta leading/falloff-range/multishot off-center — geometría balística [projectile-speed.md §Interacciones]');
  it.todo('recoil: ¿clamp de sobre-reducción? −90 + (otro −X) podría dar final < 0; el juego clampea a 0. ¿ley de C1 o presentación de D? [recoil.md; OQ-ENGINE-7]');
  it.todo('C1-gap: fire rate de armas de carga — raw trae speed:null/fire_rate:0; ¿el juego deriva 1/charge_time? [dato, no engine]');
});
