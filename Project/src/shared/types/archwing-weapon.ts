import type { BaseItem } from './base';


import type { CombatStats } from './stats';

export type ArchwingWeaponKind = 'archgun' | 'archmelee';

export interface ArchwingWeapon extends BaseItem {
  domain: 'weapon'; // El dominio sigue siendo arma
  kind: ArchwingWeaponKind;  
  // Módulo de estadísticas normalizado (Combate)
  stats: CombatStats;

  is_prime: boolean;
  tradable: boolean;
}

