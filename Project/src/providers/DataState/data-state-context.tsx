/**
 * @domain Integration / Providers / DataState
 * @status activo
 */
import { 
  createContext, 
  useContext, 
  useRef, 
  useEffect, 
  useMemo, 
  useCallback, 
  useState 
} from 'react';

type StateUpdater = (states: Record<string, boolean>) => void;

type DataStateContextValue = {
  subscribe: (element: HTMLElement) => StateUpdater;
  unsubscribe: (element: HTMLElement) => void;
};

const DataStateContext = createContext<DataStateContextValue | null>(null);

export function DataStateProvider({ children }: { children: React.ReactNode }) {
  // WeakMap para evitar memory leaks - se limpia automáticamente
  const elementsRef = useRef(new WeakMap<HTMLElement, StateUpdater>());

  const subscribe = useCallback((element: HTMLElement): StateUpdater => {
    const updater = (states: Record<string, boolean>) => {
      Object.entries(states).forEach(([key, value]) => {
        if (value) {
          element.setAttribute(`data-${key}`, '');
        } else {
          element.removeAttribute(`data-${key}`);
        }
      });
    };

    elementsRef.current.set(element, updater);
    return updater;
  }, []);

  const unsubscribe = useCallback((element: HTMLElement) => {
    elementsRef.current.delete(element);
  }, []);

  const value = useMemo(
    () => ({ subscribe, unsubscribe }),
    [subscribe, unsubscribe]
  );

  return (
    <DataStateContext.Provider value={value}>
      {children}
    </DataStateContext.Provider>
  );
}

export function useDataState<T extends HTMLElement = HTMLDivElement>(
  states: Record<string, boolean>
) {
  const context = useContext(DataStateContext);
  const ref = useRef<T>(null);
  const updaterRef = useRef<StateUpdater | null>(null);

  // Memoizar el objeto states para evitar re-renders innecesarios
  const statesHash = JSON.stringify(states);
  const memoizedStates = useMemo(() => states, [statesHash]);

  useEffect(() => {
    if (!ref.current || !context) return;

    // Suscribir el elemento
    updaterRef.current = context.subscribe(ref.current);

    return () => {
      if (ref.current && context) {
        context.unsubscribe(ref.current);
      }
    };
  }, [context]);

  useEffect(() => {
    if (updaterRef.current) {
      updaterRef.current(memoizedStates);
    }
  }, [memoizedStates]);

  return ref;
}

export function useSharedDataState(initialStates: Record<string, boolean>) {
  const [states, setStates] = useState(initialStates);
  const ref = useDataState(states);

  const updateState = useCallback((key: string, value: boolean) => {
    setStates(prev => ({ ...prev, [key]: value }));
  }, []);

  return { ref, states, updateState };
}
