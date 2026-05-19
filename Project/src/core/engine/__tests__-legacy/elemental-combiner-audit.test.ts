import { describe, it, expect } from "vitest";
import { DamageCombiner, type ElementalMod } from "../logic/DamageCombiner";

describe("Audit Hito 2: El Oráculo Elemental (Precedencia de Slots)", () => {
    
    it("Escenario 1: Combinación básica (Corrosivo)", () => {
        const innate = { damage_impact: 10, damage_puncture: 10, damage_slash: 10 };
        const mods: ElementalMod[] = [
            { type: "damage_toxin", percentage: 90, index: 0 },
            { type: "damage_electricity", percentage: 90, index: 2 }
        ];

        const result = DamageCombiner.combine(innate, mods);
        
        // Total Base = 30. 90% de 30 = 27.
        // Toxin(27) + Elec(27) = Corrosive(54)
        expect(result["damage_corrosive"]).toBe(54);
        expect(result["damage_toxin"]).toBeUndefined();
        expect(result["damage_electricity"]).toBeUndefined();
    });

    it("Escenario 2: Absorción de Daño Innato (Fusión)", () => {
        // Arma con Toxina innata (ej: Mire)
        const innate = { damage_impact: 10, damage_toxin: 10 };
        const mods: ElementalMod[] = [
            { type: "damage_electricity", percentage: 90, index: 0 }
        ];

        // Total Base = 20. 90% de 20 = 18.
        // Elec(18) + InnateToxin(10) = Corrosive(28)
        const result = DamageCombiner.combine(innate, mods);
        expect(result["damage_corrosive"]).toBe(28);
    });

    it("Escenario 3: Precedencia triple (Corrosivo + Calor)", () => {
        const innate = { damage_impact: 100 };
        const mods: ElementalMod[] = [
            { type: "damage_toxin", percentage: 90, index: 0 },
            { type: "damage_electricity", percentage: 90, index: 1 },
            { type: "damage_heat", percentage: 90, index: 2 }
        ];

        const result = DamageCombiner.combine(innate, mods);
        
        // Toxin + Elec -> Corrosivo
        // Heat solo
        expect(result["damage_corrosive"]).toBe(180);
        expect(result["damage_heat"]).toBe(90);
    });

    it("Escenario 4: El 'Slot Virtual Final' (Innato al final)", () => {
        // Arma con Calor innato + Mod Electricidad (S0) + Mod Toxina (S1)
        // Corrosivo (S0+S1) + Calor (Innato)
        const innate = { damage_impact: 10, damage_heat: 10 };
        const mods: ElementalMod[] = [
            { type: "damage_electricity", percentage: 90, index: 0 },
            { type: "damage_toxin", percentage: 90, index: 1 }
        ];

        const result = DamageCombiner.combine(innate, mods);
        
        // Total Base 20. 90% de 20 = 18.
        // Elec(18) + Toxin(18) -> Corrosive(36)
        // Innate Heat(10) -> Heat(10)
        expect(result["damage_corrosive"]).toBe(36);
        expect(result["damage_heat"]).toBe(10);
    });
});
