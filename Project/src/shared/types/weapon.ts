/**
 * @domain Shared / Types / Weapon
 * @SSoT docs/domains/semantic/damage-types.md
 */
import type { BaseItem } from './base'
import type { DamageMap, WeaponAttack } from './damage'

export type WeaponCategory = 'Primary' | 'Secondary' | 'Melee'

export interface Weapon extends BaseItem {
  kind: 'primary' | 'secondary' | 'melee';
  description: string
  imageName: string
  category: WeaponCategory
  productCategory?: string
  masteryReq: number
  isPrime: boolean
  tradable: boolean
  slot?: number
  // Combat stats
  damage: DamageMap
  totalDamage: number
  criticalChance: number
  criticalMultiplier: number
  procChance: number
  fireRate?: number
  magazineSize?: number
  reloadTime?: number
  multishot?: number
  accuracy?: number
  noise?: string
  trigger?: string
  disposition?: number
  // Melee-specific
  range?: number
  attackSpeed?: number
  comboDuration?: number
  followThrough?: number
  blockingAngle?: number
  slamAttack?: number
  slamRadialDamage?: number
  slamRadius?: number
  heavyAttackDamage?: number
  heavySlamAttack?: number
  heavySlamRadialDamage?: number
  heavySlamRadius?: number
  slideAttack?: number
  windUp?: number
  stancePolarity?: string
  // Meta
  introduced?: string
  wikiaThumbnail?: string
  wikiaUrl?: string
  attacks?: WeaponAttack[]
}
