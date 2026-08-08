/**
 * @domain Simulation-v2 / Logic / Bridge
 * @SSoT docs/domains/engine/design/simulation-architecture.md
 * @status en-desarrollo
 */
import type { Ensemble, WeaponIntent, MutatedDNA, SimulationEntity, SimulationContext, GameLaws, AttributeId, AttributeNode, Modifier } from "../engine/contracts";
import type { Scene, PlayerIntent, WeaponIntent as SceneWeapon, Bearer, SlotMap, ModIntent, ArcaneIntent } from "@shared/types/scene";
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

  /** Vía canónica — acepta la `Scene` (Capa A). */
  public simulateFromScene(
    scene: Scene,
    context?: Partial<SimulationContext>,
    options?: SimulateOptions
  ): SimulationResult {
    const ensemble = this.ensembleFromScene(scene);
    return this.runSimulation(ensemble, context, options);
  }

  // ---------------------------------------------------------------------------
  // Núcleo de simulación
  // ---------------------------------------------------------------------------

  private runSimulation(
    ensemble: Ensemble,
    context?: Partial<SimulationContext>,
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

    // El canal NO se re-escribe acá. Ya viene estampado desde el espacio (`space.ts` → `StaticHydrator`),
    // que es la única lista de participantes y la que el ruteo por canal consume ANTES de resolver.
    // Escribirlo de nuevo post-resolve era destructivo: se armaba desde `intention.items[…]`, así que
    // todo participante que no entre por el loadout —los del grupo Hostil, que se declaran y no se
    // equipan— recibía `undefined` encima del canal que el espacio ya le había puesto.
    const resolvedEntities = entities.map(e => ({
      ...e,
      attributes: this.mapCalculatedStats(e, newEngine)
    }));

    return { entities: resolvedEntities, engine: newEngine };
  }

  // ---------------------------------------------------------------------------
  // Traducción: Scene → Ensemble
  // ---------------------------------------------------------------------------

  private ensembleFromScene(scene: Scene): Ensemble {
    return {
      ...this.squadToEnsemble(scene.squad[0]),
      // El grupo Hostil se DECLARA, no se equipa — por eso viaja aparte del loadout. Traducción 1:1
      // y sin default inventado: si no se declaró contra quién, no hay participantes hostiles.
      ...(scene.hostile.length > 0
        ? { hostiles: scene.hostile.map(h => ({ id: h.uniqueName, level: h.level })) }
        : {}),
    };
  }

  /**
   * El jugador, por su variante. El `switch` es EXHAUSTIVO por tipo: agregar una variante a
   * `PlayerIntent` rompe la compilación acá, que es exactamente lo que la tabla de diez canales no
   * podía hacer — de sus diez claves el bridge leía cinco y las otras cinco desaparecían en silencio.
   *
   * Las variantes sin soporte TIRAN. No es un hueco a llenar después: `Ensemble` no tiene dónde
   * poner un archwing, así que traducirlo a medias sería devolver un escenario incompleto reportando
   * éxito. Que grite es lo que crea la demanda del dato (`archwing-weapons.json` existe y el engine
   * no lo carga).
   */
  private squadToEnsemble(player: PlayerIntent): Omit<Ensemble, 'hostiles'> {
    switch (player.kind) {
      case 'onfoot':
        return {
          ...(player.warframe
            ? { warframe: {
                  id: player.warframe.uniqueName,
                  rank: player.warframe.rank ?? 30,
                  slots: this.bearerSlots(player.warframe),
                  shards: (player.warframe.shards ?? []).map(sh => ({
                    type: sh.uniqueName, stat: sh.effectId, is_tau: sh.isTauforged,
                  })),
                  arcanes: this.bearerArcanes(player.warframe),
                  abilities: (player.warframe.abilities ?? []).map(a => ({ ability_id: a.uniqueName, rank: a.rank })),
                  helminth: undefined,
                } }
            : {}),
          weapons: {
            primary:   this.weaponToIntent(player.weapons?.primary),
            secondary: this.weaponToIntent(player.weapons?.secondary),
            melee:     this.weaponToIntent(player.weapons?.melee),
          },
          ...(player.companion
            ? { companion: { id: player.companion.uniqueName, slots: this.bearerSlots(player.companion) } }
            : {}),
        };

      case 'archwing':
      case 'necramech':
        throw new Error(
          `[escena] el loadout "${player.kind}" se puede declarar y el engine todavía no lo modela: ` +
          `\`Ensemble\` no tiene dónde ponerlo y los datasets de vehículos no se cargan. ` +
          `La estructura existe para que esta falta se vea; no se traduce a medias.`
        );

      default: {
        // Exhaustividad: si aparece una variante nueva sin caso, esto no compila.
        const _never: never = player;
        throw new Error(`[escena] variante de loadout no contemplada: ${JSON.stringify(_never)}`);
      }
    }
  }

  private weaponToIntent(weapon?: SceneWeapon): WeaponIntent | undefined {
    if (!weapon) return undefined;
    return {
      id: weapon.uniqueName,
      slots: this.bearerSlots(weapon),
      active_profile_id: weapon.activeProfile ?? "base",
      ...(weapon.evolutionPerks ? { evolution_perks: this.reindex(weapon.evolutionPerks, "perks", v => v) } : {}),
      arcanes: this.bearerArcanes(weapon),
    };
  }

  /** Los mods de un portador. Viven ADENTRO: ya no hay tabla paralela que pueda quedar huérfana. */
  private bearerSlots(bearer: Bearer): Record<number, { mod_id?: string; level?: number }> {
    return this.reindex(bearer.mods ?? {}, "mods", (m: ModIntent) => ({ mod_id: m.uniqueName, level: m.level }));
  }

  private bearerArcanes(bearer: Bearer): Record<number, { arcane_id: string; rank: number }> {
    return this.reindex(bearer.arcanes ?? {}, "arcanos", (a: ArcaneIntent) => ({ arcane_id: a.uniqueName, rank: a.rank }));
  }

  /** Re-indexa un `SlotMap` validando sus claves. Ver `slotIndex`. */
  private reindex<T, R>(map: SlotMap<T>, kind: string, project: (value: T) => R): Record<number, R> {
    const result: Record<number, R> = {};
    Object.entries(map).forEach(([key, value]) => {
      const slot = this.slotIndex(key, kind);
      if (value != null) result[slot] = project(value as T);
    });
    return result;
  }

  /**
   * Índice de slot a partir de una clave de objeto.
   *
   * `Record<number, …>` NO EXISTE en runtime: JavaScript pasa toda clave de objeto a string, y JSON
   * no tiene forma de escribir otra cosa. Por eso el `parseInt` de acá abajo **no convertía nada**
   * mientras las claves fueran numéricas (`result[0]` y `result["0"]` son la misma propiedad).
   *
   * El problema aparece cuando NO lo son: `parseInt("s0")` → `NaN`, y todos los slots escriben la
   * MISMA propiedad `"NaN"`. Medido con el oráculo sobre un parcial `.json`: entran cuatro mods
   * elementales, sale UNO (el último), sin un solo warning — y el resultado tiene cara de válido.
   * En un banco de trabajo que se usa para validar el motor contra el juego, eso no corrompe código:
   * corrompe una medición.
   *
   * Esto GRITA en vez de comerse los slots. Es una guarda, **no** el arreglo: la forma que lo hace
   * imposible (el índice del array en lugar de una clave derivada) está gated en `OQ-ENGINE-36`,
   * junto con la otra aparición del mismo patrón. Esta guarda muere con ese cambio.
   */
  private slotIndex(key: string, kind: string): number {
    if (!/^\d+$/.test(key)) {
      throw new Error(
        `[escena] ${kind}: la clave de slot ${JSON.stringify(key)} no es un índice entero. Los slots ` +
        `se declaran con claves numéricas ("0", "1", …); con una clave no entera todos colapsan en un ` +
        `solo slot y se pierden en silencio.`
      );
    }
    return parseInt(key, 10);
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
    // Los ids salen del ESPACIO y no de una segunda lista del loadout: `StaticHydrator` armaba su
    // conjunto de participantes y esto armaba el suyo, y esa copia era invisible.
    //
    // Se recorre el intent entero y no sólo su id: el `level` es parte de la intención que COMPONE al
    // participante (frame-0), así que tiene que llegar al molde, no aplicarse encima después.
    //
    // UN PARTICIPANTE DECLARADO QUE NO SE PUEDE HIDRATAR TIRA. Antes se descartaba con un `if (dna)`
    // sin `else` y el motor devolvía un escenario a medias reportando éxito: declarar un arma
    // inexistente daba `0 entidad(es)` con exit 0, sin forma de distinguir "esta build no tiene nodos"
    // de "el ítem que pediste no existe". Al poner la guarda, 157 corridas de la suite fallaron — y
    // TODAS sobre el mismo participante: el `"warframe/excalibur"` que el bridge inventaba y que no
    // existe en ningún dataset. Que B dejara de inventarlo las puso en verde sin mover un número.
    populateFromLoadout(ensemble).forEach(intent => {
      const dna = DnaRepository.findByUniqueName(intent.entity_id, intent.level);
      if (!dna) {
        throw new Error(
          `[hidratación] el participante ${JSON.stringify(intent.entity_id)} (canal "${intent.channel}") ` +
          `se declaró y no tiene DNA en los datasets cargados. O el unique_name no existe, o su dataset ` +
          `no está en los que el engine carga.`
        );
      }
      dnas[intent.entity_id] = dna;
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
