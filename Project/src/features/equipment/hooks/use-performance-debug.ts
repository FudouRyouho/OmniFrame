import { useRef } from "react";

/**
 * Hook de debug para medir performance en operaciones de carga de datos.
 * 
 * Las funciones retornadas son estables (no cambian entre renders),
 * por lo que son seguras de usar dentro de useCallback sin añadirlas
 * a las dependencias.
 * 
 * @example
 * const perf = usePerformanceDebug('ModsView');
 * perf.start();
 * await loadData();
 * perf.end();
 */
export const usePerformanceDebug = (label: string) => {
  const startTime = useRef<number>(0);
  const marks = useRef<Map<string, number>>(new Map());
  // Ref estable para el label — evita que cambios de label rompan closures
  const labelRef = useRef(label);
  labelRef.current = label;

  // Todas las funciones se exponen como refs estables para no contaminar
  // las dependencias de useCallback/useEffect en el consumer.
  const api = useRef({
    start: () => {
      startTime.current = performance.now();
      marks.current.clear();
      console.log(`%c[PERF] ${labelRef.current} - START`, 'color: #00ff00; font-weight: bold');
    },

    end: (step?: string) => {
      const duration = performance.now() - startTime.current;
      const stepLabel = step ? ` - ${step}` : '';
      console.log(
        `%c[PERF] ${labelRef.current}${stepLabel} - END: ${duration.toFixed(2)}ms`,
        'color: #ff6b6b; font-weight: bold'
      );
      if (marks.current.size > 0) {
        console.log(`%c[PERF] ${labelRef.current} - Breakdown:`, 'color: #4ecdc4; font-weight: bold');
        marks.current.forEach((time, markLabel) => {
          const percentage = ((time / duration) * 100).toFixed(1);
          console.log(`  ${markLabel}: ${time.toFixed(2)}ms (${percentage}%)`);
        });
      }
    },

    mark: (step: string) => {
      const elapsed = performance.now() - startTime.current;
      marks.current.set(step, elapsed);
      console.log(`[PERF] ${labelRef.current} - ${step}: ${elapsed.toFixed(2)}ms (elapsed)`);
    },

    measure: (fn: () => void, step: string) => {
      const stepStart = performance.now();
      fn();
      const stepDuration = performance.now() - stepStart;
      marks.current.set(step, stepDuration);
      console.log(`[PERF] ${labelRef.current} - ${step}: ${stepDuration.toFixed(2)}ms`);
    },

    measureAsync: async <T,>(fn: () => Promise<T>, step: string): Promise<T> => {
      const stepStart = performance.now();
      const result = await fn();
      const stepDuration = performance.now() - stepStart;
      marks.current.set(step, stepDuration);
      console.log(`[PERF] ${labelRef.current} - ${step}: ${stepDuration.toFixed(2)}ms`);
      return result;
    },
  });

  return api.current;
};
