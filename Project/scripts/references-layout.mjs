#!/usr/bin/env node
/**
 * references-layout.mjs — audita el layout, la reconciliabilidad y las marcas de `references/wiki/`.
 *
 * Regla del raw (ver `references/wiki/README.md`):
 *
 *     <categoría>/<documento>.md  +  <página-wiki>.wikitext   ← hermanos, sin carpeta intermedia
 *
 * Un `.md` sin raw **no es reconciliable**: no hay contra qué verificarlo, así que no se sabe si
 * está completo ni si sigue siendo cierto. El vínculo se **declara** en el encabezado
 * (`> Raw: a.wikitext · b.wikitext`) porque el nombre de archivo no alcanza.
 *
 * Dos figuras de raw, y la diferencia importa para qué cuenta como huérfano:
 *   - **fuente principal** — la página que el `.md` destila. Vive junto a su `.md`.
 *   - **fuente citada**    — respalda una línea suelta. NO lleva `.md` propio y vive en la categoría
 *                            de su propia página, así que se declara con path:
 *                            `> Raw: armor.wikitext · mods/steel-fiber.wikitext`
 * Un raw es huérfano sólo si **ningún** documento lo declara — no sólo sus vecinos de directorio.
 *
 * Regla de la marca: `⚠️ <TIPO> <flecha> <puntero>`. `Conflicto` usa `↔` y **exige contraparte**:
 * es la única parte de la regla que se rompe en silencio (marcás un lado, olvidás el otro, y quien
 * entra por el lado ciego no se entera de que el dato está en disputa).
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

/**
 * ¿El doc reclama este raw? Una entrada sin `/` se resuelve como hermana (fuente principal);
 * una con `/` es un path relativo a `wiki/` (fuente citada en otra categoría).
 */
const reclama = (doc, raw) => {
  const decl = declaredRaws(doc);
  if (!decl) return stem(doc) === stem(raw) && path.dirname(doc) === path.dirname(raw);
  return decl.some(d => d.includes('/')
    // con path: se acepta relativo al doc (`../mods/x.wikitext`) o a `wiki/` (`mods/x.wikitext`)
    ? path.resolve(path.dirname(doc), d) === raw || path.resolve(WIKI, d) === raw
    : d === path.basename(raw) && path.dirname(doc) === path.dirname(raw));
};

/** `sources/` queda fuera: son módulos Lua y export, no páginas de wiki destilables. */
const EXENTO = new Set(['sources']);
const esExento = (p) => EXENTO.has(rel(p).split(path.sep)[0]);

const sinRaw = [], sinDeclarar = [], enGenerico = [], huerfanos = [];

for (const doc of docs) {
  if (esExento(doc)) continue;
  const decl = declaredRaws(doc);
  const mios = raws.filter(r => reclama(doc, r));

  if (!mios.length) sinRaw.push(rel(doc));
  else if (decl === null) sinDeclarar.push(rel(doc));
}

// Un raw tiene dueño si CUALQUIER documento lo declara — no sólo sus vecinos de directorio.
for (const r of raws) {
  if (esExento(r)) continue;
  if (enContenedor(r)) { enGenerico.push(rel(r)); continue; }
  if (!docs.some(d => reclama(d, r))) huerfanos.push(rel(r));
}

// ── Marcas ───────────────────────────────────────────────────────────────────────────
const TIPOS = ['Desactualizado', 'Conflicto', 'Discrepancia', 'Ilustración propia'];
const RE_MARCA = /⚠️\s*([A-Za-zÁ-úñ ]+?)\s*(→|↔)\s*(.+)/g;
const linkPath = (s) => (s.match(/\]\(([^)]+)\)/) ?? [])[1];

const marcaMalTipo = [], conflictoSinVuelta = [];

for (const doc of docs) {
  const txt = fs.readFileSync(doc, 'utf8');
  for (const [, tipo, flecha, dest] of txt.matchAll(RE_MARCA)) {
    if (!TIPOS.includes(tipo)) { marcaMalTipo.push(`${rel(doc)} → "${tipo}"`); continue; }
    if (tipo !== 'Conflicto') continue;

    if (flecha !== '↔') { conflictoSinVuelta.push(`${rel(doc)} — usa "${flecha}", debe ser ↔`); continue; }
    const lp = linkPath(dest);
    if (!lp) { conflictoSinVuelta.push(`${rel(doc)} — puntero sin link resoluble`); continue; }

    const otro = path.resolve(path.dirname(doc), lp.split('#')[0]);
    if (!fs.existsSync(otro)) { conflictoSinVuelta.push(`${rel(doc)} → ${lp} (no existe)`); continue; }

    const vuelve = [...fs.readFileSync(otro, 'utf8').matchAll(RE_MARCA)]
      .some(([, t, f, d]) => t === 'Conflicto' && f === '↔'
        && path.resolve(path.dirname(otro), (linkPath(d) ?? '').split('#')[0]) === doc);
    if (!vuelve) conflictoSinVuelta.push(`${rel(doc)} ↔ ${lp} — falta la contraparte`);
  }
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
bloque('marca con tipo inválido', marcaMalTipo);
bloque('conflicto sin contraparte — se rompe en silencio', conflictoSinVuelta);

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
