/**
 * generate-enemies.mjs — generador reproducible de `public/data/enemies.json`.
 *
 * SSoT del enemigo = `omniframe-items` (export del juego vía @wfcd/items + re-cosecha del
 * `Module:Enemies/data/<facción>` del wiki, mergeada por NOMBRE). Corre en host (node plano,
 * sin Docker); refrescar la cosecha wiki = `npm run build` en `omniframe-items/`.
 *
 * Normalización:
 *   KEEP:  uniqueName→unique_name, name, health, shield→shields, armor, faction (cascada ↓),
 *          baseLevel→base_level, eximusHealth→eximus_health, multis→weakpoints[].
 *   DROP:  regionBits, imageName, category, tradable, drops, patchlogs, description,
 *          wikiInternalName (trazabilidad de la cosecha, no dato de dominio), wikiType (taxonomía
 *          de rol del wiki: candidato al filtro de entidades, sin consumidor), y el
 *          health/armor/shield de la cosecha (existen para censar el conflicto de fuente, no para
 *          emitirse — ver schema §7), resistances (COMPLETO). `resistances` = modelo per-clase pre-U36 (era muerta); los
 *          `*_type` que derivaba también quedaron deprecados — desde U36 el daño-vs-target es
 *          por FACCIÓN (ver FACTION_BONUS + enemy-resistances.md). Por eso NO se emiten
 *          `health_type/armor_type/shield_type`.
 *
 * FACCIÓN — cascada (OQ-DATA-15). El `type` del export mezcla ejes: para 33 enemigos es la
 * categoría de arma o el rol de IA (`Lancer` → "Rifle", `Prod Crewman` → "Melee"), lo que los
 * manda a la curva default en vez de la suya. Orden de verdad, **validando cada nivel por
 * separado** (un candidato inválido no consume el turno: el wiki también trae basura):
 *   1. `faction` del export       — el propio export lo trae cuando `type` está contaminado.
 *   2. `wikiFaction` (cosecha)    — `General.Faction`, la única fuente con SUBFACCIONES
 *      (Kuva Grineer, Corpus Amalgam, Infested Deimos, The Murmur) que `FACTION_BONUS` keyea.
 *   3. `type` si es una facción válida — el caso normal (Grineer/Corpus/…).
 *   4. `Unaffiliated` — default documentado del wiki. Cae acá la fauna sin match (Kuaka,
 *      Condroc, Sawgaw…) y los roles-de-IA sueltos: entidades que el proyecto no modela.
 *
 * WEAKPOINTS — `Multis` del wiki ("Head: 3.0x") parseado a `{part, multiplier}`. Parseo
 * ESTRICTO del patrón canónico: lo que no matchea se descarta y se reporta (censo visible al
 * final). Los descartes reales son (a) vacío/`None` = sin weakpoint, (b) `"Thruster: ?"` =
 * valor desconocido en el wiki, (c) entradas que NO son multiplicador de daño
 * ("Head: +2 Crit Tier, 3x Critical Damage" — ese 3x es crit damage). Parsear (c) como
 * multiplicador sería peor que no traerlo: gap del data-set, ver schema.
 *
 * Uso: `node scripts/generate-enemies.mjs` (desde Project/).
 */
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import Items from 'omniframe-items';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../public/data/enemies.json');

// @wfcd usa "Infestation"; el vocabulario canónico (factions.md + matriz) usa "Infested". El resto
// pasa literal (Orokin se mantiene Orokin — NO se aliasa a Corrupted).
const FACTION_ALIAS = { Infestation: 'Infested' };

