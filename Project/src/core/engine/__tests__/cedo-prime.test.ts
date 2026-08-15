/**
 * Cedo Prime (Normal Attack) — migrado al "clic" (output/consume; build en fixtures/builds).
 *
 * Modelo del que es consumidor: escopeta multi-pellet + flag `on_kill`.
 * El eje distintivo se ve por bucket: el multishot pasa de 14.7 (base) a 23.1 (estático)
 * porque el bonus on_kill de Galvanized Hell entra en `mods_add_pct` solo con el flag activo.
 *
 * Build verificada en partida (2026-05-27):
 *   Toxic Barrage (r3), Shotgun Barrage (r5), Critical Deceleration (r5),
 *   Primed Chilling Grasp (r10), Primed Point Blank (r10), Galvanized Savvy (r10),
 *   Galvanized Hell (r10), Primed Ravage (r10).
 *
 * ─── Estado real del engine (verificado 2026-06-09 vía clic) ──────────────────────
 * | Stat              | Juego  | Engine | Nota                                          |
 * |---|---|---|---|
 * | Puncture          | 84.8   | 84.8   | WEAPON_ADD_DAMAGE (PPB)                        |
 * | Viral             | 190.8  | 190.8  | ✅ combine Cold+Toxin YA funciona              |
 * | Crit Chance       | 72%    | 72%    | Critical Decel +200%                          |
 * | Crit Mult         | 5.04x  | 5.04x  | Primed Ravage +110%                           |
 * | Status/proj       | 4.8%   | 4.8%   | GS base +80% + Toxic Barrage +60%             |
 * | Fire Rate         | 7.65   | 7.65   | Shotgun Barrage +90%, Crit Decel −20%         |
 * | Multishot (base)  | —      | 14.7   | GH +110% (on_kill inactivo)                   |
 * | Multishot (estát) | —      | 23.1   | GH +110% + on_kill +120%                      |
 *
 * Deuda viva: Galvanized Savvy stat 1 (`WEAPON_DAMAGE_IF_VICTIM_PROC_ACTIVE`, on_kill)
 * sin mapear (pendiente D-6) → el status NO sube en modo estático. Ver el test de status.
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { cedo, CEDO_PRIME, GALVANIZED_HELL, galvanizedStacksVar } from '../fixtures/builds';

await loadEngineData(new NodeAdapter());

const GH_STACKS = galvanizedStacksVar(GALVANIZED_HELL);

/** Modo base: flags vacías, ninguna condición activa. */
const base = (withGH = false) => consume(cedo(withGH), { flags: {} }).weapon(CEDO_PRIME);
/**
 * Modo estático/techo: flags derivadas del equipamiento. `on_kill` de Galvanized Hell ya NO es un
 * gate booleano (familia STACK_DECAY_BUFF, 2026-07-10) — los stacks son C1-declarados, mismo
 * escalón que `activeStacks` de CO (que tampoco se auto-asume en techo: default 1, no max). Acá
 * se declara el cap (4) explícito para reproducir el escenario "techo" honestamente, no implícito.
 */
const stat = (withGH = false) =>
  consume(cedo(withGH), withGH ? { variables: { [GH_STACKS]: 4 } } : undefined).weapon(CEDO_PRIME);

// ─── Estabilidad: stats no condicionales (.final) ────────────────────────────────

describe('Cedo — modo base (estabilidad: .final)', () => {
  it('daño global 84.8 — PPB +165%', () => {
    expect(base().node('WEAPON_ADD_DAMAGE').final).toBeCloseTo(84.8, 1);
  });
  it('Puncture 84.8 — físico × mult global', () => {
    expect(base().node('WEAPON_ADD_PUNCTURE_DAMAGE').final).toBeCloseTo(84.8, 1);
  });
  it('status 4.8% — GS base +80% + Toxic Barrage +60%', () => {
    expect(base().node('WEAPON_ADD_STATUS_CHANCE').final).toBeCloseTo(4.8, 1);
  });
  it('crit 72% — Critical Decel +200%', () => {
    expect(base().node('WEAPON_ADD_CRIT_CHANCE').final).toBeCloseTo(72, 0);
  });
  it('crit mult 5.04x — Primed Ravage +110%', () => {
    expect(base().node('WEAPON_ADD_CRIT_MULT').final).toBeCloseTo(5.04, 1);
  });
  it('fire rate 7.65 — Shotgun Barrage +90%, Crit Decel −20% (dual-stat)', () => {
    expect(base().node('WEAPON_ADD_FIRE_RATE').final).toBeCloseTo(7.65, 2);
  });
  it('multishot 7 sin Galvanized Hell (base del arma)', () => {
    expect(base(false).node('WEAPON_ADD_MULTISHOT').final).toBeCloseTo(7, 1);
  });
});

// ─── Lógica: el flag on_kill en el bucket del multishot ──────────────────────────
//
// Eje distintivo de Cedo. Galvanized Hell aporta dos partes:
//   stat 0: +110%, condition null → siempre en mods_add_pct.
//   stat 1: +120%, condition on_kill → entra a mods_add_pct SOLO en modo estático.
// El bucket lo muestra: 110 (base) vs 230 (estático), sobre el mismo base=7.

