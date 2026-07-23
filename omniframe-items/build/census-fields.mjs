// Censo de propagación: qué campos trae upstream y cuáles sobreviven a `public/data`.
//
// Hermano de `diff-raw.mjs`. Aquél mide la frontera de ENTRADA (nuestro raw vs el de upstream);
// éste mide la de SALIDA (raw de upstream → dataset que consume el engine), que la cruza
// `generate-data.ts`. Nació porque cuatro campos disponibles y descartados (modSet, baseDrain,
// excludeFromCodex, minEnemyLevel) se encontraron por sospecha, uno por uno, sin barrido — ver
// docs/domains/source/gaps.md §G-3.
//
// MIDE, NO JUZGA: reporta presencia y conteo. Qué se propaga es decisión aparte.
//
// Uso: node build/census-fields.mjs [--verbose]
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const UP = join(ROOT, 'warframe-items', 'data', 'json');
const OUT = join(ROOT, 'Project', 'public', 'data');
const verbose = process.argv.includes('--verbose');

// Cada par es una travesía distinta del pipeline; varios archivos de upstream pueden colapsar en uno.
const PAIRS = [
  { name: 'weapons', up: ['Primary.json', 'Secondary.json', 'Melee.json'], out: 'weapons.json' },
  { name: 'mods', up: ['Mods.json'], out: 'mods.json' },
  { name: 'warframes', up: ['Warframes.json'], out: 'warframes.json' },
  { name: 'arcanes', up: ['Arcanes.json'], out: 'arcanes.json' },
  { name: 'enemies', up: ['Enemy.json'], out: 'enemies.json' },
  { name: 'companions', up: ['Pets.json', 'Sentinels.json'], out: 'companions.json' },
  { name: 'archwing-weapons', up: ['Arch-Gun.json', 'Arch-Melee.json'], out: 'archwing-weapons.json' },
  { name: 'vehicles', up: ['Archwing.json', 'Railjack.json'], out: 'vehicles.json' },
];

const read = (p) => JSON.parse(readFileSync(p, 'utf8'));
const asArray = (j) => (Array.isArray(j) ? j : Object.values(j).flat());
const snake = (k) => k.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();

// El pipeline no sólo pasa a snake_case: también renombra por semántica. Sin este mapa el censo
// reporta como perdidos campos que el engine usa todos los días (`criticalChance` → `crit_chance`).
// Cada entrada es una equivalencia verificada leyendo la salida, no una suposición.
const SYNONYMS = {
  damagePerShot: 'damage',
  totalDamage: 'total_damage',
  criticalChance: 'crit_chance',
  criticalMultiplier: 'crit_mult',
  procChance: 'status_chance',
  fireRate: 'fire_rate',
  omegaAttenuation: 'disposition',
  slot: 'kind',
  health: 'base_health',
  armor: 'base_armor',
  levelStats: 'stats',
  upgradeTypes: 'upgrade_type',
};

/** ¿Sobrevive `k` en la salida, en cualquiera de sus formas conocidas? */
const survives = (k, salida) =>
  salida.has(k) || salida.has(snake(k)) || (SYNONYMS[k] && salida.has(SYNONYMS[k]));

/** Claves de primer nivel, con cuántos ítems las traen no-nulas. */
function topLevelKeys(items) {
  const counts = new Map();
  for (const it of items) {
    if (!it || typeof it !== 'object') continue;
    for (const [k, v] of Object.entries(it)) {
      if (v === null || v === undefined) continue;
      if (Array.isArray(v) && v.length === 0) continue;
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
  }
  return counts;
}

/** Todas las claves que aparecen en cualquier profundidad — un campo puede sobrevivir anidado. */
function deepKeys(items, depth = 4) {
  const seen = new Set();
  const walk = (v, d) => {
    if (d > depth || !v || typeof v !== 'object') return;
    if (Array.isArray(v)) return v.slice(0, 50).forEach((x) => walk(x, d + 1));
    for (const [k, val] of Object.entries(v)) {
      seen.add(k);
      seen.add(snake(k));
      walk(val, d + 1);
    }
  };
  for (const it of items) walk(it, 0);
  return seen;
}

let totalPerdidos = 0;
const resumen = [];

for (const pair of PAIRS) {
  let upItems = [];
  try {
    for (const f of pair.up) upItems.push(...asArray(read(join(UP, f))));
  } catch {
    console.log(`⚠️  ${pair.name}: falta un archivo de upstream — se salta`);
    continue;
  }

  let outItems;
  try {
    outItems = asArray(read(join(OUT, pair.out)));
  } catch {
    console.log(`⚠️  ${pair.name}: falta ${pair.out} — se salta`);
    continue;
  }

  const entrada = topLevelKeys(upItems);
  const salida = deepKeys(outItems);

  const perdidos = [...entrada.entries()]
    .filter(([k]) => !survives(k, salida))
    .sort((a, b) => b[1] - a[1]);

  totalPerdidos += perdidos.length;
  resumen.push({ pair, upItems, outItems, entrada, perdidos });

  const pct = (n) => `${((n / upItems.length) * 100).toFixed(0)}%`;
  console.log(`\n═══ ${pair.name}  (${upItems.length} in → ${outItems.length} out · ${entrada.size} campos de entrada)`);
  if (!perdidos.length) {
    console.log('   todos los campos de entrada sobreviven en alguna forma');
    continue;
  }
  console.log(`   ${perdidos.length} campos no sobreviven:\n`);
  const mostrar = verbose ? perdidos : perdidos.slice(0, 15);
  for (const [k, n] of mostrar) {
    console.log(`     ${k.padEnd(28)} ${String(n).padStart(6)} ítems  (${pct(n)})`);
  }
  if (!verbose && perdidos.length > mostrar.length) {
    console.log(`     … y ${perdidos.length - mostrar.length} más (--verbose)`);
  }
}

console.log(`\n${'─'.repeat(70)}`);
console.log(`TOTAL: ${totalPerdidos} campos de upstream sin rastro en public/data`);
console.log('Presencia ≠ deuda: sólo lo que tenga consumidor plausible abre pipeline:debt.');
