/**
 * @domain Shared / Types / Base
 * @SSoT docs/semantic/damage-types.md
 */

import type { Mod } from './mod';
import type { Warframe } from './warframe';
import type { Weapon } from './weapon';
import type { PolarityType } from './polarity';

export type ItemDomain = 'warframe' | 'weapon' | 'companion' | 'mod' | 'arcane' | 'vehicle';

export type ItemKind = 
  | 'warframe' 
  | 'primary' | 'secondary' | 'melee' 
  | 'mod' | 'arcane' 
  | 'sentinel' | 'pet' | 'hound' | 'moa' 
  | 'archgun' | 'archmelee' 
  | 'necramech' | 'archwing';

export type ItemFamily = 
  | 'warframe' | 'prime' | 'kuva' | 'tenet' | 'prisma' | 'wraith' | 'vandal' 
  | 'robotic' | 'beast' | 'infested'
  | 'companion' | 'companion weapon'
  | 'mod' | 'augment' | 'exilus' | 'stance'
  | 'arcane' | 'vehicle' | 'unknown'
  // Weapon Types
  | 'rifle' | 'shotgun' | 'pistol' | 'dual_pistols' | 'melee' | 'polearm' | 'sword' | 'dagger' | 'hammer' | 'bow' | 'launcher' | 'sniper_rifle' | 'thrown'
  | string; // Fallback para tipos dinámicos de warframe-items

export type ItemSource = ItemKind | 'all' | 'companion';


/**
 * Interfaz Base para todas las entidades de OmniFrame.
 * Los campos domain, kind y family son inyectados determinísticamente por el pipeline.
 */
export interface BaseItem {
  id: string;
  name: string;
  image: string | null;
  image_name: string;
  unique_name: string;
  description: string;
  
  // Taxonomía (4 Pilares)
  domain: ItemDomain;
  kind: ItemKind;
  family?: ItemFamily;
  
  // Trazabilidad y Metadata Raw
  category: string; // Valor crudo del data-source (ex-Kind/Category contaminado)
  type?: string | null;
  
  mastery_req: number;
  polarities?: PolarityType[];
  tags?: string[];
}

// Type guards actualizados por Domain

export const isWeapon = (item: BaseItem): item is Weapon =>
  item.domain === 'weapon' || item.domain === 'vehicle'; // Incluimos vehículos por herencia de combate

export const isWarframe = (item: BaseItem): item is Warframe =>
  item.domain === 'warframe';

export const isMod = (item: BaseItem): item is Mod =>
  item.domain === 'mod';

