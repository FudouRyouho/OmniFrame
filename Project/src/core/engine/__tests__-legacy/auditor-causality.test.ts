import { describe, it, expect } from "vitest";
import { SimulationEngine } from "../logic/SimulationEngine";
import { SimulationAuditor } from "../logic/SimulationAuditor";
import type { SimulationEntity, SimulationContext } from "../contracts";

describe("Phase 4 Labs: Auditoría y Causalidad", () => {
  it("Causalidad Negativa: Debe registrar modificadores no aplicados", () => {
    const engine = new SimulationEngine();
    const entity: SimulationEntity = {
      id: "braton", 
      unique_name: "BratonPrime", 
      domain: "weapon",
      kind: "primary",
      persistence: "PE", 
      tags: ["weapon"],
      attributes: {
        "multishot": { base: 1.0, base_flat: 0, base_add_pct: 0, mods_add_pct: 0, total_flat: 0, multiplicative: 1.0, final: 1.0 }
      },
      behaviors: []
    };
    engine.addEntity(entity);

    // Modificador condicional (Galvanized)
    engine.addModifier({
      id: "galv-hell", source_id: "GalvanizedHell", target_entity: "braton", target_attribute: "multishot",
      operation: "ADD", value: 120, condition: "galvanized_max_stacks"
    });

    const contextOff: SimulationContext = {
      active_profile_id: "base", flags: {}, variables: {}, laws: {} as any
    };

    // 1. Ejecutar sin condición
    engine.resolve(contextOff);
    const auditOff = SimulationAuditor.getAudit("braton", "multishot", engine);

    expect(auditOff.trace.length).toBe(1);
    expect(auditOff.trace[0].condition_met).toBe(false);
    expect(auditOff.trace[0].impact).toBe(0);
    expect(auditOff.trace[0].resulting_value).toBe(1.0);

    const explanation = SimulationAuditor.explain(auditOff);
    expect(explanation).toContain("❌"); // Marcador de condición fallida
    console.log("Explicación (Condición OFF):\n", explanation);

    // 2. Ejecutar con condición
    const contextOn: SimulationContext = {
        active_profile_id: "base", flags: { "galvanized_max_stacks": true }, variables: {}, laws: {} as any
    };
    engine.resolve(contextOn);
    const auditOn = SimulationAuditor.getAudit("braton", "multishot", engine);

    expect(auditOn.trace[0].condition_met).toBe(true);
    expect(auditOn.trace[0].impact).toBe(120);
    expect(auditOn.trace[0].resulting_value).toBe(2.2); // 1.0 + 120% = 2.2

    console.log("Explicación (Condición ON):\n", SimulationAuditor.explain(auditOn));
    console.log("✅ CAUSALIDAD NEGATIVA CERTIFICADA");
  });

  it("Diagnóstico Diferencial: Debe explicar el cambio de estado", () => {
    const engine = new SimulationEngine();
    const entity: SimulationEntity = {
      id: "braton", 
      unique_name: "BratonPrime", 
      domain: "weapon",
      kind: "primary",
      persistence: "PE", 
      tags: ["weapon"],
      attributes: {
        "multishot": { base: 1.0, base_flat: 0, base_add_pct: 0, mods_add_pct: 0, total_flat: 0, multiplicative: 1.0, final: 1.0 }
      },
      behaviors: []
    };
    engine.addEntity(entity);
    engine.addModifier({
      id: "ms-mod", source_id: "SplitChamber", target_entity: "braton", target_attribute: "multishot",
      operation: "ADD", value: 90
    });

    engine.resolve({ active_profile_id: "base", flags: {}, variables: {}, laws: {} as any });
    const auditA = SimulationAuditor.getAudit("braton", "multishot", engine);

    // Cambiamos el valor del mod para simular una diferencia
    (engine as any).modifiers[0].value = 150;
    engine.resolve({ active_profile_id: "base", flags: {}, variables: {}, laws: {} as any });
    const auditB = SimulationAuditor.getAudit("braton", "multishot", engine);

    const diff = SimulationAuditor.diff(auditA, auditB);
    expect(diff).toContain("Impact Delta");
    expect(diff).toContain("60.0"); // 150 - 90
    console.log("Diagnóstico Diff:\n", diff);
  });
});
