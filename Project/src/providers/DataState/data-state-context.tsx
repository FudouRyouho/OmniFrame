/**
 * DataStateContext - Sistema de gestión de estados mediante atributos data-*
 * 
 * Permite sincronizar estados de React con atributos data-* en el DOM para
 * aprovechar selectores CSS como `group-data-[active]:bg-blue-500`
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

/**
 * Provider para el sistema de estados data-*
 * 
 * Debe envolver los componentes que utilizarán `useDataState` o `useSharedDataState`.
 * Utiliza WeakMap internamente para evitar memory leaks.
 * 
 * @example
 * function App() {
 *   return (
 *     <DataStateProvider>
 *       <YourComponents />
 *     </DataStateProvider>
 *   );
 * }
 */
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

/**
 * Hook principal para sincronizar estados de React con atributos data-* en el DOM
 * 
 * Convierte estados booleanos en atributos data-* que pueden ser utilizados
 * con selectores CSS de Tailwind como `group-data-[active]:bg-blue-500`
 * 
 * @template T - Tipo del elemento HTML (por defecto HTMLDivElement)
 * @param states - Objeto con estados booleanos a sincronizar
 * @returns Ref para asignar al elemento HTML
 * 
 * @example
 * // Uso básico con múltiples estados
 * const [active, setActive] = useState(false);
 * const [hover, setHover] = useState(false);
 * const ref = useDataState({ active, hover });
 * 
 * return (
 *   <div 
 *     ref={ref} 
 *     className="group"
 *     onClick={() => setActive(!active)}
 *   >
 *     <div className="group-data-[active]:bg-blue-500">
 *       Activo
 *     </div>
 *   </div>
 * );
 * 
 * @example
 * // Con tipo específico de elemento
 * const [pressed, setPressed] = useState(false);
 * const ref = useDataState<HTMLButtonElement>({ pressed });
 * 
 * return (
 *   <button ref={ref} onClick={() => setPressed(!pressed)}>
 *     Click me
 *   </button>
 * );
 */
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

/**
 * Hook para compartir estados entre componentes padre e hijo de forma bidireccional
 * 
 * Permite que componentes hijos modifiquen estados del padre sin prop drilling.
 * Combina gestión de estado local con sincronización de atributos data-*.
 * 
 * @param initialStates - Estados iniciales del componente
 * @returns Objeto con ref, estados actuales y función para actualizar estados
 * 
 * @example
 * // Componente Padre
 * const { ref, states, updateState } = useSharedDataState({ 
 *   active: false,
 *   expanded: false 
 * });
 * 
 * return (
 *   <div ref={ref} className="group">
 *     <p>Estado activo: {states.active ? 'Sí' : 'No'}</p>
 *     <ChildComponent updateState={updateState} />
 *     <div className="group-data-[active]:bg-blue-500">
 *       Reacciona al estado
 *     </div>
 *   </div>
 * );
 * 
 * @example
 * // Componente Hijo (en otro archivo)
 * function ChildComponent({ updateState }) {
 *   return (
 *     <button onClick={() => updateState('active', true)}>
 *       Activar desde hijo
 *     </button>
 *   );
 * }
 * 
 * @example
 * // Múltiples estados
 * const { ref, states, updateState } = useSharedDataState({
 *   open: false,
 *   hover: false,
 *   disabled: false
 * });
 * 
 * return (
 *   <div ref={ref} className="group">
 *     <button 
 *       onClick={() => updateState('open', !states.open)}
 *       onMouseEnter={() => updateState('hover', true)}
 *     >
 *       Toggle
 *     </button>
 *     <div className="group-data-[open]:block">
 *       Contenido
 *     </div>
 *   </div>
 * );
 */
export function useSharedDataState(initialStates: Record<string, boolean>) {
  const [states, setStates] = useState(initialStates);
  const ref = useDataState(states);

  const updateState = useCallback((key: string, value: boolean) => {
    setStates(prev => ({ ...prev, [key]: value }));
  }, []);

  return { ref, states, updateState };
}
