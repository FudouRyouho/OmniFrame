// Derivado de warframe-items/build/dedupe.ts, commit 5056d7f30, MIT. Recortada documentación upstream.
import objectsort from './objectsort.ts';
export default <T>(iter: T[] | T): T[] | T => {
  if (!Array.isArray(iter)) return iter;
  const seen = new Set<string>();
  const result: T[] = [];
  for (const curr of iter) {
    const normalized = typeof curr === 'object' && curr !== null ? objectsort(curr as Record<string, unknown>) : curr;
    const key = JSON.stringify(normalized);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(curr);
    }
  }
  return result;
};
