/**
 * @domain Simulation-v2 / Logic / Bridge
 * @SSoT docs/design/sim-v2/simulation-architecture.md
 * @status en-desarrollo
 */
import type { LoadoutState } from "../loadout";
import type { Ensemble, WeaponIntent, MutatedDNA, SimulationEntity, SimulationContext, GameLaws, AttributeId, AttributeNode } from "../contracts";
import type { EnsembleIntention, EnsembleChannel } from "@providers/Ensemble/ensemble.types";
import { BASELINE_GAME_LAWS } from "../contracts";
import { DnaRepository } from "../hydration/DnaRepository";
import { SimulationEngine } from "../resolution/SimulationEngine";
import { StaticHydrator } from "../hydration/StaticHydrator";

export interface SimulationResult {
  entities: SimulationEntity[];
  engine: SimulationEngine;
}

export class MutatorBridge {

  /** Vía legacy — acepta LoadoutState plano. Para herramientas de desarrollo y tests. */
  public simulate(loadout: LoadoutState, context?: Partial<SimulationContext>): SimulationResult {
    const ensemble = this.ensembleFromLoadout(loadout);
    return this.runSimulation(ensemble, context);
  }

  /** Vía canónica — acepta EnsembleIntention tipada desde EnsembleStore. */
  public simulateFromIntention(intention: EnsembleIntention, context?: Partial<SimulationContext>): SimulationResult {
    const channelMap = this.buildChannelMap(intention);
    const ensemble = this.ensembleFromIntention(intention);
    return this.runSimulation(ensemble, context, channelMap);
  }

  // ---------------------------------------------------------------------------
  // Núcleo de simulación
  // ---------------------------------------------------------------------------

  private runSimulation(
    ensemble: Ensemble,
    context?: Partial<SimulationContext>,
    channelMap: Record<string, string> = {}
  ): SimulationResult {
    const dnas = this.hydrateDnas(ensemble);

    const newEngine = new SimulationEngine();
    const { entities, modifiers } = StaticHydrator.hydrate(ensemble, dnas);

    entities.forEach(e => newEngine.addEntity(e));
    modifiers.forEach(m => newEngine.addModifier(m));

    const laws = this.extractLaws(entities);

    const fullContext: SimulationContext = {
      active_profile_id: context?.active_profile_id || "base",
      flags: context?.flags || {},
      variables: context?.variables || {},
      laws: { ...laws, ...context?.laws }
    };

    newEngine.resolve(fullContext);

    const resolvedEntities = entities.map(e => ({
      ...e,
      channel: channelMap[e.id],
      attributes: this.mapCalculatedStats(e, newEngine)
    }));

    return { entities: resolvedEntities, engine: newEngine };
  }

  // ---------------------------------------------------------------------------
  // Traducción: EnsembleIntention → Ensemble (vía canónica)
  // ---------------------------------------------------------------------------

  private buildChannelMap(intention: EnsembleIntention): Record<string, string> {
    const map: Record<string, string> = {};
    const channels: EnsembleChannel[] = [
      "warframe", "primary", "secondary", "melee",
      "companion", "companion_weapon", "archwing", "archgun", "archmelee", "necramech"
    ];
    for (const ch of channels) {
      const itemId = intention.items[ch]?.itemId;
      if (itemId) map[itemId] = ch;
    }
    return map;
  }

  private ensembleFromIntention(intention: EnsembleIntention): Ensemble {
    const warframeSlot = intention.items.warframe;
    const shards = (warframeSlot.shards || [])
      .filter(s => s.effectId !== null && s.shardType !== null)
      .map(s => ({ type: s.shardType as string, stat: s.effectId as string, is_tau: s.isTauforged }));

    return {
      warframe: {
        id: warframeSlot.itemId || "warframe/excalibur",
        rank: warframeSlot.rank,
        slots: this.intentionSlots(intention, "warframe"),
        shards,
        helminth: undefined
      },
      weapons: {
        primary:   this.intentionWeapon(intention, "primary"),
        secondary: this.intentionWeapon(intention, "secondary"),
        melee:     this.intentionWeapon(intention, "melee"),
      },
      focus: { school_id: "zenurik", nodes: [] }
    };
  }

