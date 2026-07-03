/**
 * @domain Data / Port ("0")
 *
 * El seam de adapter del puerto "0" (OQ-DATA-9): lo ÚNICO que varía por runtime
 * es de dónde se obtiene el JSON crudo. BrowserAdapter=fetch, NodeAdapter=fs.
 * Todo lo demás (cache, merge de overrides, resolución de refs) vive una sola vez
 * sobre este seam, agnóstico al runtime.
 *
 * El composition root inyecta el adapter que corresponde al runtime (main.tsx el
 * de browser; tests/CLI el de Node) — el puerto no sabe en qué runtime corre.
 */
export interface DataSource {
  /**
   * Devuelve el JSON crudo de un dataset por su key (nombre del archivo sin
   * extensión, ej. 'weapons', 'mod-stats.override', 'archon-shards').
   */
  read(key: string): Promise<unknown>;
}
