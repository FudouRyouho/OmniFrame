// ── Damage Types ──────────────────────────────────────────────────────────────

export type DamageType =
  | 'impact' | 'puncture' | 'slash'
  | 'heat' | 'cold' | 'electricity' | 'toxin'
  | 'blast' | 'corrosive' | 'gas' | 'magnetic' | 'radiation' | 'viral'
  | 'void' | 'tau' | 'true' | 'none';

export const DAMAGE_TYPES: DamageType[] = [
  'impact', 'puncture', 'slash',
  'heat', 'cold', 'electricity', 'toxin',
  'blast', 'corrosive', 'gas', 'magnetic', 'radiation', 'viral',
  'void', 'tau', 'true', 'none',
];

export type DamageMap = Partial<Record<DamageType, number>> & { [key: string]: number | undefined };

export interface WeaponAttack {
  name: string
  damage?: DamageMap
  totalDamage?: number
  /** Decimal format (0.32 = 32%), normalized from @wfcd/items integer format */
  crit_chance?: number | null
  crit_mult?: number | null
  /** Decimal format (0.18 = 18%), normalized from @wfcd/items integer format */
  status_chance?: number | null
  /** Fire rate (ranged) or attack speed (melee). */
  speed?: number | null
  /** Semantic attack type: "Hit-Scan" | "Projectile" | "AoE" | "Thrown" */
  shot_type?: string | null
  /** Projectile speed in m/s. null when not applicable or instantaneous. */
  flight?: number | null
  falloff?: { start: number; end: number; reduction: number } | null
  /** Slide attack damage value (melee Normal Attack only). */
  slide?: string | null
  /** Charge time in seconds. */
  charge_time?: number | null
  /**
   * @gap punchThrough
   * Some attacks have base punch through but @wfcd/items does NOT include it.
   * Pending: determine if an override file is needed.
   */
}
