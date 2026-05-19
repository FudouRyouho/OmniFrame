/**
 * @domain Shared / Types / Warframe
 * @SSoT docs/domains/semantic/damage-types.md
 */
import type { BaseItem } from './base'
import type { Ability } from './ability'

export type WarframeCategory = 'warframe' | 'archwing' | 'necramech' | 'operator';

import type { LivingStats } from './stats'

export interface Warframe extends BaseItem {
  domain: 'warframe';
  kind: 'warframe';
  
  description: string;
  
  // Módulo de estadísticas normalizado (Supervivencia)
  stats: LivingStats;

  passive_description?: string;
  passive?: string | { name: string, description: string };
  abilities: Ability[];
  aura?: string;
  sex?: string;
  introduced?: string;
  wikia_thumbnail?: string;
  wikia_url?: string;
  is_prime: boolean;
  max_rank?: number;
  playstyle?: string[];
  progenitor?: string;
  subsumed?: string;
  themes?: string;
  tactical?: string;
}

