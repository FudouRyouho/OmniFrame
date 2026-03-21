import { useState, useEffect, useCallback, useRef } from "react";
import type { Warframe, AbilityStatsData, AbilityGroup, AbilityStatEntry, AbilityStatValue, AbilityUpgradeBy } from "@lib/types";
import { resolveLabel, DEFAULT_ENGINE_VARS } from "@lib/abilityCalc";
import type { EngineVars } from "@lib/abilityCalc";
import { FormattedText } from "@lib/FormattedText";
import { StatusSelector } from "../shared/StatusSelector";
import type { EditorStatus } from "../shared/editor-types";

// ── Constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "ability-stats-backup-v2";
const STORAGE_STATUS_KEY = "ability-stats-statuses-v2";

const UPGRADE_BY_OPTIONS: AbilityUpgradeBy[] = [
  "AVATAR_ABILITY_STRENGTH", "AVATAR_ABILITY_RANGE", "AVATAR_ABILITY_DURATION",
  "AVATAR_ABILITY_EFFICIENCY", "ENERGY_COST", "ENERGY_DRAIN", "NONE",
];

const UB_SHORT: Record<string, string> = {
  AVATAR_ABILITY_STRENGTH: "STR", AVATAR_ABILITY_RANGE: "RNG", AVATAR_ABILITY_DURATION: "DUR",
  AVATAR_ABILITY_EFFICIENCY: "EFF", ENERGY_COST: "Drain", ENERGY_DRAIN: "Energy/s", NONE: "NONE",
};

const UB_COLOR: Record<string, string> = {
  AVATAR_ABILITY_STRENGTH: "text-orange-400", AVATAR_ABILITY_RANGE: "text-blue-400",
  AVATAR_ABILITY_DURATION: "text-green-400", AVATAR_ABILITY_EFFICIENCY: "text-yellow-400",
  ENERGY_COST: "text-cyan-400", ENERGY_DRAIN: "text-cyan-300", NONE: "text-white/30",
};

// Known upgradeType values — open list, user can type custom
const KNOWN_UPGRADE_TYPES = [
  "WEAPON_DAMAGE_AMOUNT",
  "WEAPON_ATTACK_SPEED",
  "WEAPON_CRIT_CHANCE",
  "WEAPON_CRIT_DAMAGE",
  "WEAPON_STATUS_CHANCE",
  "AVATAR_HEALTH_MAX",
  "AVATAR_SHIELD_MAX",
  "AVATAR_ARMOR",
  "AVATAR_SPRINT_SPEED",
  "AVATAR_ABILITY_STRENGTH",
  "AVATAR_ABILITY_RANGE",
  "AVATAR_ABILITY_DURATION",
  "AVATAR_ABILITY_EFFICIENCY",
];

// ── Types ─────────────────────────────────────────────────────────────────────

type AbilityStatsDB = Record<string, AbilityStatsData>;
interface AbilityWithKey { uniqueName: string; name: string; }

// ── Helpers ───────────────────────────────────────────────────────────────────

function emptyValue(): AbilityStatValue { return { baseValue: 0, upgradeBy: "NONE" }; }
function emptyStat(): AbilityStatEntry { return { label: "", values: [emptyValue()] }; }
function emptyGroup(): AbilityGroup { return { stats: [emptyStat()] }; }

function moveArr<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-[10px] text-white/30 font-mono uppercase tracking-wider w-20 shrink-0 pt-1.5">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function NumberInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))}
      className="w-24 bg-black/30 border border-white/10 rounded px-2 py-1 text-sm text-white/80 font-mono outline-none focus:border-white/30" />
  );
}

function OptionalNumberInput({ value, onChange }: { value: number | undefined; onChange: (v: number | undefined) => void }) {
  return (
    <input type="number" value={value ?? ""} placeholder="—"
      onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
      className="w-20 bg-black/30 border border-white/10 rounded px-2 py-1 text-sm text-white/80 font-mono outline-none focus:border-white/30 placeholder:text-white/15" />
  );
}

