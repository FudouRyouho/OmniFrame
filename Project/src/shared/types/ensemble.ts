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

// Habilidad activa declarada en la intención (warframe only). Asumida-activa: es
// la proyección estática del source-state (un buff sin duración → source-state = la
// entity estática de C1; arch-decisions §15). `rank` es opcional y hoy no se consume
// (Roar entra por su base_value máximo del override — CP1b, Fase 1b); se reserva para
// cuando el source-state vivo formalice rank/duración (gate G-a).
export interface AbilityIntent {
  id: string;      // uniqueName de la ability (clave del ability-stats.override)
  rank?: number;
}

export interface SlotIntention {
  itemId: string | null;
  rank: number;
  shards?: ArchonShardIntent[];           // warframe only — 5 slots
  abilities?: AbilityIntent[];            // warframe only — habilidades activas (muta-state, §15)
  active_profile?: string;                // weapon only — 'base' | 'incarnon_form'
  evolution_perks?: Record<number, string>; // weapon incarnon only — tier → perk id
}

// Deuda de tipo: ModIntention hereda 'rank' de SlotIntention pero el campo
// es semánticamente vacío para mods. MutatorBridge.intentionSlots() solo lee
// 'itemId' y 'level' — 'rank' nunca se propaga al engine. Ver ensemble.ts.
export interface ModIntention extends SlotIntention {
  level: number;
}

// Arcano: slot dedicado, hermano de mods (no de los slots de mod ni de shards).
// 'rank' SÍ es semántico aquí — indexa la serie base_value[rank] del arcano.
// No asumir 0-5: hay arcanos 0-3 (array de 4 valores). ArcaneRepository clampa.
export interface ArcaneIntention {
  itemId: string | null;
  rank: number; // 0..max_rank, varía por arcano
}

/**
 * Slots de EQUIPAMIENTO — el vocabulario de A1, "qué tengo".
 *
 * Es **total y cerrado**: el arsenal tiene exactamente estos diez slots, y `items` los declara todos
 * (vacíos con `itemId: null`). Esa totalidad no es un accidente que convenga aflojar — se probó
 * relajarla a `Partial<Record<...>>` y el resultado fue peor (de 18 sitios a 38 errores, tocando
 * `rhino.test.ts` y `volt.test.ts`): todo el motor asume que `items.warframe` está presente, y lo
 * está de verdad.
 *
 * NO es el vocabulario de "quién participa de la simulación". Un enemigo participa y no se equipa;
 * una exaltada participa y no ocupa slot. Ese otro vocabulario vive en el espacio
 * (`EntityIntent.channel`, abierto) — ver `resolve/hydration/space.ts`.
 */
export type EquipmentChannel =
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

/**
 * El objetivo declarado, como PARTICIPANTE y no como parámetro suelto.
 *
 * Vive en `environment` porque `environment` ya **es** A2 ("contra qué comparo"): `targetLevel` y
 * `targetFaction` siempre describieron un enemigo, sólo que desarmado en campos sueltos que ninguna
 * entidad podía portar. Darle un `itemId` lo vuelve algo que el espacio puede poblar.
 */
export interface TargetIntention {
  /** `unique_name` del enemigo en el catálogo. `null` = sin objetivo declarado (el default). */
  itemId: string | null;
}

const EMPTY_SHARD: ArchonShardIntent = { shardType: null, effectId: null, isTauforged: false };

/**
 * La Receta Completa (Intención del Usuario)
 */
export interface EnsembleIntention {
  /** A1 — "qué tengo". */
  items: Record<EquipmentChannel, SlotIntention>;
  mods: Record<string, Record<number, ModIntention>>;
  // Espejo de `mods`: capacidad de arcanos por canal. Heterogénea (warframe=2,
  // armas=1, Zaw/archgun varios de distinto tipo) → un canal puede tener 0..N
  // slots, o estar ausente. Validación de cuántos/cuáles = OQ-DATA-1 (diferida).
  // Opcional: las builds-fixture sin arcanos no necesitan declararlo.
  arcanes?: Record<string, Record<number, ArcaneIntention>>;
  /** A2 — "contra qué comparo". */
  environment: {
    targetLevel: number;
    targetFaction: string | null;
    isSteelPath: boolean;
    target?: TargetIntention;
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
  arcanes: {},
  environment: {
    targetLevel: 100,
    targetFaction: null,
    isSteelPath: false
  }
};
