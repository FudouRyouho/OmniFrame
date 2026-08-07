/**
 * @domain Simulation-v2 / Logic / Combat
 * @status en-desarrollo
 */

export type HealthType = "Health" | "Flesh" | "ClonedFlesh" | "Fossilized" | "Robotic" | "Infested" | "InfestedFlesh" | "InfestedSinew" | "Machinery";
export type ArmorType = "None" | "FerriteArmor" | "AlloyArmor";
export type ShieldType = "None" | "Shields" | "ProtoShield";

/**
 * Punto débil de un enemigo: multiplicador de daño por parte del cuerpo (`Multis` del wiki,
 * "Head: 3.0x"). **Sin consumidor todavía** — el engine no modela headshots; se emite porque es
 * dato real del juego (el schema es fidelidad, no engine). Ver `docs/data/schemas/enemy/schema.md`.
 */
export interface Weakpoint {
  part: string;
  multiplier: number;
}

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
  /**
   * Facción canónica (`docs/semantic/factions.md`), resuelta en cascada por el generador
   * (export → wiki → `type` → `Unaffiliated`): keyea el scaling y `FACTION_BONUS`. Ya NO llega
   * contaminada con categorías de arma / roles de IA (`OQ-DATA-15`); lo que no es facción real
   * cae a `Unaffiliated` explícito.
   */
  faction: string;
  /** Health de la variante Eximus (cosecha wiki). Sin consumidor todavía; fidelidad del dato. */
  eximus_health?: number;
  /** Multiplicadores por parte. Sin consumidor todavía; fidelidad del dato. */
  weakpoints?: Weakpoint[];
  /**
   * @deprecated Clases per-capa **pre-U36** — ya no rigen (daño-vs-target = por facción, ver
   * `FACTION_BONUS`). El generador **NO las emite**; `load()` las rellena con **defaults inertes**
   * (`'Health'`/`'None'`/`'None'`). `resolveHit` ya resuelve la matriz③ por facción (`targetFactionMult`,
   * checkpoint-1) y **NO lee estos campos** → son un **sunset candidato del contrato** (separado del de
   * `DAMAGE_EFFICIENCY`, ya purgado): borrarlos toca `EnemyDNA` + `enemies.json` + `load()`.
   */
  health_type: HealthType;
  armor_type: ArmorType;
  shield_type: ShieldType;
}

/**
 * Forma del enemigo tal como sale del generador (`public/data/enemies.json`): EnemyDNA MENOS los
 * `*_type` deprecados (ver arriba), que `load()` rellena con defaults inertes. `base_level` YA
 * viene en el dato (cosecha wiki vía omniframe-items) — dejó de ser un seam.
 */
export type RawEnemyEntry = Omit<EnemyDNA, 'health_type' | 'armor_type' | 'shield_type'>;

/**
 * Override fino de enemigo (hoy sólo `base_level`; keyed por unique_name). Sembrado, casi vacío.
 * El override es curación manual: **gana** sobre el `base_level` cosechado.
 */
export type EnemyOverride = Record<string, { base_level?: number }>;

/**
 * Catálogo de enemigos: CARGA Y BÚSQUEDA, nada más.
 *
 * Ya no compone participantes. Tenía un `scale(dna, level)` que orquestaba las primitivas de
 * `formulas/enemy/enemy-scaling` y devolvía un `ScaledEnemy` — un objeto paralelo que C1 nunca veía,
 * del que nacía `EnemyState`, y por el que un debuff `ENEMY_*` compuesto en el escenario no llegaba
 * al daño. Esa composición vive ahora en el frame-0 (`ItemRepository.normalizeEnemy`) y el estado
 * nace de la entidad resuelta (`simulation-architecture.md` §El escenario consolidado).
 *
 * Lo que queda —`load` y `find`— es lo que este repositorio siempre fue: encontrar un enemigo por su
 * clave canónica o por su nombre display. Buscar no es componer.
 */
export class EnemyRepository {
  private static registry: Map<string, EnemyDNA> = new Map();

  public static register(dna: EnemyDNA) {
    this.registry.set(dna.unique_name, dna);
  }

  /**
   * Puebla el registro desde el dato normalizado (`enemies.json`). El `base_level` viene en el
   * dato; el override sólo lo pisa donde cura a mano. Reemplaza el `register()` de los fixtures.
   */
  public static load(entries: RawEnemyEntry[], overrides: EnemyOverride = {}): void {
    this.registry.clear();
    for (const e of entries) {
      this.register({
        ...e,
        base_level: overrides[e.unique_name]?.base_level ?? e.base_level ?? 1,
        // Defaults inertes de los `*_type` deprecados (ver EnemyDNA): `resolveHit` ya usa la matriz③ por
        // facción (`targetFactionMult`) y no lee estos campos. Sunset candidato del contrato (ver EnemyDNA).
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
}
