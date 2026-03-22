// ── Mod ────────────────────────────────────────────────────────────────────────

import type { BaseItem } from './base'

export type ModCategory =
  | 'warframe' | 'primary' | 'secondary' | 'melee' | 'companion'
  | 'archgun' | 'archmelee' | 'archwing'
  | 'focus' | 'railjack' | 'necramech' | 'kdrive' | 'parazon'
  | 'tektolyst' | 'modset' | 'transmutation' | 'peculiar' | 'riven'
  | 'unknown';

/**
 * Clase de mod — identifica mods con progresión especial.
 * Primed/Galvanized/Archon tienen 10 rangos y progresión no lineal.
 */
export type ModClass = 'Primed' | 'Galvanized' | 'Archon' | 'Amalgam' | 'Riven';

/**
 * Identificador canónico del stat que modifica un mod.
 * Fuente: Module:Mods/data en la wiki de Warframe.
 * Ver Docs-legacy/decisions/mods-builder-analysis.md §2 para la semántica completa.
 *
 * Prefijos:
 * - WEAPON_   → efectos sobre armas
 * - AVATAR_   → efectos sobre el Warframe
 * - VEHICLE_  → efectos sobre K-Drive
 * - GAMEPLAY_ → efectos de facción y gameplay general
 */
export type UpgradeType = string; // string abierto — lista completa en mods-builder-analysis.md §2

export interface Mod extends BaseItem {
  kind: 'mod';
  description: string;
  imageName: string;
  baseDrain: number | null;
  /** Rango máximo del mod. Fuente: wikia (más fiable que fusionLimit del API). */
  rank: number | null;
  /** Stats por rango como texto plano del juego. */
  levelStats: Array<{ stats: string[] }> | null;
  categoryRaw: string | null;
  /** Categoría normalizada — colapsada desde mod.type en generate-data.mjs */
  category: ModCategory;
  /**
   * Compatibilidad canónica del mod — campo `compatName` de @wfcd/items.
   * Jerarquía: COMPANION > ROBOTIC/BEAST > tipo > individuo.
   * Ver data-audit.md §Gap: compatName.
   */
  compatName?: string | null;
  polarity?: string | null;
  rarity?: string | null;
  type?: string | null;
  introduced?: string | null;
  wikiaThumbnail?: string | null;
  wikiaUrl?: string | null;
  // ── Campos canónicos del wikia (Module:Mods/data) ──────────────────────────
  /**
   * Identificadores canónicos del stat que modifica el mod.
   * Cubre el ~85% de los mods de armas.
   * Vacío ([]) para augmentos UNIQUE (efectos Lua sin UpgradeType estándar).
   */
  upgradeTypes: UpgradeType[];
  isExilus?: boolean;
  isFlawed?: boolean;
  modClass?: ModClass;
  isWeaponAugment?: boolean;
  incompatible?: string[];
  incompatibilityTags?: string[];
  misc?: unknown[];
}
