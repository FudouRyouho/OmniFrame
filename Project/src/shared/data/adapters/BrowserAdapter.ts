/**
 * @domain Data / Adapter (Browser)
 *
 * Adapter del puerto "0" para el runtime browser: baja los JSON canónicos por
 * fetch lazy desde `/data/` (servido por Vite desde `public/`). Hermano de
 * NodeAdapter (fs) — ambos implementan DataSource; el composition root inyecta
 * el del runtime. Sustituye el import estático previo del engine: saca los datos
 * del bundle (~2.3 MB, OQ-DATA-12).
 *
 * Cachea por key (la promesa, no el valor → dedup también de requests en vuelo):
 * la instancia compartida `browserSource` hace que display (DataRegistry) y engine
 * bajen cada archivo UNA sola vez (mata el doble-fetch — Slice 3 de la Fase 1).
 */
import type { DataSource } from "../DataSource";

export class BrowserAdapter implements DataSource {
  private cache = new Map<string, Promise<unknown>>();

  read(key: string): Promise<unknown> {
    let pending = this.cache.get(key);
    if (!pending) {
      pending = this.fetchJson(key);
      this.cache.set(key, pending);
    }
    return pending;
  }

  private async fetchJson(key: string): Promise<unknown> {
    const res = await fetch(`/data/${key}.json`);
    if (!res.ok) throw new Error(`[BrowserAdapter] fallo al leer ${key}.json (${res.status})`);
    return res.json();
  }
}

/**
 * Instancia compartida del puerto en el browser: un solo load+cache para los dos
 * consumidores (display vía DataRegistry, engine vía loadEngineData). La comparten
 * por importarla del mismo módulo — así los 4 archivos comunes se bajan una vez.
 */
export const browserSource = new BrowserAdapter();
