/**
 * Descarga un módulo Lua de wiki.warframe.com y lo guarda en Docs/wiki-modules/
 *
 * Uso:
 *   node utilities/fetch-wiki-module.mjs <nombre-modulo> <nombre-archivo>
 *
 * Ejemplos:
 *   node utilities/fetch-wiki-module.mjs "Module:Warframes/data"        warframes-data
 *   node utilities/fetch-wiki-module.mjs "Module:Ability/data/stats"    ability-data-stats
 *   node utilities/fetch-wiki-module.mjs "Module:DamageTypes/data"      damage-types-data
 *   node utilities/fetch-wiki-module.mjs "Module:TextIcons"             text-icons
 *
 * Lógica basada en warframe-items/build/wikia/WikiaDataScraper.mjs (getLuaData)
 * Usa ?action=edit para obtener el Lua raw desde el textarea del editor wiki.
 */

import fs from 'fs/promises';
import path from 'path';

const BASE_URL = 'https://wiki.warframe.com/w/';
const OUT_DIR = path.resolve('Docs/wiki-modules');

async function fetchModuleLua(moduleName) {
  const url = `${BASE_URL}${encodeURIComponent(moduleName)}?action=edit`;
  console.log(`Fetching: ${url}`);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);

  const html = await res.text();

  // Extraer contenido del textarea #wpTextbox1 (mismo approach que WikiaDataScraper con cheerio)
  // El textarea puede tener atributos en cualquier orden, usamos regex tolerante
  const match = html.match(/<textarea[^>]+id="wpTextbox1"[^>]*>([\s\S]*?)<\/textarea>/i)
    ?? html.match(/<textarea[^>]+name="wpTextbox1"[^>]*>([\s\S]*?)<\/textarea>/i);

  if (!match) throw new Error('No se encontró #wpTextbox1 — el módulo puede no existir o requiere login');

  // Decodificar entidades HTML básicas que MediaWiki escapa en el textarea
  const lua = match[1]
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");

  if (!lua.trim()) throw new Error('Textarea vacío');
  return lua;
}

async function main() {
  const [, , moduleName, outName] = process.argv;

  if (!moduleName || !outName) {
    console.error('Uso: node utilities/fetch-wiki-module.mjs <nombre-modulo> <nombre-archivo>');
    console.error('Ejemplo: node utilities/fetch-wiki-module.mjs "Module:Warframes/data" warframes-data');
    process.exit(1);
  }

  const lua = await fetchModuleLua(moduleName);
  const outPath = path.join(OUT_DIR, `${outName}.lua`);

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(outPath, lua, 'utf8');

  const lines = lua.split('\n').length;
  const kb = (Buffer.byteLength(lua, 'utf8') / 1024).toFixed(1);
  console.log(`✓ Guardado: ${outPath}`);
  console.log(`  ${lines} líneas / ${kb} KB`);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
