import { useState, useEffect } from "react";
import { calcStatValue, fmtStatValue, resolveLabel, DEFAULT_ENGINE_VARS } from "@lib/abilityCalc";
import type { EngineVars } from "@lib/abilityCalc";
import type { AbilityStatEntry, AbilityGroup, AbilityStatsData } from "@lib/types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AbilityEntry extends AbilityStatsData {
  uniqueName: string;
}

type TestData = Record<string, AbilityEntry[]>;

// ── Colors ────────────────────────────────────────────────────────────────────

const UB_COLOR: Record<string, string> = {
  AVATAR_ABILITY_STRENGTH:   "text-orange-400",
  AVATAR_ABILITY_RANGE:      "text-blue-400",
  AVATAR_ABILITY_DURATION:   "text-green-400",
  AVATAR_ABILITY_EFFICIENCY: "text-yellow-400",
  ENERGY_COST:               "text-cyan-400",
  ENERGY_DRAIN:              "text-cyan-300",
  NONE:                      "text-white/20",
};

const UB_TAG: Record<string, string> = {
  AVATAR_ABILITY_STRENGTH:   "STR",
  AVATAR_ABILITY_RANGE:      "RNG",
  AVATAR_ABILITY_DURATION:   "DUR",
  AVATAR_ABILITY_EFFICIENCY: "EFF",
  ENERGY_COST:               "Drain",
  ENERGY_DRAIN:              "Energy/s",
  NONE:                      "fixed",
};

// ── StatRow ───────────────────────────────────────────────────────────────────

function StatRow({ stat, vars }: { stat: AbilityStatEntry; vars: EngineVars }) {
  const v = stat.values[0];
  const computed = calcStatValue(v, vars);
  const isBase = computed === v.baseValue;
  const color = UB_COLOR[v.upgradeBy] ?? "text-white/40";
  const tag = UB_TAG[v.upgradeBy] ?? v.upgradeBy;
  const displayLabel = resolveLabel(stat.label, stat.values, vars);

  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5 border-b border-white/5 last:border-0">
      <span className="text-sm text-white/80">{displayLabel}</span>
      <div className="flex items-center gap-2 shrink-0">
        {v.upgradeType && (
          <span className="text-[9px] px-1 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
            {v.upgradeType.replace(/^WEAPON_/, "W·").replace(/^AVATAR_/, "A·").replace(/_/g, " ")}
          </span>
        )}
        {v.helminthBase !== undefined && (
          <span className="text-[9px] px-1 py-0.5 rounded bg-yellow-500/10 text-yellow-400/60 font-mono">
            H:{fmtStatValue(calcStatValue({ ...v, baseValue: v.helminthBase }, vars))}
          </span>
        )}
        {!isBase && (
          <span className="text-[10px] text-white/20 font-mono line-through">{fmtStatValue(v.baseValue)}</span>
        )}
        <span className={`text-[10px] font-mono ${color}`}>{tag}</span>
      </div>
    </div>
  );
}

// ── GroupBlock ────────────────────────────────────────────────────────────────
// Renders a single group. Base groups (no id) are always active and have no header.
// Named groups have a toggle header.

interface GroupBlockProps {
  group: AbilityGroup;
  isActive: boolean;
  onToggle?: () => void;
  vars: EngineVars;
}

