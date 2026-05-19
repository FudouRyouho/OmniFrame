/**
 * @domain Features / Arsenal
 * @SSoT docs/domains/ui-ux/shell-status.md
 * @status stub / en desarrollo
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronsUpDown, Hexagon, PanelRight, Sparkles } from "lucide-react";
import { Button } from "@headlessui/react";
import PreviewPanel from "@shared/components/PreviewPanel";
import { useArsenalUiState } from "./state/use-arsenal-stub-state";
import { ARCHON_SHARD_CATALOG } from "./arsenal-state";
import { useEnsemble } from "@providers/Ensemble/EnsembleProvider";
import { Registry } from "@shared/data/DataRegistry";
import type { BaseItem } from "@shared/types";
import type { EnsembleChannel } from "@providers/Ensemble/ensemble.types";

// --- Tipos Locales ---

export type ArsenalSurfaceId = "loadout" | "companion" | "vehicles";

type ArsenalSlotDefinition = {
  id: string;
  surface: ArsenalSurfaceId;
  slotLabel: string;
  defaultName: string;
  icon: string;
  description: string;
  actions: string[];
  showAbilityNodes?: boolean;
};

// --- Slot Definitions ---

const SURFACE_TABS = [
  { id: "loadout", label: "Loadout", icon: "/assets/ui/Category/Warframe.png" },
  {
    id: "companion",
    label: "Companion",
    icon: "/assets/ui/Category/Sentinel.png",
  },
  {
    id: "vehicles",
    label: "Vehicles",
    icon: "/assets/ui/Category/Archwing.png",
  },
] as const satisfies readonly {
  id: ArsenalSurfaceId;
  label: string;
  icon: string;
}[];

const SLOT_DEFINITIONS: readonly ArsenalSlotDefinition[] = [
  {
    id: "warframe",
    surface: "loadout",
    slotLabel: "Warframe",
    defaultName: "Warframe",
    icon: "/assets/ui/Category/Warframe.png",
    description: "Slot principal del loadout.",
    actions: ["Swap", "Upgrade", "Abilities"],
    showAbilityNodes: true,
  },
  {
    id: "primary_weapon",
    surface: "loadout",
    slotLabel: "Primary",
    defaultName: "Primary",
    icon: "/assets/ui/Category/Primary.png",
    description: "Arma principal del loadout.",
    actions: ["Swap", "Upgrade"],
  },
  {
    id: "secondary_weapon",
    surface: "loadout",
    slotLabel: "Secondary",
    defaultName: "Secondary",
    icon: "/assets/ui/Category/Secondary.png",
    description: "Arma secundaria del loadout.",
    actions: ["Swap", "Upgrade"],
  },
  {
    id: "melee_weapon",
    surface: "loadout",
    slotLabel: "Melee",
    defaultName: "Melee",
    icon: "/assets/ui/Category/Melee.png",
    description: "Arma cuerpo a cuerpo del loadout.",
    actions: ["Swap", "Upgrade"],
  },
  {
    id: "warframeExtensions",
    surface: "loadout",
    slotLabel: "Extensions",
    defaultName: "Exalted / Venari / etc.",
    icon: "/assets/ui/Category/Augment.png",
    description: "Stub para extensiones del warframe.",
    actions: ["Inspect", "Configure"],
  },
  {
    id: "focus",
    surface: "loadout",
    slotLabel: "Focus",
    defaultName: "Focus School",
    icon: "/assets/ui/Category/Amp.png",
    description: "Superficie reservada para escuela de Focus.",
    actions: ["Swap", "Inspect"],
  },
  {
    id: "parazon",
    surface: "loadout",
    slotLabel: "Parazon",
    defaultName: "Parazon",
    icon: "/assets/ui/Category/IconLink256.png",
    description: "Slot reservado para Parazon.",
    actions: ["Swap", "Inspect"],
  },
  {
    id: "companion",
    surface: "companion",
    slotLabel: "Companion",
    defaultName: "Companion",
    icon: "/assets/ui/Category/Sentinel.png",
    description: "Compañero principal.",
    actions: ["Swap", "Upgrade"],
  },
  {
    id: "companionWeapon",
    surface: "companion",
    slotLabel: "Companion Weapon",
    defaultName: "Companion Weapon",
    icon: "/assets/ui/Category/Primary.png",
    description: "Arma del companion.",
    actions: ["Swap", "Upgrade"],
  },
  {
    id: "necramech",
    surface: "vehicles",
    slotLabel: "Necramech",
    defaultName: "Necramech",
    icon: "/assets/ui/Category/Necramech.png",
    description: "Stub estructural de vehicles.",
    actions: ["Swap", "Inspect"],
  },
  {
    id: "archwing",
    surface: "vehicles",
    slotLabel: "Archwing",
    defaultName: "Archwing",
    icon: "/assets/ui/Category/Archwing.png",
    description: "Vehículo atmosférico/espacial.",
    actions: ["Swap", "Inspect"],
  },
  {
    id: "archgun",
    surface: "vehicles",
    slotLabel: "Archgun",
    defaultName: "Archgun",
    icon: "/assets/ui/Category/Archgun.png",
    description: "Arma de vehículo.",
    actions: ["Swap", "Inspect"],
  },
] as const;

// --- Helper de Hidratación ---
// Mapeo entre los IDs de slot del Arsenal y los canales del EnsembleStore
const SLOT_TO_ENSEMBLE_CHANNEL: Record<string, { channel: EnsembleChannel, domain: string }> = {
  warframe: { channel: "warframe", domain: "warframe" },
  primary_weapon: { channel: "primary", domain: "weapon" },
  secondary_weapon: { channel: "secondary", domain: "weapon" },
  melee_weapon: { channel: "melee", domain: "weapon" },
  companion: { channel: "companion", domain: "companion" },
  companionWeapon: { channel: "companion_weapon", domain: "weapon" }, // o companion-weapon según el data registry
  archwing: { channel: "archwing", domain: "vehicle" },
  archgun: { channel: "archgun", domain: "archwing-weapon" },
  necramech: { channel: "necramech", domain: "vehicle" },
};

// --- Componentes ---

function LoadoutSelectorBar({
  active_channel_count,
}: {
  active_channel_count: number;
}) {
  return (
    <header className="border-square flex items-center justify-between gap-3 px-3 py-2">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center">
          <img
            src="/assets/ui/Category/Warframe.png"
            alt="Loadout"
            className="h-5 w-5 object-contain opacity-90"
          />
        </div>
        <div className="min-w-0">
          <div className="truncate text-[13px] text-ui-primary/95 md:text-[16px]">
            Default Loadout
          </div>
          <div className="text-[9px] uppercase tracking-[0.2em] text-ui-primary/55">
            {active_channel_count} / 4 canales activos
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-ui-primary/55">
        <ChevronsUpDown className="h-4 w-4" />
        <PanelRight className="h-4 w-4" />
      </div>
    </header>
  );
}

function ArsenalSurfaceTabs({
  activeSurface,
  onSelect,
}: {
  activeSurface: ArsenalSurfaceId;
  onSelect: (surface: ArsenalSurfaceId) => void;
}) {
  return (
    <div className="flex w-full flex-row gap-1.5">
      {SURFACE_TABS.map((tab) => (
        <Button
          key={tab.id}
          data-active={tab.id === activeSurface ? "" : undefined}
          onClick={() => onSelect(tab.id)}
          className="flex min-w-0 w-full items-center justify-center px-2 py-2 cursor-pointer transition-all border-square-b"
        >
          <img
            src={tab.icon}
            alt=""
            className="h-7 w-7 object-contain justify-self-center opacity-90"
          />
        </Button>
      ))}
    </div>
  );
}

function ArsenalSlotCard({
  slot,
  selected,
  hydratedItem,
  onHoverStart,
  onHoverEnd,
}: {
  slot: ArsenalSlotDefinition;
  selected: boolean;
  hydratedItem?: BaseItem | null;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
  const displayName = hydratedItem ? hydratedItem.name : slot.defaultName;
  const displayIcon = hydratedItem?.image || slot.icon;

  return (
    <Button
      data-active={selected ? "" : undefined}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onFocus={onHoverStart}
      onBlur={onHoverEnd}
      onClick={onHoverStart}
      className="group border-square flex w-full items-center justify-between gap-2.5 px-3 py-2 text-left transition-all"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <img src={displayIcon} alt="" className="h-5 w-5 object-contain" />
        <div className="min-w-0">
          <div className="text-heading truncate">{displayName}</div>
          <div className="text-subheading">{slot.slotLabel}</div>
        </div>
      </div>
    </Button>
  );
}

function ArsenalActionRail({
  slot,
  hydratedItem,
}: {
  slot: ArsenalSlotDefinition | undefined;
  hydratedItem?: BaseItem | null;
}) {
  const navigate = useNavigate();

  if (!slot) return null;

  function handleAction(action: string) {
    if (!slot) return;
    if (action === "Swap") {
      // Navega a la vista de selección filtrada por la categoría del slot
      void navigate(`/arsenal/swap/${slot.id}`);
    }
    if (action === "Upgrade") {
      void navigate(`/arsenal/upgrade/${slot.id}`);
    }
  }

  return (
    <aside className="place-self-start justify-self-start flex w-full max-w-37.5 flex-col gap-1.5 pt-27">
      {slot.actions.map((action) => {
        const isFilled = !!hydratedItem;
        const isDisabled = (action === "Upgrade" || action === "Abilities") && !isFilled;

        return (
          <Button
            key={action}
            disabled={isDisabled}
            onClick={() => handleAction(action)}
            className="group relative border-square-b px-3 py-2 text-left transition-colors text-heading disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <div className="bg-glow" />
            {action}
          </Button>
        );
      })}
    </aside>
  );
}

function ArchonShardsPreviewSection() {
  const { selectArchonShardSlot } = useArsenalUiState();
  const intention = useEnsemble();
  const navigate = useNavigate();
  const shards = intention.items.warframe.shards || [];

  function handleSlotClick(slotIndex: number) {
    selectArchonShardSlot(slotIndex);
    void navigate("/arsenal/archon-shards");
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 py-2">
      {shards.map((shard, index) => {
        const isFilled = !!shard.effectId;
        const catalogEntry = isFilled
          ? ARCHON_SHARD_CATALOG.find(e => e.shardType === shard.shardType)
          : null;
        const iconPath = catalogEntry
          ? (shard.isTauforged ? catalogEntry.tauforgedIconPath : catalogEntry.iconPath)
          : null;
        return (
          <Button
            key={index}
            data-active={isFilled ? "" : undefined}
            onClick={() => handleSlotClick(index)}
            className="group relative flex h-12 w-12 items-center justify-center transition-colors"
            aria-label={`Shard slot ${index + 1}${isFilled && catalogEntry ? `: ${catalogEntry.shardName}` : " (vacío)"}`}
          >
            <Hexagon
              strokeWidth={0.5}
              className="pointer-events-none absolute inset-0 h-full w-full rotate-90 text-heading"
            />
            {isFilled && iconPath && (
              <img
                src={iconPath}
                alt={catalogEntry?.shardName}
                className="relative z-10 object-contain"
                style={{ width: "70%", height: "70%" }}
              />
            )}
          </Button>
        );
      })}
    </div>
  );
}

function ArsenalPreviewPanel({
  slot,
  hydratedItem,
}: {
  slot: ArsenalSlotDefinition | undefined;
  hydratedItem?: BaseItem | null;
}) {
  if (!slot) return null;

  const displayName = hydratedItem ? hydratedItem.name : slot.defaultName;

  return (
    <PreviewPanel
      name={displayName}
      description={slot.description}
      isReady={true}
    >
      {slot.showAbilityNodes && (
        <div className="flex items-center justify-end gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex h-9 w-9 items-center justify-center border border-ui-accent/40 text-ui-accent"
            >
              <Sparkles className="h-4 w-4" />
            </div>
          ))}
        </div>
      )}
      {slot.showAbilityNodes && <ArchonShardsPreviewSection />}
    </PreviewPanel>
  );
}

// --- Vista Principal ---

export default function ArsenalView() {
  const intention = useEnsemble();
  const [hydratedData, setHydratedData] = useState<Record<string, BaseItem>>({});
  
  const active_channel_count = Object.values(intention.items).filter(i => i.itemId).length;
  const [activeSurface, setActiveSurface] = useState<ArsenalSurfaceId>("loadout");
  const [previewSlotId, setPreviewSlotId] = useState("warframe");
  const [hoveredSlotId, setHoveredSlotId] = useState<string | null>(null);

  // Hydration Effect
  useEffect(() => {
    let mounted = true;
    
    const loadItems = async () => {
      const newHydration: Record<string, BaseItem> = {};
      
      const promises = Object.entries(SLOT_TO_ENSEMBLE_CHANNEL).map(async ([slotId, config]) => {
        const itemIntention = intention.items[config.channel];
        if (itemIntention?.itemId) {
          try {
             console.log(`[ArsenalView] Hydrating slot ${slotId} with ${itemIntention.itemId}...`);
             const item = await Registry.getItemById(config.domain, itemIntention.itemId);
             if (item) {
               newHydration[slotId] = item;
             } else {
               console.warn(`[ArsenalView] ⚠️ Item not found in registry: ${itemIntention.itemId} (Domain: ${config.domain})`);
             }
          } catch (e) {
             console.error(`[ArsenalView] ❌ Error hydrating ${itemIntention.itemId}`, e);
          }
        }
      });

      await Promise.all(promises);
      if (mounted) {
        setHydratedData(newHydration);
      }
    };

    loadItems();
    return () => { mounted = false; };
  }, [intention.items]);

  const visibleSlots = useMemo(
    () => SLOT_DEFINITIONS.filter((slot) => slot.surface === activeSurface),
    [activeSurface],
  );

  useEffect(() => {
    if (!visibleSlots.some((slot) => slot.id === previewSlotId)) {
      setPreviewSlotId(visibleSlots[0]?.id ?? "");
    }
    if (
      hoveredSlotId &&
      !visibleSlots.some((slot) => slot.id === hoveredSlotId)
    ) {
      setHoveredSlotId(null);
    }
  }, [hoveredSlotId, previewSlotId, visibleSlots]);

  const handleSlotHoverStart = (slotId: string) => {
    setHoveredSlotId(slotId);
    setPreviewSlotId(slotId);
  };

  const selectedSlot =
    visibleSlots.find((slot) => slot.id === previewSlotId) ?? visibleSlots[0];

  return (
    <section className="h-full overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(var(--color-ui-accent),0.08),transparent_38%),linear-gradient(180deg,rgba(0,0,0,0.1),rgba(0,0,0,0.28))] px-4 py-3">
      <div className="w-full h-full grid grid-cols-3 items-start gap-4">
        <div className="flex flex-col gap-3">
          <LoadoutSelectorBar
            active_channel_count={active_channel_count}
          />
          <ArsenalSurfaceTabs
            activeSurface={activeSurface}
            onSelect={setActiveSurface}
          />
          <div className="space-y-2">
            {visibleSlots.map((slot) => (
              <ArsenalSlotCard
                key={slot.id}
                slot={slot}
                hydratedItem={hydratedData[slot.id]}
                selected={slot.id === selectedSlot?.id}
                onHoverStart={() => handleSlotHoverStart(slot.id)}
                onHoverEnd={() => setHoveredSlotId(null)}
              />
            ))}
          </div>
        </div>

        <ArsenalActionRail 
          slot={selectedSlot} 
          hydratedItem={selectedSlot ? hydratedData[selectedSlot.id] : null} 
        />
        <ArsenalPreviewPanel slot={selectedSlot} hydratedItem={selectedSlot ? hydratedData[selectedSlot.id] : null} />
      </div>
    </section>
  );
}
