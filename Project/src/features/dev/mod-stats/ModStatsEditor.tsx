import { useState, useEffect, useMemo } from "react";
import { Copy, History, Plus, X, Download } from "lucide-react";
import { FilterBar } from "@shared/components/FilterBar";
import type { ItemCategory } from "@lib/i18n/category-icons";
import { type EditorStatus, STATUS_CONFIG, MOD_MODIFIER_GROUPS } from "../shared/editor-types";
import { StatusSelector } from "../shared/StatusSelector";
import { LabelInput } from "../shared/LabelInput";
import type { ModModifier } from "@lib/types";

// ---- Types ----------------------------------------------------------------

type ModCategory = "warframe" | "primary" | "secondary" | "melee" | "companion";

interface RawStat {
  label: string;
  modifier: ModModifier;
  values: number[];
}

interface MiscEntry {
  label: string;
  value: number;
  modifier: ModModifier;
}

interface ModEntry {
  name: string;
  category: ModCategory;
  maxRank: number;
  misc: MiscEntry[];
  rawStats: RawStat[];
  wikiUrl: string;
}

type ModStatsDb = Record<string, ModEntry>;

// ---- Constants ------------------------------------------------------------

const CATEGORIES: (ItemCategory | "all")[] = [
  "warframe", "primary", "secondary", "melee", "companion",
];

const FILE_MAP: Record<ModCategory, string> = {
  warframe:  "/data/mods/mod.warframe.stats.json",
  primary:   "/data/mods/mod.primary.stats.json",
  secondary: "/data/mods/mod.secondary.stats.json",
  melee:     "/data/mods/mod.melee.stats.json",
  companion: "/data/mods/mod.companion.stats.json",
};

// ---- Helpers --------------------------------------------------------------

function storageKey(cat: ModCategory) {
  return `mod-stats-backup-${cat}`;
}

// ---- Component ------------------------------------------------------------

