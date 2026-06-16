/**
 * @domain Data / Adapter (Node)
 *
 * Adapter del puerto "0" para runtimes Node (tests + CLI oráculo): lee los JSON
 * canónicos del filesystem (`public/data`). Hermano de BrowserAdapter (fetch) —
 * ambos implementan DataSource; el composition root inyecta el del runtime.
 * `node:fs` vive SOLO acá: jamás entra al grafo de módulos del browser.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import type { DataSource } from "../DataSource";

const DATA_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../public/data");

export class NodeAdapter implements DataSource {
  async read(key: string): Promise<unknown> {
    const raw = await readFile(resolve(DATA_DIR, `${key}.json`), "utf-8");
    return JSON.parse(raw);
  }
}
