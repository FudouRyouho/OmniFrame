/**
 * ArsenalView — Vista del Builder.
 *
 * Abre el Builder con el layout activo (desde LoadoutProvider).
 * Accesible desde DialogMenu → "Arsenal".
 *
 * Muestra el layout en construcción: Warframe + armas + mods equipados,
 * con cálculo de stats en tiempo real via el motor de builds (engine/).
 *
 * @see DT-11 en Docs-legacy/architecture/architecture-audit.md
 */
import type { WeaponStatOutput } from "@features/arsenal/engine";
import { createSlot, type LoadoutState } from "@features/arsenal/engine/loadout";
import { useLoadout } from "@providers/Loadout/loadout-context";

const RHINO_PRIME = "/Lotus/Powersuits/Rhino/RhinoPrime";
const BRATON_PRIME = "/Lotus/Weapons/Tenno/Rifle/BratonPrime";
const LEX_PRIME = "/Lotus/Weapons/Tenno/Pistols/PrimeLex/PrimeLex";
const SKANA_PRIME = "/Lotus/Weapons/Tenno/Melee/LongSword/SkanaPrime";

const VITALITY = "/Lotus/Upgrades/Mods/Warframe/AvatarHealthMaxMod";
const REDIRECTION = "/Lotus/Upgrades/Mods/Warframe/AvatarShieldMaxMod";
const STEEL_FIBER = "/Lotus/Upgrades/Mods/Warframe/AvatarArmourMod";
const FLOW = "/Lotus/Upgrades/Mods/Warframe/AvatarPowerMaxMod";
const INTENSIFY = "/Lotus/Upgrades/Mods/Warframe/AvatarAbilityStrengthMod";
const SERRATION = "/Lotus/Upgrades/Mods/Rifle/WeaponDamageAmountMod";
const POINT_STRIKE = "/Lotus/Upgrades/Mods/Rifle/WeaponCritChanceMod";
const VITAL_SENSE = "/Lotus/Upgrades/Mods/Rifle/WeaponCritDamageMod";
const HORNET_STRIKE = "/Lotus/Upgrades/Mods/Pistol/WeaponDamageAmountMod";

const CHANNELS = [
  { key: "warframe", label: "Warframe" },
  { key: "primaryWeapon", label: "Primary" },
  { key: "secondaryWeapon", label: "Secondary" },
  { key: "meleeWeapon", label: "Melee" },
] as const;

