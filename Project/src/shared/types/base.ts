/**
 * @domain Shared / Types / Base
 * @SSoT docs/domains/semantic/damage-types.md
 */

import type { Mod } from './mod';
import type { Warframe } from './warframe';
import type { Weapon } from './weapon';

export type Kind = 'warframe' | 'primary' | 'secondary' | 'melee' | 'mod' | 'arcane' | 'companion' | 'archgun' | 'archmelee' | 'necramech' | 'archwing';

export interface BaseItem {
  id: string;
  name: string;
  kind: Kind;
  image: string | null;
  imageName?: string | null;
  uniqueName: string;
  type?: string | null;
  masteryReq: number;
  polarities?: string[];
  tags?: string[];
}

// Type guards

export const isWeapon = (item: BaseItem): item is Weapon =>
  item.kind === 'primary' || item.kind === 'secondary' || item.kind === 'melee';

export const isWarframe = (item: BaseItem): item is Warframe =>
  item.kind === 'warframe';

export const isMod = (item: BaseItem): item is Mod =>
  item.kind === 'mod';
