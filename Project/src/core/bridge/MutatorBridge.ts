/**
 * @domain Simulation-v2 / Logic / Bridge
 * @SSoT docs/domains/engine/design/simulation-architecture.md
 * @status en-desarrollo
 *
 * LA CAPA B — puebla el espacio, le cuelga los moldes y corre la simulación.
 *
 * POR QUÉ YA NO TRADUCE. Hasta acá B construía un `Ensemble` intermedio a partir de la `Scene` y se
 * lo pasaba a C. Medido campo por campo, ese paso **no computaba nada**: `uniqueName`→`id`,
 * `mods`→`slots`, `activeProfile`→`active_profile_id`, `{uniqueName,effectId,isTauforged}`→
 * `{type,stat,is_tau}`. Ni un valor derivado, más cuatro campos que nadie leía. Eran ~76 líneas de
 * diccionario de sinónimos, y su costo real no era el código sino lo que ocultaba: **hacía pasar por
 * *"el engine no lo modela"* cosas que el engine sí modelaba**. El arma de compañero está en los
 * datasets cargados y hoy se puebla; al archgun sólo le falta que `DataLoader` lea el `.json` que ya
 * está en `public/data/`. Ninguno era un hueco del motor: eran dos cosas sin dónde ponerse.
 *
 * Lo que B hace ahora es una sola cosa, en un solo recorrido: **el espacio con sus moldes**
 * (`attachMolds`), y después orquestar. Quién participa lo decide `space.ts`; qué ES cada uno lo
 * dereferencia esto, que es el único de los dos que sabe buscar en un repositorio.
 */
import type { SimulationEntity, SimulationContext, GameLaws, AttributeId, AttributeNode, Modifier } from "../engine/contracts";
import type { Scene } from "@shared/types/scene";
import { populateFromScene, type MoldedIntent } from "../engine/resolve/hydration/space";
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

  /** Vía canónica — y ahora la única: la `Scene` entra y no se re-shapea en el camino. */
  public simulateFromScene(
    scene: Scene,
    context?: Partial<SimulationContext>,
    options?: SimulateOptions
  ): SimulationResult {
    // Una sola pasada sobre el espacio. El molde viaja SOBRE el intent hasta el hidratador; antes se
    // recorría dos veces —acá y adentro de `StaticHydrator.hydrate`— y un `Record<string, MutatedDNA>`
    // keyed por `entity_id` cruzaba de una pasada a la otra. Ver `MoldedIntent` en `space.ts`.
    const intents = this.attachMolds(scene);

    const newEngine = new SimulationEngine();
    const { entities, modifiers } = StaticHydrator.hydrate(intents);

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
    // Escribirlo de nuevo post-resolve era destructivo: se armaba desde una tabla de canales, así que
    // todo participante que no entrara por el loadout —los del grupo Hostil, que se declaran y no se
    // equipan— recibía `undefined` encima del canal que el espacio ya le había puesto.
    const resolvedEntities = entities.map(e => ({
      ...e,
      attributes: this.mapCalculatedStats(e, newEngine)
    }));

    return { entities: resolvedEntities, engine: newEngine };
  }

  // ---------------------------------------------------------------------------
  // El espacio con sus moldes
  // ---------------------------------------------------------------------------

  /**
   * EL ESPACIO CON SUS MOLDES — la única pasada que puebla la simulación.
   *
   * Quién participa lo decide el espacio (`populateFromScene`); qué ES cada uno lo dereferencia esto.
   * Son dos cosas distintas y por eso viven en dos módulos, pero **un solo recorrido**: el molde se
   * cuelga del intent y viaja con él.
   *
   * Se recorre el intent entero y no sólo su id: el `level` es parte de la intención que COMPONE al
   * participante (frame-0), así que tiene que llegar al molde, no aplicarse encima después.
   *
   * UN PARTICIPANTE DECLARADO QUE NO SE PUEDE HIDRATAR TIRA. Antes se descartaba con un `if (dna)`
   * sin `else` y el motor devolvía un escenario a medias reportando éxito: declarar un arma
   * inexistente daba `0 entidad(es)` con exit 0, sin forma de distinguir "esta build no tiene nodos"
   * de "el ítem que pediste no existe". Al poner la guarda, 157 corridas de la suite fallaron — y
   * TODAS sobre el mismo participante: el `"warframe/excalibur"` que el bridge inventaba y que no
   * existe en ningún dataset. Que B dejara de inventarlo las puso en verde sin mover un número.
   *
   * Y es también donde muere un vehículo declarado: `archwing-weapons.json` y `vehicles.json` existen
   * en `public/data/` y `DataLoader` no los carga, así que el mensaje nombra el dataset — que es el
   * bloqueante real, y es trabajo chico.
   */
  private attachMolds(scene: Scene): MoldedIntent[] {
    return populateFromScene(scene).map(intent => {
      // Se dereferencia por el PUNTERO, no por la identidad: `entity_id` es dónde está parado el
      // participante en la escena y el catálogo no sabe nada de eso. Mientras los dos campos fueron
      // el mismo string esta distinción no existía, y era la conflación que colapsaba homónimos.
      const dna = DnaRepository.findByUniqueName(intent.unique_name, intent.level);
      if (!dna) {
        throw new Error(
          `[hidratación] el participante ${JSON.stringify(intent.unique_name)} (${intent.entity_id}) ` +
          `se declaró y no tiene DNA en los datasets cargados. O el unique_name no existe, o su dataset ` +
          `no está en los que el engine carga.`
        );
      }
      return { ...intent, dna };
    });
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
