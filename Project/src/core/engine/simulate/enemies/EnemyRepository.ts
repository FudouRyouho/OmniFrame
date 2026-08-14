/**
 * @domain Simulation-v2 / Logic / Combat
 * @status en-desarrollo
 */

import { UNIT_CLASSES, type UnitClass } from "../../contracts/unit-class";

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
   * Qué unidad es, cuando eso cambia qué ley recibe (`contracts/unit-class.ts`). **No lo trae la
   * cosecha**: el wiki declara la regla del Acolyte en su página de mecánica, no en la fila del
   * enemigo, así que el único origen hoy es el override. Ver `SimulationEntity.unit_class`.
   */
  unit_class?: readonly UnitClass[];
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
}

/**
 * Forma del enemigo tal como sale del generador (`public/data/enemies.json`).
 *
 * **Es `EnemyDNA` sin restar nada**, y eso es la novedad: era un `Omit` de tres campos que el
 * contrato exigía y el dato nunca trajo — `health_type`/`armor_type`/`shield_type`, clases per-capa
 * **pre-U36** que dejaron de regir cuando el daño-vs-target pasó a ser por facción (`FACTION_BONUS`).
 * El alias existía **sólo para desmentir al contrato**: ninguna fórmula los leía, `load()` los
 * fabricaba con constantes inertes y el generador no los emitía. Medido antes de cortar: **0
 * apariciones** en `enemies.json` (638 entradas) y **0** en el override.
 *
 * Se conserva el nombre porque nombra un rol distinto —lo que **llega del disco**, antes de curar—
 * aunque hoy la forma coincida: `curateEnemies` produce `RawEnemyEntry[]` y `load()` los registra.
 */
export type RawEnemyEntry = EnemyDNA;

/**
 * Override fino de enemigo, keyed por unique_name. El override es **curación manual: gana sobre lo
 * cosechado**, y para `unit_class` es la única fuente — el wiki declara la regla del Acolyte en su
 * página de mecánica, no en la fila del enemigo.
 */
export type EnemyOverride = Record<string, { base_level?: number; unit_class?: readonly UnitClass[] }>;

/**
 * LA CURACIÓN, APLICADA UNA VEZ Y ANTES DEL REPARTO.
 *
 * Vivía dentro de `load()`, y ahí sólo llegaba a **una** de las dos ramas que consumen el mismo raw:
 * `EnemyRepository` la recibía curada y `ItemRepository.loadEnemies` cruda, así que el override no
 * alcanzaba a la entidad resuelta —que es la que se simula—. Con `enemy-stats.override.json` en `{}`
 * la fuga no movía ningún número; era latente igual que lo era `min(cap, count + 1)`, y se activaba
 * con la primera fila escrita.
 *
 * El seam correcto no era pasarle el override también a la otra rama: es que **curar no es cargar**.
 * La fuente se cura una vez y las dos ramas leen lo mismo. La justificación vieja de la doble carga
 * (*"EnemyRepository lo escala para C2"*) ya era drift: `scale()` no existe más.
 *
 * 🔴 **Una clase desconocida TIRA.** Un valor que ningún `RECEIVER_*` reconoce no rendiría nada y no
 * habría cómo notarlo — el enemigo pelearía con las leyes default y el número sería creíble y falso.
 * Mismo criterio que el `throw` de dos `replace` en `applyDeviations`.
 */
export function curateEnemies(entries: RawEnemyEntry[], overrides: EnemyOverride = {}): RawEnemyEntry[] {
  for (const [uniqueName, o] of Object.entries(overrides)) {
    for (const cls of o.unit_class ?? []) {
      if (!UNIT_CLASSES.includes(cls)) {
        throw new Error(
          `[enemy-override] "${uniqueName}" declara la clase de unidad "${cls}", que no existe. ` +
            `Conocidas: ${UNIT_CLASSES.join(", ")} (contracts/unit-class.ts).`,
        );
      }
    }
  }
  return entries.map((e) => {
    const o = overrides[e.unique_name];
    if (!o) return e;
    return {
      ...e,
      base_level: o.base_level ?? e.base_level,
      ...(o.unit_class ? { unit_class: o.unit_class } : {}),
    };
  });
}

/**
 * Catálogo de enemigos: CARGA Y BÚSQUEDA, nada más.
 *
 * Ya no compone participantes. Tenía un `scale(dna, level)` que orquestaba las primitivas de
 * `formulas/enemy/enemy-scaling` y devolvía un `ScaledEnemy` — un objeto paralelo que C1 nunca veía,
 * del que nacía `EntityState`, y por el que un debuff `ENEMY_*` compuesto en el escenario no llegaba
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
   * Puebla el registro desde el dato **ya curado** (`curateEnemies`). No aplica overrides: hacerlo acá
   * los dejaba fuera de la otra rama que lee el mismo raw — ver `curateEnemies`.
   */
  public static load(entries: RawEnemyEntry[]): void {
    this.registry.clear();
    for (const e of entries) {
      this.register({ ...e, base_level: e.base_level ?? 1 });
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
