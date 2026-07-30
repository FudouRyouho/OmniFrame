#!/usr/bin/env node
/**
 * scripts/validate-docs.mjs
 * Validador del corpus `docs/` — convierte en ejecutable lo que hoy es honor-system.
 *
 * Cada check cita la autoridad que lo respalda. No hay política inventada acá:
 * si una regla no está escrita en un contrato, no es ERROR (a lo sumo INFO).
 *
 *   ERROR → violación de una regla escrita. Rompe el exit code.
 *   WARN  → señal derivada de una regla escrita (interpretación mecánica). No rompe.
 *   INFO  → patrón observado sin autoridad en ningún contrato. Solo se reporta.
 *
 * Zero-dep a propósito: corre con `node` pelado, sin instalar nada en el host.
 * Vive en Project/scripts/ por la convención de Project/CLAUDE.md (read-only + reusable),
 * pero su objeto es el repo entero — por eso resuelve rutas desde la raíz, no desde Project/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '../..');
const DOCS = path.join(REPO, 'docs');
const SRC = path.join(REPO, 'Project/src');
const REFS = path.join(REPO, 'references/wiki');

/** docs/CLAUDE.md §Pre-flight 1 — campos obligatorios del frontmatter. */
const CAMPOS = [
  'Estado',
  'Rol',
  'Impacto_ID',
  'Fidelidad_Fisica',
  'Fecha_de_creacion',
  'Fecha_de_actualizacion',
];

/** Retirados: reaparecer = drift, no nostalgia. `Version` salió el 2026-07-17 (git da el dato real). */
const CAMPOS_RETIRADOS = ['Version'];

/** docs/CLAUDE.md §Pre-flight 1 — el contrato meta-agente y los índices no entran al régimen. */
const EXENTOS = new Set(['CLAUDE.md', 'README.md']);

/** doc-map.md §1 — tiers de durabilidad declarables. */
const ESTADOS = new Set(['activo', 'referencia', 'histórico']);

/** docs/CLAUDE.md §Convenio de tamaño — máximo de operativos por dominio funcional. */
const MAX_OPERATIVOS = 3;

const hallazgos = [];
const add = (sev, check, file, msg) =>
  hallazgos.push({ sev, check, file: path.relative(REPO, file), msg });

function walk(dir, ext) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, ext));
    else if (ext.some((x) => e.name.endsWith(x))) out.push(p);
  }
  return out;
}

/**
 * Parser deliberadamente ingenuo: reconoce el estilo real del corpus (`Clave: "valor"`),
 * no YAML completo. Un parser de verdad aceptaría cosas que el corpus no usa y ocultaría
 * inconsistencias de estilo que sí queremos ver.
 */
function frontmatter(texto) {
  const lineas = texto.split('\n');
  if (lineas[0].trim() !== '---') return null;
  const cierre = lineas.indexOf('---', 1);
  if (cierre === -1) return null;
  const campos = {};
  for (const l of lineas.slice(1, cierre)) {
    const m = l.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (m) campos[m[1]] = { crudo: m[2], valor: m[2].trim().replace(/^"|"$/g, '') };
  }
  return campos;
}

// ─────────────────────────────────────────────────────────────────────────────
// Ratchet de changelog-en-doc-vivo (docs/CLAUDE.md §Ruteo #3/#5)
// Un doc es snapshot del presente, no diario. El corpus arrastra ~480 fechas-log
// como deuda: el ratchet no exige purgarlas de un saque — prohíbe que SUBAN. La
// purga baja el techo; `--update-baseline` lo lockea.
// ─────────────────────────────────────────────────────────────────────────────
const BASELINE_PATH = path.join(DOCS, 'governance/docs-date-baseline.json');

/** Cuerpo del doc SIN frontmatter ni bloques de código cercados (ahí una fecha puede ser dato). */
function cuerpo(texto) {
  const lineas = texto.split('\n');
  let start = 0;
  if (lineas[0]?.trim() === '---') {
    const cierre = lineas.indexOf('---', 1);
    if (cierre !== -1) start = cierre + 1;
  }
  return lineas.slice(start).join('\n').replace(/```[\s\S]*?```/g, '');
}

