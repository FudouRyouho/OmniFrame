/**
 * @domain Simulation-v2 / Contracts
 */

import type { ItemDomain, ItemKind, ItemFamily } from '../../../../shared/types/base';

export type EntityId = string;
export type AttributeId = string;

export interface AttributeNode {
  base: number;
  // Accumulators (Per Pass)
  base_flat: number;      
  base_add_pct: number;   
  mods_add_pct: number;   
  total_flat: number;     
  multiplicative: number; 
  // Result
  final: number;
  // Presentation Metadata
  label?: string;
  category?: 'primary' | 'offensive' | 'utility' | 'elemental';
  unit?: '%' | 'x' | 's' | '';
}

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

export interface EnemyStatusState {
  damage_corrosive: number;
  damage_viral: number;
  damage_heat: number;
  damage_magnetic: number;
}

export type ItemTag = string;

export interface Modifier {
  id: string;
  source_id?: string;
  target_entity: EntityId;
  target_attribute: AttributeId;
  source_attribute?: AttributeId; // For cross-attribute scaling
  operation: "ADD" | "SET" | "ADD_FLAT" | "BASE_FLAT" | "BASE_ADD_PCT" | "CONTEXT_SCALE" | "MULTIPLICATIVE";
  value: number;
  condition?: string;
  context_variable?: string;
}

export interface GameLaws {
  corrosive_max_stacks: number;
  corrosive_initial_strip: number;
  corrosive_stack_strip: number;
  status_max_stacks: number;
  status_initial_bonus: number;
  status_stack_bonus: number;
}

export const BASELINE_GAME_LAWS: GameLaws = {
  corrosive_max_stacks: 10,
  corrosive_initial_strip: 26,
  corrosive_stack_strip: 6,
  status_max_stacks: 10,
  status_initial_bonus: 100, // +100% Viral/Mag (2.0x)
  status_stack_bonus: 25     // +25% por stack extra
};

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

// UI Projection Layers
export interface ProjectionSnapshot {
  timestamp: number;
  entities: Record<EntityId, Record<AttributeId, number>>;
  metrics: {
    ttk?: number;
    effective_dps?: number;
    status_weights: Record<string, number>;
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
}
