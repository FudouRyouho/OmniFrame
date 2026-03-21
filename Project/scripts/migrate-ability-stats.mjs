/**
 * migrate-ability-stats.mjs
 *
 * Migra ability-stats.json del schema legacy al nuevo schema con groups[].
 *
 * Schema legacy:
 *   { name, description, icon, stats: AbilityStat[] }
 *   AbilityStat: { label?, mode?, stats: Stat[], misc: Misc[] }
 *   Stat: { value, modifier, maxCap?, minCap?, helminthValues? }
 *
 * Schema nuevo:
 *   { name, description, icon, groups: AbilityGroup[] }
 *   AbilityGroup: { id?, label?, defaultActive?, exclusive?, stats: AbilityStatNew[] }
 *   AbilityStatNew: { label, values: AbilityStatValue[] }
 *   AbilityStatValue: { baseValue, upgradeBy, upgradeType?, cap?, capMin?, helminthBase?, inverse? }
 *
 * Reglas de migración:
 * - Todos los stats van a un único grupo base (sin id)
 * - modifier → upgradeBy con mapeo de nombres cortos a canónicos
 * - value → baseValue
 * - maxCap → cap
 * - minCap → capMin
 * - helminthValues[0] → helminthBase
 * - mode → se descarta (era un separador visual, no semántico)
 * - misc → se descarta si vacío (era siempre vacío en el 99% de los casos)
 *   Si misc tiene contenido, se preserva como comentario en el label
 * - stats[] vacíos (separadores de sección) → se descartan
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const MODIFIER_MAP = {
  STRENGTH:     "AVATAR_ABILITY_STRENGTH",
  RANGE:        "AVATAR_ABILITY_RANGE",
  DURATION:     "AVATAR_ABILITY_DURATION",
  EFFICIENCY:   "AVATAR_ABILITY_EFFICIENCY",
  ENERGY_DRAIN: "ENERGY_DRAIN",
  NONE:         "NONE",
  // Por si acaso ya están en formato canónico
  AVATAR_ABILITY_STRENGTH:   "AVATAR_ABILITY_STRENGTH",
  AVATAR_ABILITY_RANGE:      "AVATAR_ABILITY_RANGE",
  AVATAR_ABILITY_DURATION:   "AVATAR_ABILITY_DURATION",
  AVATAR_ABILITY_EFFICIENCY: "AVATAR_ABILITY_EFFICIENCY",
};

// EFFICIENCY en el schema legacy era el coste de activación — mapea a ENERGY_COST
// ENERGY_DRAIN era el drain por segundo — se mantiene
function mapModifier(modifier) {
  if (!modifier) return "NONE";
  // EFFICIENCY como coste de activación → ENERGY_COST
  if (modifier === "EFFICIENCY" || modifier === "AVATAR_ABILITY_EFFICIENCY") {
    return "ENERGY_COST";
  }
  return MODIFIER_MAP[modifier] ?? modifier;
}

function migrateStat(legacyStat) {
  // Stat vacío (separador de sección) — descartar
  if (!legacyStat.stats || legacyStat.stats.length === 0) {
    if (!legacyStat.label || legacyStat.label.trim() === "") return null;
    // Tiene label pero no stats — era un header de sección, descartar
    return null;
  }

  // Construir values[] desde stats[]
  const values = legacyStat.stats.map((v) => {
    const val = {
      baseValue: v.value ?? 0,
      upgradeBy: mapModifier(v.modifier),
    };
    if (v.maxCap !== undefined && v.maxCap !== null && !isNaN(v.maxCap)) {
      val.cap = v.maxCap;
    }
    if (v.minCap !== undefined && v.minCap !== null && !isNaN(v.minCap)) {
      val.capMin = v.minCap;
    }
    if (v.helminthValues && v.helminthValues.length > 0) {
      val.helminthBase = v.helminthValues[0];
    }
    return val;
  });

  const newStat = {
    label: legacyStat.label ?? "",
    values,
  };

  return newStat;
}

function migrateEntry(legacy) {
  if (!legacy) return null;

  // Migrar stats[] al grupo base
  const rawStats = legacy.stats ?? [];
  const migratedStats = rawStats
    .map(migrateStat)
    .filter(Boolean);

  // Si no hay stats, igual creamos la entrada con grupo vacío
  const baseGroup = { stats: migratedStats };

  return {
    name: legacy.name ?? "",
    description: legacy.description ?? "",
    icon: legacy.icon ?? "",
    groups: [baseGroup],
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

const inputPath  = join(ROOT, "public/data/ability-stats.json");
const outputPath = join(ROOT, "public/data/ability-stats.json");

console.log("Reading ability-stats.json...");
const raw = JSON.parse(readFileSync(inputPath, "utf-8"));

let migrated = 0;
let skipped = 0;
const output = {};

for (const [uniqueName, entry] of Object.entries(raw)) {
  const result = migrateEntry(entry);
  if (result) {
    output[uniqueName] = result;
    migrated++;
  } else {
    skipped++;
  }
}

writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");

console.log(`Done. Migrated: ${migrated}, Skipped: ${skipped}`);
console.log(`Output: ${outputPath}`);

// Verificación rápida
const sample = Object.entries(output).slice(0, 2);
console.log("\nSample output:");
sample.forEach(([k, v]) => {
  console.log(`\n${k}:`);
  console.log(JSON.stringify(v, null, 2).slice(0, 400) + "...");
});
