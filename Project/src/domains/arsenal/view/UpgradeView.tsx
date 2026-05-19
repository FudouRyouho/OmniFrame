import { useState } from "react";
import { useParams } from "react-router";
import { ArsenalProvider, useArsenal } from "../context/ArsenalContext";
import { StatPanel } from "@shared/components/items/specs/StatPanel";
import ModSlot from "@shared/components/slots/ModSlot";
import { FilterProvider } from "@shared/components/filters/context";
import type { FilterState } from "@shared/components/filters/types";
import { useSimulation } from "@core/engine/hooks/useSimulation";
import { useEnsembleActions } from "@providers/Ensemble/EnsembleProvider";
import OmniView from "@shared/components/items/views/OmniView";
import type { EnsembleChannel } from "@providers/Ensemble/ensemble.types";

/**
 * UpgradeView — Vista de Modding del Arsenal.
 * Implementa el layout 2x4 + Especiales siguiendo el patrón espejo.
 */
const UpgradeContent = () => {
  const { category } = useParams<{ category: string }>();
  const { activeSlot, setActiveSlot } = useArsenal();
  const { setMod } = useEnsembleActions();

  // Simulación reactiva desde el EnsembleStore
  const { entities } = useSimulation();

  const channelMap: Record<string, EnsembleChannel> = {
    warframe: "warframe",
    primary: "primary",
    secondary: "secondary",
    melee: "melee",
  };
  const channel = channelMap[category || "warframe"] || "warframe";

  // Lookup estable: channel asignado por MutatorBridge al construir el SimulationResult
  const activeEntity = entities.find((e: any) => e.channel === channel) ?? null;

  // Mapear atributos del motor a StatEntry[] para el StatPanel
  const simStats =
    activeEntity && activeEntity.attributes
      ? Object.entries(activeEntity.attributes).map(
          ([id, attr]: [string, any]) => ({
            key: id,
            label: (attr.label || id.replace(/_/g, " ")).toUpperCase(),
            value:
              typeof attr.final === "number"
                ? `${attr.final.toFixed(1)}${attr.unit || ""}`
                : String(attr.final),
          }),
        )
      : [];

  // Helper para traducir el ID del slot visual al índice del motor
  const getSlotIndex = (uid: string): number => {
    if (uid === "slot:aura") return 100;
    if (uid === "slot:exilus") return 101;
    if (uid.startsWith("slot:mod_"))
      return parseInt(uid.replace("slot:mod_", ""));
    if (uid.startsWith("slot:arcane_"))
      return 200 + parseInt(uid.replace("slot:arcane_", ""));
    return 0;
  };

  const handleModSelect = (mod: any) => {
    if (!activeSlot || !channel) return;

    const slotIndex = getSlotIndex(activeSlot);
    setMod(channel, slotIndex, {
      itemId: mod.unique_name,
      level: mod.rank || 0,
      rank: mod.rank || 0, // Mantenemos rank por compatibilidad de tipos antigua si la hubiera
    });
  };

  // Estado de filtros local para OmniView
  const [filterState, setFilterState] = useState<FilterState>({
    search: "",
    setSearch: (s) => setFilterState((prev) => ({ ...prev, search: s })),
    order: "A-Z",
    setOrder: (o) => setFilterState((prev) => ({ ...prev, order: o })),
    category: "all",
    setCategory: (c) => setFilterState((prev) => ({ ...prev, category: c })),
    family: "all",
    setFamily: (f) => setFilterState((prev) => ({ ...prev, family: f })),
    hovered: null,
    setHovered: (h) => setFilterState((prev) => ({ ...prev, hovered: h })),
    resetFilters: () => {},
  });

  return (
    <FilterProvider value={filterState}>
      <div className="h-full w-full flex flex-col p-6 gap-6 overflow-hidden bg-black/40 backdrop-blur-md">
        {/* [A] HEADER */}
        <header className="flex justify-between items-center border-b border-ui-primary/20 pb-4">
          <h1 className="text-2xl font-bold uppercase tracking-[0.2em] text-ui-primary">
            {category} Upgrade
          </h1>
          <div className="flex gap-4">
            {["A", "B", "C"].map((label) => (
              <button
                key={label}
                className="px-4 py-1 text-[11px] font-bold border border-ui-primary/30 hover:border-ui-accent transition-colors"
              >
                CONFIG {label}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 flex gap-8 min-h-0">
          {/* [B] STATS PANEL */}
          <aside className="w-[300px] overflow-y-auto pr-4 border-r border-ui-primary/10 custom-scrollbar">
            <StatPanel stats={simStats} title="Attributes" />
          </aside>

          {/* [C] MOD GRID */}
          <section className="w-full">
            <div className="flex justify-center flex-warp flex-direction-row">
              <ModSlot
                channel={channel}
                index={100}
                isAura
                isActive={activeSlot === "slot:aura"}
                onClick={() => setActiveSlot("slot:aura")}
              />
              <ModSlot
                channel={channel}
                index={101}
                isExilus
                isActive={activeSlot === "slot:exilus"}
                onClick={() => setActiveSlot("slot:exilus")}
              />
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <ModSlot
                  key={i}
                  channel={channel}
                  index={i}
                  isActive={activeSlot === `slot:mod_${i}`}
                  onClick={() => setActiveSlot(`slot:mod_${i}`)}
                />
              ))}
            </div>
          </section>

          {/* [D] ARCANES */}
          <aside className="w-[140px] flex flex-col gap-4">
            <ModSlot
              channel={channel}
              index={200}
              isActive={activeSlot === "slot:arcane_0"}
              onClick={() => setActiveSlot("slot:arcane_0")}
            />
            <ModSlot
              channel={channel}
              index={201}
              isActive={activeSlot === "slot:arcane_1"}
              onClick={() => setActiveSlot("slot:arcane_1")}
            />
          </aside>
        </main>

        {/* [E] & [F] MOD CATALOG (OMNIVIEW) */}
        <footer className="mt-auto pt-6 border-t border-ui-primary/20">
          <div className="h-[150px] overflow-hidden">
            <OmniView
              basePath={`/arsenal/upgrade/${category}`}
              forcedCategory="mod"
              onClick={handleModSelect}
            />
          </div>
        </footer>
      </div>
    </FilterProvider>
  );
};

export default function UpgradeView() {
  return (
    <ArsenalProvider>
      <UpgradeContent />
    </ArsenalProvider>
  );
}
