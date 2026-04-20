/**
 * @domain Shared / Types / Mod
 * @SSoT docs/domains/semantic/damage-types.md
 */

import type { BaseItem } from './base'

export type ModCategory =
  | 'warframe' | 'primary' | 'secondary' | 'melee' | 'companion'
  | 'archgun' | 'archmelee' | 'archwing'
  | 'focus' | 'railjack' | 'necramech' | 'kdrive' | 'parazon'
  | 'tektolyst' | 'modset' | 'transmutation' | 'peculiar' | 'riven'
  | 'unknown';

export type ModClass = 'Primed' | 'Galvanized' | 'Archon' | 'Amalgam' | 'Riven';

export type UpgradeType = string;

export type ModModifier = UpgradeType;

export interface Mod extends BaseItem {
  kind: 'mod';
  description: string;
  imageName: string;
  baseDrain: number | null;
  rank: number | null;
  levelStats: Array<{ stats: string[] }> | null;
  categoryRaw: string | null;
  category: ModCategory;
  compatName?: string | null;
  polarity?: string | null;
  rarity?: string | null;
  type?: string | null;
  introduced?: string | null;
  wikiaThumbnail?: string | null;
  wikiaUrl?: string | null;
  upgradeTypes: UpgradeType[];
  isExilus?: boolean;
  isFlawed?: boolean;
  modClass?: ModClass;
  isWeaponAugment?: boolean;
  incompatible?: string[];
  incompatibilityTags?: string[];
  misc?: unknown[];
}
