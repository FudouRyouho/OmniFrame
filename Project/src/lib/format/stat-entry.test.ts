/**
 * toStatEntries() — proyector único StatViewModel[] → StatEntry[].
 *
 * Dos frentes: (1) la tabla de formato `unit→regla` (función pura, locale-free) y
 * (2) la proyección contra un snapshot REAL de C (Laetum). No re-verifica números del
 * motor — verifica que las filas salen con label resuelta + valor formateado, y que
 * el bug histórico (crit/status sin `%`) no vuelve. Los tokens de daño derivan su label
 * de DAMAGE_TYPE_DEFINITIONS (su SSoT), no del dict de presentación.
 */
import { describe, it, expect } from 'vitest';
import { loadEngineData } from '@core/engine/fixtures/engine-data';
import { consume } from '@core/engine/output/consume';
import { laetum, LAETUM } from '@core/engine/fixtures/builds';
import { project } from '@shared/view-model';
import { toStatEntries, formatStatValue } from './stat-entry';

loadEngineData();

describe('formatStatValue — tabla unit→regla (locale-free)', () => {
  it('% → 1 decimal + %', () => {
    expect(formatStatValue(72, '%')).toBe('72.0%');
    expect(formatStatValue(18.5, '%')).toBe('18.5%');
  });
  it('x → 2 decimales + x', () => {
    expect(formatStatValue(2.4, 'x')).toBe('2.40x');
  });
  it('s → 1 decimal + s', () => {
    expect(formatStatValue(0.6, 's')).toBe('0.6s');
  });
  it('sin unidad → entero si es entero, si no 1 decimal', () => {
    expect(formatStatValue(120, '')).toBe('120');
    expect(formatStatValue(1.5, '')).toBe('1.5');
  });
  it('usa punto decimal (sin locale)', () => {
    expect(formatStatValue(1234.5, '%')).toBe('1234.5%');
  });
});

describe('toStatEntries — proyección contra snapshot real (Laetum)', () => {
  const snapshot = consume(laetum('base'), { flags: {} }).snapshot();
  const vm = project(snapshot);
  const weapon = vm.entities.find((e) => e.unique_name === LAETUM)!;
  const entries = toStatEntries(weapon.stats);

  it('una fila por stat, key = id del token', () => {
    expect(entries.length).toBe(weapon.stats.length);
    for (const [i, s] of weapon.stats.entries()) {
      expect(entries[i].key).toBe(s.id);
    }
  });

  it('toda fila tiene label no vacía', () => {
    for (const e of entries) {
      expect(e.label.length, `label vacía: ${e.key}`).toBeGreaterThan(0);
    }
  });

  it('crit chance renderiza con % (el bug histórico no vuelve)', () => {
    const crit = entries.find((e) => e.key === 'WEAPON_ADD_CRIT_CHANCE');
    if (crit) {
      expect(crit.label).toBe('CRIT CHANCE');
      expect(String(crit.value).endsWith('%')).toBe(true);
    }
  });

  it('los tokens de daño derivan label del SSoT (no el token humanizado)', () => {
    const dmg = entries.filter((e) => /^WEAPON_ADD_(.+)_DAMAGE$/.test(e.key));
    expect(dmg.length).toBeGreaterThan(0);
    for (const e of dmg) {
      // 'HEAT', 'VOID', 'TRUE DAMAGE'… — nunca el token crudo humanizado ('WEAPON ADD …').
      expect(e.label.startsWith('WEAPON'), `label sin derivar: ${e.key}`).toBe(false);
      expect(e.label).toBe(e.label.toUpperCase());
    }
  });
});
