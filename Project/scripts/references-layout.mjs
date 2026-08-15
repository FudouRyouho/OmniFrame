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
 * Tres fechas, tres preguntas distintas — sólo las dos primeras viven en el encabezado:
 *   `> Última actualización:` — cuándo **nosotros** destilamos. Ya existía.
 *   `> Fuente actualizada:`   — cuándo la **wiki** tocó la página por última vez. La pone `--fuente`.
 *   `{{ver|N}}` en el raw     — en qué **parche del juego** cambió la ley. No se anota por costumbre:
 *                               sólo donde el motor consume el dato. Resolver contra
 *                               `wiki/sources/version-data.lua`.
 * Que la fuente se haya movido DESPUÉS de destilar no prueba que el doc esté mal — prueba que nadie
 * miró. Es la única señal de drift que se puede obtener sin volver a leer la página entera.
 *
 * Uso:
 *   node scripts/references-layout.mjs            → audita (offline)
 *   node scripts/references-layout.mjs --declare  → escribe `> Raw:` donde el raw YA existe
 *   node scripts/references-layout.mjs --flatten  → saca raw de contenedores `raw/`|`documents/`
 *   node scripts/references-layout.mjs --fuente   → consulta la wiki y escribe `> Fuente actualizada:`
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

// ── Fechas ───────────────────────────────────────────────────────────────────────────
const campo = (doc, nombre) => {
  const head = fs.readFileSync(doc, 'utf8').split('\n').slice(0, 15).join('\n');
  return (head.match(new RegExp(`^>\\s*${nombre}:\\s*(.+)$`, 'mi')) ?? [])[1]?.trim() ?? null;
};

/**
 * Títulos de página wiki declarados en `> Fuente:`. Un doc puede destilar más de una.
 *
 * ⚠️ El `)` **no** puede excluirse: hay títulos que lo llevan dentro
 * (`Condition_Overload_(Mechanic)`). Excluirlo truncaba el título, la API lo devolvía
 * *missing*, `--fuente` nunca escribía la fecha y —peor— el doc quedaba **invisible** al
 * check de fuente movida para siempre, porque su `> Fuente actualizada:` congelado en el
 * pasado nunca puede superar al destilado. Se corta en `·` (separador de varias fuentes),
 * en `?` (query string de los módulos Lua) y en la puntuación que cierra la línea.
 */
const titulosWiki = (doc) => [...(campo(doc, 'Fuente') ?? '')
  .matchAll(/wiki\.warframe\.com\/w\/([^\s·,?`]+)/g)]
  .map(m => decodeURIComponent(m[1].replace(/[.]+$/, '')));

const fuenteMovida = [], sinFechaFuente = [], sinFuente = [];
/** El campo puede llevar comentario detrás de la fecha (`2026-07-19 (re-captura…)`). */
const soloFecha = (s) => (s?.match(/\d{4}-\d{2}-\d{2}/) ?? [])[0] ?? null;

for (const doc of docs) {
  if (esExento(doc)) continue;
  const nuestra = soloFecha(campo(doc, 'Última actualización'));
  const suya = soloFecha(campo(doc, 'Fuente actualizada'));
  // Sin `> Fuente:` no hay a qué volver: el raw dice QUÉ se destiló, la URL dice DE DÓNDE.
  if (!campo(doc, 'Fuente')) { sinFuente.push(rel(doc)); continue; }
  if (!suya) { if (titulosWiki(doc).length) sinFechaFuente.push(rel(doc)); continue; }
  if (nuestra && suya > nuestra) fuenteMovida.push(`${rel(doc)} — destilado ${nuestra}, fuente ${suya}`);
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
bloque('la fuente se movió después de destilar — nadie miró desde entonces', fuenteMovida);
bloque('sin `> Fuente actualizada:` — correr --fuente', sinFechaFuente);
if (sinFuente.length) console.log(`\n── sin \`> Fuente:\` — no se sabe de qué página vienen (${sinFuente.length}) ──`
  + `\n  ${[...new Set(sinFuente.map(p => p.split(path.sep)[0]))].sort().join(' · ')}`);

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

// ── --fuente ─────────────────────────────────────────────────────────────────────────
if (process.argv.includes('--fuente')) {
  const API = 'https://wiki.warframe.com/api.php';
  const pedidos = new Map();                        // doc → [títulos]
  for (const doc of docs) {
    if (esExento(doc)) continue;
    const t = titulosWiki(doc);
    if (t.length) pedidos.set(doc, t);
  }
  const todos = [...new Set([...pedidos.values()].flat())];

  /** La API acepta hasta 50 títulos por llamada, y **normaliza** los que redirigen. */
  const fecha = new Map();
  for (let i = 0; i < todos.length; i += 50) {
    const lote = todos.slice(i, i + 50);
    const url = `${API}?action=query&format=json&prop=revisions&rvprop=timestamp`
              + `&titles=${lote.map(encodeURIComponent).join('%7C')}`;
    const { query } = await fetch(url).then(r => r.json());
    // `normalized` y `redirects` remapean lo pedido a lo que la wiki realmente devolvió
    const alias = new Map([...(query.normalized ?? []), ...(query.redirects ?? [])]
      .map(({ from, to }) => [from, to]));
    for (const p of Object.values(query.pages)) {
      const ts = p.revisions?.[0]?.timestamp?.slice(0, 10);
      if (ts) fecha.set(p.title, ts);
    }
    for (const t of lote) {
      let cur = t, hop = 0;
      while (!fecha.has(cur) && alias.has(cur) && hop++ < 4) cur = alias.get(cur);
      if (fecha.has(cur) && cur !== t) fecha.set(t, fecha.get(cur));
    }
    process.stdout.write(`  ${Math.min(i + 50, todos.length)}/${todos.length}\r`);
  }

  let escritos = 0, faltantes = [];
  for (const [doc, titulos] of pedidos) {
    const fs_ = titulos.map(t => fecha.get(t)).filter(Boolean);
    if (!fs_.length) { faltantes.push(`${rel(doc)} — ${titulos.join(', ')}`); continue; }
    const max = fs_.sort().at(-1);                  // si destila varias páginas, manda la más reciente
    const lines = fs.readFileSync(doc, 'utf8').split('\n');
    const decl = `> Fuente actualizada: ${max}`;
    const i = lines.findIndex(l => /^>\s*Fuente actualizada:/i.test(l));
    if (i !== -1) { if (lines[i] === decl) continue; lines[i] = decl; }
    else {
      const j = lines.findIndex(l => /^>\s*Fuente:/i.test(l));
      if (j === -1) { faltantes.push(`${rel(doc)} — sin campo "> Fuente:"`); continue; }
      lines.splice(j + 1, 0, decl);
    }
    fs.writeFileSync(doc, lines.join('\n'));
    escritos++;
  }
  console.log(`\n✓ ${escritos} documentos con fecha de fuente actualizada`);
  bloque('la wiki no devolvió fecha', faltantes);
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
