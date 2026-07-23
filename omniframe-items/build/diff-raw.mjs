// Árbitro de la fase 1 (OQ-DATA-16): nuestro data/json vs el de upstream, categoría por categoría.
// Mientras el build propio deba ser equivalente al de upstream, la respuesta esperada es "idénticos".
// Uso: node build/diff-raw.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Anclado al archivo, no al cwd: los dos clones (Linux/Windows) viven en rutas distintas.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const UP = join(ROOT, 'warframe-items', 'data', 'json') + '/';
const OURS = join(ROOT, 'omniframe-items', 'data', 'json') + '/';

const files = [...new Set([...readdirSync(UP), ...readdirSync(OURS)])].sort();
const md5 = (s) => createHash('md5').update(s).digest('hex');

let identical = 0;
const differing = [];

for (const f of files) {
  let a, b;
  try { a = readFileSync(UP + f, 'utf8'); } catch { differing.push([f, 'SOLO EN UPSTREAM']); continue; }
  try { b = readFileSync(OURS + f, 'utf8'); } catch { differing.push([f, 'FALTA EN EL NUESTRO']); continue; }

  if (md5(a) === md5(b)) { identical++; continue; }

  // Mismo contenido con distinto formato/orden de claves cuenta como igual semánticamente.
  let ja, jb;
  try { ja = JSON.parse(a); jb = JSON.parse(b); } catch { differing.push([f, 'JSON inválido']); continue; }
  const na = Array.isArray(ja) ? ja.length : Object.keys(ja).length;
  const nb = Array.isArray(jb) ? jb.length : Object.keys(jb).length;

  if (JSON.stringify(ja) === JSON.stringify(jb)) { identical++; continue; }

  // Diff por uniqueName cuando son arrays de ítems.
  let detail = `${na} → ${nb} items`;
  if (Array.isArray(ja) && Array.isArray(jb) && ja[0]?.uniqueName) {
    const setA = new Map(ja.map((i) => [i.uniqueName, i]));
    const setB = new Map(jb.map((i) => [i.uniqueName, i]));
    const soloA = [...setA.keys()].filter((k) => !setB.has(k));
    const soloB = [...setB.keys()].filter((k) => !setA.has(k));
    let changed = 0;
    const campos = {};
    for (const [k, va] of setA) {
      const vb = setB.get(k);
      if (!vb) continue;
      if (JSON.stringify(va) !== JSON.stringify(vb)) {
        changed++;
        for (const campo of new Set([...Object.keys(va), ...Object.keys(vb)])) {
          if (JSON.stringify(va[campo]) !== JSON.stringify(vb[campo])) campos[campo] = (campos[campo] ?? 0) + 1;
        }
      }
    }
    const top = Object.entries(campos).sort((x, y) => y[1] - x[1]).slice(0, 5);
    detail = `${na}→${nb} | solo-upstream ${soloA.length} · solo-nuestro ${soloB.length} · cambiados ${changed}`;
    if (top.length) detail += ` | campos: ${top.map(([c, n]) => `${c}(${n})`).join(', ')}`;
  }
  differing.push([f, detail]);
}

console.log(`IDÉNTICOS: ${identical}/${files.length}`);
console.log(`DIFIEREN:  ${differing.length}\n`);
for (const [f, d] of differing) console.log(`  ${f.padEnd(20)} ${d}`);
