import { useMemo, useState } from "react";
import {
  ARCHON_SHARD_BONUS_CATALOG,
  ARCHON_SHARD_CATALOG,
  type ArchonShardType,
} from "src/domains/arsenal/arsenal-state";
import { useArsenalUiState } from "src/domains/arsenal/state/use-arsenal-stub-state";
import classNames from "classnames";
import { Button, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

type ModalStep = "shard" | "bonus" | null;

export default function ArchonShardSelectionView() {
  const {
    arsenalMetadata,
    arsenalUi,
    selectArchonShardSlot,
    equipWarframeArchonShardByEffect,
    clearWarframeArchonShardSlot,
  } = useArsenalUiState();

  const [modalStep, setModalStep] = useState<ModalStep>(null);
  const [isTauforgedSelection, setIsTauforgedSelection] = useState(false);
  const [pendingShardType, setPendingShardType] =
    useState<ArchonShardType | null>(null);

  const shards = arsenalMetadata.warframe.archonShards;
  const selectedIndex = arsenalUi.selectedArchonShardSlotIndex;

  const selectedShard = selectedIndex !== null ? shards[selectedIndex] : null;

  const pendingShardEntry = useMemo(() => {
    if (!pendingShardType) return null;
    return (
      ARCHON_SHARD_CATALOG.find(
        (entry) => entry.shardType === pendingShardType,
      ) ?? null
    );
  }, [pendingShardType]);

  function handleSlotClick(slotIndex: number) {
    selectArchonShardSlot(slotIndex);
    setPendingShardType(null);
    setIsTauforgedSelection(false);
    setModalStep("shard");
  }

  function handleShardTypeSelect(
    shardType: ArchonShardType,
    isTauforged: boolean,
  ) {
    setPendingShardType(shardType);
    setIsTauforgedSelection(isTauforged);
    setModalStep("bonus");
  }

  function handleBonusSelect(effectId: string) {
    if (selectedIndex === null) return;
    equipWarframeArchonShardByEffect(
      selectedIndex,
      effectId,
      isTauforgedSelection,
    );
    setModalStep(null);
    setPendingShardType(null);
  }

  function handleClear() {
    if (selectedIndex === null) return;
    clearWarframeArchonShardSlot(selectedIndex);
    setModalStep(null);
  }

  function handleCloseModal() {
    setModalStep(null);
    setPendingShardType(null);
  }

  return (
    <div className="relative h-full overflow-y-auto px-4 py-6">
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-center gap-x-4 gap-y-8 py-4">
            {shards.map((shard, index) => {
              const isSelected = selectedIndex === index;
              return (
                <div key={index} className="flex w-40 flex-col items-center">
                  <Button
                    type="button"
                    data-active={isSelected ? "" : undefined}
                    onClick={() => handleSlotClick(index)}
                    className={classNames(
                      "flex h-28 w-full items-center justify-center border border-ui-primary/28 bg-black/28 transition-all hover:border-ui-accent/45 data-active:border-ui-accent/75 data-active:bg-ui-accent/12 data-active:shadow-[0_0_14px_rgba(var(--color-ui-accent),0.18)]",
                      isSelected && "z-10",
                    )}
                    aria-label={`Slot ${index + 1}${shard.state === "filled" ? `: ${shard.label}` : " (vacío)"}`}
                  >
                    {shard.state === "filled" && shard.iconPath ? (
                      <img
                        src={shard.iconPath}
                        alt={shard.label}
                        className="h-16 w-16 object-contain drop-shadow-[0_0_10px_rgba(var(--color-ui-accent),0.2)]"
                      />
                    ) : (
                      <span className="h-4 w-4 rounded-full border border-ui-primary/45" />
                    )}
                  </Button>
                  <span className="mt-1 text-center text-[10px] text-ui-primary/45">
                    {shard.valueLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="space-y-3">
          <div className="rounded border border-ui-primary/25 bg-black/28 p-3">
            <div className="grid grid-cols-6 gap-2">
              {ARCHON_SHARD_CATALOG.map((entry) => (
                <div
                  key={`${entry.shardType}-visual-normal`}
                  className="space-y-1 text-center"
                >
                  <div className=" mx-auto flex h-11 w-11 items-center justify-center border border-ui-primary/28 bg-black/30">
                    <img
                      src={entry.iconPath}
                      alt={entry.shardName}
                      className="h-7 w-7 object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-6 gap-2">
              {ARCHON_SHARD_CATALOG.map((entry) => (
                <div
                  key={`${entry.shardType}-visual-tau`}
                  className="space-y-1 text-center"
                >
                  <div className=" mx-auto flex h-11 w-11 items-center justify-center border border-ui-accent/45 bg-ui-accent/8">
                    <img
                      src={entry.tauforgedIconPath}
                      alt={`Tauforged ${entry.shardName}`}
                      className="h-7 w-7 object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <Dialog
        open={modalStep !== null}
        onClose={handleCloseModal}
        className="relative z-40"
      >
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-3xl border border-ui-primary/30 bg-black/85 p-4 shadow-[0_0_24px_rgba(0,0,0,0.45)]">
            <div className="mb-3 flex items-center justify-between">
              <DialogTitle className="text-sm font-semibold tracking-wider text-ui-primary/92 uppercase">
                {modalStep === "shard"
                  ? `Slot ${(selectedIndex ?? 0) + 1} · Seleccionar fragmento`
                  : `Slot ${(selectedIndex ?? 0) + 1} · Seleccionar bonificación`}
              </DialogTitle>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-xs text-ui-primary/60 hover:text-ui-accent"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-ui-primary/60 hover:text-ui-accent"
              >
                Limpiar
              </button>
            </div>

            {modalStep === "shard" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                  {ARCHON_SHARD_CATALOG.map((entry) => (
                    <button
                      key={`${entry.shardType}-normal`}
                      type="button"
                      onClick={() =>
                        handleShardTypeSelect(entry.shardType, false)
                      }
                      className=" flex flex-col items-center gap-2 border border-ui-primary/28 bg-black/35 p-2 text-center transition-colors hover:border-ui-accent/45"
                    >
                      <img
                        src={entry.iconPath}
                        alt={entry.shardName}
                        className="h-10 w-10 object-contain"
                      />
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                  {ARCHON_SHARD_CATALOG.map((entry) => (
                    <button
                      key={`${entry.shardType}-tau`}
                      type="button"
                      onClick={() =>
                        handleShardTypeSelect(entry.shardType, true)
                      }
                      className=" flex flex-col items-center gap-2 border border-ui-accent/45 bg-ui-accent/9 p-2 text-center transition-colors hover:border-ui-accent/70"
                    >
                      <img
                        src={entry.tauforgedIconPath}
                        alt={`Tauforged ${entry.shardName}`}
                        className="h-10 w-10 object-contain"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {modalStep === "bonus" && pendingShardEntry && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-ui-primary/60">
                  <span>{pendingShardEntry.shardName}</span>
                  <span>·</span>
                  <span>{isTauforgedSelection ? "Tauforged" : "Normal"}</span>
                </div>

                <div className="grid gap-2">
                  {ARCHON_SHARD_BONUS_CATALOG.filter(
                    (entry) => entry.shardType === pendingShardEntry.shardType,
                  ).map((entry) => {
                    const isEquipped =
                      selectedShard?.state === "filled" &&
                      selectedShard.selectedBonusId === entry.effectId &&
                      selectedShard.isTauforged === isTauforgedSelection;

                    return (
                      <Button
                        key={entry.effectId}
                        type="button"
                        data-active={isEquipped ? "" : undefined}
                        onClick={() => handleBonusSelect(entry.effectId)}
                        className="flex items-center gap-3 border border-ui-primary/28 bg-black/35 px-3 py-2 text-left transition-colors hover:border-ui-accent/45 data-active:border-ui-accent/70 data-active:bg-ui-accent/12"
                      >
                        <img
                          src={
                            isTauforgedSelection
                              ? entry.tauforgedIconPath
                              : entry.iconPath
                          }
                          alt={`${entry.shardName} - ${entry.effectLabel}`}
                          className="h-8 w-8 shrink-0 object-contain"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-ui-primary/92">
                            {entry.effectLabel}
                          </p>
                          <p className="truncate text-[11px] text-ui-primary/58">
                            {isTauforgedSelection
                              ? (entry.tauforgedValueLabel ?? entry.valueLabel)
                              : entry.valueLabel}
                          </p>
                        </div>
                      </Button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setModalStep("shard")}
                  className="text-xs text-ui-primary/60 hover:text-ui-accent"
                >
                  ← Cambiar shard/tauforged
                </button>
              </div>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
