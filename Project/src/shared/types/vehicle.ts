import type { BaseItem } from './base';

import type { LivingStats } from './stats';

export type VehicleKind = 'necramech' | 'archwing';

export interface Vehicle extends BaseItem {
  domain: 'vehicle';
  kind: VehicleKind;
  // Módulo de estadísticas normalizado (Supervivencia)
  stats: LivingStats;

  is_prime: boolean;
  tradable: boolean;
  abilities: { unique_name: string }[];
}

