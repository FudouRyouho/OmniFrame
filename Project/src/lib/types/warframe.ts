// ── Warframe ──────────────────────────────────────────────────────────────────

import type { BaseItem } from './base'
import type { Ability } from './ability'

export interface Warframe extends BaseItem {
  kind: 'warframe';
  description: string;
  imageName: string;
  health: number;
  shield: number;
  armor: number;
  power: number;
  sprintSpeed: number;
  passiveDescription?: string;
  passive?: string | { name: string, description: string }; // Pointer to passives.json or hydrated object
  abilities: Ability[];
  aura?: string;
  sex?: string;
  introduced?: string;
  wikiaThumbnail?: string;
  wikiaUrl?: string;
  isPrime: boolean;
  // Stats from Module:Warframes/data
  energy?: number;
  initialEnergy?: number;
  healthRank30?: number;
  shieldRank30?: number;
  armorRank30?: number;
  energyRank30?: number;
  maxRank?: number;
  category?: 'Warframes' | 'Archwings' | 'Necramechs' | 'Operators';
  playstyle?: string[];
  progenitor?: string;
  subsumed?: string;
  themes?: string;
  tactical?: string;
}