function MoveBtn({ onClick, dir }: { onClick: () => void; dir: "up" | "down" }) {
  return (
    <button onClick={onClick} title={dir === "up" ? "Subir" : "Bajar"}
      className="px-1 py-0.5 rounded text-[10px] text-white/20 hover:text-white/60 hover:bg-white/5 transition-colors leading-none">
      {dir === "up" ? "↑" : "↓"}
    </button>
  );
}

function DangerBtn({ onClick, title }: { onClick: () => void; title?: string }) {
  return (
    <button onClick={onClick} title={title}
      className="px-2 py-1 rounded text-xs text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-colors">
      ✕
    </button>
  );
}

// ── UpgradeTypeInput — lista conocida + valor libre ───────────────────────────

function UpgradeTypeInput({ value, onChange }: { value: string | undefined; onChange: (v: string | undefined) => void }) {
  const [custom, setCustom] = useState(!value || KNOWN_UPGRADE_TYPES.includes(value) ? false : true);

  const handleSelect = (v: string) => {
    if (v === "__custom__") { setCustom(true); onChange(undefined); }
    else if (v === "") { setCustom(false); onChange(undefined); }
    else { setCustom(false); onChange(v); }
  };

  if (custom) {
    return (
      <div className="flex items-center gap-1">
        <input type="text" value={value ?? ""} placeholder="UPGRADE_TYPE..."
          onChange={(e) => onChange(e.target.value || undefined)}
          className="w-40 bg-black/30 border border-purple-500/30 rounded px-2 py-1 text-[11px] font-mono text-purple-300/80 outline-none focus:border-purple-400/50 placeholder:text-white/15" />
        <button onClick={() => { setCustom(false); onChange(undefined); }}
          className="text-[9px] text-white/20 hover:text-white/50 px-1">✕</button>
      </div>
    );
  }

  const selectVal = value && KNOWN_UPGRADE_TYPES.includes(value) ? value : (value ? "__custom__" : "");

  return (
    <select value={selectVal} onChange={(e) => handleSelect(e.target.value)}
      className={`bg-black/40 border rounded px-2 py-1 text-[11px] font-mono outline-none focus:border-white/30 ${
        value ? "border-purple-500/30 text-purple-300/80" : "border-white/10 text-white/20"
      }`}>
      <option value="" className="bg-gray-900 text-white/40">— upgradeType —</option>
      {KNOWN_UPGRADE_TYPES.map(t => (
        <option key={t} value={t} className="bg-gray-900 text-white">{t.replace(/_/g, " ")}</option>
      ))}
      <option value="__custom__" className="bg-gray-900 text-yellow-300">✎ personalizado...</option>
    </select>
  );
}

// ── StatValueEditor ───────────────────────────────────────────────────────────

function StatValueEditor({ value, onChange, onRemove, canRemove }: {
  value: AbilityStatValue; onChange: (v: AbilityStatValue) => void; onRemove: () => void; canRemove: boolean;
}) {
  const setOpt = <K extends keyof AbilityStatValue>(k: K, v: AbilityStatValue[K] | undefined) => {
    const next = { ...value };
    if (v === undefined) delete next[k]; else next[k] = v;
    onChange(next);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
      {/* upgradeBy */}
      <select value={value.upgradeBy} onChange={(e) => onChange({ ...value, upgradeBy: e.target.value as AbilityUpgradeBy })}
        className={`bg-black/40 border border-white/10 rounded px-2 py-1 text-xs font-mono outline-none focus:border-white/30 ${UB_COLOR[value.upgradeBy] ?? "text-white/50"}`}>
        {UPGRADE_BY_OPTIONS.map((o) => (
          <option key={o} value={o} className="bg-gray-900 text-white">{UB_SHORT[o] ?? o}</option>
        ))}
      </select>
      {/* baseValue */}
      <div className="flex items-center gap-1">
        <span className="text-[9px] text-white/20 font-mono">base</span>
        <NumberInput value={value.baseValue} onChange={(v) => onChange({ ...value, baseValue: v })} />
      </div>
      {/* cap */}
      <div className="flex items-center gap-1">
        <span className="text-[9px] text-white/20 font-mono">cap</span>
        <OptionalNumberInput value={value.cap} onChange={(v) => setOpt("cap", v)} />
      </div>
      {/* capMin */}
      <div className="flex items-center gap-1">
        <span className="text-[9px] text-white/20 font-mono">min</span>
        <OptionalNumberInput value={value.capMin} onChange={(v) => setOpt("capMin", v)} />
      </div>
      {/* helminthBase */}
      <div className="flex items-center gap-1">
        <span className="text-[9px] text-white/20 font-mono">helm</span>
        <OptionalNumberInput value={value.helminthBase} onChange={(v) => setOpt("helminthBase", v)} />
      </div>
      {/* upgradeType */}
      <UpgradeTypeInput value={value.upgradeType} onChange={(v) => setOpt("upgradeType", v)} />
      {/* inverse */}
      <label className="flex items-center gap-1 cursor-pointer">
        <input type="checkbox" checked={value.inverse ?? false}
          onChange={(e) => setOpt("inverse", e.target.checked || undefined)} className="accent-pink-400" />
        <span className="text-[9px] text-white/20 font-mono">inv</span>
      </label>
      {canRemove && <DangerBtn onClick={onRemove} title="Eliminar valor" />}
    </div>
  );
}

