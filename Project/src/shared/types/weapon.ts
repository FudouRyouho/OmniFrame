import type { BaseItem, ItemKind } from './base'
import type { CombatStats } from './stats'

export type WeaponCategory = 'primary' | 'secondary' | 'melee'

export interface Weapon extends BaseItem {
  domain: 'weapon';
  kind: ItemKind; // Generalizado para soportar archguns, sentinel weapons, etc.
  
  description: string;
  product_category?: string;
  is_prime: boolean;
  tradable: boolean;
  
  // Módulo de estadísticas normalizado
  stats: CombatStats;

  // Metadata adicional
  introduced?: string;
  wikia_thumbnail?: string;
  wikia_url?: string;
}

