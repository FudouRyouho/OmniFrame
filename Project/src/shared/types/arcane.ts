/**
 * @domain Shared / Types / Arcane
 * @SSoT docs/domains/semantic/damage-types.md
 */
import type { BaseItem } from './base';

export type ArcaneCategory = 'warframe' | 'primary' | 'secondary' | 'melee' | 'amp' | 'operator' | 'unknown'
export type ArcaneCompatName = 'warframe' | 'primary' | 'shotgun' | 'bow' | 'secondary' | 'kitgun' | 'melee' | 'zaw' | 'amp' | 'operator' | 'unknown'

export interface Arcane extends BaseItem {
  kind: 'arcane';
  type: string | null;   // valor raw de warframe-items
  category: ArcaneCategory;
  compatName: ArcaneCompatName | null;
  rarity: string | null;
  tradable: boolean;
  imageName: string;
  maxRank: number;       // garantizado por el filtro levelStats.length > 0 del pipeline
  levelStats: { stats: string[] }[];
}
