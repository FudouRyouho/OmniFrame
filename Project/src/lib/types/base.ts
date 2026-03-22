// ── BaseItem Type System ──────────────────────────────────────────────────────

export type Kind = 'warframe' | 'primary' | 'secondary' | 'melee' | 'mod';

export interface BaseItem {
  id: string;              // uniqueName ?? name
  name: string;
  kind: Kind;              // Lowercase category
  image: string | null;    // Full CDN URL
  uniqueName: string;
  type?: string | null;
  masteryReq: number;
  polarities?: string[];
  tags?: string[];
}

// Type guards — usan BaseItem para evitar dependencias circulares.
// Los tipos concretos (Weapon, Warframe, Mod) extienden BaseItem,
// por lo que el narrowing es correcto en runtime.

export const isWeapon = (item: BaseItem): item is BaseItem & { kind: 'primary' | 'secondary' | 'melee' } =>
  item.kind === 'primary' || item.kind === 'secondary' || item.kind === 'melee';

export const isWarframe = (item: BaseItem): item is BaseItem & { kind: 'warframe' } =>
  item.kind === 'warframe';

export const isMod = (item: BaseItem): item is BaseItem & { kind: 'mod' } =>
  item.kind === 'mod';
