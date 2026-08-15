/**
 * Test de la resolución de `co_behavior` (familia Condition Overload / GunCO).
 *
 * Regla (references/wiki/mechanics/condition-overload.md + contracts.ts CoBehavior):
 *   1. Override explícito en weapon-stats.override.json (campo co_behavior) → TERMINAL
 *      (cualquier valor, incluido 'none', gana y no cae a la heurística).
 *   2. Ausente → default por shot_type: Hit-Scan→adding, Projectile→multiplying, AoE→none.
 *   3. Ausente + shot_type no reconocido → gap: la clave NO se puebla (no se asume 'adding').
 *
 * `co_behavior` es metadata cualitativa POR PERFIL, agnóstica al modo estático/dinámico:
 * clasifica a qué bucket compone el bonus CO, no cuánto vale. Reemplaza el muerto
 * `behaviors: string[]` (engine v1, purgado 2026-07-03).
 *
 * Cedo es el caso ideal: sus tres ataques cubren los tres shot_type en un solo arma
 * (Normal Attack=Hit-Scan, Alt-Fire Glaive=Projectile, Glaive Radial Attack=AoE),
 * así que estresa las tres ramas del default de una.
 *
 * Caveat (§8 — techo asumido, no verificado): el default por shot_type es la mejor
 * apuesta hasta verificar en partida. Cedo Normal Attack → adding es heurística, no
 * dato confirmado; si la verificación lo desmiente, se agrega override (no se toca esto).
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { ItemRepository } from '../resolve/hydration/ItemRepository';

await loadEngineData(new NodeAdapter());

const IDS = {
  CEDO_PRIME: '/Lotus/Weapons/Tenno/LongGuns/PrimeCedo/PrimeCedoWeapon',
  CEDO:       '/Lotus/Weapons/Tenno/LongGuns/TnAlchemistShotgun/TnAlchemistShotgun',
};

// ─── Default por shot_type: las tres ramas en un solo arma ───────────────────

describe('co_behavior — default por shot_type (Cedo Prime, las 3 ramas)', () => {
  it('Normal Attack (Hit-Scan) → adding', () => {
    const dna = ItemRepository.getDNA(IDS.CEDO_PRIME);
    expect(dna?.co_behavior?.['normal_attack']).toBe('adding');
  });

  it('Alt-Fire Glaive (Projectile) → multiplying', () => {
    const dna = ItemRepository.getDNA(IDS.CEDO_PRIME);
    expect(dna?.co_behavior?.['alt-fire_glaive']).toBe('multiplying');
  });

  it('Glaive Radial Attack (AoE) → none', () => {
    const dna = ItemRepository.getDNA(IDS.CEDO_PRIME);
    expect(dna?.co_behavior?.['glaive_radial_attack']).toBe('none');
  });

  it('Cedo (no-prime) resuelve idéntico — la clasificación es del ataque, no de la variante', () => {
    const dna = ItemRepository.getDNA(IDS.CEDO);
    expect(dna?.co_behavior?.['normal_attack']).toBe('adding');
    expect(dna?.co_behavior?.['alt-fire_glaive']).toBe('multiplying');
    expect(dna?.co_behavior?.['glaive_radial_attack']).toBe('none');
  });
});
