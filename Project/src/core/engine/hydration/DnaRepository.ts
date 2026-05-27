import type { MutatedDNA } from "../contracts";
import { ItemRepository } from "./ItemRepository";

/**
 * Punto de entrada canónico para resolución de DNA de entidades.
 * Capa de indirección sobre ItemRepository — punto de extensión para
 * mutaciones futuras (Helminth, Archon Shards en Capa B).
 */
export class DnaRepository {
  public static findByUniqueName(unique_name: string): MutatedDNA | null {
    return ItemRepository.getDNA(unique_name);
  }
}