  private intentionWeapon(intention: EnsembleIntention, channel: string): WeaponIntent | undefined {
    const item = intention.items[channel as EnsembleChannel];
    if (!item?.itemId) return undefined;
    return {
      id: item.itemId,
      slots: this.intentionSlots(intention, channel),
      active_profile_id: item.active_profile || "base"
    };
  }

  private intentionSlots(intention: EnsembleIntention, channel: string): Record<number, { mod_id?: string; level?: number }> {
    const result: Record<number, { mod_id?: string; level?: number }> = {};
    const channelMods = intention.mods[channel] || {};
    Object.entries(channelMods).forEach(([index, mod]) => {
      if (mod?.itemId) {
        result[parseInt(index)] = { mod_id: mod.itemId, level: mod.level };
      }
    });
    return result;
  }

  // ---------------------------------------------------------------------------
  // Traducción: LoadoutState → Ensemble (vía legacy — dev/test)
  // ---------------------------------------------------------------------------

  private ensembleFromLoadout(state: LoadoutState): Ensemble {
    return {
      warframe: this.loadoutEntity(state, "warframe"),
      weapons: {
        primary:   this.loadoutWeapon(state, "primary_weapon"),
        secondary: this.loadoutWeapon(state, "secondary_weapon"),
        melee:     this.loadoutWeapon(state, "melee_weapon")
      },
      focus: { school_id: "zenurik", nodes: [] }
    };
  }

  private loadoutEntity(state: LoadoutState, channel: string) {
    const id = state[`slot:${channel}`];
    const configIndex = state[`slot:${channel}:active_config`] || 0;
    return {
      id: id || "warframe/excalibur",
      rank: 30,
      slots: this.loadoutSlots(state, channel, configIndex),
      shards: [] as { type: string; stat: string; is_tau?: boolean }[],
      helminth: undefined
    };
  }

  private loadoutWeapon(state: LoadoutState, channel: string): WeaponIntent | undefined {
    const id = state[`slot:${channel}`];
    if (!id) return undefined;
    const configIndex = state[`slot:${channel}:active_config`] || 0;
    return { id, slots: this.loadoutSlots(state, channel, configIndex), active_profile_id: "base" };
  }

  private loadoutSlots(state: LoadoutState, channel: string, configIndex: number): Record<number, { mod_id?: string; level?: number }> {
    const result: Record<number, { mod_id?: string; level?: number }> = {};
    const prefix = `slot:${channel}:config:${configIndex}:mod:`;
    Object.keys(state).forEach(key => {
      if (key.startsWith(prefix)) {
        const index = parseInt(key.replace(prefix, ""));
        const intent = state[key];
        if (intent?.unique_name) {
          result[index] = { mod_id: intent.unique_name, level: intent.rank || 0 };
        }
      }
    });
    return result;
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private extractLaws(entities: SimulationEntity[]): GameLaws {
    const baseline: GameLaws = { ...BASELINE_GAME_LAWS };
    entities.forEach(entity => {
      if (entity.attributes["law_corrosive_max_stacks"])
        baseline.corrosive_max_stacks = entity.attributes["law_corrosive_max_stacks"].final;
      if (entity.attributes["law_corrosive_initial_strip"])
        baseline.corrosive_initial_strip = entity.attributes["law_corrosive_initial_strip"].final;
      if (entity.attributes["law_corrosive_stack_strip"])
        baseline.corrosive_stack_strip = entity.attributes["law_corrosive_stack_strip"].final;
    });
    return baseline;
  }

  private hydrateDnas(ensemble: Ensemble): Record<string, MutatedDNA> {
    const dnas: Record<string, MutatedDNA> = {};
    const ids = [
      ensemble.warframe.id,
      ensemble.weapons.primary?.id,
      ensemble.weapons.secondary?.id,
      ensemble.weapons.melee?.id
    ].filter((id): id is string => !!id);

    ids.forEach(id => {
      const dna = DnaRepository.findByUniqueName(id);
      if (dna) dnas[id] = dna;
    });
    return dnas;
  }

  private mapCalculatedStats(entity: SimulationEntity, engine: SimulationEngine): Record<AttributeId, AttributeNode> {
    const stats = engine.getEntityStats(entity.id);
    const updatedAttributes = { ...entity.attributes };
    Object.keys(updatedAttributes).forEach(id => {
      if (stats[id] !== undefined) updatedAttributes[id].final = stats[id];
    });
    return updatedAttributes;
  }
}
