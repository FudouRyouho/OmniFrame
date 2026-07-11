/**
 * Slash → Bleed — caso mínimo aislado (altitud 2: instancia sintética → valor del tick).
 * MODELADO hoy (Slice 2, PROTOTIPO): el VALOR de un tick, parte no-faction, no-timeline.
 * `tick = 0.35 × modded_base × (1 + status_damage)`, tipo True. Ver status-effects.md §Bleed.
 *
 * Consumidor = instancia sintética (`makeIsolatedInstance`-style), no un arma hidratada: aísla la
 * variable bajo test (el tick), sin acoplar a la hidratación. Es el laboratorio del §14.
 */
import { describe, it, expect } from 'vitest';
import { tickFromInstance, type IsolatedInstanceSpec } from './harness';

describe('Slash/Bleed — valor del tick (MODELADO, prototipo)', () => {
  it('tick = 0.35 × modded_base (instancia de 1000 → 350)', () => {
    const inst: IsolatedInstanceSpec = { moddedBase: 1000 };
    expect(tickFromInstance('slash', inst)).toBeCloseTo(350, 5);
  });

  it('EXCEPCIÓN: los mods de Slash% NO amplifican el bleed', () => {
    const plain: IsolatedInstanceSpec = { moddedBase: 1000 };
    const withSlashMods: IsolatedInstanceSpec = { moddedBase: 1000, ownElementBonusPct: 120 };
    expect(tickFromInstance('slash', withSlashMods)).toBeCloseTo(tickFromInstance('slash', plain), 5);
  });

  it('status damage SÍ amplifica: +100% → tick ×2 (700)', () => {
    const inst: IsolatedInstanceSpec = { moddedBase: 1000, statusDamageBonusPct: 100 };
    expect(tickFromInstance('slash', inst)).toBeCloseTo(700, 5);
  });

  // Lo que NO tenemos hoy (frontera del prototipo — no assertar contra maquinaria ausente):
  it.todo('aplicación: el tick es True → bypassa armor (resolución vs target, no el valor) — Slice 3');
  it.todo('double-dip de faction: × (1 + faction)² — eje faction diferido');
  it.todo('timeline: 6 ticks en 6s (delay 1s), timer independiente por stack, sin cap — C2 (Slice 3)');
});
