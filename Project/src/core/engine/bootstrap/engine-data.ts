/**
 * Bootstrap de datos del engine — detrás del seam del puerto "0" (DataSource).
 *
 * `loadEngineData(source)` es agnóstico al runtime: recibe el adapter inyectado
 * (NodeAdapter en tests/CLI, BrowserAdapter en main.tsx) y NO importa ninguno
 * concreto — así `node:fs` nunca entra al grafo del browser. Lee los
 * datasets por el seam y los entrega a `DataLoader.init` (que sigue síncrono).
 *
 * Vive en `bootstrap/` (Fase 2, Slice E) — separado de `fixtures/`, que ahora
 * solo aloja `builds.ts` (catálogo de intenciones).
 */
import type { DataSource } from "@shared/data/DataSource";
import { DataLoader } from "../resolve/hydration/DataLoader";

/** Carga la data real del juego en los repositorios vía el adapter. Idempotente. */
export async function loadEngineData(source: DataSource): Promise<void> {
  if (DataLoader.isReady()) return;

  const [weapons, warframes, companions, modOverrides, weaponStats, incarnon, arcaneOverrides, abilityOverrides, archonShards, enemies, enemyOverrides] =
    await Promise.all([
      source.read("weapons"),
      source.read("warframes"),
      source.read("companions"),
      source.read("mod-stats.override"),
      source.read("weapon-stats.override"),
      source.read("incarnon-evolutions.override"),
      source.read("arcane-stats.override"),
      source.read("ability-stats.override"),
      source.read("archon-shards"),
      source.read("enemies"),
      source.read("enemy-stats.override"),
    ]);

  DataLoader.init({
    weapons:               weapons as DataSourceInput["weapons"],
    warframes:             warframes as DataSourceInput["warframes"],
    companions:            companions as DataSourceInput["companions"],
    modOverrides:          modOverrides as DataSourceInput["modOverrides"],
    weaponAttackOverrides: weaponStats as DataSourceInput["weaponAttackOverrides"],
    incarnon:              incarnon as DataSourceInput["incarnon"],
    arcaneOverrides:       arcaneOverrides as DataSourceInput["arcaneOverrides"],
    abilityOverrides:      abilityOverrides as DataSourceInput["abilityOverrides"],
    archonShards:          archonShards as DataSourceInput["archonShards"],
    enemies:               enemies as DataSourceInput["enemies"],
    enemyOverrides:        enemyOverrides as DataSourceInput["enemyOverrides"],
  });
}

// Alias local del input de DataLoader: el seam devuelve `unknown`, acá se afirma la
// forma que `DataLoader.init` espera (los JSON son dato canónico verificado).
type DataSourceInput = Parameters<typeof DataLoader.init>[0];
