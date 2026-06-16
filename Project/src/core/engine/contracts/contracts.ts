/**
 * @domain Engine / Contracts
 *
 * Cortes de frontera (DTOs) entre capas: entrada A1, gemelo B,
 * intención A2, salida C y salida C→D.
 */

import type { ItemDomain, ItemKind, ItemFamily } from '@shared/types/base';
import type { EntityId, AttributeId, AttributeNode, GameLaws } from './primitives';

export interface SimulationEntity {
  id: EntityId;
  unique_name: string;
  channel?: string; // EnsembleChannel name ('warframe' | 'primary' | 'secondary' | 'melee' | ...)

  // Taxonomía (Sincronizada con SSoT)
  domain: ItemDomain;
  kind: ItemKind;
  family?: ItemFamily;

  persistence: 'PE' | 'TE'; // Pure Entity | Transient Entity
  tags: string[];
  attributes: Record<AttributeId, AttributeNode>;
  behaviors: string[];
  innate_dna?: MutatedDNA;
}

export interface MutatedDNA {
  entity_id: EntityId;
  domain: ItemDomain;
  kind: ItemKind;
  family?: ItemFamily;
  tags: string[];
  profiles: Record<string, Record<AttributeId, number>>; // 'base', 'alt', 'incarnon'
  behaviors: string[];
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

export interface AuditStep {
  pass: number;
  source: string;
  operation: string;
  impact: number;
  resulting_value: number;
  condition_met?: boolean;
  context_value?: number;
}

export interface AuditResponse {
  entity_id: EntityId;
  attribute_id: AttributeId;
  trace: AuditStep[];
}

export interface Ensemble {
  warframe: {
    id: string;
    rank: number;
    slots: Record<number, { mod_id?: string; level?: number }>;
    shards: { type: string; stat: string; is_tau?: boolean }[];
    arcanes?: Record<number, { arcane_id: string; rank: number }>;
    helminth?: { ability_id: string; slot: number };
  };
  weapons: {
    primary?: WeaponIntent;
    secondary?: WeaponIntent;
    melee?: WeaponIntent;
  };
  focus?: { school_id: string; nodes: string[] };
}

export interface WeaponIntent {
  id: string;
  slots: Record<number, { mod_id?: string; level?: number }>;
  active_profile_id: string;
  evolution_perks?: Record<number, string>;
  arcanes?: Record<number, { arcane_id: string; rank: number }>;
}
