import { useMemo, useState } from "react";
import { useParams } from "react-router";
import { ArsenalProvider, useArsenal } from "../context/ArsenalContext";
import { StatPanel } from "@shared/components/items/specs/StatPanel";
import { toStatEntries } from "@lib/format/stat-entry";
import { useViewModel } from "@providers/Ensemble/use-view-model";
import { useEnsemble, useEnsembleActions } from "@providers/Ensemble/EnsembleProvider";
import { useItems } from "@shared/hooks/data/use-items";
import type { BaseItem, Mod, Arcane } from "@shared/types";
import { SLOT_TO_ENSEMBLE_CHANNEL } from "../slot-channel";

/**
 * UpgradeView — Vista de Modding del Arsenal (UI MÍNIMA FUNCIONAL).
 *
 * Decisión 2026-06-12 (function-first): se reemplazó la réplica 1:1 de la pantalla
 * de modding de Warframe (grid 2×4 + ModSlot SVG + cards canvas de OmniView) por una
 * superficie plana — botones de slot + lista buscable — para validar el loop funcional
 * equip → engine → stat sin pelear con el visual frágil. El 1:1 vive en OQ-DATA-10
 * (UI/UX), diferido. No anclar contratos a esta UI (ver feedback-ui-no-es-biblia-derivar-de-d2).
 *
 * Conexiones (foco "0", consumo desde un solo lugar): mods → store.setMod (→ intention.mods),
 * arcanos → store.setArcane (→ intention.arcanes). El engine lee ambos del store vía el bridge.
 */

// Slots del canal, en orden.
const SLOT_DEFS: { uid: string; label: string }[] = [
  { uid: "slot:aura", label: "Aura" },
  { uid: "slot:exilus", label: "Exilus" },
  ...Array.from({ length: 8 }, (_, i) => ({ uid: `slot:mod_${i}`, label: `Mod ${i + 1}` })),
  { uid: "slot:arcane_0", label: "Arcane 1" },
  { uid: "slot:arcane_1", label: "Arcane 2" },
];

const isArcaneSlot = (uid: string): boolean => uid.startsWith("slot:arcane_");
const arcaneSlotIndex = (uid: string): number => parseInt(uid.replace("slot:arcane_", ""));

// Traduce el uid del slot de mod al índice que entiende el motor (arcanos van por su propia vía).
const getModSlotIndex = (uid: string): number => {
  if (uid === "slot:aura") return 100;
  if (uid === "slot:exilus") return 101;
  if (uid.startsWith("slot:mod_")) return parseInt(uid.replace("slot:mod_", ""));
  return 0;
};

