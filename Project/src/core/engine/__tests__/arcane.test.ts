/**
 * Arcanos v0 — primer consumidor del flujo A→B→C de arcanos (slot dedicado → ArcaneRepository → engine).
 *
 * Caso: Primary Merciless sobre Lanka. Un solo arcano ejercita las tres invariantes del v0:
 *   1. parte siempre-activa (`+30% Reload Speed`, sin condition, token mapeado) → fluye a su nodo;
 *   2. parte `On Kill +5% Damage` (base_value:null + upgrade_type:null) → OMITIDA (stacking, OQ-DATA-4);
 *   3. rank fuera de rango (5 sobre serie de 1 valor) → clampado, no explota (los arcanos no son todos 0-5).
 *
 * Naturaleza distinta a los mods: el arcano resuelve a Modifier directo, SIN pasar por DamageCombiner
 * (su daño no se combina con el del arma). Ver ArcaneRepository / StaticHydrator.
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { lankaArcane, LANKA } from '../fixtures/builds';

await loadEngineData(new NodeAdapter());

const w = () => consume(lankaArcane(), { flags: {} }).weapon(LANKA);

describe('Arcano v0 — Primary Merciless sobre Lanka (flujo A→B→C)', () => {
  it('siempre-activo: +30% Reload Speed fluye → nodo reload base 100 + 30 = 130', () => {
    const rl = w().node('WEAPON_ADD_RELOAD_SPEED');
    expect(rl.base).toBe(100);                  // base del nodo (getDNA)
    expect(rl.mods_add_pct).toBeCloseTo(30, 0); // el arcano inyectó el modifier (ADD)
    expect(rl.final).toBeCloseTo(130, 0);       // 100 × 1.30
  });

  it('clamp de rank: rank 5 sobre serie [30] (length 1) → idx 0, valor 30 (no explota)', () => {
    // Prueba que el rank de la intención se acota a la longitud real de base_value.
    // Si no se clampara, base_value[5] sería undefined → NaN/crash.
    expect(w().node('WEAPON_ADD_RELOAD_SPEED').mods_add_pct).toBeCloseTo(30, 0);
  });

  it('guarda de null: la parte On Kill (base_value:null, upgrade_type:null) se omite → daño intacto', () => {
    // El arcano NO inyecta ningún modifier de daño: Electricity base de Lanka queda en 525 (charged).
    expect(w().node('WEAPON_ADD_ELECTRICITY_DAMAGE').final).toBeCloseTo(525, 0);
  });
});

// ─── Borde — lo que el arcano NO modela en v0 (it.todo) ───────────────────────────

describe('Arcano v0 — borde (preguntas abiertas)', () => {
  it.todo('stacking on_kill: +5%/stack, cap 12×, 4s — requiere contexto de stack-count [OQ-DATA-4 / D-20]');
  it.todo('weapon-type gate: Merciless es Primary-only; v0 no valida compatibilidad de slot [OQ-DATA-5]');
  // Servido: el ruteo por canal existe y está cubierto en `channel-routing.test.ts` (Arcane Rage
  // directo + Arcane Blade Charger cruzado). Lo que sigue abierto de este borde es el `{cuándo}`
  // (proc/duration), no el `{cuál}`.
  it.todo('uptime de arcano condicional: proc% + duration — hoy C1 lo proyecta al 100% [arch §15]');
});
