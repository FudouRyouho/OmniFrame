/**
 * Vocabulario interno del Oracle (D2). Ver `docs/domains/oracle/design/architecture.md`.
 *
 * Tres capas: dispatch (`argv → OracleQuery`) → adquisición (`OracleQuery → AcquiredResult`)
 * → presentación (`AcquiredResult × format → stdout`). Este módulo define los contratos que
 * cruzan esos seams. `AcquiredResult` es la forma NATIVA del motor sin shaping — el seam
 * adquisición↔presentación es donde nacen los contratos que luego se promueven a `@shared`.
 */
import type { SimulationEntity, TraceStep } from '@core/engine/contracts';
import type { CombatMetrics } from '@core/engine/output/combat-metrics';
import type { AbilityEmission } from '@core/engine/resolve/hydration/AbilityRepository';
import type { Vitals } from '@core/engine/simulate/EntityState';
import type { ViewModelContract } from '@shared/view-model';

/** Lente de observación del pipeline. `intention` (salida de B) queda declarada pero no
 *  implementada: requiere exponer la intención hidratada desde `@core` (diferido). */
export const LENSES = ['nodes', 'display', 'metrics', 'trace', 'enemy', 'ability', 'intention'] as const;
export type Lens = (typeof LENSES)[number];

export const FORMATS = ['text', 'json'] as const;
export type Format = (typeof FORMATS)[number];

/** La consulta a C2 (target). Relevante sólo para las lentes que la consumen (`metrics`, `enemy`). */
export interface A2Query {
  enemy: string;
  level: number;
  duration: number;
  /**
   * ¿El target spawnea como Eximus? Mismo campo que `HostileIntent.isEximus` (#38: el escenario
   * pregunta la variante, no el catálogo). ⚠️ Genérico — no cubre las tres excepciones que la wiki
   * declara (Warden/Prosecutor/Archwing Eximus no reciben Overguard, Health extra en su lugar);
   * usarlo contra esos nombres da un número creíble y falso. Ver #50.
   */
  eximus: boolean;
}

/** El comando resuelto — salida de la capa de dispatch, entrada de la de adquisición. */
export interface OracleQuery {
  lens: Lens;
  /** A1: qué se observa. Para lentes de build = nombre de build (`| 'all'`); para `enemy` = nombre del enemigo. */
  subject: string;
  a2: A2Query;
  /** Selector de atributo para la lente `trace`. */
  node: string | null;
  /** `uniqueName` de la ability (clave del override) para la lente `ability`. */
  ability: string | null;
  format: Format;
}

// ─── AcquiredResult: unión discriminada por lente (forma nativa del motor, sin formatear) ───

export interface NodesResult {
  lens: 'nodes';
  builds: { name: string; entities: SimulationEntity[] }[];
}
export interface DisplayResult {
  lens: 'display';
  builds: { name: string; view: ViewModelContract }[];
}
export interface MetricsResult {
  lens: 'metrics';
  build: string;
  weapon: SimulationEntity;
  /** El objetivo tal como el ESCENARIO lo consolidó — la misma entidad que C1 resolvió, no un paralelo. */
  target: SimulationEntity;
  /** Display del catálogo: la entidad lleva su `unique_name`, no el nombre legible. */
  targetName: string;
  /**
   * Nivel del objetivo. Sale de la DECLARACIÓN y no de la entidad: el nivel entra al frame-0 y se
   * consume ahí (`nacer es estar compuesto`), así que el participante resuelto ya no lo lleva encima.
   */
  targetLevel: number;
  metrics: CombatMetrics;
  duration: number;
}
export interface TraceResult {
  lens: 'trace';
  build: string;
  entityId: string;
  node: string;
  steps: TraceStep[];
}
export interface EnemyResult {
  lens: 'enemy';
  query: string;
  level: number;
  entity: SimulationEntity;
  name: string;
  vitals: Vitals;
  dr: number;
  ehp: number;
}

export interface AbilityResult {
  lens: 'ability';
  build: string;
  abilityId: string;
  /** `final/base` de `AVATAR_ADD_ABILITY_STRENGTH` en el build — 1 si el warframe no lleva el nodo. */
  strength: number;
  emissions: AbilityEmission[];
}

export type AcquiredResult = NodesResult | DisplayResult | MetricsResult | TraceResult | EnemyResult | AbilityResult;

/** Error de uso del Oracle (input inválido / sujeto inexistente). El entry lo captura y emite
 *  un mensaje limpio + exit 1, sin stack. Distingue "el usuario se equivocó" de un bug del motor. */
export class OracleError extends Error {}
