import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronsUpDown, Hexagon, PanelRight, Sparkles } from "lucide-react";
import { useLoadout } from "@providers/Loadout/loadout-context";
import { useArsenalUiState } from "src/domains/arsenal/state/use-arsenal-stub-state";
import { Button } from "@headlessui/react";
import PreviewPanel from "@shared/components/PreviewPanel";

// =============================================================================
// TIPOS LOCALES — stub, sin dependencia de contratos de engine/resolver
// =============================================================================

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

// =============================================================================
// SLOT DEFINITIONS — estructura del stub UX
// Define qué slots existen y su metadata de UI (label, icono, acciones).
// Es la estructura fija del Arsenal para el stub; el contrato de slots del
// loadout en runtime está abierto y se definirá al cerrar el flujo UX.
// Referencia: Docs/domains/builder-engine/status.md (Dirección de UI de Arsenal)
// =============================================================================

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
    id: "primaryWeapon",
    surface: "loadout",
    slotLabel: "Primary",
    defaultName: "Primary",
    icon: "/assets/ui/Category/Primary.png",
    description: "Arma principal del loadout.",
    actions: ["Swap", "Upgrade"],
  },
  {
    id: "secondaryWeapon",
    surface: "loadout",
    slotLabel: "Secondary",
    defaultName: "Secondary",
    icon: "/assets/ui/Category/Secondary.png",
    description: "Arma secundaria del loadout.",
    actions: ["Swap", "Upgrade"],
  },
  {
    id: "meleeWeapon",
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

// =============================================================================
// COMPONENTES
// =============================================================================

function LoadoutSelectorBar({
  activeChannelCount,
  isLoading,
}: {
  activeChannelCount: number;
  isLoading: boolean;
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
            {isLoading
              ? "Cargando datasets del builder"
              : `${activeChannelCount} / 4 canales activos`}
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
  onHoverStart,
  onHoverEnd,
}: {
  slot: ArsenalSlotDefinition;
  selected: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
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
        <img src={slot.icon} alt="" className="h-5 w-5 object-contain" />
        <div className="min-w-0">
          <div className="text-heading">{slot.defaultName}</div>
          <div className="text-subheading">{slot.slotLabel}</div>
        </div>
      </div>
    </Button>
  );
}

function ArsenalActionRail({
  slot,
}: {
  slot: ArsenalSlotDefinition | undefined;
}) {
  const navigate = useNavigate();

  if (!slot) return null;

  function handleAction(action: string) {
    if (!slot) return;
    if (action === "Swap") {
      // Navega a la vista de selección filtrada por la categoría del slot
      void navigate(`/arsenal/swap/${slot.id}`);
    }
    // Upgrade y otros: pendiente de implementación
  }

  return (
    <aside className="place-self-start justify-self-start flex w-full max-w-37.5 flex-col gap-1.5 pt-27">
      {slot.actions.map((action) => (
        <Button
          key={action}
          onClick={() => handleAction(action)}
          className="group relative border-square-b px-3 py-2 text-left transition-colors text-heading"
        >
          <div className="bg-glow" />
          {action}
        </Button>
      ))}
    </aside>
  );
}

function ArchonShardsPreviewSection() {
  const { arsenalMetadata, selectArchonShardSlot } = useArsenalUiState();
  const navigate = useNavigate();
  const shards = arsenalMetadata.warframe.archonShards;

  function handleSlotClick(slotIndex: number) {
    selectArchonShardSlot(slotIndex);
    void navigate("/arsenal/archon-shards");
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 py-2">
      {shards.map((shard, index) => {
        const isActive = shard.state === "filled";
        return (
          <Button
            key={index}
            data-active={isActive ? "" : undefined}
            onClick={() => handleSlotClick(index)}
            className="group relative flex h-12 w-12 items-center justify-center transition-colors"
            aria-label={`Shard slot ${index + 1}${isActive ? `: ${shard.label}` : " (vacío)"}`}
          >
            <Hexagon
              strokeWidth={0.5}
              className="pointer-events-none absolute inset-0 h-full w-full rotate-90 text-heading"
            />
            {isActive && shard.iconPath && (
              <img
                src={shard.iconPath}
                alt={shard.label}
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
  isReady,
}: {
  slot: ArsenalSlotDefinition | undefined;
  isReady: boolean;
}) {
  if (!slot) return null;

  return (
    <PreviewPanel
      name={slot.defaultName}
      description={slot.description}
      isReady={isReady}
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

// =============================================================================
// VISTA PRINCIPAL
// =============================================================================

export default function ArsenalView() {
  const { isLoading, isReady, activeChannelCount } = useLoadout();
  const [activeSurface, setActiveSurface] =
    useState<ArsenalSurfaceId>("loadout");
  const [previewSlotId, setPreviewSlotId] = useState("warframe");
  const [hoveredSlotId, setHoveredSlotId] = useState<string | null>(null);

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
            activeChannelCount={activeChannelCount}
            isLoading={isLoading}
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
                selected={slot.id === selectedSlot?.id}
                onHoverStart={() => handleSlotHoverStart(slot.id)}
                onHoverEnd={() => setHoveredSlotId(null)}
              />
            ))}
          </div>
        </div>

        <ArsenalActionRail slot={selectedSlot} />
        <ArsenalPreviewPanel slot={selectedSlot} isReady={isReady} />
      </div>
    </section>
  );
}