// ── StatEntryEditor ───────────────────────────────────────────────────────────

function StatEntryEditor({ stat, onChange, onRemove, onMove, vars }: {
  stat: AbilityStatEntry; onChange: (s: AbilityStatEntry) => void;
  onRemove: () => void; onMove: (dir: -1 | 1) => void; vars: EngineVars;
}) {
  const addVal = () => onChange({ ...stat, values: [...stat.values, emptyValue()] });
  const removeVal = (i: number) => onChange({ ...stat, values: stat.values.filter((_, idx) => idx !== i) });
  const setVal = (i: number, v: AbilityStatValue) => {
    const values = [...stat.values]; values[i] = v; onChange({ ...stat, values });
  };

  const preview = stat.label ? resolveLabel(stat.label, stat.values, vars) : null;

  return (
    <div className="border border-white/8 rounded-lg bg-black/20 mb-2">
      {/* Label row */}
      <div className="flex items-center gap-1 px-3 pt-2 pb-1">
        <div className="flex flex-col gap-0.5 shrink-0">
          <MoveBtn onClick={() => onMove(-1)} dir="up" />
          <MoveBtn onClick={() => onMove(1)} dir="down" />
        </div>
        <span className="text-[9px] text-white/20 font-mono shrink-0 ml-1">label</span>
        <input type="text" value={stat.label} onChange={(e) => onChange({ ...stat, label: e.target.value })}
          placeholder="|val1| stat label..."
          className="flex-1 bg-transparent border-b border-white/10 text-sm text-white/70 outline-none focus:border-white/30 placeholder:text-white/15 pb-0.5 mx-2" />
        <DangerBtn onClick={onRemove} title="Eliminar stat" />
      </div>
      {/* Preview */}
      {preview && (
        <div className="px-3 pb-1 flex items-center gap-1">
          <span className="text-[10px] text-white/20 font-mono shrink-0">→</span>
          <FormattedText text={preview} className="text-[10px] text-white/40 font-mono" />
        </div>
      )}
      {/* Values */}
      <div className="px-3 pb-1">
        {stat.values.map((v, i) => (
          <StatValueEditor key={i} value={v} onChange={(nv) => setVal(i, nv)}
            onRemove={() => removeVal(i)} canRemove={stat.values.length > 1} />
        ))}
        <button onClick={addVal} className="mt-1 text-[10px] text-white/20 hover:text-white/50 transition-colors font-mono">+ valor</button>
      </div>
    </div>
  );
}

// ── GroupEditor ───────────────────────────────────────────────────────────────

