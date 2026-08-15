// Árbitro raw-vs-raw (OQ-DATA-16): nuestro data/json vs el de upstream, categoría por categoría.
//
// ⚠️ **Ya no espera diff vacío.** Hay dos divergencias deliberadas contra upstream:
//   · G-1 (puncture↔slash corregido en `raw-build.ts`) → ~620 ítems en el campo `damage`.
//   · Control de acción → no emitimos 8 categorías sin consumidor, ni `All.json`/`i18n.json`.
// Ambas se descuentan acá abajo. Lo que sigue siendo señal es **solo-upstream / solo-nuestro ≠ 0**
// dentro de una categoría que sí emitimos, y cualquier campo distinto de `damage`.
// El árbitro del dataset es `git diff public/data`, que el loader propio habilitó.
//
// Uso: node build/diff-raw.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Anclado al archivo, no al cwd: los dos clones (Linux/Windows) viven en rutas distintas.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const UP = join(ROOT, 'warframe-items', 'data', 'json') + '/';
const OURS = join(ROOT, 'omniframe-items', 'data', 'json') + '/';

// Campos que difieren entre corridas SIN que cambiemos nada, por causa conocida. Descontarlos es lo
// que hace del diff un árbitro: si no, el ruido de fondo tapa la señal y una corrida limpia es
// indistinguible de una rota. Con --strict se comparan igual.
const VOLATILE = new Set([
  'wikiaThumbnail', // scrape del wiki en vivo: cambia porque el wiki cambió, no porque el build falle
  'imageName',      // empate en el group.sort de dedupImageNames (misma categoría ⇒ misma prioridad)
  'itemCount',      // deriva de lo anterior
  'patchlogs',      // se reusa del caché incremental según el hash del export
]);
const strict = process.argv.includes('--strict');
const omitVolatile = (o) => {
  if (strict || !o || typeof o !== 'object') return o;
  const c = {};
  for (const [k, v] of Object.entries(o)) if (!VOLATILE.has(k)) c[k] = v;
  return c;
};

// No las emitimos a propósito (control de acción, fase 2): no aportan un solo ítem a `public/data`.
// `All.json` es el agregado que el loader excluye; `i18n.json`, traducciones sin consumidor.
const NOT_EMITTED = new Set([
  'Fish.json', 'Gear.json', 'Glyphs.json', 'Quests.json',
  'Relics.json', 'Resources.json', 'Sigils.json', 'Skins.json',
  'All.json', 'i18n.json',
]);

const files = [...new Set([...readdirSync(UP), ...readdirSync(OURS)])].sort();
const md5 = (s) => createHash('md5').update(s).digest('hex');

let identical = 0;
const differing = [];
const notEmitted = [];

for (const f of files) {
  if (NOT_EMITTED.has(f)) { notEmitted.push(f.replace('.json', '')); continue; }
  let a, b;
  try { a = readFileSync(UP + f, 'utf8'); } catch { differing.push([f, 'SOLO EN UPSTREAM']); continue; }
  try { b = readFileSync(OURS + f, 'utf8'); } catch { differing.push([f, 'FALTA EN EL NUESTRO — ¿build incompleto?']); continue; }

  if (md5(a) === md5(b)) { identical++; continue; }

  // Mismo contenido con distinto formato/orden de claves cuenta como igual semánticamente.
  let ja, jb;
  try { ja = JSON.parse(a); jb = JSON.parse(b); } catch { differing.push([f, 'JSON inválido']); continue; }
  const na = Array.isArray(ja) ? ja.length : Object.keys(ja).length;
  const nb = Array.isArray(jb) ? jb.length : Object.keys(jb).length;

  // Canónico: un objeto con las mismas entradas en otro orden es el mismo dato (i18n.json llega así).
  const canon = (v) =>
    JSON.stringify(v, (_, val) =>
      val && typeof val === 'object' && !Array.isArray(val)
        ? Object.fromEntries(Object.entries(val).sort(([x], [y]) => (x < y ? -1 : 1)))
        : val,
    );
  if (canon(ja) === canon(jb)) { identical++; continue; }

  // Diff por uniqueName cuando son arrays de ítems.
  let detail = `${na} → ${nb} items`;
  if (Array.isArray(ja) && Array.isArray(jb) && ja[0]?.uniqueName) {
    const setA = new Map(ja.map((i) => [i.uniqueName, i]));
    const setB = new Map(jb.map((i) => [i.uniqueName, i]));
    const soloA = [...setA.keys()].filter((k) => !setB.has(k));
    const soloB = [...setB.keys()].filter((k) => !setA.has(k));
    let changed = 0;
    let soloVolatil = 0;
    const campos = {};
    for (const [k, va] of setA) {
      const vb = setB.get(k);
      if (!vb) continue;
      if (JSON.stringify(va) === JSON.stringify(vb)) continue;
      if (JSON.stringify(omitVolatile(va)) === JSON.stringify(omitVolatile(vb))) { soloVolatil++; continue; }
      changed++;
      for (const campo of new Set([...Object.keys(va), ...Object.keys(vb)])) {
        if (JSON.stringify(va[campo]) !== JSON.stringify(vb[campo])) campos[campo] = (campos[campo] ?? 0) + 1;
      }
    }
    if (!changed && !soloA.length && !soloB.length) {
      identical++;
      console.log(`  ${f.padEnd(20)} equivalente (${soloVolatil} ítems difieren sólo en campos volátiles)`);
      continue;
    }
    const top = Object.entries(campos).sort((x, y) => y[1] - x[1]).slice(0, 5);
    detail = `${na}→${nb} | solo-upstream ${soloA.length} · solo-nuestro ${soloB.length} · cambiados ${changed}`;
    if (soloVolatil) detail += ` (+${soloVolatil} sólo-volátil)`;
    if (top.length) detail += ` | campos: ${top.map(([c, n]) => `${c}(${n})`).join(', ')}`;
  }
  differing.push([f, detail]);
}

const comparados = files.length - notEmitted.length;
console.log(`IDÉNTICOS: ${identical}/${comparados} comparados`);
console.log(`DIFIEREN:  ${differing.length}\n`);
for (const [f, d] of differing) console.log(`  ${f.padEnd(20)} ${d}`);
console.log(`\nno emitidas a propósito (${notEmitted.length}): ${notEmitted.join(' · ')}`);
