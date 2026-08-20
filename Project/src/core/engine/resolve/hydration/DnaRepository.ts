import type { MutatedDNA } from "../../contracts";
import { ItemRepository } from "./ItemRepository";

/**
 * Punto de entrada canónico para resolución de DNA de entidades.
 * Capa de indirección sobre ItemRepository — punto de extensión para
 * mutaciones futuras (Helminth, Archon Shards en Capa B).
 */
export class DnaRepository {
  /**
   * `level`/`isEximus`: la parte de la intención que compone el frame-0 — sólo la declara el grupo
   * Hostil.
   */
  public static findByUniqueName(unique_name: string, level?: number, isEximus?: boolean): MutatedDNA | null {
    return ItemRepository.getDNA(unique_name, level, isEximus);
  }
}

