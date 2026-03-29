// ── BaseItem Type System ──────────────────────────────────────────────────────

import type { Mod } from './mod';
import type { Warframe } from './warframe';
import type { Weapon } from './weapon';

export type Kind = 'warframe' | 'primary' | 'secondary' | 'melee' | 'mod' | 'arcane' | 'companion' | 'archgun' | 'archmelee' | 'necramech' | 'archwing';

export interface BaseItem {
  id: string;              // uniqueName ?? name
  name: string;
  kind: Kind;              // Lowercase category
  image: string | null;    // Ruta runtime (local o remota)
  imageName?: string | null;
  uniqueName: string;
  type?: string | null;
  masteryReq: number;
  polarities?: string[];
  tags?: string[];
}

// Type guards: siguen basados en `kind`, pero exponen el tipo concreto
// para que los consumers no tengan que reconstruir el shape manualmente.

export const isWeapon = (item: BaseItem): item is Weapon =>
  item.kind === 'primary' || item.kind === 'secondary' || item.kind === 'melee';

export const isWarframe = (item: BaseItem): item is Warframe =>
  item.kind === 'warframe';

export const isMod = (item: BaseItem): item is Mod =>
  item.kind === 'mod';
