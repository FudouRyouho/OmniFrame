/**
 * Bootstrap de datos del engine — ahora detrás del seam del puerto "0" (DataSource).
 *
 * `loadEngineData(source)` es agnóstico al runtime: recibe el adapter inyectado
 * (NodeAdapter en tests/CLI, StaticAdapter/BrowserAdapter en main.tsx) y NO importa
 * ninguno concreto — así `node:fs` nunca entra al grafo del browser. Lee los 7
 * datasets por el seam y los entrega a `DataLoader.init` (que sigue síncrono).
 *
 * Ubicación provisional (`fixtures/` mezcla bootstrap + intenciones) — ver OQ-ENGINE-9.
 * Unificar esta carga con la del display (DataRegistry) es Slice 3 de la Fase 1:
 * hoy ambos lados bajan los JSON por separado.
 */
import type { DataSource } from "@shared/data/DataSource";
import { DataLoader } from "../resolve/hydration/DataLoader";

/** Carga la data real del juego en los repositorios vía el adapter. Idempotente. */
export async function loadEngineData(source: DataSource): Promise<void> {
  if (DataLoader.isReady()) return;

  const [weapons, warframes, modOverrides, weaponStats, incarnon, arcaneOverrides, archonShards] =
    await Promise.all([
      source.read("weapons"),
      source.read("warframes"),
      source.read("mod-stats.override"),
      source.read("weapon-stats.override"),
      source.read("incarnon-evolutions.override"),
      source.read("arcane-stats.override"),
      source.read("archon-shards"),
    ]);

  DataLoader.init({
    weapons:               weapons as DataSourceInput["weapons"],
    warframes:             warframes as DataSourceInput["warframes"],
    modOverrides:          modOverrides as DataSourceInput["modOverrides"],
    weaponAttackOverrides: weaponStats as DataSourceInput["weaponAttackOverrides"],
    incarnon:              incarnon as DataSourceInput["incarnon"],
    arcaneOverrides:       arcaneOverrides as DataSourceInput["arcaneOverrides"],
    archonShards:          archonShards as DataSourceInput["archonShards"],
  });
}

// Alias local del input de DataLoader: el seam devuelve `unknown`, acá se afirma la
// forma que `DataLoader.init` espera (los JSON son dato canónico verificado).
type DataSourceInput = Parameters<typeof DataLoader.init>[0];
