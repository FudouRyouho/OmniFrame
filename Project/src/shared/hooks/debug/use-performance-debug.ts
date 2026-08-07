import { useRef } from "react";

const SLOW_THRESHOLD_MS = 100;

export const usePerformanceDebug = (label: string) => {
  const startTime = useRef<number>(0);
  const marks = useRef<Map<string, number>>(new Map());
  const labelRef = useRef(label);
  labelRef.current = label;

  const api = useRef({
    start: () => {
      startTime.current = performance.now();
      marks.current.clear();
      // Ya no logueamos el START para reducir ruido
    },

    end: (step?: string) => {
      const duration = performance.now() - startTime.current;
      
      // Solo logueamos si es una operación lenta (>100ms)
      if (duration > SLOW_THRESHOLD_MS) {
        const stepLabel = step ? ` - ${step}` : '';
        console.warn(
          `%c[PERF-SLOW] ${labelRef.current}${stepLabel} - DURATION: ${duration.toFixed(2)}ms (Threshold: ${SLOW_THRESHOLD_MS}ms)`,
          'color: #ff9f43; font-weight: bold; background: #2c3e50; padding: 2px 5px; border-radius: 2px'
        );
        
        if (marks.current.size > 0) {
          console.groupCollapsed(`%cBreakdown: ${labelRef.current}`, 'color: #4ecdc4');
          marks.current.forEach((time, markLabel) => {
            const percentage = ((time / duration) * 100).toFixed(1);
            console.log(`  ${markLabel}: ${time.toFixed(2)}ms (${percentage}%)`);
          });
          console.groupEnd();
        }
      }
    },

    mark: (step: string) => {
      const elapsed = performance.now() - startTime.current;
      marks.current.set(step, elapsed);
    },

    measure: (fn: () => void, step: string) => {
      const stepStart = performance.now();
      fn();
      const stepDuration = performance.now() - stepStart;
      marks.current.set(step, stepDuration);
    },

    measureAsync: async <T,>(fn: () => Promise<T>, step: string): Promise<T> => {
      const stepStart = performance.now();
      const result = await fn();
      const stepDuration = performance.now() - stepStart;
      marks.current.set(step, stepDuration);
      return result;
    },
  });

  return api.current;
};