function GroupBlock({ group, isActive, onToggle, vars }: GroupBlockProps) {
  const isBase = !group.id;
  const isExclusive = group.exclusive !== false;

  if (isBase) {
    // Base group — no header, no toggle, always rendered
    return (
      <div className="px-4 pt-3 pb-2">
        {group.stats.map((stat, i) => <StatRow key={i} stat={stat} vars={vars} />)}
      </div>
    );
  }

  // Named group — has toggle header
  return (
    <div className={`mx-4 mb-2 rounded-lg border transition-all duration-150 ${
      isActive ? "border-white/20 bg-white/4" : "border-white/5 opacity-40"
    }`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2"
      >
        <span className={`text-xs font-bold uppercase tracking-wider ${
          isActive ? "text-pink-400" : "text-white/30"
        }`}>
          {group.label ?? group.id}
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-mono px-1 rounded ${
            isExclusive
              ? "bg-orange-500/10 text-orange-400/40"
              : "bg-blue-500/10 text-blue-400/40"
          }`}>
            {isExclusive ? "exclusive" : "additive"}
          </span>
          <span className={`w-2 h-2 rounded-full transition-colors ${
            isActive ? "bg-pink-400" : "bg-white/10"
          }`} />
        </div>
      </button>
      <div className="px-3 pb-2">
        {group.stats.map((stat, i) => <StatRow key={i} stat={stat} vars={vars} />)}
      </div>
    </div>
  );
}

// ── AbilityCard ───────────────────────────────────────────────────────────────

function AbilityCard({ ability, vars, globalForm }: {
  ability: AbilityEntry;
  vars: EngineVars;
  globalForm?: string | null;
}) {
  const namedGroups = ability.groups.filter(g => g.id);
  const initActive = namedGroups.reduce<Record<string, boolean>>((acc, g) => {
    acc[g.id!] = g.defaultActive ?? false;
    return acc;
  }, {});
  const [activeGroups, setActiveGroups] = useState<Record<string, boolean>>(initActive);

  // Sync with global form — overrides local exclusive state when provided
  useEffect(() => {
    if (!globalForm) return;
    const hasGlobalGroup = namedGroups.some(g => g.id === globalForm && g.exclusive !== false);
    if (!hasGlobalGroup) return;
    setActiveGroups(prev => {
      const next = { ...prev };
      namedGroups.forEach(g => {
        if (g.exclusive !== false) next[g.id!] = g.id === globalForm;
      });
      return next;
    });
  // globalForm is the only dep we care about here
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalForm]);

  const toggle = (group: AbilityGroup) => {
    const id = group.id!;
    const isExclusive = group.exclusive !== false;

    if (isExclusive) {
      const isOn = activeGroups[id];
      const next: Record<string, boolean> = { ...activeGroups };
      namedGroups.forEach(g => {
        if (g.exclusive !== false) next[g.id!] = false;
      });
      next[id] = !isOn;
      setActiveGroups(next);
    } else {
      setActiveGroups(p => ({ ...p, [id]: !p[id] }));
    }
  };

  const hasNamedGroups = namedGroups.length > 0;

  return (
    <div className="bg-white/3 border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10">
        <img
          src={`https://wiki.warframe.com/images/${ability.icon}`}
          alt=""
          className="w-10 h-10 rounded bg-black/40 border border-white/10 object-contain"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white/90">{ability.name}</div>
          <div className="text-[11px] text-white/30 truncate">{ability.description}</div>
        </div>
      </div>

      {/* Groups */}
      <div className={hasNamedGroups ? "pb-2" : ""}>
        {ability.groups.map((group, i) => (
          <GroupBlock
            key={group.id ?? `base-${i}`}
            group={group}
            isActive={group.id ? (activeGroups[group.id] ?? false) : true}
            onToggle={group.id ? () => toggle(group) : undefined}
            vars={vars}
          />
        ))}
      </div>
    </div>
  );
}


// ── Engine Sliders ────────────────────────────────────────────────────────────

const VAR_CONFIG = [
  { key: "STR" as const, color: "accent-orange-400", ub: "AVATAR_ABILITY_STRENGTH",   min: 25, max: 600 },
  { key: "RNG" as const, color: "accent-blue-400",   ub: "AVATAR_ABILITY_RANGE",      min: 25, max: 365 },
  { key: "DUR" as const, color: "accent-green-400",  ub: "AVATAR_ABILITY_DURATION",   min: 25, max: 300 },
  { key: "EFF" as const, color: "accent-yellow-400", ub: "AVATAR_ABILITY_EFFICIENCY", min: 25, max: 175 },
];

function EnginePanel({ vars, onChange }: { vars: EngineVars; onChange: (v: EngineVars) => void }) {
  const set = (key: keyof EngineVars, val: number) => onChange({ ...vars, [key]: val });

  return (
    <div className="border-b border-white/10 px-6 py-3 flex gap-6 flex-wrap bg-black/20">
      {VAR_CONFIG.map(({ key, color, ub, min, max }) => (
        <div key={key} className="flex items-center gap-3 min-w-[180px]">
          <span className={`text-[10px] font-bold font-mono w-6 ${UB_COLOR[ub]}`}>{key}</span>
          <input
            type="range" min={min} max={max} step={5}
            value={vars[key]}
            onChange={(e) => set(key, Number(e.target.value))}
            className={`flex-1 h-1 ${color} cursor-pointer`}
          />
          <span className="text-xs font-mono text-white/60 w-10 text-right">{vars[key]}%</span>
          <button
            onClick={() => set(key, 100)}
            className="text-[9px] text-white/20 hover:text-white/50 transition-colors"
            title="Reset"
          >↺</button>
        </div>
      ))}
    </div>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────

const WARFRAMES = ["rhino", "chroma", "wisp", "equinox"] as const;
type WFKey = typeof WARFRAMES[number];
const DEFAULT_VARS: EngineVars = DEFAULT_ENGINE_VARS;

// Warframes con forma global — el toggle afecta a todas las habilidades a la vez
const GLOBAL_FORMS: Partial<Record<WFKey, string[]>> = {
  equinox: ["Night", "Day"],
};

export default function AbilitySchemaView() {
  const [data, setData] = useState<TestData | null>(null);
  const [selected, setSelected] = useState<WFKey>("rhino");
  const [vars, setVars] = useState<EngineVars>(DEFAULT_VARS);
  // Forma global activa — solo para warframes con GLOBAL_FORMS
  const [globalForm, setGlobalForm] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/dev/ability-schema-test.json")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  // Reset global form when switching warframes
  useEffect(() => {
    const forms = GLOBAL_FORMS[selected];
    setGlobalForm(forms ? forms[0] : null);
  }, [selected]);

  if (!data) return <div className="p-8 text-white/40">Loading...</div>;

  const abilities = data[selected] ?? [];
  const forms = GLOBAL_FORMS[selected];

  return (
    <div className="flex flex-col h-[calc(100vh-48px)] bg-[#0a0c10] text-white overflow-hidden">
      <EnginePanel vars={vars} onChange={setVars} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-44 border-r border-white/10 flex flex-col p-3 gap-1 shrink-0">
          <div className="text-[10px] uppercase font-bold text-white/20 tracking-wider px-2 mb-2">
            Test Cases
          </div>
          {WARFRAMES.map((wf) => (
            <button
              key={wf}
              onClick={() => setSelected(wf)}
              className={`text-left px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                selected === wf
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/60 hover:bg-white/5"
              }`}
            >
              {wf}
            </button>
          ))}
          <div className="mt-auto pt-4 border-t border-white/5 text-[9px] text-white/15 px-2 leading-relaxed font-mono">
            /data/dev/<br />ability-schema-test.json
          </div>
        </div>

        {/* Cards */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-xl mx-auto flex flex-col gap-4">

            {/* Global form selector — solo para warframes con formas */}
            {forms && (
              <div className="flex items-center gap-2 px-1">
                <span className="text-[10px] text-white/30 font-mono uppercase tracking-wider">
                  Active Form
                </span>
                <div className="flex gap-1">
                  {forms.map((form) => (
                    <button
                      key={form}
                      onClick={() => setGlobalForm(form)}
                      className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                        globalForm === form
                          ? "bg-pink-500/20 text-pink-300 border border-pink-500/30"
                          : "bg-white/5 text-white/30 border border-white/10 hover:text-white/50"
                      }`}
                    >
                      {form}
                    </button>
                  ))}
                </div>
                <span className="text-[9px] text-white/15 font-mono ml-auto">
                  global — afecta todas las habilidades
                </span>
              </div>
            )}

            {abilities.map((ability) => (
              <AbilityCard
                key={ability.uniqueName}
                ability={ability}
                vars={vars}
                globalForm={globalForm}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
