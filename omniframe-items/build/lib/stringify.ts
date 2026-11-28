// Derivado de warframe-items/build/stringify.ts, commit 5056d7f30, MIT. Recortada documentación upstream.
// El formato de arrays primitivos en una línea proviene de https://gist.github.com/nrkn/c7a89bb7039182314415,
// fuente que cita el archivo de upstream.
import dedupe from './dedupe.ts';
const isPrimitive = (obj: unknown): boolean => !obj || ['string', 'number', 'boolean'].includes(typeof obj);
const isArrayOfPrimitive = (obj: unknown): boolean => Array.isArray(obj) && obj.every(isPrimitive);
const format = (arr: unknown[]): string => `^^^[ ${arr.map((val) => JSON.stringify(val)).join(', ')} ]`;
const replacer = (_key: string, value: unknown): unknown =>
  isArrayOfPrimitive(value) ? format(value as unknown[]) : value;
const expand = (str: string): string =>
  str.replace(/"\^\^\^(\[ .* ])"/g, (_match, a: string) => a.replace(/\\"/g, '"')).replace(/\\\\"/g, "'");
const stringify = (obj: unknown): string => expand(JSON.stringify(Array.isArray(obj) ? dedupe(obj) : obj, replacer, 2));
export default stringify;
