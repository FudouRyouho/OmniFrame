/**
 * Dev script: Extract ability stats.
 * Lee el warframes.json actual y extrae un JSON con:
 * { "ability_uniqueName": [...] }
 * Lo guarda en Project/data/ability-stats.json
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.resolve(__dirname, '../public/data/warframes.json');
const outPath = path.resolve(__dirname, '../data/ability-stats.json');

async function extract() {
  try {
    const data = await fs.readFile(inputPath, 'utf-8');
    const warframes = JSON.parse(data);

    const statsDb = {};

    for (const w of warframes) {
      if (w.abilities) {
        for (const a of w.abilities) {
          if (a.stats && a.stats.length > 0) {
            statsDb[a.uniqueName] = a.stats;
          }
        }
      }
    }

    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, JSON.stringify(statsDb, null, 2), 'utf-8');
    console.log(`✓ Extraídos stats de ${Object.keys(statsDb).length} habilidades.`);
    console.log(`✓ Guardado en: ${outPath}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

extract();
