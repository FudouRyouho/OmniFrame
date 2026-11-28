// Derivado de warframe-items/build/objectsort.ts, commit 5056d7f30, MIT. Recortada documentación upstream.
export default <T extends Record<string, unknown>>(obj: T): T => {
  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key as keyof T] = obj[key as keyof T];
      return result;
    }, {} as T);
};
