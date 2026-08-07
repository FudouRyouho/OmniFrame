/**
 * @domain Engine / Contracts
 *
 * Cortes de frontera (DTOs) entre capas: entrada A1, gemelo B,
 * intención A2, salida C y salida C→D.
 */

import type { ItemDomain, ItemKind, ItemFamily } from '@shared/types/base';
import type { CoBehavior } from '@shared/types/modifier';
import type { DamageType } from '@shared/types';
import type { EntityId, AttributeId, AttributeNode, GameLaws } from './primitives';

export type { CoBehavior };

export interface SimulationEntity {
  id: EntityId;
  unique_name: string;
  channel?: string; // EquipmentChannel name ('warframe' | 'primary' | 'secondary' | 'melee' | ...)

  // Taxonomía (Sincronizada con SSoT) — SÓLO para participantes que son ítems del arsenal.
  // Un enemigo no tiene ninguna de las tres: no está en el vocabulario `ItemDomain` y no debería
  // estarlo (agregar 'enemy' ahí sería declarar que un enemigo es un ítem del pipeline).
  domain?: ItemDomain;
  kind?: ItemKind;
  family?: ItemFamily;

  persistence: 'PE' | 'TE'; // Pure Entity | Transient Entity
  tags: string[];
  /**
   * Marcas de ruteo — **a qué destinos responde** la entidad, no qué es. Distinto de `tags`, que
   * arrastra la taxonomía del ítem (`[domain, kind, family, …]`) y por eso sólo puede contestar
   * "qué es esto"; una marca la puede portar cualquier participante, venga o no del loadout.
   *
   * POR QUÉ EXISTE. `resolveFamilyEntities` ruteaba por `domain`: un buff `AVATAR_*` alcanzaba a
   * `domain === 'warframe'` y nada más. Un compañero, un specter o un objetivo de defensa nunca
   * podrían recibirlo — no por una decisión, sino porque no son ítems del loadout. El ruteo
   * preguntaba *qué es* la entidad cuando la pregunta del juego es *a quién alcanza* el efecto.
   */
  routes?: string[];
  attributes: Record<AttributeId, AttributeNode>;
  // Ruteo CO/GunCO YA RESUELTO al perfil activo de ESTA entidad (StaticHydrator lo baja
  // de innate_dna.co_behavior[perfil]). El motor lo consume directo — no vuelve a mirar el
  // perfil ni un active_profile_id global (que es único para toda la sim y no modela el
  // perfil por-arma). Ausente = gap. Ver arch-decisions §9.
  co_behavior?: CoBehavior;
  innate_dna?: MutatedDNA;
  /**
   * Enriquecimiento C1→C2 para el escalado de DoT (`simulation-architecture §2.0.1`;
   * `references/wiki/mechanics/status-effects.md §Procs de tipo DoT` + `ingame-tests/dot-scaling.md`).
   * El DoT NO escala con el daño COMPUESTO (que incluye mods de elemento) sino con el **base innato ×
   * base-damage-mods**; y el `own_element` sale de los mods del propio elemento. Ambos se pierden al
   * componer (`DamageCombiner` los descarta) — C1 los preserva acá para que C2 no los reconstruya.
   */
  dot_scaling?: {
    /** Σ del daño innato (pre-combine, pre-Serration). × serrationMult = `modded_base` del DoT. */
    innateBaseTotal: number;
    /** Σ % de mods del propio elemento por tipo (Hellfire→heat). Físicos NO cuentan; Slash → ausente. */
    ownElementBonusPct: Partial<Record<DamageType, number>>;
  };
}

export interface MutatedDNA {
  entity_id: EntityId;
  /** Ver `SimulationEntity.domain`: sólo los participantes que son ítems del arsenal la tienen. */
  domain?: ItemDomain;
  kind?: ItemKind;
  family?: ItemFamily;
  tags: string[];
  profiles: Record<string, Record<AttributeId, number>>; // 'base', 'alt', 'incarnon'
  // Keyed por profile_name (igual que profiles) — el behavior es por-ataque, no por-arma.
  // Ausencia de entrada = gap: sin clasificar, el engine NO asume adding. Espejo cualitativo
  // de profiles (que es cuantitativo). Reemplaza el muerto `behaviors: string[]` (engine v1,
  // prototipo prematuro de CO con la granularidad y el tipo inversos — purgado 2026-07-03).
  co_behavior?: Record<string, CoBehavior>;
}

export interface SimulationContext {
  active_profile_id: string; // 'base' | 'alt' | 'incarnon'
  flags: Record<string, boolean>;
  variables: Record<string, number>;
  laws: GameLaws;
  target?: {
    id: string;
    attributes: Record<string, number>;
  };
}

export interface TraceStep {
  pass: number;
  source: string;
  operation: string;
  impact: number;
  resulting_value: number;
  condition_met?: boolean;
  context_value?: number;
}

export interface TraceResponse {
  entity_id: EntityId;
  attribute_id: AttributeId;
  trace: TraceStep[];
}

export interface Ensemble {
  warframe: {
    id: string;
    rank: number;
    slots: Record<number, { mod_id?: string; level?: number }>;
    shards: { type: string; stat: string; is_tau?: boolean }[];
    arcanes?: Record<number, { arcane_id: string; rank: number }>;
    abilities?: { ability_id: string; rank?: number }[]; // habilidades activas (muta-state, arch §15)
    helminth?: { ability_id: string; slot: number };
  };
  weapons: {
    primary?: WeaponIntent;
    secondary?: WeaponIntent;
    melee?: WeaponIntent;
  };
  /**
   * Participante que NO es pieza del loadout de armas. Ranura propia y no un cuarto `weapons.*`
   * porque el discriminador no es el slot sino qué recibe: un compañero porta la marca `avatar`
   * (armadura, salud) y no la de arma. Ver `space.ts` y `channel-routing.ts`.
   */
  companion?: { id: string; slots: Record<number, { mod_id?: string; level?: number }> };
  /**
   * El grupo **Hostil**, como participantes del espacio — no como parámetros del cálculo. El `level`
   * viaja con cada uno porque es suyo: compone su frame-0, no lo modifica después.
   */
  hostiles?: { id: string; level: number }[];
  focus?: { school_id: string; nodes: string[] };
}

export interface WeaponIntent {
  id: string;
  slots: Record<number, { mod_id?: string; level?: number }>;
  active_profile_id: string;
  evolution_perks?: Record<number, string>;
  arcanes?: Record<number, { arcane_id: string; rank: number }>;
}
