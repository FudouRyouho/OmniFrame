/**
 * @domain Data / Adapter (estático — PROVISIONAL)
 *
 * Adapter del puerto "0" que sirve los JSON por import estático (el comportamiento
 * previo del engine, ahora detrás del seam DataSource). Browser-safe; los JSON ya
 * están en el bundle, así que `read()` resuelve de inmediato.
 *
 * PROVISIONAL: lo reemplaza BrowserAdapter (fetch lazy) en el Slice 2 de la Fase 1,
 * que saca los datos del bundle (~2.3 MB, OQ-DATA-12). Existe para que el Slice 1
 * sea un refactor de comportamiento-cero en el browser (el seam, sin tocar la carga).
 */
import weaponsData     from "../../../../public/data/weapons.json";
import warframesData   from "../../../../public/data/warframes.json";
import modOverrides    from "../../../../public/data/mod-stats.override.json";
import weaponStats     from "../../../../public/data/weapon-stats.override.json";
import incarnon        from "../../../../public/data/incarnon-evolutions.override.json";
import arcaneOverrides from "../../../../public/data/arcane-stats.override.json";
import archonShards    from "../../../../public/data/archon-shards.json";
import type { DataSource } from "../DataSource";

const DATA: Record<string, unknown> = {
  "weapons":                     weaponsData,
  "warframes":                   warframesData,
  "mod-stats.override":          modOverrides,
  "weapon-stats.override":       weaponStats,
  "incarnon-evolutions.override": incarnon,
  "arcane-stats.override":       arcaneOverrides,
  "archon-shards":               archonShards,
};

export class StaticAdapter implements DataSource {
  async read(key: string): Promise<unknown> {
    const data = DATA[key];
    if (data === undefined) throw new Error(`[StaticAdapter] dataset desconocido: ${key}`);
    return data;
  }
}
