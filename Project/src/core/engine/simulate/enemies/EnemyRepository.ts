/**
 * @domain Simulation-v2 / Logic / Combat
 * @status en-desarrollo
 */

import { scaleHealth, scaleArmor, scaleShields } from '../../formulas/enemy/enemy-scaling';

export type HealthType = "Health" | "Flesh" | "ClonedFlesh" | "Fossilized" | "Robotic" | "Infested" | "InfestedFlesh" | "InfestedSinew" | "Machinery";
export type ArmorType = "None" | "FerriteArmor" | "AlloyArmor";
export type ShieldType = "None" | "Shields" | "ProtoShield";

/**
 * ADN de un Enemigo básico.
 */
export interface EnemyDNA {
  unique_name: string;
  name?: string;
  base_level: number;
  health: number;
  armor: number;
  shields: number;
  faction: string;
  /**
   * @deprecated Clases per-capa **pre-U36** — ya no rigen (daño-vs-target = por facción, ver
   * `FACTION_BONUS`). El generador **NO las emite**; `load()` las rellena con **defaults inertes**
   * (`'Health'`/`'None'`/`'None'`) que no matchean ninguna clave de `DAMAGE_EFFICIENCY` → el legacy
   * `resolveHit` los resuelve a 0 (modelo muerto inerte, correcto post-U36) SIN necesidad de tocarlo.
   * Se eliminan del contrato cuando `resolveHit` se reconcilie a facción (deferido, C2).
   */
  health_type: HealthType;
  armor_type: ArmorType;
  shield_type: ShieldType;
}

/**
 * Forma del enemigo tal como sale del generador (`public/data/enemies.json`): EnemyDNA MENOS el
 * `base_level` (seam, no viene de @wfcd) y MENOS los `*_type` deprecados (ver arriba). `load()`
 * completa ambos.
 */
export type RawEnemyEntry = Omit<EnemyDNA, 'base_level' | 'health_type' | 'armor_type' | 'shield_type'>;

/** Override fino de enemigo (hoy sólo `base_level`; keyed por unique_name). Sembrado, casi vacío. */
export type EnemyOverride = Record<string, { base_level?: number }>;

/**
 * Estado escalado de un enemigo en un nivel específico.
 */
export interface ScaledEnemy {
  dna: EnemyDNA;
  current_level: number;
  current_health: number;
  current_armor: number;
  current_shields: number;
}

/**
 * Repositorio de Enemigos Estáticos (Similares a warframe-items).
 */
export class EnemyRepository {
  private static registry: Map<string, EnemyDNA> = new Map();

  public static register(dna: EnemyDNA) {
    this.registry.set(dna.unique_name, dna);
  }

  /**
   * Puebla el registro desde el dato normalizado (`enemies.json`), inyectando el `base_level`
   * del override (`??1`, seam de Fase 1). Reemplaza el `register()` a mano de los fixtures.
   */
  public static load(entries: RawEnemyEntry[], overrides: EnemyOverride = {}): void {
    this.registry.clear();
    for (const e of entries) {
      this.register({
        ...e,
        base_level: overrides[e.unique_name]?.base_level ?? 1,
        // Defaults inertes de los `*_type` deprecados (ver EnemyDNA): no matchean DAMAGE_EFFICIENCY
        // → el legacy resolveHit los resuelve a 0. Se quitan al reconciliar resolveHit a facción.
        health_type: 'Health',
        armor_type: 'None',
        shield_type: 'None',
      });
    }
  }

  /** Busca por unique_name canónico o, como conveniencia, por `name` display (case-insensitive). */
  public static find(name: string): EnemyDNA | null {
    const byId = this.registry.get(name);
    if (byId) return byId;
    const lower = name.toLowerCase();
    for (const dna of this.registry.values()) {
      if (dna.name?.toLowerCase() === lower) return dna;
    }
    return null;
  }

  /**
   * Escala un enemigo por la curva-S real (post Update 27.2, `enemy-level-scaling.md`). Orquesta las
   * primitivas puras de `formulas/enemy/enemy-scaling` (health/shields por facción; armor cap/floor)
   * contra los campos de la entidad; la matemática vive en la fórmula, aquí solo la composición.
   */
  public static scale(dna: EnemyDNA, level: number): ScaledEnemy {
    const dx = Math.max(0, level - dna.base_level);
    return {
      dna,
      current_level: level,
      current_health: scaleHealth(dna.health, dna.faction, dx),
      current_armor: scaleArmor(dna.armor, dx),
      current_shields: scaleShields(dna.shields, dna.faction, dx),
    };
  }
}
