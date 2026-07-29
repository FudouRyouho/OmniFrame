#!/usr/bin/env node
/**
 * references-layout.mjs — audita el layout y la reconciliabilidad de `references/wiki/`.
 *
 * Regla (ver `references/wiki/README.md` § "el raw vive junto a su `.md`"):
 *
 *     <categoría>/<documento>.md  +  <página-wiki>.wikitext   ← hermanos, sin carpeta intermedia
 *
 * Un `.md` sin raw **no es reconciliable**: no hay contra qué verificarlo, así que no se sabe si
 * está completo ni si sigue siendo cierto. El vínculo se **declara** en el encabezado
 * (`> Raw: a.wikitext · b.wikitext`) porque el nombre de archivo no alcanza: un documento puede
 * destilar varias páginas de wiki, y ahí no hay coincidencia de nombres posible.
 *
 * Uso:
 *   node scripts/references-layout.mjs            → audita
 *   node scripts/references-layout.mjs --declare  → escribe `> Raw:` donde el raw YA existe
 *   node scripts/references-layout.mjs --flatten  → saca raw de contenedores `raw/`|`documents/`
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const WIKI = path.resolve(import.meta.dirname, '../../references/wiki');

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
  const p = path.join(dir, e.name);
  return e.isDirectory() ? walk(p) : [p];
});

const rel = (p) => path.relative(WIKI, p);
const isRaw = (p) => /\.(wikitext|lua)$/.test(p);
const stem = (p) => path.basename(p).replace(/\.[^.]+$/, '');

const files = walk(WIKI);
const docs = files.filter(p => p.endsWith('.md') && path.basename(p) !== 'README.md');
const raws = files.filter(isRaw);

/** Contenedores que agrupan por TIPO de archivo — el layout agrupa por tema, no por tipo. */
const GENERIC = new Set(['raw', 'documents']);
const enContenedor = (p) => GENERIC.has(path.basename(path.dirname(p)));

/** Raw declarados en el encabezado del doc. `null` = no declara. */
const declaredRaws = (doc) => {
  const head = fs.readFileSync(doc, 'utf8').split('\n').slice(0, 15).join('\n');
  const m = head.match(/^>\s*Raw:\s*(.+)$/mi);
  return m ? m[1].split(/[·,]/).map(s => s.trim()).filter(Boolean) : null;
};

/** Raw hermanos: mismo directorio que el doc. */
const hermanos = (doc) => raws.filter(r => path.dirname(r) === path.dirname(doc));

const sinRaw = [], sinDeclarar = [], enGenerico = [], huerfanos = [];

for (const doc of docs) {
  const decl = declaredRaws(doc);
  const propios = hermanos(doc);
  const mios = decl
    ? propios.filter(r => decl.includes(path.basename(r)))
    : propios.filter(r => stem(r) === stem(doc));

  if (!mios.length) sinRaw.push(rel(doc));
  else if (decl === null) sinDeclarar.push(rel(doc));
}

// Un raw tiene dueño si algún doc de su directorio lo declara o comparte su nombre.
for (const r of raws) {
  if (enContenedor(r)) { enGenerico.push(rel(r)); continue; }
  const vecinos = docs.filter(d => path.dirname(d) === path.dirname(r));
  const reclamado = vecinos.some(d =>
    (declaredRaws(d) ?? []).includes(path.basename(r)) || stem(d) === stem(r));
  if (!reclamado) huerfanos.push(rel(r));
}

const bloque = (titulo, items) => {
  if (!items.length) return;
  console.log(`\n── ${titulo} (${items.length}) ──`);
  items.forEach(i => console.log(`  ${i}`));
};

console.log(`\n📁 references/wiki — ${docs.length} documentos · ${raws.length} raw`);
console.log(`\n  ${docs.length - sinRaw.length}/${docs.length} reconciliables (tienen raw)`);
bloque('sin raw — no reconciliable, worklist de captura', sinRaw);
bloque('con raw pero sin declararlo en el encabezado', sinDeclarar);
bloque('raw en contenedor genérico (raw/ | documents/)', enGenerico);
bloque('raw que ningún documento reclama', huerfanos);

// ── --declare ────────────────────────────────────────────────────────────────────────
if (process.argv.includes('--declare')) {
  let n = 0;
  for (const doc of docs) {
    if (declaredRaws(doc) !== null) continue;
    const propios = hermanos(doc).filter(r => stem(r) === stem(doc));
    if (!propios.length) continue;             // sin raw → sin declaración (la ausencia es la señal)
    const lines = fs.readFileSync(doc, 'utf8').split('\n');
    const decl = `> Raw: ${propios.map(r => path.basename(r)).sort().join(' · ')}`;
    let i = lines.findIndex(l => l.startsWith('>'));
    if (i === -1) {
      const h1 = lines.findIndex(l => l.startsWith('# '));
      lines.splice(h1 + 1, 0, '', decl);
    } else {
      while (i + 1 < lines.length && lines[i + 1].startsWith('>')) i++;
      lines.splice(i + 1, 0, decl);
    }
    fs.writeFileSync(doc, lines.join('\n'));
    n++;
  }
  console.log(`\n✓ ${n} documentos declararon su raw\n`);
}

// ── --flatten ────────────────────────────────────────────────────────────────────────
if (process.argv.includes('--flatten')) {
  const enCont = raws.filter(enContenedor);
  for (const r of enCont) {
    execFileSync('git', ['mv', r, path.join(path.dirname(path.dirname(r)), path.basename(r))], { cwd: WIKI });
  }
  for (const d of new Set(enCont.map(r => path.dirname(r)))) {
    if (fs.existsSync(d) && !fs.readdirSync(d).length) fs.rmdirSync(d);
  }
  console.log(`\n✓ ${enCont.length} raw sacados de contenedores genéricos\n`);
}
console.log();
