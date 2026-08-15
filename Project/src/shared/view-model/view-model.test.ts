/**
 * project() — fidelidad del ViewModelContract contra un snapshot REAL de C.
 *
 * No re-verifica los números del motor (eso lo hace laetum.test). Verifica la
 * PROYECCIÓN: que el cut C→D es fiel a `snapshot()` — value = node.final, unit y
 * category se adjuntan por lookup en el borde ([D-7 Fase 4] ya NO viajan en el nodo),
 * NO se filtra ningún bucket interno, y las entidades quedan ubicables por channel
 * (la clave de lookup de la UI). Anclado a Laetum porque ya es build verificada
 * (pistola single + radial).
 */
import { describe, it, expect } from 'vitest';
import { loadEngineData } from '@core/engine/bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { consume } from '@core/engine/output/consume';
import { laetum, LAETUM } from '@core/engine/fixtures/builds';
import { getPresentationMeta } from '@lib/format/stat-presentation';
import { project } from './index';

await loadEngineData(new NodeAdapter());

const BUCKET_KEYS = [
  'base', 'base_flat', 'mods_add_pct',
  'total_flat', 'multiplicative', 'final',
];

describe('project() — ViewModelContract fiel al snapshot (display-only / C1)', () => {
  const snapshot = consume(laetum('base'), { flags: {} }).snapshot();
  const vm = project(snapshot);

  it('proyecta exactamente las entidades del snapshot', () => {
    expect(snapshot.length).toBeGreaterThan(0);
    expect(vm.entities.length).toBe(snapshot.length);
  });

  it('cada stat es fiel al AttributeNode y NO filtra los 4 buckets internos', () => {
    for (const entity of snapshot) {
      const vmEntity = vm.entities.find((e) => e.id === entity.id);
      expect(vmEntity).toBeTruthy();

      for (const [attrId, node] of Object.entries(entity.attributes)) {
        const stat = vmEntity!.stats.find((s) => s.id === attrId);
        expect(stat, `stat ausente: ${attrId}`).toBeTruthy();
        const meta = getPresentationMeta(attrId);
        expect(stat!.value).toBe(node.final);
        expect(stat!.unit).toBe(meta.unit);
        expect(stat!.category).toBe(meta.category);
        for (const key of Object.keys(stat!)) {
          expect(BUCKET_KEYS, `bucket filtrado: ${key}`).not.toContain(key);
        }
      }
    }
  });

  it('la entidad del arma es ubicable por channel (clave de la UI)', () => {
    const weapon = vm.entities.find((e) => e.unique_name === LAETUM);
    expect(weapon).toBeTruthy();
    expect(weapon!.channel).toBeTruthy();
    expect(vm.entities.find((e) => e.channel === weapon!.channel)).toBe(weapon);
  });

  it('preserva la identidad (domain/kind/family) sin tocarla', () => {
    for (const entity of snapshot) {
      const vmEntity = vm.entities.find((e) => e.id === entity.id)!;
      expect(vmEntity.domain).toBe(entity.domain);
      expect(vmEntity.kind).toBe(entity.kind);
      expect(vmEntity.family).toBe(entity.family);
    }
  });
});
