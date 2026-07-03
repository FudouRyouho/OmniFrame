/**
 * @domain Features / Arsenal / Archon Shards
 * @SSoT docs/data/schemas/archon-shards/schema.md
 *
 * Vista de selección de Archon Shard para un slot del warframe.
 * El slot activo viene de arsenalUi.selectedArchonShardSlotIndex.
 * Al seleccionar una stat aplica inmediatamente al EnsembleStore y navega de vuelta.
 */
import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@headlessui/react";
import { useArsenalUiSession } from "@domains/arsenal/state/use-arsenal-ui-session";
import { useEnsemble, useEnsembleActions } from "@providers/Ensemble/EnsembleProvider";
import { useCatalog } from "@shared/hooks/data/use-catalog";
import type { ArchonShardCatalog } from "@shared/types";

// Las imágenes de shards viven en /assets/archon-shard/ (PascalCase), no en /images/
// (donde el resolver general busca los ítems). La variante tauforjada antepone "Tauforged".
const shardImageUrl = (imageName: string, tauforged: boolean): string =>
  `/assets/archon-shard/${tauforged ? "Tauforged" : ""}${imageName}`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function resolveStatLabel(label: string, value: [number, number], tauforged: boolean): string {
  return label.replace("|val1|", String(tauforged ? value[1] : value[0]));
}

// ── Vista principal ───────────────────────────────────────────────────────────

export default function ArchonShardSelectionView() {
  const { arsenalUi } = useArsenalUiSession();
  const intention = useEnsemble();
  const { setShard } = useEnsembleActions();
  const navigate = useNavigate();
  const catalog = useCatalog<ArchonShardCatalog>("archon-shards");

  const slotIndex = arsenalUi.selectedArchonShardSlotIndex ?? 0;
  const currentShard = intention.items.warframe.shards?.[slotIndex] ?? {
    shardType: null,
    effectId: null,
    isTauforged: false,
  };

  const [selectedType, setSelectedType] = useState<string | null>(currentShard.shardType);
  const [isTauforged, setIsTauforged] = useState(currentShard.isTauforged);

  if (!catalog) {
    return <div className="p-8 text-ui-primary/30 text-sm">Cargando...</div>;
  }

  // type = la CLAVE del catálogo (/Lotus/.../ArchonCrystal*), que es lo que el engine espera
  // (ShardRepository.resolve hace catalog[shardType]). Antes se pasaba el color
  // (name.split(' ')[0]) → catalog[color] = undefined → ningún shard aplicaba.
  const shardEntries = Object.entries(catalog).map(([key, entry]) => ({
    type: key,
    entry,
  }));

  const activeEntry = selectedType
    ? shardEntries.find((s) => s.type === selectedType)?.entry ?? null
    : null;

  function handleSelectStat(effectId: string) {
    if (!selectedType) return;
    setShard(slotIndex, { shardType: selectedType, effectId, isTauforged });
    void navigate("/arsenal");
  }

  function handleClear() {
    setShard(slotIndex, null);
    void navigate("/arsenal");
  }

  function handleTypeSelect(type: string) {
    setSelectedType(type);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-ui-primary/10 px-4 py-3">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-ui-primary/90">Archon Shard</div>
          <div className="text-[10px] text-ui-primary/30 font-mono">
            Slot {slotIndex + 1} / 5
            {currentShard.effectId && (
              <span className="ml-2 text-ui-accent/60">equipado</span>
            )}
          </div>
        </div>
        {currentShard.effectId && (
          <Button
            onClick={handleClear}
            className="text-xs text-ui-primary/30 hover:text-red-400/70 transition-colors px-2 py-1 rounded hover:bg-red-400/5"
          >
            Limpiar slot
          </Button>
        )}
      </header>

      {/* Shard type selector */}
      <div className="flex items-center gap-2 border-b border-ui-primary/10 px-4 py-3">
        {shardEntries.map(({ type, entry }) => {
          const isActive = type === selectedType;
          return (
            <Button
              key={type}
              data-active={isActive ? "" : undefined}
              onClick={() => handleTypeSelect(type)}
              title={entry.name}
              className="relative flex h-10 w-10 items-center justify-center rounded border border-ui-primary/10 bg-ui-primary/3 transition-all hover:border-ui-primary/30 data-[active]:border-ui-accent/50 data-[active]:bg-ui-accent/5"
            >
              <img
                src={shardImageUrl(entry.image_name, isTauforged)}
                alt={entry.name}
                className="h-6 w-6 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </Button>
          );
        })}
      </div>

      {/* Tauforged toggle */}
      <div className="flex items-center gap-2 border-b border-ui-primary/10 px-4 py-2">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isTauforged}
            onChange={(e) => setIsTauforged(e.target.checked)}
            className="accent-ui-accent"
          />
          <span className="text-xs text-ui-primary/50">Tauforged</span>
        </label>
        {isTauforged && (
          <span className="text-[10px] font-mono text-ui-accent/60">×1.5</span>
        )}
      </div>

      {/* Stat list */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {!activeEntry ? (
          <p className="py-6 text-center text-xs text-ui-primary/25 italic">
            Selecciona un tipo de shard
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {activeEntry.stats.map((stat) => {
              const isSelected =
                currentShard.effectId === stat.id &&
                currentShard.shardType === selectedType;
              return (
                <Button
                  key={stat.id}
                  data-active={isSelected ? "" : undefined}
                  onClick={() => handleSelectStat(stat.id)}
                  className="group flex w-full items-center justify-between gap-3 rounded border border-transparent px-3 py-2.5 text-left transition-all hover:border-ui-primary/15 hover:bg-ui-primary/4 data-[active]:border-ui-accent/30 data-[active]:bg-ui-accent/5"
                >
                  <span className="text-sm text-ui-primary/80 group-data-[active]:text-ui-primary">
                    {resolveStatLabel(stat.label, stat.value, isTauforged)}
                  </span>
                  {isSelected && (
                    <span className="shrink-0 text-[10px] font-mono text-ui-accent/70">
                      activo
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
