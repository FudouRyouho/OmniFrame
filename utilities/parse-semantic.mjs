/**
 * parse-semantic.mjs
 * Parsea los archivos references/Semantic/*.md y genera un JSON
 * compatible con ability-stats.override.json (keyed por uniqueName de Lotus).
 *
 * Formato del md:
 *   # WARFRAME — /Lotus/...  (comentario, ignorado por el parser)
 *   ## /Lotus/Powersuits/PowersuitAbilities/GlaiveAbility   ← clave del output
 *   ##! /Lotus/...   ← skip: ya procesado/listo en ability-stats.override.json
 *   ### Subgrupo     ← grupo exclusivo (forma, elemento, mote)
 *   #### AUGMENT     ← grupo no-exclusivo (augment)
 *   Label: valor     ← stat
 *   // comentario    ← ignorado
 *
 * Uso:
 *   node utilities/parse-semantic.mjs
 *   node utilities/parse-semantic.mjs --file Ash.md
 *   node utilities/parse-semantic.mjs --out output.json
 *
 * Salida: { "/Lotus/...": { groups: [...] }, ... }
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, basename } from "path";

const SEMANTIC_DIR = "references/Semantic";
const DEFAULT_OUT  = "references/Semantic/parsed-output.json";

// ── CLI args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const filterFile = args.includes("--file")
  ? args[args.indexOf("--file") + 1]
  : null;
const outPath = args.includes("--out")
  ? args[args.indexOf("--out") + 1]
  : DEFAULT_OUT;

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseValue(raw) {
  return raw.replace(/<[^>]+>/g, "").trim();
}

function extractTags(raw) {
  return raw.match(/<[^>]+>/g) ?? [];
}

function parseNumeric(valueStr) {
  const clean = valueStr.replace(/[^0-9.,\-\s]/g, "").trim();
  if (clean.includes(" - ")) {
    const parts = clean.split(" - ").map(p =>
      parseFloat(p.replace(/\.(?=\d{3})/g, "").replace(",", "."))
    );
    return parts.length === 2 && parts.every(n => !isNaN(n)) ? parts : null;
  }
  const normalized = clean.replace(/\.(?=\d{3})/g, "").replace(",", ".");
  const n = parseFloat(normalized);
  return isNaN(n) ? null : n;
}

function buildLabel(labelName, tags, valStr) {
  const unit = valStr.match(/[^0-9.,\-\s]+$/)?.[0] ?? "";
  const tagStr = tags.length ? tags.join(" ") + " " : "";
  return `${labelName}: ${tagStr}|val1|${unit}`;
}

function buildStatEntry(labelName, rawValue) {
  const tags    = extractTags(rawValue);
  const valStr  = parseValue(rawValue);
  const numeric = parseNumeric(valStr);

  let label;
  if (Array.isArray(numeric)) {
    const tagStr = tags.length ? tags.join(" ") + " " : "";
    const unit   = valStr.match(/[^0-9.,\-\s]+$/)?.[0] ?? "";
    label = `${labelName}: ${tagStr}|val1| - |val2|${unit}`;
  } else {
    label = buildLabel(labelName, tags, valStr);
  }

  const values = Array.isArray(numeric)
    ? [{ baseValue: numeric[0], upgradeBy: "NONE" }, { baseValue: numeric[1], upgradeBy: "NONE" }]
    : [{ baseValue: numeric ?? 0, upgradeBy: "NONE" }];

  return { label, values };
}

// ── Parser principal ──────────────────────────────────────────────────────────

/**
 * Parsea un .md y devuelve un objeto { [uniqueName]: { groups } }
 * Solo incluye entradas con ## (uniqueName completo).
 * Ignora líneas ##! (marcadas como ya procesadas).
 */
function parseFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const lines   = content.split(/\r?\n/);

  const result = {};          // { uniqueName: { groups } }
  let currentKey   = null;    // uniqueName activo
  let currentGroup = null;    // grupo activo { id?, label?, exclusive?, stats[] }
  let skipCurrent  = false;   // true cuando ##! → ignorar hasta el próximo ##

  function pushGroup() {
    if (!currentKey || !currentGroup || skipCurrent) return;
    result[currentKey].groups.push(currentGroup);
    currentGroup = null;
  }

  function startAbility(uniqueName) {
    pushGroup();
    currentKey   = uniqueName;
    skipCurrent  = false;
    result[currentKey] = { groups: [] };
    currentGroup = { stats: [] }; // grupo base
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("//")) continue;
    const clean = line.replace(/\s*\/\/.*$/, "").trim();
    if (!clean) continue;

    // ##! uniqueName → skip
    if (clean.match(/^##!\s+\//)) {
      pushGroup();
      currentKey  = null;
      skipCurrent = true;
      continue;
    }

    // ## /Lotus/... → nueva habilidad
    const abilityMatch = clean.match(/^##\s+(\/Lotus\/[^\s]+)/);
    if (abilityMatch) {
      startAbility(abilityMatch[1]);
      continue;
    }

    // # ... → comentario de warframe, ignorar
    if (clean.match(/^#\s/)) continue;

    // Si no hay clave activa, ignorar
    if (!currentKey || skipCurrent) continue;

    // ### Subgrupo → grupo exclusivo
    const subgroupMatch = clean.match(/^###\s+(.+)$/);
    if (subgroupMatch) {
      pushGroup();
      const label = subgroupMatch[1].trim();
      currentGroup = {
        id: label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        label,
        exclusive: true,
        defaultActive: false,
        stats: [],
      };
      continue;
    }

    // #### AUGMENT → grupo exclusivo (solo uno por habilidad)
    const augmentMatch = clean.match(/^####\s+(.+)$/);
    if (augmentMatch) {
      pushGroup();
      const label = augmentMatch[1].trim();
      currentGroup = {
        id: label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        label,
        exclusive: true,
        defaultActive: false,
        stats: [],
      };
      continue;
    }

    // Label: valor → stat
    const statMatch = clean.match(/^([^:]+):\s*(.+)$/);
    if (statMatch && currentGroup) {
      currentGroup.stats.push(buildStatEntry(statMatch[1].trim(), statMatch[2].trim()));
    }
  }

  pushGroup();
  return result;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const files = readdirSync(SEMANTIC_DIR)
  .filter(f => f.endsWith(".md") && f !== "README.md")
  .filter(f => !filterFile || f === filterFile);

const result   = {};
const warnings = [];
let   total    = 0;

for (const file of files) {
  try {
    const parsed = parseFile(join(SEMANTIC_DIR, file));
    const keys   = Object.keys(parsed);

    if (keys.length === 0) {
      warnings.push(`⚠  ${file} — sin entradas (¿sin uniqueNames?)`);
      continue;
    }

    for (const [key, val] of Object.entries(parsed)) {
      if (result[key]) {
        warnings.push(`⚠  ${file} — clave duplicada: ${key}`);
      }
      result[key] = val;
    }

    console.log(`✓  ${file.padEnd(30)} ${keys.length} habilidad(es)`);
    total += keys.length;
  } catch (e) {
    warnings.push(`✗  ${file} — error: ${e.message}`);
  }
}

if (warnings.length) {
  console.log("\nWarnings:");
  warnings.forEach(w => console.log("  " + w));
}

writeFileSync(outPath, JSON.stringify(result, null, 2), "utf-8");
console.log(`\nTotal: ${total} habilidades → ${outPath}`);
