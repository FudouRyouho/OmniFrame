/**
 * Oráculo del engine — cáscara CLI (PASO 2 de la secuencia del oráculo).
 *
 * Primer cliente real, no-UI, consumiendo el motor por su puerto `consume()` (salida de C).
 * Adaptador NO-reactivo (lee la salida resuelta de C y la serializa a stdout) — hermano del
 * futuro adaptador reactivo (UI). Ver `docs/domains/engine/design/arch-decisions.md` §5-7.
 *
 * Comparte con los tests el harness de entrada (`@core/engine/fixtures`): el bootstrap de data
 * (`loadEngineData`) y las intenciones-fixture (`builds` / `BUILDS`). El test le adosa
 * expectativas y aserta; el oráculo INSPECCIONA (imprime el crudo). Mismo input, distinto acto.
 *
 * Uso: `npm run oracle -- <build>` (un build del catálogo) o `npm run oracle -- all` (todos).
 * Sin argumento → `lanka`. Imprime el snapshot CRUDO (nodos + 6 buckets) — material de PASO 3.
 */
import { loadEngineData } from '@core/engine/fixtures/engine-data';
import { BUILDS } from '@core/engine/fixtures/builds';
import { consume } from '@core/engine/output/consume';

loadEngineData();

const arg = process.argv[2] ?? 'lanka';
const names = arg === 'all' ? Object.keys(BUILDS) : [arg];

for (const name of names) {
  const factory = BUILDS[name];
  if (!factory) {
    console.error(`oráculo: build "${name}" no existe. Disponibles: ${Object.keys(BUILDS).join(', ')}, all`);
    process.exitCode = 1;
    continue;
  }

  // Consumo del puerto: salida CRUDA de C (forma-de-productor, sin shaping).
  const entities = consume(factory(), { flags: {} }).snapshot();

  console.log(`\n######## BUILD: ${name} — ${entities.length} entidad(es) resuelta(s) ########`);
  for (const e of entities) {
    console.log(`\n=== [${e.channel ?? '—'}] ${e.id}  (${e.domain}/${e.kind}) ===`);
    console.dir(e.attributes, { depth: null, maxArrayLength: null });
  }
}
