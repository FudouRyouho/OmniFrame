import type { 
  ISimulationObserver, 
  Modifier, 
  AttributeNode, 
  EntityId, 
  AttributeId 
} from "../contracts";

export interface TraceStep {
  source: string;
  bucket: string;
  value: number;
  op: "ADD" | "MUL" | "SET";
  desc?: string;
  pass: number;
}

export interface TraceNode {
  attributeId: string;
  finalValue: number;
  steps: TraceStep[];
}

/**
 * Implementación del Observer que construye un árbol de trazabilidad.
 * Esta clase vive fuera del motor y es puramente para propósitos de debug/UI.
 */
export class TraceObserver implements ISimulationObserver {
  private currentPass: number = 0;
  private traces: Map<string, TraceStep[]> = new Map();

  public onPassStart(pass: number): void {
    this.currentPass = pass;
  }

  public onModifierApplied(mod: Modifier, node: AttributeNode, value: number, bucket: string, desc?: string): void {
    const key = `${mod.target_attribute}`;
    const steps = this.traces.get(key) || [];
    
    steps.push({
      source: mod.id || "Unknown Mod",
      bucket,
      value,
      op: this.getOpFromBucket(bucket),
      desc,
      pass: this.currentPass
    });

    this.traces.set(key, steps);
  }

  public onAttributeResolved(entityId: EntityId, attrId: AttributeId, node: AttributeNode): void {
    // Podemos registrar el valor final en cada pasada si queremos ver la evolución
    const key = `${attrId}`;
    const steps = this.traces.get(key) || [];
    
    // Solo registrar si es la base o el final de una pasada
    if (steps.length === 0) {
      steps.push({
        source: "DNA:Base",
        bucket: "base",
        value: node.base,
        op: "SET",
        pass: -1
      });
    }

    this.traces.set(key, steps);
  }

  public onPassEnd(pass: number): void {
    // Opcional: Podríamos limpiar duplicados o consolidar datos aquí
  }

  public getTrace(attrId: string): TraceStep[] {
    return this.traces.get(attrId) || [];
  }

  public getAllTraces(): Record<string, TraceStep[]> {
    const result: Record<string, TraceStep[]> = {};
    this.traces.forEach((steps, id) => {
      result[id] = steps;
    });
    return result;
  }

  private getOpFromBucket(bucket: string): "ADD" | "MUL" | "SET" {
    if (bucket === "multiplicative") return "MUL";
    if (bucket === "final") return "SET";
    return "ADD";
  }
}