/** Formas AGUDAS nombradas por #5: paréntesis-acumulativo y sello-de-fase-con-fecha/verbo. */
const CHANGELOG_AGUDO = [
  /\((?:Actualizaci[oó]n|Update|Correcci[oó]n|Nota)[^)]*\d{4}-\d{2}/gi, // (Actualización … fecha)
  /\(\s*\d{4}-\d{2}-\d{2}[^)]*:/g,                                       // (fecha: …)
  /Fase\s*\d+[a-z]?\s*\(\s*\d{4}-/gi,                                    // Fase 1b (2026-…
  /\(\s*Fase\s*\d+[a-z]?,?\s*\d{4}-/gi,                                  // (Fase 1b, 2026-…
  /Fase\s*\d+[a-z]?\s+(?:ejecut[oó]|cerr[oó]|valid[oó]|hizo|realiz[oó]|reemplaz[oó])/gi, // Fase 1b ejecutó/cerró…
];

const contarFechas = (cuerpoTxt) => (cuerpoTxt.match(/\d{4}-\d{2}-\d{2}/g) || []).length;
const contarAgudo = (cuerpoTxt) => CHANGELOG_AGUDO.reduce((n, re) => n + (cuerpoTxt.match(re) || []).length, 0);

function cargarBaseline() {
  try { return JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf-8')).archivos || {}; }
  catch { return {}; }
}

// ─────────────────────────────────────────────────────────────────────────────
// Pasada 1 — frontmatter, fidelidad física y links (docs/CLAUDE.md §Pre-flight)
// ─────────────────────────────────────────────────────────────────────────────
const docs = walk(DOCS, ['.md']);
const meta = new Map();

for (const f of docs) {
  const texto = fs.readFileSync(f, 'utf-8');
  const base = path.basename(f);

  if (!EXENTOS.has(base)) {
    const fm = frontmatter(texto);
    if (!fm) {
      add('ERROR', 'frontmatter', f, 'sin frontmatter YAML (docs/CLAUDE.md §Pre-flight 1)');
    } else {
      meta.set(f, fm);
      for (const c of CAMPOS) {
        if (!(c in fm)) add('ERROR', 'frontmatter', f, `falta campo obligatorio \`${c}\``);
      }
      for (const c of CAMPOS_RETIRADOS) {
        if (c in fm) add('ERROR', 'campo-retirado', f, `campo \`${c}\` retirado del contrato (docs/CLAUDE.md §Pre-flight 1)`);
      }

      const est = fm.Estado?.valor;
      if (est && !ESTADOS.has(est)) {
        add('WARN', 'estado', f, `Estado "${est}" fuera del vocabulario de doc-map §1`);
      }

      // docs/CLAUDE.md §Pre-flight 2 — la ruta declarada debe existir.
      const fis = fm.Fidelidad_Fisica?.valor;
      if (fis && !fs.existsSync(path.join(REPO, fis))) {
        add('ERROR', 'fidelidad', f, `Fidelidad_Fisica apunta a ruta inexistente: ${fis}`);
      }

      // El campo fecha es una fecha. Cualquier otra cosa adentro es un log encubierto.
      const fec = fm.Fecha_de_actualizacion?.valor;
      if (fec && !/^\d{4}-\d{2}-\d{2}$/.test(fec)) {
        add('WARN', 'fecha-log', f, `Fecha_de_actualizacion no es una fecha limpia: "${fec}"`);
      }
    }
  }

  // docs/CLAUDE.md §Pre-flight 3 — links internos relativos y resolubles.
  for (const m of texto.matchAll(/\]\(([^)\s]+\.md)(?:#[^)]*)?\)/g)) {
    const href = m[1];
    if (href.startsWith('/')) {
      add('ERROR', 'link-absoluto', f, `link absoluto: ${href} (docs/CLAUDE.md §Pre-flight 3)`);
      continue;
    }
    if (/^https?:/.test(href)) continue;
    if (!fs.existsSync(path.resolve(path.dirname(f), href))) {
      add('ERROR', 'link-roto', f, `link relativo no resuelve: ${href}`);
    }
  }

  // docs/CLAUDE.md §Ruteo regla 4 — la procedencia vive en git, no en un doc vivo.
  const est = meta.get(f)?.Estado?.valor;
  if (est === 'activo' || est === 'referencia') {
    const hashes = [...texto.matchAll(/`([0-9a-f]{7,40})`/g)].map((m) => m[1]);
    if (hashes.length) {
      add('ERROR', 'hash-en-doc-vivo', f, `${hashes.length} hash(es) de commit citados: ${[...new Set(hashes)].join(', ')} (docs/CLAUDE.md §Ruteo regla 4)`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Pasada 2 — @SSoT código→doc (jsdoc-standard.md §Reglas de @SSoT)
// ─────────────────────────────────────────────────────────────────────────────
if (fs.existsSync(SRC)) {
  for (const f of walk(SRC, ['.ts', '.tsx'])) {
    const texto = fs.readFileSync(f, 'utf-8');
    for (const m of texto.matchAll(/@SSoT\s+(.+)/g)) {
      for (const ruta of m[1].matchAll(/[\w./-]+\.md/g)) {
        const p = ruta[0];
        if (!fs.existsSync(path.join(REPO, p))) {
          add('ERROR', 'ssot-roto', f, `@SSoT apunta a doc inexistente: ${p} (jsdoc-standard.md §Reglas de @SSoT)`);
        }
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Pasada 3 — in-degree (doc-map.md §2: archivable ⟺ ningún doc activo lo cita)
// ─────────────────────────────────────────────────────────────────────────────
const corpus = docs.map((f) => ({ f, texto: fs.readFileSync(f, 'utf-8') }));
for (const f of docs) {
  const base = path.basename(f);
  if (EXENTOS.has(base)) continue;
  const citas = corpus.filter((c) => c.f !== f && c.texto.includes(base)).length;
  if (citas === 0) {
    const est = meta.get(f)?.Estado?.valor ?? '?';
    add('WARN', 'huerfano', f, `0 citas entrantes en docs/ — archivable segun doc-map §2 (Estado: ${est})`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Pasada 4 — convenio de tamaño (docs/CLAUDE.md §Convenio de tamaño)
// ─────────────────────────────────────────────────────────────────────────────
const dominios = path.join(DOCS, 'domains');
if (fs.existsSync(dominios)) {
  for (const d of fs.readdirSync(dominios, { withFileTypes: true }).filter((e) => e.isDirectory())) {
    const dir = path.join(dominios, d.name);
    const activos = walk(dir, ['.md'])
      .filter((f) => !EXENTOS.has(path.basename(f)))
      .filter((f) => meta.get(f)?.Estado?.valor === 'activo');
    if (activos.length > MAX_OPERATIVOS) {
      add('WARN', 'tamano-dominio', dir,
        `${activos.length} operativos (max ${MAX_OPERATIVOS}): ${activos.map((f) => path.relative(dir, f)).join(', ')}`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Pasada 6 — corpus `references/wiki/` (references/wiki/README.md · references/CLAUDE.md)
//
// El layout, los raw, las marcas y las fechas los audita `references-layout.mjs`
// (dominio propio, sale a la red con --fuente). Acá van las reglas del corpus que
// ese auditor NO cubre y que sí son del mismo régimen que docs/: links, vocablo y
// encabezado. Sin solapamiento deliberado — dos herramientas, dos objetos.
// ─────────────────────────────────────────────────────────────────────────────

/** README §Encabezado obligatorio. Acepta la variante en negrita (`> **Fuente:**`) que usa el corpus. */
const CAMPOS_REF = ['Estado', 'Rol', 'Fuente de verdad de', 'No usar para', 'Última actualización', 'Fuente', 'Raw'];

/**
 * README §Regla — sin vocablo del proyecto. Sólo lo INEQUÍVOCAMENTE nuestro es ERROR:
 * un `OQ-*` o un `D-N` no existen fuera de este repo. `WEAPON_*`/`AVATAR_*` los nombra
 * la misma regla, pero el corpus los usa como **dato de la wiki** — los módulos Lua de
 * `sources/` los traen literales en `UpgradeTypes`. Ese solapamiento es real y no lo
 * resuelve un regex: va como INFO, que es la casilla para "patrón sin autoridad clara".
 */
const VOCABLO_PROPIO = /\b(OQ-[A-Z]+-\d+|D-\d+|engine v\d+)\b|Project\/src\//g;
const VOCABLO_AMBIGUO = /\b(?:WEAPON|AVATAR)_[A-Z][A-Z_]+\b/g;

/** README §Estructura — `sources/` está declarado FUERA de estas reglas ("excepción declarada"). */
const esFuente = (rel) => rel.split(path.sep).includes('sources');

/** Sin bloques cercados: ahí un link o un token es *ejemplo de la forma*, no un uso. */
const sinCercados = (texto) => texto.replace(/```[\s\S]*?```/g, '');

const REF_BASELINE_PATH = path.join(DOCS, 'governance/references-header-baseline.json');
const cargarRefBaseline = () => {
  try { return JSON.parse(fs.readFileSync(REF_BASELINE_PATH, 'utf-8')).archivos || {}; }
  catch { return {}; }
};

/** Campos faltantes del encabezado, o `null` si el doc está exento. */
function faltantesRef(f, texto) {
  const rel = path.relative(REFS, f);
  if (path.basename(f) === 'README.md' || esFuente(rel)) return null;
  const head = texto.split('\n').slice(0, 16).join('\n');
  return CAMPOS_REF.filter((c) => !new RegExp(`^>\\s*\\*{0,2}${c}`, 'm').test(head));
}

const refs = fs.existsSync(REFS) ? walk(REFS, ['.md']) : [];
const refsCorpus = refs.map((f) => ({ f, texto: fs.readFileSync(f, 'utf-8') }));

if (!process.argv.includes('--update-baseline')) {
  const refBaseline = cargarRefBaseline();
  let refMejoras = 0;

  for (const { f, texto } of refsCorpus) {
    const rel = path.relative(REPO, f);

    // Links relativos resolubles — misma regla que docs/CLAUDE.md §Pre-flight 3,
    // extendida a references/. Un link colgado es un hecho, no una política.
    //
    // Los bloques cercados se descuentan: el README **enseña la forma de la marca**
    // con links de ejemplo que no apuntan a nada. Tratarlos como rotos hace que
    // "arreglarlos" corrompa la documentación de la propia regla — ya pasó una vez.
    for (const m of sinCercados(texto).matchAll(/\]\(([^)\s#]+\.md)(?:#[^)]*)?\)/g)) {
      const href = m[1];
      if (/^https?:/.test(href)) continue;
      if (href.startsWith('/')) {
        add('ERROR', 'ref-link-absoluto', f, `link absoluto: ${href}`);
      } else if (!fs.existsSync(path.resolve(path.dirname(f), href))) {
        add('ERROR', 'ref-link-roto', f, `link relativo no resuelve: ${href}`);
      }
    }

    // Vocablo del proyecto dentro de la wiki local.
    const propio = [...new Set((texto.match(VOCABLO_PROPIO) || []))];
    if (propio.length && path.basename(f) !== 'README.md') {
      add('ERROR', 'ref-vocablo', f, `vocablo del proyecto en wiki/: ${propio.join(', ')} (references/wiki/README.md §Regla — sin vocablo del proyecto)`);
    }
    const ambiguo = [...new Set((texto.match(VOCABLO_AMBIGUO) || []))];
    if (ambiguo.length && !esFuente(path.relative(REFS, f))) {
      add('INFO', 'ref-vocablo-ambiguo', f, `${ambiguo.length} token(s) \`WEAPON_*\`/\`AVATAR_*\`: ${ambiguo.slice(0, 3).join(', ')}${ambiguo.length > 3 ? '…' : ''} — la regla los prohíbe, pero también son nombres internos del juego que la wiki publica. Decidir si la regla se precisa o el uso se acepta.`);
    }

    // Estado dentro del vocabulario de tiers.
    const est = texto.match(/^>\s*\*{0,2}Estado:?\*{0,2}\s*(.+)$/m)?.[1]?.trim().replace(/\*/g, '');
    if (est && !ESTADOS.has(est)) {
      add('WARN', 'ref-estado', f, `Estado "${est}" fuera del vocabulario de doc-map §1`);
    }

    // Encabezado obligatorio — ratchet. 66 documentos legacy lo tienen incompleto:
    // exigirlo de golpe sería inventar una campaña, no validar. Prohibimos que SUBA.
    const faltan = faltantesRef(f, texto);
    if (faltan) {
      const base = refBaseline[rel] ?? 0;
      if (faltan.length > base) {
        add('ERROR', 'ref-encabezado', f, `${faltan.length} campo(s) faltantes (baseline ${base}): ${faltan.join(', ')} (references/wiki/README.md §Encabezado obligatorio)`);
      } else if (faltan.length < base) refMejoras++;
    }
  }

  if (refMejoras) {
    add('INFO', 'ref-ratchet-mejora', REF_BASELINE_PATH, `${refMejoras} archivo(s) por debajo de su baseline — corré \`npm run validate:docs -- --update-baseline\` para lockear el progreso`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Modo --update-baseline — recuenta y lockea el baseline del ratchet. Se corre
// DELIBERADAMENTE tras una purga (bajar el techo) o una adición justificada.
// ─────────────────────────────────────────────────────────────────────────────
if (process.argv.includes('--update-baseline')) {
  const archivos = {};
  for (const { f, texto } of corpus) {
    if (EXENTOS.has(path.basename(f))) continue;
    const c = cuerpo(texto);
    const fecha = contarFechas(c);
    const agudo = contarAgudo(c);
    if (fecha || agudo) archivos[path.relative(REPO, f)] = { fecha, agudo };
  }
  const orden = Object.fromEntries(Object.entries(archivos).sort(([a], [b]) => a.localeCompare(b)));
  const salida = {
    _nota: 'Baseline del ratchet de changelog-en-doc-vivo (docs/CLAUDE.md §Ruteo #3/#5). El conteo por archivo NO puede subir; bajar es progreso. Regenerar SOLO tras purga o adición justificada (tripwire/auditoría). No editar a mano para subir un techo.',
    generado: new Date().toISOString().slice(0, 10),
    archivos: orden,
  };
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(salida, null, 2) + '\n');
  const tot = Object.values(archivos).reduce((a, c) => ({ fecha: a.fecha + c.fecha, agudo: a.agudo + c.agudo }), { fecha: 0, agudo: 0 });
  console.log(`\n✅ Baseline regenerado → ${path.relative(REPO, BASELINE_PATH)}`);
  console.log(`   ${Object.keys(archivos).length} archivos · ${tot.fecha} fechas-log · ${tot.agudo} formas agudas\n`);

  // Ratchet de encabezado de references/ — mismo régimen, archivo aparte.
  const refArchivos = {};
  for (const { f, texto } of refsCorpus) {
    const faltan = faltantesRef(f, texto);
    if (faltan?.length) refArchivos[path.relative(REPO, f)] = faltan.length;
  }
  fs.writeFileSync(REF_BASELINE_PATH, JSON.stringify({
    _nota: 'Baseline del ratchet de encabezado de references/wiki/ (references/wiki/README.md §Encabezado obligatorio). El conteo de campos faltantes por archivo NO puede subir; bajar es progreso. `sources/` y los README están exentos por el propio contrato.',
    generado: new Date().toISOString().slice(0, 10),
    archivos: Object.fromEntries(Object.entries(refArchivos).sort(([a], [b]) => a.localeCompare(b))),
  }, null, 2) + '\n');
  const refTot = Object.values(refArchivos).reduce((a, c) => a + c, 0);
  console.log(`✅ Baseline de references/ → ${path.relative(REPO, REF_BASELINE_PATH)}`);
  console.log(`   ${Object.keys(refArchivos).length} archivos · ${refTot} campos de encabezado faltantes\n`);
  process.exit(0);
}

// ─────────────────────────────────────────────────────────────────────────────
// Pasada 5 — ratchet de changelog (docs/CLAUDE.md §Ruteo #3/#5)
// ─────────────────────────────────────────────────────────────────────────────
{
  const baseline = cargarBaseline();
  let mejoras = 0;
  for (const { f, texto } of corpus) {
    if (EXENTOS.has(path.basename(f))) continue;
    const c = cuerpo(texto);
    const fecha = contarFechas(c);
    const agudo = contarAgudo(c);
    const base = baseline[path.relative(REPO, f)] || { fecha: 0, agudo: 0 };
    if (agudo > base.agudo) {
      add('ERROR', 'changelog-agudo', f, `${agudo} forma(s) de changelog agudo (baseline ${base.agudo}): sello de fase-con-fecha o paréntesis acumulativo — reescribir a presente (docs/CLAUDE.md §Ruteo #5)`);
    }
    if (fecha > base.fecha) {
      add('ERROR', 'fecha-cuerpo-ratchet', f, `${fecha} fechas-log en el cuerpo, +${fecha - base.fecha} sobre el baseline (${base.fecha}) — reescribir a presente; si es tripwire/auditoría legítima, \`--update-baseline\` (docs/CLAUDE.md §Ruteo #3/#5)`);
    }
    if (fecha < base.fecha || agudo < base.agudo) mejoras++;
  }
  if (mejoras) {
    add('INFO', 'ratchet-mejora', BASELINE_PATH, `${mejoras} archivo(s) por debajo de su baseline — corré \`npm run validate:docs -- --update-baseline\` para lockear el progreso`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Modo --iteraciones — reemplaza al viejo campo `Version`: cuántas veces se tocó
// cada doc, contado de git. No driftea porque no se mantiene: es el hecho.
// ─────────────────────────────────────────────────────────────────────────────
if (process.argv.includes('--iteraciones')) {
  const filas = docs.map((f) => {
    const rel = path.relative(REPO, f);
    let n = 0;
    try {
      const out = execFileSync('git', ['log', '--oneline', '--follow', '--', rel], {
        cwd: REPO, encoding: 'utf-8',
      }).trim();
      n = out ? out.split('\n').length : 0;
    } catch {
      n = 0; // sin trackear en git todavía
    }
    return { rel, n, fecha: meta.get(f)?.Fecha_de_actualizacion?.valor ?? '—' };
  });

  filas.sort((a, b) => b.n - a.n);
  console.log('\n📈 Iteraciones por doc (commits que lo tocaron, vía git)\n');
  for (const { rel, n, fecha } of filas) {
    console.log(`  ${String(n).padStart(3)}  ${fecha.padEnd(12)}  ${rel}`);
  }
  console.log('');
  process.exit(0);
}

// ─────────────────────────────────────────────────────────────────────────────
// Reporte
// ─────────────────────────────────────────────────────────────────────────────
const ICONO = { ERROR: '❌', WARN: '⚠️ ', INFO: 'ℹ️ ' };
const orden = ['ERROR', 'WARN', 'INFO'];
const n = (s) => hallazgos.filter((h) => h.sev === s).length;

console.log(`\n🔍 Validación — ${docs.length} docs/ · ${refs.length} references/wiki/\n`);

for (const sev of orden) {
  const grupo = hallazgos.filter((h) => h.sev === sev);
  if (!grupo.length) continue;
  console.log(`${ICONO[sev]} ${sev} (${grupo.length})`);
  const porCheck = {};
  for (const h of grupo) (porCheck[h.check] ??= []).push(h);
  for (const [check, hs] of Object.entries(porCheck)) {
    console.log(`\n  [${check}] ${hs.length}`);
    for (const h of hs) console.log(`    · ${h.file}\n      ${h.msg}`);
  }
  console.log('');
}

console.log('─'.repeat(70));
console.log(`❌ ${n('ERROR')} errores · ⚠️  ${n('WARN')} warnings · ℹ️  ${n('INFO')} informativos`);
if (n('INFO')) {
  console.log('\nℹ️  Los INFO no tienen autoridad en ningún contrato todavía: se reportan');
  console.log('   para decidir si la regla se escribe o el patrón se acepta.');
}
console.log('');

process.exit(n('ERROR') > 0 ? 1 : 0);
