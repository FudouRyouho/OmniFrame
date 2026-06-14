/**
 * @domain ViewModelContract — cut C→D (salida del motor, display-only / C1)
 *
 * Contrato consumer-shaped que la Capa D consume: la "hoja del arsenal" (qué
 * vale cada atributo). Presentation-neutral — lleva el token + el valor crudo +
 * la unidad por separado; la label y el nombre se componen en el borde vía
 * `lib/i18n`, y el formateo (ej. "47.0%") lo hace `lib/*`. NO es pasamanos
 * (no re-exporta el AttributeNode) ni pre-formateado (no hornea strings).
 *
 * `project()` es z2: función pura, React-free, compartida por D1 (UI) y D2 (CLI).
 *
 * Deuda liviana (deliberada): `project()` importa `type SimulationEntity` de
 * `@core` (solo el tipo → erased en runtime, sin ciclo `@core ↔ @shared`). El
 * smell direccional vive aquí por simplicidad hasta nombrar la capa z2 real.
 * Ver `docs/governance/open-questions.md` (OQ-ENGINE-FUTURE / OQ-ENGINE-8).
 */
import type { SimulationEntity } from '@core/engine/contracts';
import type { ItemDomain, ItemKind, ItemFamily } from '@shared/types/base';
import { getPresentationMeta } from '@lib/presentation/attribute-registry';

export interface StatViewModel {
  /** Token del atributo (ej. `WEAPON_CRIT_CHANCE`). La label la compone i18n en el borde. */
  id: string;
  /** Valor resuelto, crudo. El formateo (toFixed, etc.) vive en `lib/*`. */
  value: number;
  unit: '%' | 'x' | 's' | '';
  category?: 'primary' | 'offensive' | 'utility' | 'elemental';
}

export interface EntityViewModel {
  /** EntityId del motor (clave estable; la usa `consume().weapon(id)`). */
  id: string;
  /** Canal del ensemble — lookup estable para la UI ('warframe' | 'primary' | …). */
  channel?: string;
  /** Token de identidad (path del juego). El nombre legible lo resuelve i18n/data en el borde. */
  unique_name: string;
  domain: ItemDomain;
  kind: ItemKind;
  family?: ItemFamily;
  stats: StatViewModel[];
}

export interface ViewModelContract {
  entities: EntityViewModel[];
}

/**
 * Proyecta la salida nativa de C (`snapshot(): SimulationEntity[]`) al contrato
 * de display. Pura y total: tira los 6 buckets internos del nodo y queda el
 * `final` + unidad + categoría por entidad. [D-7 Fase 4] unit/category ya NO viajan
 * en el nodo (el engine es puro) — se adjuntan acá por lookup keyed en el token,
 * vía `lib/presentation`. La label sigue siendo del borde (i18n), no del contrato.
 */
export function project(snapshot: SimulationEntity[]): ViewModelContract {
  return {
    entities: snapshot.map((entity) => ({
      id: entity.id,
      channel: entity.channel,
      unique_name: entity.unique_name,
      domain: entity.domain,
      kind: entity.kind,
      family: entity.family,
      stats: Object.entries(entity.attributes).map(([id, node]) => {
        const meta = getPresentationMeta(id);
        return {
          id,
          value: node.final,
          unit: meta.unit,
          category: meta.category,
        };
      }),
    })),
  };
}
