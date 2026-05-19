import { SimulationAuditor } from "../audit/SimulationAuditor";
import { seedRealData } from "./DatasetSeeder";
import { MutatorBridge } from "../bridge/MutatorBridge";

async function verifyDiffSystem() {
    const bridge = new MutatorBridge();
    seedRealData();

    const loadout = {
        primary_weapon: {
            unique_name: "StrunPrime",
            active_config_index: 0,
            configs: [{ mods: [{ unique_name: "GalvanizedHell", rank: 10 }] }]
        }
    };

    // State A: No stacks
    const resultA = bridge.simulate(loadout, { flags: { galvanized_max_stacks: false } });
    
    // State B: Max stacks
    const resultB = bridge.simulate(loadout, { flags: { galvanized_max_stacks: true } });

    const auditA = SimulationAuditor.getAudit("StrunPrime", "multishot", resultA.engine);
    const auditB = SimulationAuditor.getAudit("StrunPrime", "multishot", resultB.engine);

    const diffMd = SimulationAuditor.diff(auditA, auditB);
    
    console.log("=== DIFF DIAGNOSTIC ===");
    console.log(diffMd);

    if (diffMd.includes("Desviación Total: 1.20")) {
        console.log("✅ Diff logic verified: 120% multishot delta detected.");
    } else {
        console.log("❌ Diff logic mismatch.");
    }
}

verifyDiffSystem();
