/**
 * @domain Integration / Providers / Loadout
 * @SSoT docs/domains/integration/runtime-composition.md
 * @status DEPRECADO
 * 
 * @deprecated ARQUITECTURA FALLIDA. Este proveedor actúa como un "Contexto Referencial"
 * que acopla la UI a funciones de ejecución directa en lugar de un flujo Observer puro.
 * Marcado para sustitución total.
 */
import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import {
  calculate,
  type EngineOutput,
  type ResolvedLayout,
} from "@core/engine";
import {
  equipEntity as equipLoadoutEntity,
  setActiveConfig as setLoadoutActiveConfig,
  setMod as setLoadoutMod,
  toResolverInput,
  unequipEntity as unequipLoadoutEntity,
  type LoadoutState,
  type ModSlot,
} from "@core/engine/loadout";
import { loadResolverDependencies } from "@core/engine/runtime-deps";
import { resolve, type LoadoutInput } from "@core/engine/resolver";

export type LoadoutChannel = keyof LoadoutState;

export type LoadoutAction =
  | { type: "equip-entity"; channel: LoadoutChannel; uniqueName: string }
  | { type: "unequip-entity"; channel: LoadoutChannel }
  | { type: "set-active-config"; channel: LoadoutChannel; configIndex: number }
  | {
      type: "set-mod";
      channel: LoadoutChannel;
      slotIndex: number;
      mod: ModSlot | null;
    }
  | { type: "replace-loadout"; nextLoadout: LoadoutState }
  | { type: "clear-loadout" };

export type LoadoutContextValue = {
  loadout: LoadoutState;
  resolverInput: LoadoutInput;
  resolvedLayout: ResolvedLayout | null;
  engineOutput: EngineOutput | null;
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  activeChannelCount: number;
  equipEntity: (channel: LoadoutChannel, uniqueName: string) => void;
  unequipEntity: (channel: LoadoutChannel) => void;
  setActiveConfig: (channel: LoadoutChannel, configIndex: number) => void;
  setMod: (
    channel: LoadoutChannel,
    slotIndex: number,
    mod: ModSlot | null,
  ) => void;
  replaceLoadout: (nextLoadout: LoadoutState) => void;
  clearLoadout: () => void;
};

const CHANNELS = [
  "warframe",
  "primaryWeapon",
  "secondaryWeapon",
  "meleeWeapon",
] as const;

const LoadoutContext = createContext<LoadoutContextValue | null>(null);

function loadoutReducer(
  state: LoadoutState,
  action: LoadoutAction,
): LoadoutState {
  switch (action.type) {
    case "equip-entity":
      return equipLoadoutEntity(state, action.channel, action.uniqueName);
    case "unequip-entity":
      return unequipLoadoutEntity(state, action.channel);
    case "set-active-config":
      return setLoadoutActiveConfig(state, action.channel, action.configIndex);
    case "set-mod":
      return setLoadoutMod(state, action.channel, action.slotIndex, action.mod);
    case "replace-loadout":
      return action.nextLoadout;
    case "clear-loadout":
      return {};
    default:
      return state;
  }
}

function useLoadoutCore() {
  const [loadout, dispatch] = useReducer(loadoutReducer, {});

  const activeChannelCount = useMemo(
    () => CHANNELS.filter((channel) => loadout[channel] !== undefined).length,
    [loadout],
  );

  return {
    loadout,
    activeChannelCount,
    dispatch,
  };
}

function useLoadoutRuntime(loadout: LoadoutState) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolverDepsLoaded, setResolverDepsLoaded] = useState<Awaited<
    ReturnType<typeof loadResolverDependencies>
  > | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    void loadResolverDependencies()
      .then((deps) => {
        if (cancelled) {
          return;
        }

        startTransition(() => {
          setResolverDepsLoaded(deps);
          setIsLoading(false);
          setError(null);
        });
      })
      .catch((reason: unknown) => {
        if (cancelled) {
          return;
        }

        setIsLoading(false);
        setResolverDepsLoaded(null);
        setError(
          reason instanceof Error
            ? reason.message
            : "No se pudieron cargar los datasets del builder",
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const resolverInput = useMemo<LoadoutInput>(
    () => toResolverInput(loadout),
    [loadout],
  );

  const resolvedLayout = useMemo<ResolvedLayout | null>(() => {
    if (!resolverDepsLoaded) {
      return null;
    }

    return resolve(resolverInput, resolverDepsLoaded);
  }, [resolverDepsLoaded, resolverInput]);

  const engineOutput = useMemo<EngineOutput | null>(() => {
    if (!resolvedLayout) {
      return null;
    }

    return calculate(resolvedLayout, {});
  }, [resolvedLayout]);

  const isReady = !isLoading && error === null && resolverDepsLoaded !== null;

  return {
    isLoading,
    error,
    resolverInput,
    resolvedLayout,
    engineOutput,
    isReady,
  };
}

export function LoadoutProvider({ children }: { children: ReactNode }) {
  const { loadout, activeChannelCount, dispatch } = useLoadoutCore();

  const {
    isLoading,
    error,
    resolverInput,
    resolvedLayout,
    engineOutput,
    isReady,
  } = useLoadoutRuntime(loadout);

  const value = useMemo<LoadoutContextValue>(
    () => ({
      loadout,
      resolverInput,
      resolvedLayout,
      engineOutput,
      isLoading,
      isReady,
      error,
      activeChannelCount,
      equipEntity: (channel, uniqueName) => {
        startTransition(() => {
          dispatch({ type: "equip-entity", channel, uniqueName });
        });
      },
      unequipEntity: (channel) => {
        startTransition(() => {
          dispatch({ type: "unequip-entity", channel });
        });
      },
      setActiveConfig: (channel, configIndex) => {
        startTransition(() => {
          dispatch({ type: "set-active-config", channel, configIndex });
        });
      },
      setMod: (channel, slotIndex, mod) => {
        startTransition(() => {
          dispatch({ type: "set-mod", channel, slotIndex, mod });
        });
      },
      replaceLoadout: (nextLoadout) => {
        startTransition(() => {
          dispatch({ type: "replace-loadout", nextLoadout });
        });
      },
      clearLoadout: () => {
        startTransition(() => {
          dispatch({ type: "clear-loadout" });
        });
      },
    }),
    [
      activeChannelCount,
      dispatch,
      engineOutput,
      error,
      isLoading,
      isReady,
      loadout,
      resolvedLayout,
      resolverInput,
    ],
  );

  return (
    <LoadoutContext.Provider value={value}>{children}</LoadoutContext.Provider>
  );
}

export function useLoadout(): LoadoutContextValue {
  const context = useContext(LoadoutContext);
  if (!context) {
    throw new Error("useLoadout must be used within LoadoutProvider");
  }
  return context;
}

export function useLoadoutChannel(channel: LoadoutChannel) {
  return useLoadout().loadout[channel];
}
