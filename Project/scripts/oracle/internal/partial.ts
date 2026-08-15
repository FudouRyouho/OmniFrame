/**
 * Boca de escena parcial (Trabajo 2a): una `Scene` a medias se completa mergeándola
 * sobre `EMPTY_SCENE` (el skeleton canónico compartido con el EnsembleStore). El equivalente,
 * para el CLI, del hook que en la UI mantiene y completa el ensemble — acá es stateless/one-shot.
 * Ver `docs/domains/oracle/design/architecture.md` §2 y §4.
 *
 * Nota de type-erasure: `DeepPartial` es guía de compilación; el JSON externo entra `unknown` y se
 * castea laxo (validación robusta diferida — function-first). El completado lo hace el merge, no el tipo.
 */
import { EMPTY_SCENE, type Scene } from '@shared/types/scene';

export type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

/** Completa un parcial sobre el skeleton canónico. No muta `EMPTY_SCENE`. */
export function sceneFromPartial(patch: DeepPartial<Scene>): Scene {
  return deepMerge(structuredClone(EMPTY_SCENE), patch) as Scene;
}

/** Merge profundo: objetos plano → recursivo; array/primitivo/null del patch → reemplaza; `undefined` → base gana. */
function deepMerge(base: unknown, patch: unknown): unknown {
  if (!isPlainObject(base) || !isPlainObject(patch)) return patch;
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    out[key] = key in base ? deepMerge(base[key], value) : value;
  }
  return out;
}

export function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
