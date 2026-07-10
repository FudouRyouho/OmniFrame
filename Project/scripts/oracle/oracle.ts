/**
 * Oráculo del engine — cáscara CLI (PASO 2 de la secuencia del oráculo).
 *
 * Primer cliente real, no-UI, consumiendo el motor por su puerto `consume()` (salida de C).
 * Adaptador NO-reactivo (lee la salida resuelta de C y la serializa a stdout) — hermano del
 * futuro adaptador reactivo (UI). Ver `docs/domains/engine/design/arch-decisions.md` §5-7.
 *
 * Comparte con los tests el harness de entrada: el bootstrap de data (`loadEngineData`,
 * `@core/engine/bootstrap`) y las intenciones-fixture (`builds` / `BUILDS`, `@core/engine/fixtures`).
 * El test le adosa expectativas y aserta; el oráculo INSPECCIONA. Mismo input, distinto acto.
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
import { loadEngineData } from '@core/engine/bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { BUILDS } from '@core/engine/fixtures/builds';
import { consume } from '@core/engine/output/consume';
import { project } from '@shared/view-model';
import { toStatEntries } from '@lib/format/stat-entry';
import { EnemyRepository } from '@core/engine/simulate/enemies/EnemyRepository';
import { damageReductionFromArmor } from '@core/engine/formulas/enemy/armor-mitigation';

await loadEngineData(new NodeAdapter());

// Modo `enemy`: instrumento de contraste del eje enemigo (health/armor/DR/EHP escalados a un nivel).
//   npm run oracle -- enemy "Arid Butcher" 215   |   enemy <unique_name> <lvl>
if (process.argv[2] === 'enemy') {
  const query = process.argv[3] ?? '';
  const level = Number(process.argv[4] ?? 1);
  const dna = EnemyRepository.find(query);
  if (!dna) {
    console.error(`oráculo: enemigo "${query}" no encontrado (probá el name display o el unique_name).`);
    process.exitCode = 1;
  } else {
    const s = EnemyRepository.scale(dna, level);
    const dr = damageReductionFromArmor(s.current_armor);
    const ehp = s.current_health / (1 - dr) + s.current_shields;
    console.log(`\n######## ENEMY: ${dna.name ?? dna.unique_name} @ lvl ${level} (base ${dna.base_level}, facción ${dna.faction}) ########`);
    console.log(`  health : ${s.current_health.toFixed(2)}`);
    console.log(`  armor  : ${s.current_armor}  → DR ${(dr * 100).toFixed(2)}%  [√3a/100, provisional OQ-ENGINE-15]`);
    console.log(`  shields: ${s.current_shields.toFixed(2)}`);
    console.log(`  EHP    : ${ehp.toFixed(2)}  (health/(1−DR)+shields)`);
    console.log(`  daño-vs-target: por facción (${dna.faction}) — matriz FACTION_BONUS, aplicación en resolveHit pendiente (C2)`);
  }
  process.exit(process.exitCode ?? 0);
}

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
