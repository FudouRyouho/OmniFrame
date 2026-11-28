// [omniframe] Copia fiel de warframe-items/build/sleep.ts (WFCD/warframe-items, commit 5056d7f30, MIT).
// [omniframe] Sin cambios fuera de estas líneas; procedencia y licencia en omniframe-items/THIRD_PARTY_NOTICES.md.
/**
 * Simple sleep function that returns a promise that resolves after a given number of milliseconds
 * @param ms Milliseconds to sleep
 * @returns Promise that resolves after the given number of milliseconds
 */
export default (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
