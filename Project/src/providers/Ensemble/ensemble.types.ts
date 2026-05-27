/**
 * @domain Shared / Providers / Ensemble
 * @description Contrato de "Intención" para el EnsembleStore.
 * Solo almacena IDs y estados mínimos de configuración, no datos de items.
 */

export interface ArchonShardIntent {
  shardType: string | null;  // 'crimson' | 'amber' | 'azure' | 'topaz' | 'violet' | 'emerald'
  effectId: string | null;   // ID del bonus seleccionado (campo 'stat' en el contrato del motor)
  isTauforged: boolean;
}

export interface SlotIntention {
  itemId: string | null;
  rank: number;
  shards?: ArchonShardIntent[];           // warframe only — 5 slots
  active_profile?: string;                // weapon only — 'base' | 'incarnon_form'
  evolution_perks?: Record<number, string>; // weapon incarnon only — tier → perk id
}

// Deuda de tipo: ModIntention hereda 'rank' de SlotIntention pero el campo
// es semánticamente vacío para mods. MutatorBridge.intentionSlots() solo lee
// 'itemId' y 'level' — 'rank' nunca se propaga al engine. Ver ensemble.types.ts.
export interface ModIntention extends SlotIntention {
  level: number;
}

export type EnsembleChannel =
  | 'warframe'
  | 'primary'
  | 'secondary'
  | 'melee'
  | 'companion'
  | 'companion_weapon'
  | 'archwing'
  | 'archgun'
  | 'archmelee'
  | 'necramech';

const EMPTY_SHARD: ArchonShardIntent = { shardType: null, effectId: null, isTauforged: false };

/**
 * La Receta Completa (Intención del Usuario)
 */
export interface EnsembleIntention {
  items: Record<EnsembleChannel, SlotIntention>;
  mods: Record<string, Record<number, ModIntention>>;
  environment: {
    targetLevel: number;
    targetFaction: string | null;
    isSteelPath: boolean;
  };
}

export const INITIAL_INTENTION: EnsembleIntention = {
  items: {
    warframe: {
      itemId: null,
      rank: 30,
      shards: [
        { ...EMPTY_SHARD },
        { ...EMPTY_SHARD },
        { ...EMPTY_SHARD },
        { ...EMPTY_SHARD },
        { ...EMPTY_SHARD },
      ]
    },
    primary:          { itemId: null, rank: 30, active_profile: "base" },
    secondary:        { itemId: null, rank: 30, active_profile: "base" },
    melee:            { itemId: null, rank: 30, active_profile: "base" },
    companion:        { itemId: null, rank: 30 },
    companion_weapon: { itemId: null, rank: 30 },
    archwing:         { itemId: null, rank: 30 },
    archgun:          { itemId: null, rank: 30 },
    archmelee:        { itemId: null, rank: 30 },
    necramech:        { itemId: null, rank: 30 },
  },
  mods: {},
  environment: {
    targetLevel: 100,
    targetFaction: null,
    isSteelPath: false
  }
};
