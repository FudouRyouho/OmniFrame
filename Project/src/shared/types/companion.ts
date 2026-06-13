import type { BaseItem } from './base';

import type { LivingStats } from './stats';
import type { Weapon } from './weapon';

export type CompanionCategory = 'sentinel' | 'pet' | 'hound' | 'moa';

export interface Companion extends BaseItem {
  domain: 'companion';
  kind: CompanionCategory;
  // Módulo de estadísticas normalizado (Supervivencia)
  stats: LivingStats;

  is_prime: boolean;
  tradable: boolean;
  introduced?: string;
  wikia_thumbnail?: string;
  wikia_url?: string;
}

/**
 * Interfaz para armas de Compañero (Sentinels, Hounds, etc.)
 */
export interface CompanionWeapon extends Weapon {
  kind: 'sentinel' | 'hound' | 'moa'; // Especialización funcional
}

