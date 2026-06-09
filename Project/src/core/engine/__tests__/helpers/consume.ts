/**
 * El "clic" — punto único de consumo del motor para los tests derivados.
 *
 * El test impersona A (datos, ya cargados por engine-data-setup), B (hidratación,
 * la hace el bridge) y D (mete la intención + lee la proyección). C (el motor) es lo
 * único bajo prueba. Como el motor es auto-auditable por construcción (cada nodo carga
 * sus 6 buckets + el audit trace), este clic es genérico: una sola implementación sirve
 * a todos los consumidores. Un test dedicado = una intención distinta + sus aserciones.
 *
 *   const dmg = consume(intention).weapon(BOLTOR).node('WEAPON_DAMAGE');
 *   expect(dmg.base_flat).toBe(4);        // qué/dónde (lógica)
 *   expect(dmg.final).toBeCloseTo(132.5); // resultado (estabilidad)
 *   // ...al final, por debug:
 *   console.table(consume(intention).weapon(BOLTOR).audit('WEAPON_DAMAGE'));
 *
 * (i)  `node()`  → el AttributeNode completo: 6 buckets + final. Superficie de aserción limpia.
 * (ii) `audit()` → el trace por modifier (source, op, impact). Procedencia para debug;
 *      el `resulting_value` es ruidoso por orden y los perks hoy salen `source=unknown`
 *      (B no propaga source_id). Se deja a propósito: reporta el comportamiento real.
 */
import { MutatorBridge } from '../../bridge/MutatorBridge';
import type { AttributeNode, AttributeId, SimulationContext, AuditStep } from '../../contracts';
import type { EnsembleIntention } from '@providers/Ensemble/ensemble.types';

export interface NodeProbe {
  /** (i) El nodo decompuesto: base, base_flat, base_add_pct, mods_add_pct, total_flat, multiplicative, final. */
  node(attribute: AttributeId): AttributeNode;
  /** (ii) Trace de procedencia del nodo (debug). Vacío si el nodo no recibió modifiers. */
  audit(attribute: AttributeId): AuditStep[];
}

export interface Consumption {
  /** Selecciona una entidad por su unique_name (id). */
  weapon(entityId: string): NodeProbe;
}

/**
 * Resuelve UNA vez la intención y expone los nodos auditables.
 * @param context  flags/laws opcionales. `{ flags: {} }` = modo base sin condiciones.
 *                 Si se omite, el bridge deriva las flags estáticas del equipamiento.
 */
export function consume(intention: EnsembleIntention, context?: Partial<SimulationContext>): Consumption {
  const bridge = new MutatorBridge();
  const result = bridge.simulateFromIntention(intention, context);

  return {
    weapon(entityId: string): NodeProbe {
      const entity = result.entities.find(e => e.id === entityId);
      if (!entity) throw new Error(`consume: entidad "${entityId}" no encontrada en el resultado`);

      return {
        node(attribute: AttributeId): AttributeNode {
          const n = entity.attributes[attribute];
          if (!n) throw new Error(`consume: nodo "${attribute}" ausente en "${entityId}"`);
          return n;
        },
        audit(attribute: AttributeId): AuditStep[] {
          return result.engine.getAuditResponse(entityId, attribute).trace;
        },
      };
    },
  };
}