function formatEntityLabel(uniqueName?: string): string {
  if (!uniqueName) {
    return "Vacío";
  }

  const tail = uniqueName.split("/").filter(Boolean).pop() ?? uniqueName;
  return tail.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

function createVerificationLoadout(): LoadoutState {
  const warframe = createSlot(RHINO_PRIME);
  warframe.configs[0].mods[0] = { uniqueName: VITALITY, rank: 10 };
  warframe.configs[0].mods[1] = { uniqueName: REDIRECTION, rank: 10 };
  warframe.configs[0].mods[2] = { uniqueName: STEEL_FIBER, rank: 10 };
  warframe.configs[0].mods[3] = { uniqueName: FLOW, rank: 10 };
  warframe.configs[0].mods[4] = { uniqueName: INTENSIFY, rank: 5 };

  const primaryWeapon = createSlot(BRATON_PRIME);
  primaryWeapon.configs[0].mods[0] = { uniqueName: SERRATION, rank: 10 };
  primaryWeapon.configs[0].mods[1] = { uniqueName: POINT_STRIKE, rank: 5 };
  primaryWeapon.configs[0].mods[2] = { uniqueName: VITAL_SENSE, rank: 5 };

  const secondaryWeapon = createSlot(LEX_PRIME);
  secondaryWeapon.configs[0].mods[0] = { uniqueName: HORNET_STRIKE, rank: 10 };

  const meleeWeapon = createSlot(SKANA_PRIME);

  return {
    warframe,
    primaryWeapon,
    secondaryWeapon,
    meleeWeapon,
  };
}

function WeaponOutputCard({ label, output }: { label: string; output?: WeaponStatOutput }) {
  if (!output) {
    return null;
  }

  const firstAttack = output.attacks[0];

  return (
    <article className="border border-ui-primary/20 bg-black/25 p-4">
      <div className="text-[10px] uppercase tracking-[0.3em] text-ui-primary/65">{label}</div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-ui-primary/90 md:grid-cols-3">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-ui-primary/55">Ataques</div>
          <div>{output.attacks.length}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-ui-primary/55">Magazine</div>
          <div>{output.magazineSize}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-ui-primary/55">Reload</div>
          <div>{output.reloadTime}</div>
        </div>
        {firstAttack && (
          <>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-ui-primary/55">Primer ataque</div>
              <div>{firstAttack.name}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-ui-primary/55">Daño</div>
              <div>{firstAttack.totalDamage}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-ui-primary/55">Crit promedio</div>
              <div>{firstAttack.averageCritMultiplier}</div>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

export default function ArsenalView() {
  const {
    loadout,
    engineOutput,
    isLoading,
    isReady,
    error,
    activeChannelCount,
    replaceLoadout,
    clearLoadout,
  } = useLoadout();

  return (
    <section className="h-full overflow-auto p-4">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <header className="flex flex-col gap-3 border border-ui-primary/20 bg-black/20 p-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-xl uppercase tracking-[0.35em] text-ui-primary/90">Arsenal</h1>
            <p className="mt-2 max-w-3xl text-sm text-ui-primary/70">
              Provider real conectado: Loadout → Resolver → Engine. Esta vista sigue siendo un
              consumer de verificación, no la UI final del builder.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => replaceLoadout(createVerificationLoadout())}
              className="border border-ui-primary/35 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-ui-primary/90 transition-colors hover:border-ui-accent hover:text-ui-accent"
            >
              Cargar preset de verificación
            </button>
            <button
              type="button"
              onClick={clearLoadout}
              className="border border-ui-primary/20 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-ui-primary/75 transition-colors hover:border-ui-primary/45 hover:text-ui-primary"
            >
              Vaciar loadout
            </button>
          </div>
        </header>

        {isLoading && (
          <div className="border border-ui-primary/20 bg-black/20 p-4 text-sm text-ui-primary/75">
            Cargando datasets del builder...
          </div>
        )}

        {error && (
          <div className="border border-red-500/40 bg-red-950/20 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          {CHANNELS.map((channel) => (
            <article key={channel.key} className="border border-ui-primary/20 bg-black/20 p-4">
              <div className="text-[10px] uppercase tracking-[0.3em] text-ui-primary/65">{channel.label}</div>
              <div className="mt-2 text-sm text-ui-primary/92">
                {formatEntityLabel(loadout[channel.key]?.uniqueName)}
              </div>
            </article>
          ))}
        </div>

        <div className="border border-ui-primary/20 bg-black/20 p-4 text-sm text-ui-primary/80">
          Canales activos: {activeChannelCount} / 4
          {isReady && activeChannelCount === 0 && (
            <span className="ml-2 text-ui-primary/60">Cargado pero sin equipamiento activo.</span>
          )}
        </div>

        {isReady && engineOutput?.warframe && (
          <article className="border border-ui-primary/20 bg-black/25 p-4">
            <div className="text-[10px] uppercase tracking-[0.3em] text-ui-primary/65">Warframe Output</div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-ui-primary/90 md:grid-cols-5">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-ui-primary/55">Health</div>
                <div>{engineOutput.warframe.health}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-ui-primary/55">Shield</div>
                <div>{engineOutput.warframe.shield}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-ui-primary/55">Armor</div>
                <div>{engineOutput.warframe.armor}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-ui-primary/55">Power</div>
                <div>{engineOutput.warframe.power}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-ui-primary/55">Strength</div>
                <div>{engineOutput.warframe.abilityStrength ?? 1}</div>
              </div>
            </div>
          </article>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          <WeaponOutputCard label="Primary Output" output={engineOutput?.primaryWeapon} />
          <WeaponOutputCard label="Secondary Output" output={engineOutput?.secondaryWeapon} />
          <WeaponOutputCard label="Melee Output" output={engineOutput?.meleeWeapon} />
        </div>
      </div>
    </section>
  );
}
