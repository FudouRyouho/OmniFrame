// ── Companion ─────────────────────────────────────────────────────────────────

import type { BaseItem } from './base';

export type CompanionCategory = 'Pets' | 'Sentinels';

export interface Companion extends BaseItem {
  kind: 'companion';
  description: string;
  imageName: string;
  category: CompanionCategory;
  health: number | null;
  shield: number | null;
  armor: number | null;
  isPrime: boolean;
  tradable: boolean;
}