function GroupEditor({ group, onChange, onRemove, onMove, index, vars }: {
  group: AbilityGroup; onChange: (g: AbilityGroup) => void;
  onRemove: () => void; onMove: (dir: -1 | 1) => void; index: number; vars: EngineVars;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const isBase = !group.id && index === 0;

  const setOpt = <K extends keyof AbilityGroup>(k: K, v: AbilityGroup[K] | undefined) => {
    const next = { ...group };
    if (v === undefined) delete next[k]; else next[k] = v;
    onChange(next);
  };

  const setStat = (i: number, s: AbilityStatEntry) => {
    const stats = [...group.stats]; stats[i] = s; onChange({ ...group, stats });
  };
  const addStat = () => onChange({ ...group, stats: [...group.stats, emptyStat()] });
  const removeStat = (i: number) => onChange({ ...group, stats: group.stats.filter((_, idx) => idx !== i) });
  const moveStat = (i: number, dir: -1 | 1) => onChange({ ...group, stats: moveArr(group.stats, i, i + dir) });

  return (
    <div className={`border rounded-xl mb-3 overflow-hidden ${isBase ? "border-white/10 bg-white/2" : "border-pink-500/20 bg-pink-500/3"}`}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/8">
        <button onClick={() => setCollapsed(!collapsed)} className="text-white/30 hover:text-white/60 text-xs w-4">
          {collapsed ? "▶" : "▼"}
        </button>
        {!isBase && (
          <div className="flex flex-col gap-0.5 shrink-0">
            <MoveBtn onClick={() => onMove(-1)} dir="up" />
            <MoveBtn onClick={() => onMove(1)} dir="down" />
          </div>
        )}
        {isBase ? (
          <span className="text-[10px] font-mono text-white/20 uppercase tracking-wider">grupo base</span>
        ) : (
          <>
            <span className="text-[9px] text-white/20 font-mono shrink-0">id</span>
            <input type="text" value={group.id ?? ""} onChange={(e) => setOpt("id", e.target.value || undefined)}
              placeholder="group-id"
              className="w-28 bg-black/30 border border-white/10 rounded px-2 py-0.5 text-xs font-mono text-pink-300/70 outline-none focus:border-white/30 placeholder:text-white/15" />
            <span className="text-[9px] text-white/20 font-mono shrink-0">label</span>
            <input type="text" value={group.label ?? ""} onChange={(e) => setOpt("label", e.target.value || undefined)}
              placeholder="Display label"
              className="flex-1 bg-black/30 border border-white/10 rounded px-2 py-0.5 text-xs text-white/60 outline-none focus:border-white/30 placeholder:text-white/15" />
          </>
        )}
        <div className="flex items-center gap-2 ml-auto">
          {!isBase && (
            <>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={group.defaultActive ?? false}
                  onChange={(e) => setOpt("defaultActive", e.target.checked || undefined)} className="accent-pink-400" />
                <span className="text-[9px] text-white/20 font-mono">default</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={group.exclusive !== false}
                  onChange={(e) => setOpt("exclusive", e.target.checked ? undefined : false)} className="accent-orange-400" />
                <span className="text-[9px] text-white/20 font-mono">exclusive</span>
              </label>
              <DangerBtn onClick={onRemove} title="Eliminar grupo" />
            </>
          )}
          <span className="text-[9px] text-white/15 font-mono">{group.stats.length}s</span>
        </div>
      </div>
      {!collapsed && (
        <div className="p-3">
          {group.stats.map((stat, i) => (
            <StatEntryEditor key={i} stat={stat} onChange={(s) => setStat(i, s)}
              onRemove={() => removeStat(i)} onMove={(dir) => moveStat(i, dir)} vars={vars} />
          ))}
          <button onClick={addStat} className="text-[10px] text-white/20 hover:text-white/50 transition-colors font-mono">+ stat</button>
        </div>
      )}
    </div>
  );
}

// ── Engine sliders (preview) ──────────────────────────────────────────────────

const VAR_CONFIG = [
  { key: "STR" as const, color: "accent-orange-400", label: "STR", ubColor: "text-orange-400", min: 25, max: 600 },
  { key: "RNG" as const, color: "accent-blue-400",   label: "RNG", ubColor: "text-blue-400",   min: 25, max: 365 },
  { key: "DUR" as const, color: "accent-green-400",  label: "DUR", ubColor: "text-green-400",  min: 25, max: 300 },
  { key: "EFF" as const, color: "accent-yellow-400", label: "EFF", ubColor: "text-yellow-400", min: 25, max: 175 },
];

const DEFAULT_VARS: EngineVars = DEFAULT_ENGINE_VARS;

function EngineSliders({ vars, onChange }: { vars: EngineVars; onChange: (v: EngineVars) => void }) {
  return (
    <div className="flex gap-4 flex-wrap px-4 py-2 border-b border-white/8 bg-black/10">
      {VAR_CONFIG.map(({ key, color, label, ubColor, min, max }) => (
        <div key={key} className="flex items-center gap-2 min-w-[160px]">
          <span className={`text-[10px] font-bold font-mono w-6 ${ubColor}`}>{label}</span>
          <input type="range" min={min} max={max} step={5} value={vars[key]}
            onChange={(e) => onChange({ ...vars, [key]: Number(e.target.value) })}
            className={`flex-1 h-1 ${color} cursor-pointer`} />
          <span className="text-[10px] font-mono text-white/50 w-9 text-right">{vars[key]}%</span>
          <button onClick={() => onChange({ ...vars, [key]: 100 })}
            className="text-[9px] text-white/15 hover:text-white/40 transition-colors" title="Reset">↺</button>
        </div>
      ))}
    </div>
  );
}

// ── AbilityEditor ─────────────────────────────────────────────────────────────

function AbilityEditor({ abilityKey, data, onChange, status, onStatusChange, vars }: {
  abilityKey: string; data: AbilityStatsData; onChange: (d: AbilityStatsData) => void;
  status: EditorStatus; onStatusChange: (s: EditorStatus) => void; vars: EngineVars;
}) {
  const [collapsed, setCollapsed] = useState(true);

  const setField = <K extends keyof AbilityStatsData>(k: K, v: AbilityStatsData[K]) =>
    onChange({ ...data, [k]: v });

  const setGroup = (i: number, g: AbilityGroup) => {
    const groups = [...data.groups]; groups[i] = g; onChange({ ...data, groups });
  };
  const addGroup = () => onChange({ ...data, groups: [...data.groups, emptyGroup()] });
  const removeGroup = (i: number) => onChange({ ...data, groups: data.groups.filter((_, idx) => idx !== i) });
  const moveGroup = (i: number, dir: -1 | 1) => onChange({ ...data, groups: moveArr(data.groups, i, i + dir) });

  const totalStats = data.groups.reduce((acc, g) => acc + g.stats.length, 0);
  const namedGroups = data.groups.filter(g => g.id).length;

  return (
    <div className="border border-white/8 rounded-xl overflow-hidden mb-3">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/3 transition-colors"
        onClick={() => setCollapsed(!collapsed)}>
        <span className="text-white/20 text-xs w-4">{collapsed ? "▶" : "▼"}</span>
        {data.icon ? (
          <img src={`https://wiki.warframe.com/images/${data.icon}`} alt=""
            className="w-8 h-8 rounded bg-black/40 border border-white/10 object-contain shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        ) : (
          <div className="w-8 h-8 rounded bg-white/5 border border-white/10 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white/80">
            {data.name || <span className="text-white/20 italic">sin nombre</span>}
          </div>
          <div className="text-[10px] text-white/25 font-mono truncate">{abilityKey}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          <span className="text-[9px] text-white/20 font-mono">{totalStats}s / {namedGroups}g</span>
          <StatusSelector value={status} onChange={onStatusChange} />
        </div>
      </div>

      {!collapsed && (
        <div className="border-t border-white/8 p-4 flex flex-col gap-3">
          <FieldRow label="name">
            <input type="text" value={data.name} onChange={(e) => setField("name", e.target.value)}
              placeholder="Ability name"
              className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-sm text-white/80 outline-none focus:border-white/30 placeholder:text-white/15" />
          </FieldRow>
          <FieldRow label="icon">
            <input type="text" value={data.icon} onChange={(e) => setField("icon", e.target.value)}
              placeholder="Icon_Name.png"
              className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-sm text-white/80 font-mono outline-none focus:border-white/30 placeholder:text-white/15" />
          </FieldRow>
          <FieldRow label="desc">
            <textarea value={data.description} onChange={(e) => setField("description", e.target.value)}
              placeholder="Description..." rows={2}
              className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-sm text-white/60 outline-none focus:border-white/30 placeholder:text-white/15 resize-none" />
          </FieldRow>

          <div className="mt-1">
            <div className="text-[10px] text-white/20 font-mono uppercase tracking-wider mb-2">groups[]</div>
            {data.groups.map((group, i) => (
              <GroupEditor key={i} group={group} index={i} vars={vars}
                onChange={(g) => setGroup(i, g)} onRemove={() => removeGroup(i)}
                onMove={(dir) => moveGroup(i, dir)} />
            ))}
            <button onClick={addGroup}
              className="text-[10px] text-white/20 hover:text-white/50 transition-colors font-mono border border-dashed border-white/10 rounded px-3 py-1.5 w-full hover:border-white/20">
              + grupo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

const STATUS_DOT: Record<EditorStatus, string> = {
  Pendiente: "bg-gray-400", Completado: "bg-green-500", Revision: "bg-yellow-500", Problemas: "bg-red-500",
};

function Sidebar({ warframes, selected, onSelect, statuses }: {
  warframes: Warframe[]; selected: string | null;
  onSelect: (id: string) => void; statuses: Record<string, Record<string, EditorStatus>>;
}) {
  const [search, setSearch] = useState("");
  const [showPrimes, setShowPrimes] = useState(false);

  const dedupedWarframes = showPrimes ? warframes : warframes.filter(wf => {
    if (!wf.isPrime) return true;
    const baseName = wf.name.replace(/ Prime$/, '');
    return !warframes.some(w => !w.isPrime && w.name === baseName);
  });

  const filtered = dedupedWarframes.filter((wf) => wf.name.toLowerCase().includes(search.toLowerCase()));

  const getWfStatus = (wf: Warframe): EditorStatus => {
    const vals = Object.values(statuses[wf.uniqueName] ?? {});
    if (vals.length === 0) return "Pendiente";
    if (vals.every((s) => s === "Completado")) return "Completado";
    if (vals.some((s) => s === "Problemas")) return "Problemas";
    if (vals.some((s) => s === "Revision" || s === "Completado")) return "Revision";
    return "Pendiente";
  };

  return (
    <div className="w-52 border-r border-white/10 flex flex-col shrink-0 overflow-hidden">
      <div className="p-3 border-b border-white/10 flex flex-col gap-2">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar warframe..."
          className="w-full bg-black/30 border border-white/10 rounded px-2 py-1.5 text-xs text-white/70 outline-none focus:border-white/30 placeholder:text-white/20" />
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={showPrimes} onChange={(e) => setShowPrimes(e.target.checked)} className="accent-pink-400" />
          <span className="text-[10px] text-white/40">Mostrar Primes</span>
        </label>
      </div>
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
        {filtered.map((wf) => (
          <button key={wf.uniqueName} onClick={() => onSelect(wf.uniqueName)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
              selected === wf.uniqueName ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70 hover:bg-white/5"
            }`}>
            <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[getWfStatus(wf)]}`} />
            <span className="truncate">{wf.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function AbilityStatsEditor() {
  const [warframes, setWarframes] = useState<Warframe[]>([]);
  const [db, setDb] = useState<AbilityStatsDB>({});
  const [selectedWf, setSelectedWf] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, Record<string, EditorStatus>>>({});
  const [vars, setVars] = useState<EngineVars>(DEFAULT_VARS);
  const [copyMsg, setCopyMsg] = useState<string | null>(null);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/data/warframes.json").then((r) => r.json()),
      fetch("/data/ability-stats.json").then((r) => r.json()),
    ]).then(([wfData, statsData]: [Warframe[], AbilityStatsDB]) => {
      setWarframes(wfData);
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try { setDb({ ...statsData, ...JSON.parse(saved) }); setHasLocalChanges(true); }
        catch { setDb(statsData); }
      } else { setDb(statsData); }
      const savedStatuses = localStorage.getItem(STORAGE_STATUS_KEY);
      if (savedStatuses) { try { setStatuses(JSON.parse(savedStatuses)); } catch { /* ignore */ } }
      if (wfData.length > 0) setSelectedWf(wfData[0].uniqueName);
    }).catch(console.error);
  }, []);

  const saveToLocal = useCallback((newDb: AbilityStatsDB) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newDb));
    setHasLocalChanges(true);
  }, []);

  const saveStatuses = useCallback((s: typeof statuses) => {
    localStorage.setItem(STORAGE_STATUS_KEY, JSON.stringify(s));
  }, []);

  const updateAbility = useCallback((key: string, data: AbilityStatsData) => {
    setDb((prev) => { const next = { ...prev, [key]: data }; saveToLocal(next); return next; });
  }, [saveToLocal]);

  const updateStatus = useCallback((wfId: string, abilityKey: string, status: EditorStatus) => {
    setStatuses((prev) => {
      const next = { ...prev, [wfId]: { ...(prev[wfId] ?? {}), [abilityKey]: status } };
      saveStatuses(next); return next;
    });
  }, [saveStatuses]);

  const handleCopyDB = () => {
    navigator.clipboard.writeText(JSON.stringify(db, null, 2)).then(() => {
      setCopyMsg("Copiado");
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopyMsg(null), 2000);
    });
  };

  const handleResetBackup = () => {
    if (!confirm("¿Eliminar cambios locales y volver al JSON del servidor?")) return;
    localStorage.removeItem(STORAGE_KEY);
    setHasLocalChanges(false);
    fetch("/data/ability-stats.json").then((r) => r.json()).then((data: AbilityStatsDB) => setDb(data)).catch(console.error);
  };

  const handleExportStatuses = () => {
    const blob = new Blob([JSON.stringify(statuses, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "ability-statuses.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const selectedWarframe = warframes.find((wf) => wf.uniqueName === selectedWf);
  const wfAbilities: AbilityWithKey[] = selectedWarframe?.abilities.map((a) => ({ uniqueName: a.uniqueName, name: a.name })) ?? [];

  return (
    <div className="flex flex-col h-[calc(100vh-48px)] bg-[#0a0c10] text-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-white/10 bg-black/20 shrink-0">
        <span className="text-xs font-mono text-white/30 uppercase tracking-wider">Ability Stats Editor</span>
        {hasLocalChanges && (
          <span className="text-[10px] font-mono text-yellow-400/60 bg-yellow-500/10 px-2 py-0.5 rounded">cambios locales</span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={handleExportStatuses} className="text-xs text-white/30 hover:text-white/60 transition-colors px-2 py-1 rounded hover:bg-white/5">Export statuses</button>
          <button onClick={handleResetBackup} className="text-xs text-red-400/40 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-500/10">Reset backup</button>
          <button onClick={handleCopyDB} className="text-xs bg-white/8 hover:bg-white/15 text-white/70 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-white/10">
            {copyMsg ?? "Copy DB JSON"}
          </button>
        </div>
      </div>

      {/* Engine sliders — globales para todo el editor */}
      <EngineSliders vars={vars} onChange={setVars} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar warframes={warframes} selected={selectedWf} onSelect={setSelectedWf} statuses={statuses} />
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedWarframe ? (
            <div className="text-white/20 text-sm">Selecciona un warframe</div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white/90">{selectedWarframe.name}</h2>
                  <div className="text-[10px] text-white/25 font-mono">{selectedWarframe.uniqueName}</div>
                </div>
                <div className="ml-auto text-[10px] text-white/20 font-mono">{wfAbilities.length} habilidades</div>
              </div>
              {wfAbilities.length === 0 ? (
                <div className="text-white/20 text-sm">Sin habilidades en warframes.json</div>
              ) : (
                wfAbilities.map((ability) => {
                  const abilityData = db[ability.uniqueName];
                  if (!abilityData) {
                    return (
                      <div key={ability.uniqueName} className="border border-white/5 rounded-xl px-4 py-3 mb-3 text-white/20 text-sm font-mono">
                        {ability.uniqueName}
                        <span className="ml-2 text-[10px] text-red-400/40">sin datos</span>
                      </div>
                    );
                  }
                  return (
                    <AbilityEditor key={ability.uniqueName} abilityKey={ability.uniqueName}
                      data={abilityData} vars={vars}
                      onChange={(d) => updateAbility(ability.uniqueName, d)}
                      status={statuses[selectedWf!]?.[ability.uniqueName] ?? "Pendiente"}
                      onStatusChange={(s) => updateStatus(selectedWf!, ability.uniqueName, s)} />
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