const UpgradeContent = () => {
  const { category } = useParams<{ category: string }>();
  const { activeSlot, setActiveSlot } = useArsenal();
  const { setMod, setArcane } = useEnsembleActions();
  const intention = useEnsemble();

  // ViewModelContract reactivo desde el EnsembleStore (cut C→D vía @shared).
  const { entities } = useViewModel();

  // Catálogos (isla DataRegistry — mismo origen que los overrides del motor; el unique_name
  // debe coincidir para que el modifier resuelva). Mods y arcanos son canales distintos.
  const { data: mods, isLoading: modsLoading } = useItems("mod");
  const { data: arcanes, isLoading: arcanesLoading } = useItems("arcane");
  const [search, setSearch] = useState("");

  // slot.id de la ruta (`primary_weapon`, …) → canal del ensemble (SSoT compartido).
  const channel = category ? SLOT_TO_ENSEMBLE_CHANNEL[category]?.channel : undefined;

  const activeEntity = channel
    ? entities.find((e) => e.channel === channel) ?? null
    : null;

  const activeIsArcane = activeSlot ? isArcaneSlot(activeSlot) : false;

  // StatViewModel[] → StatEntry[] vía el proyector único (lib/format). Mata el mapeo inline.
  const simStats = activeEntity ? toStatEntries(activeEntity.stats) : [];

  // unique_name → nombre (mods + arcanos), para mostrar qué hay equipado en cada slot.
  const nameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const x of mods) m.set(x.unique_name, x.name);
    for (const x of arcanes) m.set(x.unique_name, x.name);
    return m;
  }, [mods, arcanes]);

  // Compat campo-a-campo contra compat_name (data-driven, no matriz hardcodeada).
  // - Arcanos: compat_name está a granularidad de CANAL (warframe/primary/secondary/melee) →
  //   match limpio por channel. Sub-tipos (zaw/kitgun/bow/shotgun, ~19) quedan fuera → OQ-DATA-11.
  // - Mods: arma → family, resto → domain. PROVISIONAL e incompleto: la compat de mods es
  //   muchos-a-muchos y no está materializada (sniper/bow no ven 'Rifle'; dual pistols ≠ 'Pistol').
  //   Ver OQ-DATA-11.
  const compatToken = activeIsArcane
    ? channel?.toLowerCase()
    : (activeEntity?.domain === "weapon" ? activeEntity.family : activeEntity?.domain)?.toLowerCase();

  // Lista: catálogo según el slot activo + filtro compat (mods) + búsqueda + dedup + tope.
  const filtered = useMemo(() => {
    const catalog = activeIsArcane ? arcanes : mods;
    const q = search.trim().toLowerCase();
    const seen = new Set<string>();
    const out: BaseItem[] = [];
    for (const it of catalog) {
      if (compatToken && (it as { compat_name?: string | null }).compat_name?.toLowerCase() !== compatToken) continue;
      if (q && !it.name.toLowerCase().includes(q)) continue;
      if (seen.has(it.unique_name)) continue;
      seen.add(it.unique_name);
      out.push(it);
      if (out.length >= 100) break;
    }
    return out;
  }, [activeIsArcane, arcanes, mods, search, compatToken]);

  if (!channel) {
    return (
      <div className="h-full w-full flex items-center justify-center text-ui-primary/50 uppercase tracking-[0.2em] text-sm">
        Slot no reconocido: {category}
      </div>
    );
  }

  const isLoading = activeIsArcane ? arcanesLoading : modsLoading;

  // Equipar el ítem del catálogo en el slot activo, ruteando al canal correcto del store.
  const equip = (item: BaseItem) => {
    if (!activeSlot) return;
    if (isArcaneSlot(activeSlot)) {
      const maxRank = (item as Arcane).max_rank ?? 0;
      setArcane(channel, arcaneSlotIndex(activeSlot), { itemId: item.unique_name, rank: maxRank });
    } else {
      const maxRank = (item as Mod).stats?.rank ?? 0; // el motor lee 'level'; equipamos a rank máximo
      setMod(channel, getModSlotIndex(activeSlot), {
        itemId: item.unique_name,
        level: maxRank,
        rank: maxRank,
      });
    }
  };

  const clear = (uid: string) => {
    if (isArcaneSlot(uid)) setArcane(channel, arcaneSlotIndex(uid), null);
    else setMod(channel, getModSlotIndex(uid), null);
  };

  const equippedIdFor = (uid: string): string | null =>
    (isArcaneSlot(uid)
      ? intention.arcanes?.[channel]?.[arcaneSlotIndex(uid)]?.itemId
      : intention.mods[channel]?.[getModSlotIndex(uid)]?.itemId) ?? null;


  return (
    <div className="h-full w-full flex flex-col p-6 gap-4 overflow-hidden bg-black/40">
      <header className="border-b border-ui-primary/20 pb-3">
        <h1 className="text-xl font-bold uppercase tracking-[0.2em] text-ui-primary">
          {category} — Upgrade
        </h1>
        <p className="text-[11px] text-ui-primary/40">
          Canal: {channel} · UI mínima funcional (1:1 diferido — OQ-DATA-10)
        </p>
      </header>

      <main className="flex-1 flex gap-6 min-h-0">
        {/* Stats resueltos por el motor */}
        <aside className="w-[280px] shrink-0 overflow-y-auto pr-3 border-r border-ui-primary/10 custom-scrollbar">
          <StatPanel stats={simStats} title="Attributes" />
        </aside>

        {/* Slots como botones planos */}
        <section className="w-[280px] shrink-0 overflow-y-auto custom-scrollbar">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-ui-primary/60 mb-2">Slots</h2>
          <div className="flex flex-col gap-1">
            {SLOT_DEFS.map(({ uid, label }) => {
              const equipped = equippedIdFor(uid);
              const isActive = activeSlot === uid;
              return (
                <div
                  key={uid}
                  className={`flex items-center justify-between gap-2 px-3 py-2 border text-sm cursor-pointer transition-colors ${
                    isActive
                      ? "border-ui-accent bg-ui-accent/10"
                      : "border-ui-primary/20 hover:border-ui-primary/40"
                  }`}
                  onClick={() => setActiveSlot(uid)}
                >
                  <span className="text-ui-primary/50 text-[11px] uppercase w-16 shrink-0">
                    {label}
                  </span>
                  <span className="flex-1 truncate">
                    {equipped ? (
                      nameById.get(equipped) ?? equipped
                    ) : (
                      <span className="opacity-30">vacío</span>
                    )}
                  </span>
                  {equipped && (
                    <button
                      type="button"
                      className="text-ui-primary/40 hover:text-ui-accent px-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        clear(uid);
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Picker: lista buscable plana (mods o arcanos según el slot activo) */}
        <section className="flex-1 flex flex-col min-h-0">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              !activeSlot
                ? "Seleccioná un slot primero"
                : activeIsArcane
                  ? "Buscar arcano…"
                  : "Buscar mod…"
            }
            disabled={!activeSlot}
            className="mb-2 px-3 py-2 bg-black/40 border border-ui-primary/20 text-sm outline-none focus:border-ui-accent disabled:opacity-30"
          />
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-px">
            {isLoading && <p className="text-ui-primary/40 text-sm p-2">Cargando…</p>}
            {!isLoading &&
              filtered.map((item) => (                
                <button
                  key={item.unique_name}
                  type="button"
                  disabled={!activeSlot}
                  onClick={() => equip(item)}
                  className="text-left px-3 py-1.5 text-sm border-l-2 border-transparent hover:border-ui-accent hover:bg-white/5 disabled:opacity-30"
                >
                  {item.name}
                </button>
              ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default function UpgradeView() {
  return (
    <ArsenalProvider>
      <UpgradeContent />
    </ArsenalProvider>
  );
}
