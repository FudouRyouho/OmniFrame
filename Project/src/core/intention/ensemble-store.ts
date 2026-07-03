import {
  type EnsembleIntention,
  type EnsembleChannel,
  type ModIntention,
  type ArcaneIntention,
  type ArchonShardIntent,
  INITIAL_INTENTION
} from '@shared/types/ensemble';

type Listener = (state: EnsembleIntention) => void;

/**
 * EnsembleStore (Core)
 * Implementación de un observable ligero para la gestión de intenciones.
 * Diseñado para ser agnóstico al framework.
 */
class EnsembleStore {
  private state: EnsembleIntention;
  private listeners = new Set<Listener>();

  constructor(initialState: EnsembleIntention = INITIAL_INTENTION) {
    this.state = JSON.parse(JSON.stringify(initialState)); // Clonación profunda inicial
  }

  /**
   * Obtiene el estado actual (Snapshot inmutable)
   */
  getState(): EnsembleIntention {
    return this.state;
  }

  /**
   * Suscribe una función al cambio de estado.
   * Devuelve una función para desuscribirse.
   */
  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notifica a todos los suscriptores del cambio de estado.
   */
  private notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // --- Mutaciones de Intención ---

  /**
   * Equipar/Desequipar un item en un canal específico.
   */
  setItem(channel: EnsembleChannel, itemId: string | null) {
    if (!channel) {
      console.error("[EnsembleStore] Intento de setItem sin canal.");
      return;
    }

    // Evitar actualizaciones si el ID es el mismo
    if (this.state.items[channel].itemId === itemId) return;

    console.log(`%c[EnsembleStore] 🔄 Cambio en ${channel}: ${this.state.items[channel].itemId} -> ${itemId}`, 'color: #3498db; font-weight: bold');

    this.state = {
      ...this.state,
      items: {
        ...this.state.items,
        [channel]: { ...this.state.items[channel], itemId }
      }
    };
    this.notify();
  }

  /**
   * Actualizar el rango de un item.
   */
  setItemRank(channel: EnsembleChannel, rank: number) {
    if (this.state.items[channel].rank === rank) return;

    this.state = {
      ...this.state,
      items: {
        ...this.state.items,
        [channel]: { ...this.state.items[channel], rank }
      }
    };
    this.notify();
  }

  /**
   * Equipar un mod en un slot de un canal.
   */
  setMod(channel: string, slotIndex: number, modIntention: ModIntention | null) {
    if (!channel) {
      console.error("[EnsembleStore] Intento de setMod sin canal.");
      return;
    }

    const channelMods = { ...(this.state.mods[channel] || {}) };
    
    if (modIntention === null) {
      delete channelMods[slotIndex];
    } else {
      channelMods[slotIndex] = modIntention;
    }

    console.log(`%c[EnsembleStore] 🧩 Mod en ${channel}[${slotIndex}]: ${modIntention?.itemId || 'REMOVED'}`, 'color: #9b59b6');

    this.state = {
      ...this.state,
      mods: {
        ...this.state.mods,
        [channel]: channelMods
      }
    };
    this.notify();
  }

  /**
   * Equipar/quitar un arcano en un slot de un canal.
   * Espejo de setMod, pero escribe en `arcanes` (el engine los lee de ahí, no de `mods`).
   * Passing null limpia el slot.
   */
  setArcane(channel: string, slotIndex: number, intent: ArcaneIntention | null) {
    if (!channel) {
      console.error("[EnsembleStore] Intento de setArcane sin canal.");
      return;
    }

    const channelArcanes = { ...(this.state.arcanes?.[channel] || {}) };

    if (intent === null) {
      delete channelArcanes[slotIndex];
    } else {
      channelArcanes[slotIndex] = intent;
    }

    console.log(`%c[EnsembleStore] ✨ Arcano en ${channel}[${slotIndex}]: ${intent?.itemId || 'REMOVED'}`, 'color: #1abc9c');

    this.state = {
      ...this.state,
      arcanes: {
        ...(this.state.arcanes || {}),
        [channel]: channelArcanes
      }
    };
    this.notify();
  }

  /**
   * Establece o limpia un Archon Shard en un slot del Warframe.
   * Passing null resetea el slot a vacío.
   */
  setShard(slotIndex: number, intent: ArchonShardIntent | null) {
    const currentShards = [...(this.state.items.warframe.shards || [])];
    currentShards[slotIndex] = intent ?? { shardType: null, effectId: null, isTauforged: false };
    this.state = {
      ...this.state,
      items: {
        ...this.state.items,
        warframe: { ...this.state.items.warframe, shards: currentShards }
      }
    };
    this.notify();
  }

  /**
   * Selecciona o deselecciona un perk de evolución incarnon en un tier específico.
   */
  setEvolutionPerk(channel: EnsembleChannel, tier: number, perkId: string | null) {
    const current = this.state.items[channel];
    const currentPerks = { ...(current.evolution_perks ?? {}) };

    if (perkId === null) {
      delete currentPerks[tier];
    } else {
      currentPerks[tier] = perkId;
    }

    this.state = {
      ...this.state,
      items: {
        ...this.state.items,
        [channel]: { ...current, evolution_perks: currentPerks }
      }
    };
    this.notify();
  }

  /**
   * Cambia el perfil activo de un canal (ej: 'base' | 'incarnon_form').
   */
  setActiveProfile(channel: EnsembleChannel, profileId: string) {
    const current = this.state.items[channel];
    if (current.active_profile === profileId) return;

    this.state = {
      ...this.state,
      items: {
        ...this.state.items,
        [channel]: { ...current, active_profile: profileId }
      }
    };
    this.notify();
  }

  /**
   * Resetear toda la intención.
   */
  clear() {
    this.state = { ...INITIAL_INTENTION };
    this.notify();
  }
}

// Exportamos una instancia única (Singleton) para todo el ciclo de vida de la app
export const ensembleStore = new EnsembleStore();
