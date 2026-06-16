/**
 * @domain Data / Adapter (Browser)
 *
 * Adapter del puerto "0" para el runtime browser: baja los JSON canónicos por
 * fetch lazy desde `/data/` (servido por Vite desde `public/`). Hermano de
 * NodeAdapter (fs) — ambos implementan DataSource; el composition root inyecta
 * el del runtime. Sustituye el import estático previo del engine: saca los datos
 * del bundle (~2.3 MB, OQ-DATA-12).
 */
import type { DataSource } from "../DataSource";

export class BrowserAdapter implements DataSource {
  async read(key: string): Promise<unknown> {
    const res = await fetch(`/data/${key}.json`);
    if (!res.ok) throw new Error(`[BrowserAdapter] fallo al leer ${key}.json (${res.status})`);
    return res.json();
  }
}
