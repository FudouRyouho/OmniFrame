import type { MutatedDNA } from "../contracts";
import { ItemRepository } from "./ItemRepository";

/**
 * Repositorio que gestiona el ADN (Blueprint técnico) de las entidades.
 * Centraliza el acceso entre stubs manuales y el dataset real.
 */
export class DnaRepository {
  private static registry: Map<string, MutatedDNA> = new Map();

  /**
   * Registra un DNA para pruebas o stubs.
   */
  public static register(dna: MutatedDNA): void {
    this.registry.set(dna.entity_id, dna);
  }

  /**
   * Busca el ADN base mutado para un nombre único.
   * Prioridad: Registro manual (Stubs) > ItemRepository (Dataset Real).
   */
  public static findByUniqueName(unique_name: string): MutatedDNA | null {
    // 1. Intentar búsqueda directa en el registro manual
    const registered = this.registry.get(unique_name);
    if (registered) return registered;

    // 2. Intentar búsqueda simplificada (para compatibilidad con stubs cortos)
    const short_id = unique_name.split('/').pop() || unique_name;
    const short_registered = this.registry.get(short_id);
    if (short_registered) return short_registered;

    // 3. Fallback al dataset real
    return ItemRepository.getDNA(unique_name);
  }
}

