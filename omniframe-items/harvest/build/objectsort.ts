// [omniframe] Copia fiel de warframe-items/build/objectsort.ts (WFCD/warframe-items, commit 5056d7f30, MIT).
// [omniframe] Sin cambios fuera de estas líneas; procedencia y licencia en omniframe-items/THIRD_PARTY_NOTICES.md.
/**
 * Sorting objects by keys
 * https://www.w3docs.com/snippets/javascript/how-to-sort-javascript-object-by-key.html
 * @param obj object to be sorted
 * @returns same as obj but sorted keys
 */
export default <T extends Record<string, unknown>>(obj: T): T => {
  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key as keyof T] = obj[key as keyof T];
      return result;
    }, {} as T);
};
