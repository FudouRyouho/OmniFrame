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
 * Actos de D2:
 *   - CRUDO (default): `npm run oracle -- <build>` | `all`. Snapshot crudo (nodos + 6 buckets),
 *     material de debug del motor (PASO 3).
 *   - VIEW (display):  `npm run oracle -- view <build>` | `view all`. El ViewModelContract
 *     (cut C→D, display-only/C1) vía `project()`, proyectado a filas con `toStatEntries`
 *     (`lib/format`, el MISMO proyector que D1). Primer consumidor real del contrato; hermano
 *     de display del adaptador UI.
 *   - ENEMY (target):  `npm run oracle -- enemy <name> <lvl>`. Contraste del eje enemigo.
 *   - METRICS (C2):    `npm run oracle -- metrics <build> [enemy] [lvl] [dur]`. Materializa
 *     OQ-ENGINE-8: el paquete de salida de C2, corriendo sus DOS actos contra un enemigo
 *     escalado — closed-form (`CombatCalculator.project`, suelo C1, sin target) + needs-a-run
 *     (`TimelineSimulator.simulateBurst`, timeline steppeado vs el target). El consumidor real
 *     del que EMERGE la forma del contrato (espejo de cómo `view` derivó `ViewModelContract v0`).
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
import { CombatCalculator } from '@core/engine/simulate/combat/CombatCalculator';
import { TimelineSimulator } from '@core/engine/simulate/combat/TimelineSimulator';
import { BASELINE_GAME_LAWS } from '@core/engine/contracts';
import type { SimulationContext } from '@core/engine/contracts';

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

// Modo `metrics`: materializa OQ-ENGINE-8 — el paquete de salida de C2 (métricas de combate),
// derivándolo de un consumidor REAL en vez de cristalizar un tipo sin call-sites (el error que
// purgó `ProjectionSnapshot` en `6ab32e8`). La FORMA que se imprime acá ES el borrador del
// contrato. Corre los dos actos del selector C1|C2 contra un enemigo escalado.
//   npm run oracle -- metrics <build> [enemy] [lvl] [dur]
if (process.argv[2] === 'metrics') {
  const buildName = process.argv[3] ?? 'lanka';
  const enemyQuery = process.argv[4] ?? 'Arid Butcher';
  const level = Number(process.argv[5] ?? 100);
  const simDuration = Number(process.argv[6] ?? 6);

  const factory = BUILDS[buildName];
  if (!factory) {
    console.error(`oráculo: build "${buildName}" no existe. Disponibles: ${Object.keys(BUILDS).join(', ')}`);
    process.exit(1);
  }
  const dna = EnemyRepository.find(enemyQuery);
  if (!dna) {
    console.error(`oráculo: enemigo "${enemyQuery}" no encontrado (probá el name display o el unique_name).`);
    process.exit(1);
  }
  const target = EnemyRepository.scale(dna, level);

  // El arma resuelta por C1 (una entidad del snapshot). Multi-arma: se toma la primera weapon.
  const entities = consume(factory(), { flags: {} }).snapshot();
  const weapon = entities.find((e) => e.domain === 'weapon');
  if (!weapon) {
    console.error(`oráculo: el build "${buildName}" no tiene entidad de arma (domain=weapon).`);
    process.exit(1);
  }

  // ⚠️ Limitación del spike: active_profile_id='base' (el perfil real del build — ej. Lanka
  // 'charged_shot' — no se propaga acá; solo afecta el lookup de reload_time, fidelidad menor).
  const ctx: SimulationContext = {
    active_profile_id: 'base',
    flags: {},
    variables: {},
    laws: { ...BASELINE_GAME_LAWS },
  };

  // Acto 1 — closed-form (suelo C1): DPS/crit/status en forma cerrada, sin correr el reloj ni ver el target.
  const closed = CombatCalculator.project(weapon, ctx);
  // Acto 2 — needs-a-run (C2): timeline steppeado contra el target escalado → ttk + daño realizado.
  const run = TimelineSimulator.simulateBurst(weapon, target, simDuration, simDuration, ctx);
  const effective_dps = simDuration > 0 ? run.total_damage / simDuration : 0;

  console.log(`\n######## METRICS: ${buildName} vs ${dna.name ?? dna.unique_name} @lvl ${level} (dur ${simDuration}s) ########`);
  console.log(`=== [${weapon.channel ?? '—'}] ${weapon.unique_name}  (${weapon.domain}/${weapon.kind}) ===`);
  console.log(`  target: health ${target.current_health.toFixed(0)}  armor ${target.current_armor.toFixed(0)}  shields ${target.current_shields.toFixed(0)}`);

  console.log(`\n  closed-form (C1 suelo — sin target):`);
  console.log(`    burst_dps      : ${closed.burst_dps.toFixed(1)}`);
  console.log(`    sustained_dps  : ${closed.sustained_dps.toFixed(1)}`);
  console.log(`    avg_crit_mult  : ${closed.average_crit_multiplier.toFixed(3)}`);
  console.log(`    pellet_count   : ${closed.pellet_count}`);
  console.log(`    falloff_mult   : ${closed.falloff_multiplier.toFixed(3)}`);
  console.log(`    status_weights :`);
  for (const [token, p] of Object.entries(closed.status_map)) {
    if (p > 0) console.log(`      ${token}: ${(p * 100).toFixed(2)}%`);
  }

  console.log(`\n  needs-a-run (C2 — timeline vs target):`);
  console.log(`    ttk            : ${run.ttk === null ? '— (no muere en la ventana)' : run.ttk.toFixed(2) + ' s'}`);
  console.log(`    total_damage   : ${run.total_damage.toFixed(0)}`);
  console.log(`    effective_dps  : ${effective_dps.toFixed(1)}  (total_damage/dur)`);
  console.log(`    events         : ${run.events.length}`);

  process.exit(0);
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
