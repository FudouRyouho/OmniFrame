/**
 * @domain Shared / Providers / Ensemble
 * @deprecated FORMA ESTACIONADA — el contrato vivo de Capa A es `Scene` (`./scene.ts`).
 *
 * Sobrevive porque el **store y la UI** todavía la escriben, y esa reconexión está gated
 * (`use-view-model.ts` §Condición de reanudación). El motor entero —bridge, fixtures, oráculo,
 * tests— ya consume `Scene`: nadie del lado del cálculo lee esto.
 *
 * NO ES una forma alternativa que convivan dos capas: es la forma vieja de un consumidor
 * desconectado, esperando su turno. Lo que la mata es reconectar la UI por D, no por el store.
 *
 * Lo que `Scene` corrige y esto no puede:
 *   · `mods[canal]` podía existir con `items[canal].itemId === null` — nada las ataba
 *   · el bridge leía 5 de los 10 canales; los otros 5 desaparecían en silencio
 *   · `ModIntention extends SlotIntention` arrastraba un `rank` vacío para mods
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
 * A2 — la declaración de **un participante del grupo Hostil**.
 *
 * No es el espejo de un `SlotIntention`: el Squad declara un loadout, el Hostil declara qué enemigo y
 * a qué nivel. Ninguno de los dos declara menos que el otro — declaran cosas distintas, y forzar la
 * simetría es de donde salen los `if` (`simulation-architecture.md` §*Los dos pobladores no son
 * espejos*).
 *
 * **El nivel vive acá y no en un "escenario"**: sacá todos los participantes y un nivel de enemigo no
 * significa nada. Mismo criterio que Steel Path, que **todavía no se declara** — el dataset no trae el
 * bonus (0 de 638 enemigos), y un campo sin dato es exactamente el campo mudo que esta partición vino
 * a eliminar.
 */
export interface HostileIntention {
  /** `unique_name` del enemigo en el catálogo. */
  itemId: string;
  /** Nivel al que se enfrenta. Compone su frame-0 (curva-S), no lo modifica después. */
  level: number;
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
  /**
   * A2 — el grupo **Hostil**. Lista vacía = sin objetivo declarado (el default).
   *
   * Es lista y no un objeto único porque el grupo es *"uno o más enemigos de uno o más tipos"*.
   * **Poblar** N espera al plano (`OQ-ENGINE-35`) — sin un lugar donde ubicarlos, N unidades idénticas
   * son clones que ningún cómputo distingue. Lo que la lista evita es tener que rehacer la forma el
   * día que ese gate se abra.
   *
   * Reemplaza a `environment`, que llevaba `targetLevel`/`targetFaction`/`isSteelPath` como campos de
   * un escenario que no es dueño de ninguno: **A es el escenario entero, no un campo adentro**. Los
   * tres estaban sin lector, y `targetFaction` además se deriva de qué enemigo elegiste.
   */
  hostile: HostileIntention[];
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
  hostile: [],
};
