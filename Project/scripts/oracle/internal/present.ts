/**
 * Capa 3 — Presentación: `AcquiredResult × format → stdout`. Desechable y específica del Oracle
 * (no es contrato). `text` = para humano; `json` = para máquina/IA, el proto-contrato serializado.
 * Ver `docs/domains/oracle/design/architecture.md` §2-2.1.
 */
import { toStatEntries } from '@lib/format/stat-entry';
import type { AcquiredResult, Format, MetricsResult, EnemyResult, TraceResult } from './types';

export function present(result: AcquiredResult, format: Format): void {
  if (format === 'json') {
    console.log(JSON.stringify(jsonView(result), null, 2));
    return;
  }
  text(result);
}

// ─── json: forma cercana a la adquisición, sin ruido de dumps completos ───

function jsonView(r: AcquiredResult): unknown {
  switch (r.lens) {
    case 'nodes':
      return { lens: r.lens, builds: r.builds };
    case 'display':
      return { lens: r.lens, builds: r.builds };
    case 'metrics':
      return {
        lens: r.lens,
        build: r.build,
        weapon: r.weapon.unique_name,
        target: targetSummary(r),
        duration: r.duration,
        metrics: r.metrics,
      };
    case 'trace':
      return { lens: r.lens, build: r.build, entity: r.entityId, node: r.node, steps: r.steps };
    case 'enemy':
      return {
        lens: r.lens,
        enemy: r.scaled.dna.name ?? r.scaled.dna.unique_name,
        faction: r.scaled.dna.faction,
        level: r.level,
        health: r.scaled.current_health,
        armor: r.scaled.current_armor,
        shields: r.scaled.current_shields,
        damage_reduction: r.dr,
        ehp: r.ehp,
      };
  }
}

// ─── text: legible por humano ───

function text(r: AcquiredResult): void {
  switch (r.lens) {
    case 'nodes':
      for (const b of r.builds) {
        console.log(`\n######## NODES: ${b.name} — ${b.entities.length} entidad(es) ########`);
        for (const e of b.entities) {
          console.log(`\n=== [${e.channel ?? '—'}] ${e.id}  (${e.domain}/${e.kind}) ===`);
          console.dir(e.attributes, { depth: null, maxArrayLength: null });
        }
      }
      return;

    case 'display':
      for (const b of r.builds) {
        console.log(`\n######## DISPLAY: ${b.name} — ${b.view.entities.length} entidad(es) ########`);
        for (const e of b.view.entities) {
          console.log(`\n=== [${e.channel ?? '—'}] ${e.unique_name}  (${e.domain}/${e.kind}) ===`);
          const entries = toStatEntries(e.stats);
          for (let i = 0; i < entries.length; i++) {
            const cat = e.stats[i].category ? `[${e.stats[i].category}] ` : '';
            console.log(`  ${cat}${entries[i].label}: ${entries[i].value}`);
          }
        }
      }
      return;

    case 'metrics':
      textMetrics(r);
      return;

    case 'trace':
      textTrace(r);
      return;

    case 'enemy':
      textEnemy(r);
      return;
  }
}

function targetSummary(r: MetricsResult) {
  return {
    name: r.target.dna.name ?? r.target.dna.unique_name,
    level: r.target.current_level,
    health: r.target.current_health,
    armor: r.target.current_armor,
    shields: r.target.current_shields,
  };
}

function textMetrics(r: MetricsResult): void {
  const { target_agnostic: ta, vs_target: vt } = r.metrics;
  const name = r.target.dna.name ?? r.target.dna.unique_name;
  console.log(`\n######## METRICS: ${r.build} vs ${name} @lvl ${r.target.current_level} (dur ${r.duration}s) ########`);
  console.log(`=== [${r.weapon.channel ?? '—'}] ${r.weapon.unique_name}  (${r.weapon.domain}/${r.weapon.kind}) ===`);
  console.log(`  target: health ${r.target.current_health.toFixed(0)}  armor ${r.target.current_armor.toFixed(0)}  shields ${r.target.current_shields.toFixed(0)}`);

  console.log(`\n  target_agnostic (C1 suelo — sin target):`);
  console.log(`    burst_dps      : ${ta.burst_dps.toFixed(1)}`);
  console.log(`    sustained_dps  : ${ta.sustained_dps.toFixed(1)}`);
  console.log(`    avg_crit_mult  : ${ta.average_crit_multiplier.toFixed(3)}`);
  console.log(`    pellet_count   : ${ta.pellet_count}`);
  console.log(`    falloff_mult   : ${ta.falloff_multiplier.toFixed(3)}`);
  console.log(`    status_weights :`);
  for (const [token, p] of Object.entries(ta.status_map)) {
    if (p > 0) console.log(`      ${token}: ${(p * 100).toFixed(2)}%`);
  }

  const kills = vt.ttk !== null;
  console.log(`\n  vs_target (C2 — timeline vs target):`);
  console.log(`    ttk            : ${kills ? vt.ttk!.toFixed(2) + ' s' : '— (no muere en la ventana)'}`);
  console.log(`    shots_to_kill  : ${vt.shots_to_kill ?? '—'}`);
  console.log(`    total_damage   : ${vt.total_damage.toFixed(0)}`);
  console.log(`    effective_dps  : ${vt.effective_dps.toFixed(1)}  (${kills ? 'total/ttk — hasta matar' : 'total/dur — sostenido'})`);
}

function textTrace(r: TraceResult): void {
  console.log(`\n######## TRACE: ${r.build} — ${r.entityId} · ${r.node} — ${r.steps.length} paso(s) ########`);
  if (r.steps.length === 0) {
    console.log('  (sin pasos — nodo sin modifiers, o el atributo no existe en la entidad)');
    return;
  }
  for (const s of r.steps) {
    const cond = s.condition_met === undefined ? '' : `  cond=${s.condition_met}`;
    console.log(`  [pass ${s.pass}] ${s.source}  ${s.operation}  impact=${s.impact}  → ${s.resulting_value}${cond}`);
  }
}

function textEnemy(r: EnemyResult): void {
  const dna = r.scaled.dna;
  console.log(`\n######## ENEMY: ${dna.name ?? dna.unique_name} @ lvl ${r.level} (base ${dna.base_level}, facción ${dna.faction}) ########`);
  console.log(`  health : ${r.scaled.current_health.toFixed(2)}`);
  console.log(`  armor  : ${r.scaled.current_armor}  → DR ${(r.dr * 100).toFixed(2)}%  [√3a/100, provisional OQ-ENGINE-15]`);
  console.log(`  shields: ${r.scaled.current_shields.toFixed(2)}`);
  console.log(`  EHP    : ${r.ehp.toFixed(2)}  (health/(1−DR)+shields)`);
}