// Facciones reconocidas (docs/semantic/factions.md) — incluye SUBFACCIONES: son facciones propias,
// no etiquetas (Kuva Grineer comparte vulnerabilidades con Grineer pero resiste Heat), y
// `FACTION_BONUS` ya las keyea. Agruparlas para el escalado es trabajo de la LEY
// (`enemy-scaling.ts`), no del dato. Lo que no está acá NO es facción: es categoría de arma, rol
// de IA o basura del wiki (`?`, `Unknown`, `Objects`) → el candidato se descarta y sigue la cascada.
const VALID_FACTIONS = new Set([
  'Grineer', 'Kuva Grineer',
  'Corpus', 'Corpus Amalgam',
  'Infested', 'Infested Deimos',
  'Orokin', 'Sentient', 'Stalker',
  'Narmer', 'The Murmur', 'Techrot', 'Scaldra', 'Anarchs', 'Unaffiliated',
]);

// `Murmur` → `The Murmur` (canónico de FACTION_BONUS). NO se aliasa `Anarch` (3 entradas) a
// `Anarchs` (26): parece el mismo label mal escrito, pero las 3 son Specters y no hay evidencia de
// que sean la misma facción — sin verificar, el candidato se descarta y la cascada sigue.
const WIKI_FACTION_ALIAS = { Murmur: 'The Murmur' };

/** `"Head: 3.0x"` → `{ part: 'Head', multiplier: 3 }`. Tolera `3.0` sin `x` y `Body:3x` sin espacio. */
const MULTI_RE = /^(.+?)\s*:\s*([0-9]+(?:\.[0-9]+)?)x?$/;

const dropped = [];

function toWeakpoints(multis, name) {
  if (!Array.isArray(multis)) return undefined;
  const out = [];
  for (const raw of multis) {
    const s = String(raw).trim();
    if (!s || s === 'None') continue; // sin weakpoint: no es descarte, es ausencia.
    const m = MULTI_RE.exec(s);
    if (!m) {
      dropped.push(`${name} · ${s}`);
      continue;
    }
    out.push({ part: m[1].trim(), multiplier: Number(m[2]) });
  }
  return out.length ? out : undefined;
}

/** Cascada de §FACCIÓN: cada nivel se valida por separado; un candidato inválido no consume el turno. */
function resolveFaction(e) {
  const wiki = WIKI_FACTION_ALIAS[e.wikiFaction] ?? FACTION_ALIAS[e.wikiFaction] ?? e.wikiFaction;
  for (const candidate of [e.faction, wiki, FACTION_ALIAS[e.type] ?? e.type]) {
    if (candidate && VALID_FACTIONS.has(candidate)) return candidate;
  }
  return 'Unaffiliated';
}

const enemies = new Items()
  .filter((e) => e.category === 'Enemy' && e.uniqueName && typeof e.health === 'number')
  .map((e) => {
    const entry = {
      unique_name: e.uniqueName,
      name: e.name ?? null,
      faction: resolveFaction(e),
      base_level: e.baseLevel ?? 1,
      health: e.health,
      armor: e.armor ?? 0,
      shields: e.shield ?? 0,
    };
    if (typeof e.eximusHealth === 'number') entry.eximus_health = e.eximusHealth;
    const weakpoints = toWeakpoints(e.multis, e.name);
    if (weakpoints) entry.weakpoints = weakpoints;
    return entry;
  });

await writeFile(OUT, JSON.stringify(enemies, null, 2) + '\n');

// Resumen para estresar el transform.
const byFaction = {};
for (const e of enemies) byFaction[e.faction] = (byFaction[e.faction] ?? 0) + 1;
const enriched = enemies.filter((e) => e.base_level > 1 || e.eximus_health || e.weakpoints).length;
console.log(`✓ enemies.json — ${enemies.length} enemigos → ${OUT}`);
console.log('Facciones:', JSON.stringify(byFaction));
console.log(`Cosecha wiki aplicada a ${enriched} · weakpoints: ${enemies.filter((e) => e.weakpoints).length}`);
console.log(`Multis descartados (no parseables): ${dropped.length}`);
for (const d of dropped) console.log(`  · ${d}`);
console.log('Muestra (Arid Butcher):', JSON.stringify(enemies.find((e) => e.unique_name.includes('BladeSawman')), null, 1));
