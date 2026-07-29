#!/usr/bin/env node
/**
 * Cobertura del vocabulario D-6 sobre el dato real — la medición del descarte silencioso.
 *
 * Replica `resolveUpgradeEntry` parseando `UPGRADES`, `UPGRADE_MAP` y `OPERATION_MAP` desde
 * `shared/types/modifier.ts` (no los importa: así mide el vocabulario tal como está escrito,
 * sin depender del build) y lo corre sobre los `upgrade_type` de los overrides.
 *
 * DOS DEFINICIONES, o el conteo no cierra — las dos torcieron la medición antes:
 *   1. El universo son las ocurrencias **no nulas** de `upgrade_type`.
 *   2. Hay que recorrer el JSON **recursivo por clave**, NO por `stats[].values[]`:
 *      `incarnon-evolutions.override.json` tiene otro shape y se perderían sus 446 entradas.
 *
 * ⚠️ Mide UNA de las dos compuertas del descarte silencioso: que el **token resuelva**. La otra
 * —que el modifier **aterrice** en un nodo existente— no se ve acá y puede dar falso verde: un
 * token válido cuyo modifier apunte a un nodo inexistente se pierde igual, y este conteo baja.
 * La segunda compuerta se cubre con tests (`__tests__/channel-routing.test.ts`).
 *
 * Consumidor: el registro de inexpresables de `docs/semantic/upgrade-tokens.md`.
 *   uso: node scripts/measure-token-coverage.mjs [--json]
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SUB = new Set(['PRIMARY', 'SECONDARY', 'MELEE']);
const OPS = new Set(['ADD', 'FLAT', 'BASE', 'MULT']);

const src = readFileSync(join(ROOT, 'src/shared/types/modifier.ts'), 'utf8');
const UPGRADES = new Set(
  [...src.match(/export const UPGRADES = \[([\s\S]*?)\n\] as const/)[1].matchAll(/^\s*'([A-Z_]+)',/gm)].map(m => m[1]),
);
const MAP_KEYS = new Set(
  [...src.match(/export const UPGRADE_MAP[\s\S]*?\n\}\n/)[0].matchAll(/^\s*([A-Z_]+):\s*\{/gm)].map(m => m[1]),
);

/** Espejo de `resolveUpgradeEntry`: ¿el token resuelve a { attr, op }? */
function resolves(token) {
  if (!UPGRADES.has(token)) return false;
  if (MAP_KEYS.has(token)) return true;
  const p = token.split('_');
  if (p.length < 3) return false;
  return OPS.has(p[0] === 'WEAPON' && SUB.has(p[1]) ? p[2] : p[1]);
}

const dataDir = join(ROOT, 'public/data');
const files = readdirSync(dataDir).filter(f => f.includes('override') && f.endsWith('.json'));

let total = 0, nulls = 0;
const bad = new Map();
const perFile = new Map();

for (const f of files) {
  const walk = o => {
    if (Array.isArray(o)) return o.forEach(walk);
    if (o === null || typeof o !== 'object') return;
    if ('upgrade_type' in o) {
      const t = o.upgrade_type;
      if (t === null || t === undefined) nulls++;
      else {
        total++;
        const st = perFile.get(f) ?? { ok: 0, bad: 0 };
        if (resolves(t)) st.ok++;
        else { st.bad++; bad.set(t, (bad.get(t) ?? 0) + 1); }
        perFile.set(f, st);
      }
    }
    Object.values(o).forEach(walk);
  };
  walk(JSON.parse(readFileSync(join(dataDir, f), 'utf8')));
}

const discarded = [...bad.values()].reduce((a, b) => a + b, 0);
const inVocab = [...bad.keys()].filter(t => UPGRADES.has(t));
const garbage = [...bad.keys()].filter(t => !UPGRADES.has(t) && !/^[A-Z_]+$/.test(t));
const unmodeled = [...bad.keys()].filter(t => !UPGRADES.has(t) && /^[A-Z_]+$/.test(t));
const uses = ts => ts.reduce((a, t) => a + bad.get(t), 0);

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ total, nulls, discarded, distinct: bad.size, byToken: Object.fromEntries([...bad].sort((a, b) => b[1] - a[1])) }, null, 2));
  process.exit(0);
}

console.log(`\n🔍 Cobertura del vocabulario D-6 — ${UPGRADES.size} tokens · ${MAP_KEYS.size} entradas en UPGRADE_MAP\n`);
console.log(`  upgrade_type null (fuera del universo) : ${nulls}`);
console.log(`  universo (no nulos)                    : ${total}`);
console.log(`  DESCARTADOS                            : ${discarded}  (${(100 * discarded / total).toFixed(1)}%) en ${bad.size} tokens distintos\n`);
console.log(`     en UPGRADES pero irresolubles : ${inVocab.length} tokens / ${uses(inVocab)} usos   (desviación D-6)`);
console.log(`     stats reales sin modelar      : ${unmodeled.length} tokens / ${uses(unmodeled)} usos`);
console.log(`     basura de dato                : ${garbage.length} tokens / ${uses(garbage)} usos   ${garbage.map(g => JSON.stringify(g)).join(', ')}\n`);
console.log('  por archivo (descartados / total):');
for (const [f, st] of [...perFile].sort()) console.log(`     ${String(st.bad).padStart(5)} / ${String(st.ok + st.bad).padEnd(5)} ${f}`);
console.log('\n  top 15 tokens descartados:');
for (const [t, n] of [...bad].sort((a, b) => b[1] - a[1]).slice(0, 15)) console.log(`     ${String(n).padStart(4)}  ${t}`);
console.log();
