/**
 * El "clic" — punto único de consumo del motor: la salida resuelta de C.
 *
 * Módulo de salida de C (`@core/engine/output`), no Capa D. Lo consumen scripts
 * (CLI oráculo), tests derivados, y `useViewModel` (`@providers`, el único hot
 * path de producción — capa de composición, legal por el ruling `@providers→@core`).
 * La Capa D (consumo derivado: ViewModelContract + mapping) vive fuera de `@core`
 * y cruza por `@shared`. Ver `docs/domains/engine/design/arch-decisions.md` §6-7.
 *
 * El consumidor impersona A (datos, ya cargados por `loadEngineData` en bootstrap/), B (hidratación,
 * la hace el bridge) y D (mete la intención + lee la proyección). C (el motor) es lo
 * único bajo prueba. El motor es auto-trazable por construcción (cada nodo carga
 * sus 4 buckets + el trace de procedencia, opt-in — ver `SimulateOptions`), este clic
 * es genérico: una sola implementación sirve a todos los consumidores. Un test
 * dedicado = una intención distinta + sus aserciones.
 *
 *   const dmg = consume(scene).weapon(BOLTOR).node('WEAPON_ADD_DAMAGE');
 *   expect(dmg.base_flat).toBe(4);        // qué/dónde (lógica)
 *   expect(dmg.final).toBeCloseTo(132.5); // resultado (estabilidad)
 *   // ...al final, por debug (nota el { trace: true } — opt-in, Fase 3):
 *   console.table(consume(scene, undefined, { trace: true }).weapon(BOLTOR).trace('WEAPON_ADD_DAMAGE'));
 *
 * (i)  `node()`  → el AttributeNode completo: base + 4 buckets + final. Superficie de aserción limpia.
 * (ii) `trace()` → el trace por modifier (source, op, impact). Procedencia para debug;
 *      el `resulting_value` es ruidoso por orden y los perks hoy salen `source=unknown`
 *      (B no propaga source_id). Se deja a propósito: reporta el comportamiento real.
 *      Requiere `{ trace: true }` en `consume()` — apagado por default, el path UI
 *      (`useViewModel`) nunca lo lee y trazar para nadie era costo sin beneficio.
 */
import { MutatorBridge, type SimulateOptions } from '../../bridge/MutatorBridge';
import type { AttributeNode, AttributeId, SimulationContext, TraceStep, SimulationEntity } from '../contracts';
import type { Scene } from '@shared/types/scene';

export interface NodeProbe {
  /** (i) El nodo decompuesto: base, base_flat, mods_add_pct, total_flat, multiplicative, final. */
  node(attribute: AttributeId): AttributeNode;
  /**
   * (ii) Trace de procedencia del nodo (debug). Opt-in (Fase 3): vacío salvo que
   * `consume(..., { trace: true })` — sin eso, NO significa "sin modifiers".
   */
  trace(attribute: AttributeId): TraceStep[];
}

export interface Consumption {
  /**
   * Selecciona un participante por su **molde** (`unique_name`) — la lente cómoda, y la que usa casi
   * toda la suite: quien mide un build sabe qué arma equipó, no en qué coordenada quedó.
   *
   * ⚠️ Con varios participantes del mismo molde devuelve **el primero declarado**. Es una decisión,
   * no un descuido: el caso vive del lado hostil (dos enemigos iguales) y ahí lo que se mide son
   * habilidades, no armas. Cuando haga falta apuntar a uno en particular, la lente es `at()`.
   */
  weapon(uniqueName: string): NodeProbe;
  /**
   * Selecciona por **coordenada en la escena** (`squad.0.primary`, `hostile.1`) — la lente precisa.
   *
   * Existe desde el día uno de la identidad por posición y no cuando aparezca el primer caso: la
   * alternativa era que `weapon()` cambiara de significado según cuántos participantes haya, que es
   * exactamente la clave-que-cambia-de-forma que `OQ-ENGINE-36` registra como deuda a no imitar.
   */
  at(coordinate: string): NodeProbe;
  /**
   * Volcado crudo: todas las entidades resueltas con sus `AttributeNode` completos (finales + 4 buckets).
   * Es la **forma nativa de C** sin shaping — el consumidor (CLI/script) selecciona/formatea en su borde.
   * NO devolver una forma seleccionada o de presentación: eso sería un `ViewModelContract` incipiente en
   * `@core` (anti-patrón producer-laundered). El contrato consumer-shaped vive fuera de `@core` (Capa D).
   * Ver `docs/domains/engine/design/arch-decisions.md` §6 y `DC-OQ-ENGINE-8`.
   */
  snapshot(): SimulationEntity[];
}

/**
 * Resuelve UNA vez la intención y expone los nodos trazables.
 * @param context  flags/laws opcionales. `{ flags: {} }` = modo base sin condiciones.
 *                 Si se omite, el bridge deriva las flags estáticas del equipamiento.
 * @param options  `{ trace: true }` activa el trace de procedencia (`.trace()`) —
 *                 apagado por default (Fase 3: opt-in, el path UI nunca lo lee).
 */
export function consume(
  scene: Scene,
  context?: Partial<SimulationContext>,
  options?: SimulateOptions
): Consumption {
  const bridge = new MutatorBridge();
  const result = bridge.simulateFromScene(scene, context, options);

  return {
    snapshot(): SimulationEntity[] {
      return result.entities;
    },
    weapon(uniqueName: string): NodeProbe {
      const entity = result.entities.find(e => e.unique_name === uniqueName);
      if (!entity) throw new Error(`consume: entidad "${uniqueName}" no encontrada en el resultado`);
      return probe(entity);
    },
    at(coordinate: string): NodeProbe {
      const entity = result.entities.find(e => e.id === coordinate);
      if (!entity) {
        const habia = result.entities.map(e => e.id).join(', ');
        throw new Error(`consume: coordenada "${coordinate}" no existe en la escena. Participantes: ${habia}`);
      }
      return probe(entity);
    },
  };

  /** El probe es el mismo para las dos lentes: cambia cómo se elige la entidad, no qué se lee de ella. */
  function probe(entity: SimulationEntity): NodeProbe {
    return {
      node(attribute: AttributeId): AttributeNode {
        const n = entity.attributes[attribute];
        if (!n) throw new Error(`consume: nodo "${attribute}" ausente en "${entity.id}"`);
        return n;
      },
      trace(attribute: AttributeId): TraceStep[] {
        return result.engine.getTrace(entity.id, attribute).trace;
      },
    };
  }
}
