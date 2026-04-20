// ── ArchwingWeapon ────────────────────────────────────────────────────────────

import type { BaseItem } from './base';
import type { DamageMap, WeaponAttack } from './damage';

export type ArchwingWeaponCategory = 'Arch-Gun' | 'Arch-Melee';

export interface ArchwingWeapon extends BaseItem {
  kind: 'archgun' | 'archmelee';
  description: string;
  imageName: string;
  category: ArchwingWeaponCategory;
  masteryReq: number;
  isPrime: boolean;
  tradable: boolean;
  damage: DamageMap;
  totalDamage: number;
  criticalChance: number;
  criticalMultiplier: number;
  procChance: number;
  attacks: WeaponAttack[];
}
