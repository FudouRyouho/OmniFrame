/**
 * Oráculo del engine — cáscara CLI (PASO 2 de la secuencia del oráculo).
 *
 * Primer cliente real, no-UI, consumiendo el motor por su puerto `consume()` (salida de C).
 * Adaptador NO-reactivo (lee la salida resuelta de C y la serializa a stdout) — hermano del
 * futuro adaptador reactivo (UI). Ver `docs/domains/engine/design/arch-decisions.md` §5-7.
 *
 * Comparte con los tests el harness de entrada (`@core/engine/fixtures`): el bootstrap de data
 * (`loadEngineData`) y las intenciones-fixture (`builds` / `BUILDS`). El test le adosa
 * expectativas y aserta; el oráculo INSPECCIONA. Mismo input, distinto acto.
 *
 * Dos actos de D2:
 *   - CRUDO (default): `npm run oracle -- <build>` | `all`. Snapshot crudo (nodos + 6 buckets),
 *     material de debug del motor (PASO 3).
 *   - VIEW (display):  `npm run oracle -- view <build>` | `view all`. El ViewModelContract
 *     (cut C→D, display-only/C1) vía `project()`, proyectado a filas con `toStatEntries`
 *     (`lib/format`, el MISMO proyector que D1). Primer consumidor real del contrato; hermano
 *     de display del adaptador UI.
 *
 * Sin argumento → `lanka` (crudo).
 */
import { loadEngineData } from '@core/engine/fixtures/engine-data';
import { BUILDS } from '@core/engine/fixtures/builds';
import { consume } from '@core/engine/output/consume';
import { project } from '@shared/view-model';
import { toStatEntries } from '@lib/format/stat-entry';

loadEngineData();

const isView = process.argv[2] === 'view';
const arg = (isView ? process.argv[3] : process.argv[2]) ?? 'lanka';
const names = arg === 'all' ? Object.keys(BUILDS) : [arg];

for (const name of names) {
  const factory = BUILDS[name];
  if (!factory) {
    console.error(`oráculo: build "${name}" no existe. Disponibles: ${Object.keys(BUILDS).join(', ')}, all`);
    process.exitCode = 1;
    continue;
  }

  const consumption = consume(factory(), { flags: {} });

  if (isView) {
    // Capa D (display): el ViewModelContract proyectado, formateado al borde.
    const vm = project(consumption.snapshot());
    console.log(`\n######## VIEW: ${name} — ${vm.entities.length} entidad(es) ########`);
    for (const e of vm.entities) {
      console.log(`\n=== [${e.channel ?? '—'}] ${e.unique_name}  (${e.domain}/${e.kind}) ===`);
      // Proyector único (lib/format) — mismo que D1. El prefijo [category] es debug del CLI.
      const entries = toStatEntries(e.stats);
      for (let i = 0; i < entries.length; i++) {
        const cat = e.stats[i].category ? `[${e.stats[i].category}] ` : '';
        console.log(`  ${cat}${entries[i].label}: ${entries[i].value}`);
      }
    }
  } else {
    // Crudo: salida nativa de C (forma-de-productor, sin shaping) — inspección de buckets.
    const entities = consumption.snapshot();
    console.log(`\n######## BUILD: ${name} — ${entities.length} entidad(es) resuelta(s) ########`);
    for (const e of entities) {
      console.log(`\n=== [${e.channel ?? '—'}] ${e.id}  (${e.domain}/${e.kind}) ===`);
      console.dir(e.attributes, { depth: null, maxArrayLength: null });
    }
  }
}