describe('Cedo — multishot por buckets: el flag on_kill (lógica)', () => {
  it('modo base — solo GH stat 0: mods_add_pct = 110 → 7×2.10 = 14.7', () => {
    const ms = base(true).node('WEAPON_ADD_MULTISHOT');
    expect(ms.base).toBeCloseTo(7, 0);
    expect(ms.mods_add_pct).toBeCloseTo(110, 0);   // on_kill inactivo
    expect(ms.final).toBeCloseTo(14.7, 1);
  });
  it('modo estático — GH stat 0 + on_kill: mods_add_pct = 230 → 7×3.30 = 23.1', () => {
    const ms = stat(true).node('WEAPON_ADD_MULTISHOT');
    expect(ms.base).toBeCloseTo(7, 0);
    expect(ms.mods_add_pct).toBeCloseTo(230, 0);   // +120 del on_kill ya presente
    expect(ms.final).toBeCloseTo(23.1, 1);
  });
});

// ─── Estabilidad: modo estático, lo no-condicional no cambia ─────────────────────

describe('Cedo — modo estático (estabilidad)', () => {
  it('crit, crit mult y fire rate no cambian (no son condicionales)', () => {
    const w = stat();
    expect(w.node('WEAPON_ADD_CRIT_CHANCE').final).toBeCloseTo(72, 0);
    expect(w.node('WEAPON_ADD_CRIT_MULT').final).toBeCloseTo(5.04, 1);
    expect(w.node('WEAPON_ADD_FIRE_RATE').final).toBeCloseTo(7.65, 2);
  });
  it('status sigue 4.8% — DEUDA: GS on_kill (WEAPON_DAMAGE_IF_VICTIM_PROC_ACTIVE) sin mapear', () => {
    // El bonus on_kill de Galvanized Savvy no está mapeado → el status no sube con el flag.
    expect(stat().node('WEAPON_ADD_STATUS_CHANCE').final).toBeCloseTo(4.8, 1);
  });
});

// ─── Gate hitscan: el nodo projectile speed está AUSENTE (ausencia ≠ 0) ───────────
//
// Cedo Normal Attack es Hit-Scan (flight=null en el raw) → el nodo WEAPON_ADD_PROJECTILE_SPEED
// NO se materializa. Esta aserción negativa blinda el gate del ItemRepository: un disparo
// instantáneo no tiene velocidad, y un base 0 + mod % daría una velocidad espuria.
// Ref: references/wiki/mechanics/projectile-speed.md §Gate hitscan.

describe('Cedo — gate hitscan: projectile speed ausente', () => {
  it('el nodo WEAPON_ADD_PROJECTILE_SPEED NO existe en una hitscan', () => {
    expect(() => base().node('WEAPON_ADD_PROJECTILE_SPEED')).toThrow(/ausente/);
  });
});

// ─── Combine elemental: Viral ya funciona ────────────────────────────────────────

describe('Cedo — Viral combine (funciona)', () => {
  it('Viral 190.8 — Cold (Primed Chilling) + Toxin (Toxic Barrage) combinan × PPB', () => {
    // (32×0.6 + 32×1.65) × 2.65 = 190.8. El nodo existe y computa (antes era deuda).
    expect(stat().node('WEAPON_ADD_VIRAL_DAMAGE').final).toBeCloseTo(190.8, 1);
  });
});

// ─── Borde de C1 — preguntas abiertas (it.todo) ──────────────────────────────────
//
// Cedo es la shotgun pura (proyectil multi-pellet, no-incarnon): el baseline correcto.
// C1 cubre los STATS (arriba: daño, crit chance, status per-pellet, multishot, fire rate).
// Lo que sigue NO es C1 — vive en C2 (combat) o es un gap de mapeo. No se fabrica respuesta:
// el todo acuña la pregunta. Ref: references/wiki/mechanics/hit-mechanic.md §Relevancia para el engine.

describe('Cedo — borde de C1 (preguntas abiertas)', () => {
  it.todo('C2: daño dividido por pellet (total/multishot) — CombatSimulator [hit-mechanic.md:57]');
  it.todo('C2: distribución de crit tier por pellet — AtomicSimulator.calculateCritDistribution [hit-mechanic.md:110]');
  it.todo('C2: procs/disparo = multishot × status_per_pellet — StatusEngine (parcial) [status-chance-mechanics.md:27]');
  // RESUELTO 2026-07-03: GS on_kill (damage per status type) mapeado a WEAPON_ADD_DAMAGE_PER_STATUS_TYPE
  // (CONTEXT_SCALE) + ruteo por co_behavior. Modo estático/techo cubierto en cedo-co-static.test.ts.
  // Modo dinámico (uptime real) diferido a C2. D-17 resuelto para shotgun.
  it.todo('C2: damage falloff — daño(distancia) lineal entre start 26/end 52, reduction 0.9667; projectile-speed escala start/end (gate hitscan: el % no tiene nodo dónde aterrizar) [damage-falloff.md]');
});
