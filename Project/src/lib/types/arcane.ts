// ── Arcane ────────────────────────────────────────────────────────────────────
//
// Invariante del pipeline: solo se generan arcanes con levelStats.length > 0
// (filtro en generate-data.ts). Por eso maxRank es siempre number, nunca null.
//
// `type` preserva el valor raw de warframe-items.
// `category` modela el grupo amplio de compatibilidad derivado desde `type`.
// `compatName` modela la compatibilidad especifica derivada.
// - `null` cuando `raw.type` no existe en la fuente
// - `'unknown'` cuando `raw.type` existe pero la taxonomia derivada aun no lo cubre

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
