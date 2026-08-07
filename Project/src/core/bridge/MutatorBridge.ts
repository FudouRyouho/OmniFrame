/**
 * @domain Simulation-v2 / Logic / Bridge
 * @SSoT docs/domains/engine/design/simulation-architecture.md
 * @status en-desarrollo
 */
import type { Ensemble, WeaponIntent, MutatedDNA, SimulationEntity, SimulationContext, GameLaws, AttributeId, AttributeNode, Modifier } from "../engine/contracts";
import type { EnsembleIntention, EquipmentChannel } from "@shared/types/ensemble";
import { populateFromLoadout } from "../engine/resolve/hydration/space";
import { BASELINE_GAME_LAWS } from "../engine/contracts";
import { DnaRepository } from "../engine/resolve/hydration/DnaRepository";
import { SimulationEngine } from "../engine/resolve/SimulationEngine";
import { StaticHydrator } from "../engine/resolve/hydration/StaticHydrator";
import { conditionTokens } from "@shared/types/condition";

export interface SimulationResult {
  entities: SimulationEntity[];
  engine: SimulationEngine;
}

export interface SimulateOptions {
  /** Activa la acumulación de trace de procedencia (Fase 3: opt-in, apagado por default — ver SimulationEngine.enableTrace). */
  trace?: boolean;
}

export class MutatorBridge {

  /** Vía canónica — acepta EnsembleIntention tipada desde EnsembleStore. */
  public simulateFromIntention(
    intention: EnsembleIntention,
    context?: Partial<SimulationContext>,
    options?: SimulateOptions
  ): SimulationResult {
    const channelMap = this.buildChannelMap(intention);
    const ensemble = this.ensembleFromIntention(intention);
    return this.runSimulation(ensemble, context, channelMap, options);
  }

  // ---------------------------------------------------------------------------
  // Núcleo de simulación
  // ---------------------------------------------------------------------------

  private runSimulation(
    ensemble: Ensemble,
    context?: Partial<SimulationContext>,
    channelMap: Record<string, string> = {},
    options?: SimulateOptions
  ): SimulationResult {
    const dnas = this.hydrateDnas(ensemble);

    const newEngine = new SimulationEngine();
    const { entities, modifiers } = StaticHydrator.hydrate(ensemble, dnas);

    entities.forEach(e => newEngine.addEntity(e));
    modifiers.forEach(m => newEngine.addModifier(m));

    const laws = this.extractLaws(entities);

    const fullContext: SimulationContext = {
      active_profile_id: context?.active_profile_id || "base",
      flags: context?.flags !== undefined ? context.flags : this.deriveStaticFlags(modifiers),
      variables: context?.variables || {},
      laws: { ...laws, ...context?.laws }
    };

    if (options?.trace) newEngine.enableTrace();
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
    const channels: EquipmentChannel[] = [
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
        arcanes: this.intentionArcanes(intention, "warframe"),
        abilities: (warframeSlot.abilities || []).map(a => ({ ability_id: a.id, rank: a.rank })),
        helminth: undefined
      },
      weapons: {
        primary:   this.intentionWeapon(intention, "primary"),
        secondary: this.intentionWeapon(intention, "secondary"),
        melee:     this.intentionWeapon(intention, "melee"),
      },
      ...(intention.items.companion?.itemId
        ? { companion: {
              id: intention.items.companion.itemId,
              slots: this.intentionSlots(intention, "companion"),
            } }
        : {}),
      // El objetivo sale de `environment` — A2, "contra qué comparo" — y NO de `items`, que es A1.
      // Un enemigo se declara, no se equipa. Es el mismo lugar donde ya vivían `targetLevel` y
      // `targetFaction`: lo único que cambia es que ahora hay algo que puede portar atributos.
      ...(intention.environment.target?.itemId
        ? { enemy: { id: intention.environment.target.itemId } }
        : {}),
      focus: { school_id: "zenurik", nodes: [] }
    };
  }

  private intentionWeapon(intention: EnsembleIntention, channel: string): WeaponIntent | undefined {
    const item = intention.items[channel as EquipmentChannel];
    if (!item?.itemId) return undefined;
    return {
      id: item.itemId,
      slots: this.intentionSlots(intention, channel),
      active_profile_id: item.active_profile || "base",
      ...(item.evolution_perks ? { evolution_perks: item.evolution_perks } : {}),
      arcanes: this.intentionArcanes(intention, channel)
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

  /** Espejo de intentionSlots para el canal de arcanos (rank = índice de la serie base_value). */
  private intentionArcanes(intention: EnsembleIntention, channel: string): Record<number, { arcane_id: string; rank: number }> {
    const result: Record<number, { arcane_id: string; rank: number }> = {};
    const channelArcanes = intention.arcanes?.[channel] || {};
    Object.entries(channelArcanes).forEach(([index, arc]) => {
      if (arc?.itemId) {
        result[parseInt(index)] = { arcane_id: arc.itemId, rank: arc.rank };
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
    // Los ids salen del ESPACIO, no de una segunda lista del loadout. Estaban duplicados —
    // `StaticHydrator` armaba su conjunto de participantes y esto armaba el suyo—, y esa copia
    // era invisible: un participante declarado allá y ausente acá se descartaba en silencio en
    // `if (!dna) return`, sin error ni warn.
    const ids = populateFromLoadout(ensemble).map(i => i.entity_id);

    ids.forEach(id => {
      const dna = DnaRepository.findByUniqueName(id);
      if (dna) dnas[id] = dna;
    });
    return dnas;
  }

  /** Modo estático: activa todas las condiciones presentes en el equipamiento. */
  private deriveStaticFlags(modifiers: Modifier[]): Record<string, boolean> {
    const flags: Record<string, boolean> = {};
    for (const mod of modifiers) {
      for (const token of conditionTokens(mod.condition)) flags[token] = true;
    }
    return flags;
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
