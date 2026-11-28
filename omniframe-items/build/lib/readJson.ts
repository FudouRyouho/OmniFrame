// Derivado de warframe-items/build/readJson.ts, commit 5056d7f30, MIT. Sin recortes funcionales.
import fs from 'node:fs/promises';
const jsonCache = new Map<string, unknown>();
export default async <T = unknown>(jsonURL: URL): Promise<T> => {
  const { pathname } = jsonURL;
  if (!jsonCache.has(pathname)) {
    jsonCache.set(pathname, JSON.parse(await fs.readFile(jsonURL, { encoding: 'utf-8' })));
  }
  return jsonCache.get(pathname) as T;
};
