// ── Arcane ────────────────────────────────────────────────────────────────────
//
// Invariante del pipeline: solo se generan arcanes con levelStats.length > 0
// (filtro en generate-data.mjs). Por eso maxRank es siempre number, nunca null.
//
// `type` puede ser null en la fuente (arcanes sin clasificacion en warframe-items).
// `entity` puede ser 'unknown' cuando type no mapea a ninguna entidad del Layout.

import type { BaseItem } from './base';

export interface Arcane extends BaseItem {
  kind: 'arcane';
  type: string | null;   // null cuando raw.type no existe en la fuente
  entity: string;        // 'unknown' | 'warframe' | 'primary' | 'secondary' | 'melee' | 'amp' | 'operator' | etc.
  rarity: string | null;
  tradable: boolean;
  imageName: string;
  maxRank: number;       // garantizado por el filtro levelStats.length > 0 del pipeline
  levelStats: { stats: string[] }[];
}
