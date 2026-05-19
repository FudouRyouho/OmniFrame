/**
 * @domain Shared / Types / Mod
 * @SSoT docs/domains/semantic/damage-types.md
 */

import type { BaseItem } from './base'

import type { ModStats } from './stats'

export type ModCategory =
  | 'warframe' | 'primary' | 'secondary' | 'melee' | 'companion'
  | 'archgun' | 'archmelee' | 'archwing'
  | 'focus' | 'railjack' | 'necramech' | 'kdrive' | 'parazon'
  | 'tektolyst' | 'modset' | 'transmutation' | 'peculiar' | 'riven'
  | 'unknown';

export type ModClass = 'Primed' | 'Galvanized' | 'Archon' | 'Amalgam' | 'Riven';

export interface Mod extends BaseItem {
  domain: 'mod';
  kind: 'mod';
  
  description: string;
  
  // Módulo de estadísticas normalizado
  stats: ModStats;

  category_raw: string | null;
  compat_name?: string | null;
  polarity?: string | null;
  rarity?: string | null;
  introduced?: string | null;
  wikia_thumbnail?: string | null;
  wikia_url?: string | null;
  is_exilus?: boolean;
  is_flawed?: boolean;
  mod_class?: ModClass;
  is_weapon_augment?: boolean;
  incompatible?: string[];
  incompatibility_tags?: string[];
}

