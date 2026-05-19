import React, { useState, useMemo } from "react";
import MarkdownIt from "markdown-it";
import { useSimulation } from "../core/engine/hooks/useSimulation";
import { SimulationAuditor } from "../core/engine/audit/SimulationAuditor";
import type { LoadoutState } from "../core/engine/loadout";
import { seedRealData } from "../core/engine/dev/DatasetSeeder";
import {
  Activity,
  Shield,
  Sword,
  FlaskConical,
  ChevronRight,
  Zap,
} from "lucide-react";

import { ItemRepository } from "../core/engine/hydration/ItemRepository";

const md = new MarkdownIt({ html: true, linkify: true });
seedRealData();

export const SimulationLab: React.FC = () => {
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [p, s, m, overrides] = await Promise.all([
          fetch('/data/items/primary.json').then(r => r.json()),
          fetch('/data/items/secondary.json').then(r => r.json()),
          fetch('/data/items/melee.json').then(r => r.json()),
          fetch('/data/mod-stats.override.json').then(r => r.json())
        ]);
        ItemRepository.load(p);
        ItemRepository.load(s);
        ItemRepository.load(m);
        ItemRepository.loadOverrides(overrides);
      } catch (e) {
        console.error("Error loading dataset:", e);
      }
    };
    loadData();
  }, []);

  const [weaponId, setWeaponId] = useState<string>("/Lotus/Weapons/ClanTech/Chemical/FlameThrowerWraith");
  const [warframeId, setWarframeId] = useState<string>("Hydroid");
  const [selectedMods, setSelectedMods] = useState<string[]>([
    "Serration",
  ]);


  const [galvanizedStacks, setGalvanizedStacks] = useState<boolean>(true);
  const [selectedAttr, setSelectedAttr] = useState<{
    entity: string;
    attr: string;
  } | null>(null);

  // Snapshot for comparison
  const [snapshot, setSnapshot] = useState<typeof result | null>(null);
  const [isDiffActive, setIsDiffActive] = useState<boolean>(false);

  const availableWeapons = [
    { name: "Ignis Wraith", id: "/Lotus/Weapons/ClanTech/Chemical/FlameThrowerWraith" },
    { name: "Strun Prime", id: "/Lotus/Weapons/Tenno/LongGuns/PrimeStrun/PrimeStrunWeapon" },
    { name: "Braton Prime", id: "BratonPrime" } // Legacy Stub
  ];
  const availableWarframes = ["Hydroid"];
  const availableMods = [
    "Serration",
    "SplitChamber",
    "GalvanizedHell",
    "PrimaryFrostbite",
    "MalignantForce",
  ];


  const loadout: LoadoutState = useMemo(() => {
    const record: LoadoutState = {
      "slot:warframe": warframeId,
      "slot:warframe:active_config": 0,
      "slot:primary_weapon": weaponId,
      "slot:primary_weapon:active_config": 0,
    };

    selectedMods.forEach((mod, index) => {
      record[`slot:primary_weapon:config:0:mod:${index}`] = { 
        unique_name: mod, 
        rank: 10 
      };
    });

    return record;
  }, [weaponId, warframeId, selectedMods]);

  const context = useMemo(
    () => ({
      flags: {
        galvanized_max_stacks: galvanizedStacks,
      },
    }),
    [galvanizedStacks],
  );

  const result = useSimulation(loadout, context);
  const weaponEntity = result.entities.find((e: any) => e.id === weaponId);
  const warframeEntity = result.entities.find((e: any) => e.id === warframeId);

  const auditContent = useMemo(() => {
    if (!selectedAttr) return null;
    
    if (isDiffActive && snapshot) {
      const auditA = SimulationAuditor.getAudit(selectedAttr.entity, selectedAttr.attr, snapshot.engine);
      const auditB = SimulationAuditor.getAudit(selectedAttr.entity, selectedAttr.attr, result.engine);
      return SimulationAuditor.diff(auditA, auditB);
    }

    const audit = SimulationAuditor.getAudit(
      selectedAttr.entity,
      selectedAttr.attr,
      result.engine,
    );
    return SimulationAuditor.explain(audit);
  }, [selectedAttr, result, isDiffActive, snapshot]);

  const toggleMod = (mod: string) => {
    setSelectedMods((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod],
    );
  };

  const handleSetSnapshot = () => {
    setSnapshot(result);
    setIsDiffActive(true);
  };

  return (
    <div className="h-full flex flex-row overflow-hidden">
      {/* Sidebar: Control Panel */}
      <aside className="w-90 flex flex-col h-full border-r border-white/5 glass-warframe shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-ui-accent/20 rounded-full flex items-center justify-center border border-ui-accent/30">
              <Activity size={16} className="text-ui-accent" />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic text-ui-primary">
              Omni<span className="text-ui-accent">Lab</span>
            </h1>
          </div>
          <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-ui-primary/40 font-mono">
            v2.4.0-DEV
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Entity Selection */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-ui-primary/40">
              <Shield size={14} />
              <h3 className="text-heading">Ensemble Config</h3>
            </div>

            <div className="space-y-3">
              <div className="group">
                <label className="text-subheading uppercase mb-1 block group-focus-within:text-ui-accent animate-200">
                  Warframe Chassis
                </label>
                <select
                  value={warframeId}
                  onChange={(e) => setWarframeId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 p-3 outline-none focus:border-ui-accent animate-200 text-sm rounded-sm appearance-none cursor-pointer"
                >
                  {availableWarframes.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
              </div>
              <div className="group">
                <label className="text-subheading uppercase mb-1 block group-focus-within:text-ui-accent animate-200">
                  Primary Armament
                </label>
                <select
                  value={weaponId}
                  onChange={(e) => setWeaponId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 p-3 outline-none focus:border-ui-accent animate-200 text-sm rounded-sm appearance-none cursor-pointer"
                >
                  {availableWeapons.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Mod Library */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-ui-primary/40">
              <Sword size={14} />
              <h3 className="text-heading">Modifications</h3>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {availableMods.map((mod) => (
                <button
                  key={mod}
                  onClick={() => toggleMod(mod)}
                  className={`p-3 text-left animate-200 border text-[11px] font-bold rounded-sm flex items-center justify-between group ${
                    selectedMods.includes(mod)
                      ? "border-ui-accent/50 bg-ui-accent/10 text-ui-accent shadow-[0_0_15px_rgba(var(--color-ui-accent),0.1)]"
                      : "border-white/5 bg-white/[0.02] text-ui-primary/50 hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  {mod}
                  <ChevronRight
                    size={12}
                    className={`animate-200 ${selectedMods.includes(mod) ? "rotate-90 text-ui-accent" : "opacity-0 group-hover:opacity-100"}`}
                  />
                </button>
              ))}
            </div>
          </section>

          {/* Environment Flags */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-ui-primary/40">
              <FlaskConical size={14} />
              <h3 className="text-heading">Environment Overrides</h3>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ui-primary/70">
                  Galvanized Stacks
                </span>
                <button
                  onClick={() => setGalvanizedStacks(!galvanizedStacks)}
                  className={`w-12 h-6 rounded-full relative animate-200 ${galvanizedStacks ? "bg-ui-accent" : "bg-white/10"}`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white animate-200 ${galvanizedStacks ? "left-7" : "left-1"}`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Comparison Engine */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-ui-primary/40">
                <Activity size={14} />
                <h3 className="text-heading">Comparison Engine</h3>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/5 space-y-4">
                <button 
                  onClick={handleSetSnapshot}
                  className="w-full p-3 bg-ui-accent/10 border border-ui-accent/30 text-ui-accent text-[10px] font-black uppercase tracking-widest hover:bg-ui-accent/20 transition-all rounded-sm"
                >
                  Capture Reference
                </button>
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-ui-primary/70">Diff Mode</span>
                        <span className="text-[9px] text-ui-primary/30 uppercase">{snapshot ? 'Snapshot Ready' : 'No Reference'}</span>
                    </div>
                    <button 
                        disabled={!snapshot}
                        onClick={() => setIsDiffActive(!isDiffActive)}
                        className={`w-12 h-6 rounded-full relative animate-200 ${!snapshot ? 'opacity-20 cursor-not-allowed' : (isDiffActive ? 'bg-ui-accent' : 'bg-white/10')}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white animate-200 ${isDiffActive ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>
            </div>
          </section>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-8 overflow-y-auto space-y-8">
        {/* Top Section: Overview */}
        <section className="flex-1 grid grid-cols-12 gap-8 overflow-hidden z-10">
          {/* Left: Attribute Grid */}
          <div className="h-full col-span-7 flex flex-col space-y-6 overflow-y-auto custom-scrollbar">
            <header className="flex items-end justify-between border-b border-white/5 pb-4">
              <div className="pl-4">
                <h2 className="text-3xl font-black italic uppercase text-ui-primary tracking-tighter">
                  {weaponId}
                </h2>
                <p className="text-[10px] text-ui-accent font-mono uppercase tracking-[0.3em]">
                  Projection Snapshot • Topological Resolver
                </p>
              </div>
              <div className="text-right pr-4">
                <span className="text-subheading uppercase block">
                  Simulated Output
                </span>
                <span className="text-2xl font-black text-ui-accent italic">
                  READY
                </span>
              </div>
            </header>

            <div className="grid grid-cols-2 gap-4">
              {weaponEntity &&
                Object.entries(weaponEntity.attributes)
                  .sort()
                  .map(([id, node]) => (
                    <div
                      key={id}
                      onClick={() =>
                        setSelectedAttr({ entity: weaponId, attr: id })
                      }
                      className={`flex flex-col p-4 cursor-pointer animate-200 border relative overflow-hidden group ${
                        selectedAttr?.attr === id &&
                        selectedAttr?.entity === weaponId
                          ? "border-ui-accent bg-ui-accent/[0.07] shadow-[0_0_30px_rgba(var(--color-ui-accent),0.1)]"
                          : "border-white/5 bg-white/[0.02] hover:border-ui-accent/40 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1 relative z-10">
                        <span className="text-heading group-hover:text-ui-accent transition-colors">
                          {(node as any).label || id}
                        </span>
                        <Zap
                          size={10}
                          className={`${selectedAttr?.attr === id ? "text-ui-accent" : "text-white/5"}`}
                        />
                      </div>
                      <div className="flex items-baseline gap-1 relative z-10">
                        <span
                          className={`text-2xl font-black italic tracking-tighter ${id.startsWith("damage_") ? `dt-${id.replace("damage_", "")}` : "text-ui-primary"}`}
                        >
                          {(node as any).final.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-ui-primary/30 font-mono">
                          {(node as any).unit}
                        </span>
                      </div>
                      {selectedAttr?.attr === id && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-ui-accent" />
                      )}
                    </div>
                  ))}
            </div>

            {warframeEntity && (
              <div className="pt-6 space-y-4">
                <h3 className="text-heading opacity-40">
                  Warframe Laws (Passive)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(warframeEntity.attributes)
                    .filter(([id]) => id.startsWith("law_"))
                    .map(([id, node]) => (
                      <div
                        key={id}
                        onClick={() =>
                          setSelectedAttr({ entity: warframeId, attr: id })
                        }
                        className={`flex justify-between items-center p-4 cursor-pointer animate-200 border ${
                          selectedAttr?.attr === id &&
                          selectedAttr?.entity === warframeId
                            ? "border-ui-accent bg-ui-accent/5"
                            : "border-white/5 bg-white/[0.02] hover:border-ui-accent/40"
                        }`}
                      >
                        <span className="text-subheading uppercase font-bold">
                          {(node as any).label || id}
                        </span>
                        <span className="text-xl font-black text-ui-accent italic">
                          {(node as any).final.toFixed(0)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Audit Panel */}
          <div className="col-span-5 flex flex-col glass-warframe rounded-sm overflow-hidden shadow-inner border border-white/5">
            <header className="p-4 bg-white/[0.03] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical size={14} className="text-ui-primary/40" />
                <h3 className="text-heading">Causal Audit Trace</h3>
              </div>
              {isDiffActive && (
                <span className="text-[9px] bg-ui-accent text-black px-2 py-0.5 font-black uppercase italic animate-pulse">
                  Differential Mode
                </span>
              )}
            </header>
            <div className="flex-1 overflow-y-auto p-0 custom-scrollbar relative">
              {auditContent ? (
                <div
                  className="prose prose-invert prose-xs max-w-none audit-panel p-6"
                  dangerouslySetInnerHTML={{ __html: md.render(auditContent) }}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 space-y-4">
                  <Activity
                    size={32}
                    className="text-ui-primary/10 animate-pulse"
                  />
                  <p className="text-subheading uppercase tracking-[0.3em] leading-relaxed max-w-[200px]">
                    Select an attribute to visualize topological resolution
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .audit-panel table { width: 100%; border-collapse: collapse; font-family: monospace; font-size: 10px; }
        .audit-panel th { text-align: left; text-transform: uppercase; color: var(--ui-primary); opacity: 0.4; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .audit-panel td { padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .audit-panel strong { color: var(--ui-accent); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--ui-accent); }
      `}</style>
    </div>
  );
};

export default SimulationLab;
