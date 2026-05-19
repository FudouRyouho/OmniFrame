/**
 * @domain Shared / Types / Arcane
 * @SSoT docs/domains/semantic/damage-types.md
 */
import type { BaseItem } from './base';

export type ArcaneCategory = 'warframe' | 'primary' | 'secondary' | 'melee' | 'amp' | 'operator' | 'unknown'
export type ArcaneCompatName = 'warframe' | 'primary' | 'shotgun' | 'bow' | 'secondary' | 'kitgun' | 'melee' | 'zaw' | 'amp' | 'operator' | 'unknown'

export interface Arcane extends BaseItem {
  kind: 'arcane';
  type: string | null;
  category: ArcaneCategory;
  compat_name: ArcaneCompatName | null;
  rarity: string | null;
  tradable: boolean;
  image_name: string;
  max_rank: number;
  level_stats: { stats: string[] }[];
}