export default function ModStatsEditor() {
  const [category, setCategory] = useState<ModCategory>("primary");
  const [db, setDb] = useState<ModStatsDb>({});
  const [originalDb, setOriginalDb] = useState<ModStatsDb>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, EditorStatus>>({});

  // Load JSON for selected category
  useEffect(() => {
    setLoading(true);
    setSelectedKey(null);
    setSearch("");

    fetch(FILE_MAP[category])
      .then((r) => r.json())
      .then((data: ModStatsDb) => {
        setOriginalDb(JSON.parse(JSON.stringify(data)));

        const backup = localStorage.getItem(storageKey(category));
        if (backup) {
          const parsed: ModStatsDb = JSON.parse(backup);
          setDb({ ...data, ...parsed });
        } else {
          setDb(data);
        }
      })
      .catch((e) => console.error("Failed to load mod stats", e))
      .finally(() => setLoading(false));

    const savedStatuses = localStorage.getItem(`mod-editor-statuses-${category}`);
    if (savedStatuses) setStatuses(JSON.parse(savedStatuses));
    else setStatuses({});
  }, [category]);

  // Auto-save diffs to localStorage
  useEffect(() => {
    if (!Object.keys(db).length) return;
    const diff: ModStatsDb = {};
    Object.keys(db).forEach((key) => {
      if (JSON.stringify(db[key]) !== JSON.stringify(originalDb[key])) {
        diff[key] = db[key];
      }
    });
    localStorage.setItem(storageKey(category), JSON.stringify(diff));
  }, [db, originalDb, category]);

  // ---- Filtered list -------------------------------------------------------

  const filteredKeys = useMemo(() => {
    const q = search.trim().toLowerCase();
    return Object.keys(db).filter((k) =>
      !q || db[k].name.toLowerCase().includes(q)
    );
  }, [db, search]);

  // ---- Handlers ------------------------------------------------------------

  /** Si el mod está en Pendiente, lo marca como Revision al primer cambio. */
  const autoRevision = (modKey: string) => {
    setStatuses((prev) => {
      if ((prev[modKey] ?? "Pendiente") !== "Pendiente") return prev;
      const next = { ...prev, [modKey]: "Revision" as const };
      localStorage.setItem(`mod-editor-statuses-${category}`, JSON.stringify(next));
      return next;
    });
  };

  const updateStat = (
    modKey: string,
    statIdx: number,
    field: keyof RawStat,
    value: unknown,
  ) => {
    autoRevision(modKey);
    setDb((prev) => {
      const entry = { ...prev[modKey] };
      const rawStats = [...entry.rawStats];
      rawStats[statIdx] = { ...rawStats[statIdx], [field]: value };
      return { ...prev, [modKey]: { ...entry, rawStats } };
    });
  };

  const handleModifierChange = (modKey: string, statIdx: number, value: string) =>
    updateStat(modKey, statIdx, "modifier", value);

  const handleLabelChange = (modKey: string, statIdx: number, value: string) =>
    updateStat(modKey, statIdx, "label", value);

  const handleValueChange = (modKey: string, statIdx: number, valIdx: number, raw: string) => {
    setDb((prev) => {
      const entry = { ...prev[modKey] };
      const rawStats = [...entry.rawStats];
      const values = [...rawStats[statIdx].values];
      values[valIdx] = raw === "" ? 0 : parseFloat(raw);
      rawStats[statIdx] = { ...rawStats[statIdx], values };
      return { ...prev, [modKey]: { ...entry, rawStats } };
    });
  };

  const handleAddRawStat = (modKey: string) => {
    autoRevision(modKey);
    setDb((prev) => {
      const entry = { ...prev[modKey] };
      const blank: RawStat = { label: "|val1|",  modifier: "", values: Array(entry.maxRank + 1).fill(0) };
      return { ...prev, [modKey]: { ...entry, rawStats: [...entry.rawStats, blank] } };
    });
  };

  const handleRemoveRawStat = (modKey: string, si: number) => {
    autoRevision(modKey);
    setDb((prev) => {
      const entry = { ...prev[modKey] };
      const rawStats = [...entry.rawStats];
      rawStats.splice(si, 1);
      return { ...prev, [modKey]: { ...entry, rawStats } };
    });
  };

  const handleAddMisc = (modKey: string) => {
    autoRevision(modKey);
    setDb((prev) => {
      const entry = { ...prev[modKey] };
      return { ...prev, [modKey]: { ...entry, misc: [...(entry.misc ?? []), { label: "|val1|", value: 0, modifier: "" }] } };
    });
  };

  const handleUpdateMisc = (modKey: string, idx: number, field: keyof MiscEntry, value: string | number) => {
    autoRevision(modKey);
    setDb((prev) => {
      const entry = { ...prev[modKey] };
      const misc = [...(entry.misc ?? [])];
      misc[idx] = { ...misc[idx], [field]: value };
      return { ...prev, [modKey]: { ...entry, misc } };
    });
  };

  const handleRemoveMisc = (modKey: string, idx: number) => {
    autoRevision(modKey);
    setDb((prev) => {
      const entry = { ...prev[modKey] };
      const misc = [...(entry.misc ?? [])];
      misc.splice(idx, 1);
      return { ...prev, [modKey]: { ...entry, misc } };
    });
  };

  const handleCopyJson = (keys?: string[]) => {
    const out: ModStatsDb = {};
    (keys ?? Object.keys(db)).forEach((k) => {
      out[k] = db[k];
    });
    navigator.clipboard.writeText(JSON.stringify(out, null, 2));
  };

  const handleReset = () => {
    if (confirm("¿Borrar cambios locales y volver al archivo?")) {
      setDb(JSON.parse(JSON.stringify(originalDb)));
      localStorage.removeItem(storageKey(category));
    }
  };

  const handleExportStatuses = () => {
    const out: Record<string, EditorStatus> = {};
    Object.keys(statuses).forEach((key) => {
      if (statuses[key] !== "Pendiente") out[key] = statuses[key];
    });
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mod-editor-statuses-${category}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStatusChange = (modKey: string, status: EditorStatus) => {
    setStatuses((prev) => {
      const next = { ...prev, [modKey]: status };
      localStorage.setItem(`mod-editor-statuses-${category}`, JSON.stringify(next));
      return next;
    });
  };

  const isModified = (key: string) =>
    JSON.stringify(db[key]) !== JSON.stringify(originalDb[key]);

  // ---- Render --------------------------------------------------------------

  const selectedMod = selectedKey ? db[selectedKey] : null;

  return (
    <div className="flex h-[calc(100vh-48px)] bg-gray-900 text-white overflow-hidden">

      {/* Sidebar */}
      <div className="w-72 border-r border-white/10 flex flex-col shrink-0">

        {/* Category filter */}
        <div className="p-3 border-b border-white/10">
          <FilterBar
            categories={CATEGORIES}
            value={category as ItemCategory}
            onChange={(v) => setCategory(v as ModCategory)}
          />
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-white/10">
          <input
            type="text"
            placeholder="Search mod..."
            className="w-full bg-gray-800 border border-white/10 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Mod list */}
        <div className="flex-1 overflow-y-auto text-sm">
          {loading && (
            <div className="p-4 text-white/30 text-xs">Loading...</div>
          )}
          {!loading && filteredKeys.map((key) => {
            const mod = db[key];
            const modified = isModified(key);
            const done = mod.rawStats.every((s) => s.modifier !== "");
            return (
              <button
                key={key}
                onClick={() => setSelectedKey(key)}
                className={`w-full text-left px-3 py-2 border-b border-white/5 hover:bg-white/5 transition-colors flex items-center justify-between gap-2
                  ${selectedKey === key ? "bg-white/10" : ""}
                `}
              >
                <span className={modified ? "text-blue-400" : "text-white/70"}>
                  {mod.name}
                  {modified && (
                    <span className="ml-1 text-[8px] px-1 bg-blue-500/20 rounded-sm">MEM</span>
                  )}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  {!done && <span className="w-1.5 h-1.5 rounded-full bg-gray-600" title="Modifiers pendientes" />}
                  <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[statuses[key] ?? "Pendiente"].color}`} title={statuses[key] ?? "Pendiente"} />
                </div>              </button>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="p-3 border-t border-white/10 flex gap-2">
          <button
            onClick={() => handleCopyJson()}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded text-sm flex items-center justify-center gap-2"
          >
            <Copy size={14} /> Copy JSON
          </button>
          <button
            onClick={handleExportStatuses}
            className="p-2 bg-gray-800 hover:bg-green-900/50 text-white/50 hover:text-green-400 rounded"
            title="Exportar statuses como JSON"
          >
            <Download size={16} />
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-gray-800 hover:bg-red-900/50 text-white/50 hover:text-red-400 rounded"
            title="Reset local backup"
          >
            <History size={16} />
          </button>
        </div>
      </div>

      {/* Main panel */}
      <div className="flex-1 overflow-y-auto p-8 bg-[#0a0c10]">
        {!selectedMod ? (
          <div className="text-white/20 text-sm mt-16 text-center">
            Selecciona un mod de la lista
          </div>
        ) : (
          <div className="max-w-2xl mx-auto flex flex-col gap-6">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <a href={selectedMod.wikiUrl ? selectedMod.wikiUrl : "#"} target="_blank" className="text-2xl font-bold">{selectedMod.name}</a>
                <div className="text-[10px] font-mono text-white/20 mt-1 select-all">{selectedKey}</div>
              </div>
              <div className="flex items-center gap-3">
                <StatusSelector
                  value={statuses[selectedKey!] ?? "Pendiente"}
                  onChange={(s) => handleStatusChange(selectedKey!, s)}
                />
                <div className="flex items-center gap-2 text-xs text-white/30">
                  <span>maxRank: {selectedMod.maxRank}</span>
                  <button
                    onClick={() => handleCopyJson([selectedKey!])}
                    className="p-1.5 hover:bg-white/10 rounded"
                    title="Copy this mod JSON"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Stat rows */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-white/40 font-bold tracking-wider">Raw Stats</span>
              <button
                onClick={() => handleAddRawStat(selectedKey!)}
                className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/70 transition-colors px-2 py-1 rounded hover:bg-white/5"
              >
                <Plus size={10} /> Add stat
              </button>
            </div>

            {selectedMod.rawStats.map((stat, si) => (
              <div
                key={si}
                className="bg-white/3 border border-white/10 rounded-xl p-5 flex flex-col gap-4 relative"
              >
                <button
                  onClick={() => handleRemoveRawStat(selectedKey!, si)}
                  className="absolute top-3 right-3 text-white/20 hover:text-red-400 transition-colors"
                >
                  <X size={12} />
                </button>
                {/* Label + preview */}
                <LabelInput
                  value={stat.label}
                  modified={stat.label !== (originalDb[selectedKey!]?.rawStats?.[si]?.label ?? "")}
                  previewValues={[stat.values]}
                  onChange={(v) => handleLabelChange(selectedKey!, si, v)}
                />

                {/* Modifier */}
                <div>
                  <span className="text-[10px] uppercase text-white/30 block mb-1">Modifier</span>
                  <select
                    className={`w-full bg-gray-800 border rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500 transition-colors
                      ${stat.modifier !== (originalDb[selectedKey!]?.rawStats?.[si]?.modifier ?? "")
                        ? "border-blue-500/60 text-blue-300"
                        : stat.modifier === "" ? "border-white/10 text-white/30" : "border-white/10 text-white/80"
                      }`}
                    value={stat.modifier}
                    onChange={(e) => handleModifierChange(selectedKey!, si, e.target.value as ModModifier)}
                  >
                    {MOD_MODIFIER_GROUPS.map((group) =>
                      <optgroup key={group.label} label={group.label}>
                        {group.values.map((v) => (
                          <option key={v} value={v}>{v === "" ? "— Sin asignar —" : v}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                {/* Values */}
                <div>
                  <span className="text-[10px] uppercase text-white/30 block mb-1">
                    Values ({stat.values.length} rangos)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {stat.values.map((v, vi) => {
                      const origVal = originalDb[selectedKey!]?.rawStats?.[si]?.values?.[vi];
                      const changed = v !== origVal;
                      return (
                        <div key={vi} className="flex flex-col items-center gap-0.5">
                          <span className="text-[9px] text-white/20">{vi}</span>
                          <input
                            type="number"
                            className={`w-16 text-xs font-mono text-center bg-black/40 border rounded px-1 py-0.5 outline-none focus:border-blue-500 transition-colors
                              ${changed ? "border-blue-500/60 text-blue-300" : "border-white/10 text-white/60"}
                              ${v === null ? "border-red-500/60 text-red-400" : ""}
                            `}
                            value={v ?? ""}
                            onChange={(e) => handleValueChange(selectedKey!, si, vi, e.target.value)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Misc — efectos fijos del mod (no escalan con rango) */}
            <div className="bg-white/3 border border-white/10 rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-white/40 font-bold tracking-wider">Misc</span>
                <button
                  onClick={() => handleAddMisc(selectedKey!)}
                  className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/70 transition-colors px-2 py-1 rounded hover:bg-white/5"
                >
                  <Plus size={10} /> Add
                </button>
              </div>

              {(selectedMod.misc ?? []).length === 0 && (
                <div className="text-[11px] text-white/20 italic">Sin entradas misc</div>
              )}

              {(selectedMod.misc ?? []).map((m, mi) => (
                <div key={mi} className="flex flex-col gap-2 bg-black/30 rounded-lg p-3 relative">
                  <button
                    onClick={() => handleRemoveMisc(selectedKey!, mi)}
                    className="absolute top-2 right-2 text-white/20 hover:text-red-400 transition-colors"
                  >
                    <X size={12} />
                  </button>

                  {/* Label misc + preview */}
                  <LabelInput
                    value={m.label}
                    previewValues={[m.value]}
                    onChange={(v) => handleUpdateMisc(selectedKey!, mi, "label", v)}
                  />

                  <div className="flex gap-2">
                    {/* Value */}
                    <div className="flex-1">
                      <span className="text-[9px] uppercase text-white/20 block mb-1">Value</span>
                      <input
                        type="number"
                        className="w-full bg-gray-800 border border-white/10 rounded px-2 py-1 text-xs font-mono outline-none focus:border-blue-500 text-white/60"
                        value={m.value}
                        onChange={(e) => handleUpdateMisc(selectedKey!, mi, "value", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    {/* Modifier */}
                    <div className="flex-2">
                      <span className="text-[9px] uppercase text-white/20 block mb-1">Modifier</span>
                      <select
                        className="w-full bg-gray-800 border border-white/10 rounded px-2 py-1 text-xs outline-none focus:border-blue-500 text-white/60"
                        value={m.modifier}
                        onChange={(e) => handleUpdateMisc(selectedKey!, mi, "modifier", e.target.value as ModModifier)}
                      >
                        {MOD_MODIFIER_GROUPS.map((group) =>
                          <optgroup key={group.label} label={group.label}>
                            {group.values.map((v) => (
                              <option key={v} value={v}>{v === "" ? "— Sin asignar —" : v}</option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
