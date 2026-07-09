/**
 * generate-enemies.mjs — generador reproducible de `public/data/enemies.json`.
 *
 * SSoT del enemigo = el submódulo `warframe-items` (dato crudo de WFCD). El paquete npm
 * `@wfcd/items` NO expone enemigos (sólo curó ítems crafteables), así que este generador
 * lee el submódulo directo. Sin dependencias (node plano) → corre en host sin Docker.
 *
 * Normalización (Fase 1, 2026-07-08):
 *   KEEP:  uniqueName→unique_name, name, health, shield→shields, armor, type→faction
 *   DROP:  regionBits, imageName, category, tradable, drops, patchlogs, resistances (COMPLETO).
 *          `resistances` = modelo per-clase pre-U36 (era muerta); los `*_type` que derivaba también
 *          quedaron deprecados — desde U36 el daño-vs-target es por FACCIÓN (ver FACTION_BONUS +
 *          enemy-resistances.md). Por eso NO se emiten `health_type/armor_type/shield_type`.
 *   SEAM:  base_level NO se emite (no está en @wfcd) → lo aplica EnemyRepository.load (override ?? 1).
 *
 * Facción → vocabulario canónico (semantic/factions.md: raw, "Orokin" NO "Corrupted").
 * Uso: `node scripts/generate-enemies.mjs` (desde Project/).
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, '../../warframe-items/data/json/Enemy.json');
const OUT = resolve(__dirname, '../public/data/enemies.json');

// @wfcd usa "Infestation"; el vocabulario canónico (factions.md + matriz) usa "Infested". El resto
// pasa literal (Orokin se mantiene Orokin — NO se aliasa a Corrupted).
const FACTION_ALIAS = { Infestation: 'Infested' };

const raw = JSON.parse(await readFile(SRC, 'utf-8'));

const enemies = raw
  .filter((e) => e.uniqueName && typeof e.health === 'number')
  .map((e) => ({
    unique_name: e.uniqueName,
    name: e.name ?? null,
    faction: FACTION_ALIAS[e.type] ?? e.type ?? 'Grineer',
    health: e.health,
    armor: e.armor ?? 0,
    shields: e.shield ?? 0,
  }));

await writeFile(OUT, JSON.stringify(enemies, null, 2) + '\n');

// Resumen para estresar el transform.
const byFaction = {};
for (const e of enemies) byFaction[e.faction] = (byFaction[e.faction] ?? 0) + 1;
console.log(`✓ enemies.json — ${enemies.length} enemigos → ${OUT}`);
console.log('Facciones:', JSON.stringify(byFaction));
console.log('Muestra (Arid Butcher):', JSON.stringify(enemies.find((e) => e.unique_name.includes('BladeSawman')), null, 1));
