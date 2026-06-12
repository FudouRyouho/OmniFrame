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
 *     (cut C→D, display-only/C1) vía `project()`, formateado al borde del CLI. Primer consumidor
 *     real del contrato; hermano de display del adaptador UI (D1). Label = token por ahora
 *     (la resolución i18n es un ingrediente `lib/*` aparte).
 *
 * Sin argumento → `lanka` (crudo).
 */
import { loadEngineData } from '@core/engine/fixtures/engine-data';
import { BUILDS } from '@core/engine/fixtures/builds';
import { consume } from '@core/engine/output/consume';
import { project, type StatViewModel } from '@shared/view-model';

loadEngineData();

const isView = process.argv[2] === 'view';
const arg = (isView ? process.argv[3] : process.argv[2]) ?? 'lanka';
const names = arg === 'all' ? Object.keys(BUILDS) : [arg];

/** Formateo de display al borde del CLI: value + unit. Label = token (i18n = ingrediente aparte). */
function formatStat(s: StatViewModel): string {
  const value = Number.isInteger(s.value) ? String(s.value) : s.value.toFixed(2);
  const cat = s.category ? `[${s.category}] ` : '';
  return `${cat}${s.id}: ${value}${s.unit}`;
}

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
      for (const s of e.stats) {
        console.log(`  ${formatStat(s)}`);
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
