import { describe, it, expect } from "vitest";
import { DamageCombiner } from "../logic/DamageCombiner";

describe("DamageCombiner (Hierarchy & Order)", () => {
  it("debe combinar Heat + Cold en Blast", () => {
    const innate = { damage_impact: 100 };
    const mods = [
      { type: "damage_heat", percentage: 90, index: 0 },
      { type: "damage_cold", percentage: 90, index: 1 },
    ];

    const result = DamageCombiner.combine(innate, mods);

    expect(result.damage_impact).toBe(100);
    expect(result.damage_blast).toBe(180); // (100 * 0.9) + (100 * 0.9)
    expect(result.damage_heat).toBeUndefined();
    expect(result.damage_cold).toBeUndefined();
  });

  it("debe respetar el orden de slots para combinaciones complejas (Viral + Heat)", () => {
    const innate = { damage_impact: 100 };
    const mods = [
      { type: "damage_cold", percentage: 90, index: 0 },
      { type: "damage_toxin", percentage: 90, index: 1 },
      { type: "damage_heat", percentage: 60, index: 2 },
    ];

    const result = DamageCombiner.combine(innate, mods);

    expect(result.damage_viral).toBe(180);
    expect(result.damage_heat).toBe(60);
  });

  it("debe absorber el daño innato en el primer mod coincidente (Viral innato + Toxin mod)", () => {
     // Si el arma tiene Viral innato, no se combina con Toxin. Se queda como Viral y Toxin.
     const innate = { damage_impact: 100, damage_viral: 50 };
     const mods = [
       { type: "damage_toxin", percentage: 90, index: 0 }
     ];

     const result = DamageCombiner.combine(innate, mods);
     expect(result.damage_viral).toBe(50);
     expect(result.damage_toxin).toBe(135); // (100+50) * 0.9 = 135
  });
});
