/**
 * useViewModel — binding reactivo (z3) de la Capa D1 (UI). **DESCONECTADO.**
 *
 * ════════════════════════════════════════════════════════════════════════════════════════
 *  POR QUÉ ESTÁ DESCONECTADO, y por qué eso NO es una pausa por comodidad
 * ════════════════════════════════════════════════════════════════════════════════════════
 *
 * La Capa A pasó de `EnsembleIntention` (diez canales planos + tablas paralelas de mods) a `Scene`
 * (dos grupos, portadores que contienen lo que se les monta). El store y los componentes todavía
 * escriben la forma vieja.
 *
 * Pero el motivo de fondo no es la migración pendiente: **la UI nunca reconoció a D.**
 * `HudHeader.tsx` lee `intention.items` CRUDO —`Object.values(intention.items)`,
 * `intention.items[ch.key]?.itemId`— saltándose la capa que existe exactamente para eso. Es el mismo
 * error que C hacía con B: consumir la capa de más abajo porque la de al lado no terminó su trabajo.
 *
 * Reconectar antes de que A y B cierren sería reescribir ese salto de capa **para volver a tocarlo
 * después**. El orden `A → B → C → D → UI` no es respeto por las capas: es no hacer dos veces el
 * mismo trabajo, y el segundo sobre algo que el primero no arregló.
 *
 * ── LO QUE SE SABE, MEDIDO ──────────────────────────────────────────────────────────────
 *
 *   · la UI **no tiene un solo test** — nada verifica que funcione, y nada lo verificaba antes
 *   · **buildea**: 2177 módulos, 577 KB, sin errores. Se estaciona compilando, runtime desconocido
 *   · 8 archivos la componen; **`EnsembleProvider` concentra 14 de las 29 escrituras**
 *   · sólo 2 de los 8 leen por `project()`; el resto toca A directo
 *
 * ── POR QUÉ TIRA EN VEZ DE DEVOLVER VACÍO ───────────────────────────────────────────────
 *
 * Un hook que devuelve `{ entities: [] }` se declara, se llena y **miente en silencio** — es el
 * campo mudo que esta campaña viene eliminando. Esto no se puede ignorar: rompe al primer render,
 * nombrando la capa y su condición de salida.
 *
 * Y el compilador no "avisa": **se niega**. `Scene` no tiene `items`, así que cualquier intento de
 * reconectar sin migrar el store no compila. No hace falta recordar nada.
 *
 * ── CONDICIÓN DE REANUDACIÓN (no una fecha) ─────────────────────────────────────────────
 *
 * `ViewModelContract` estable, después de que la dereferencia se mude de C a B (`OQ-ENGINE-36`).
 * D es el borde por el que la UI debe reconectarse — **no el store**. Reconectarla contra `Scene`
 * directamente sería repetir el salto de capa que la dejó así.
 */
import type { ViewModelContract } from '@shared/view-model';

/** Error de capa: la UI está estacionada, no rota por accidente. */
export class LayerDisconnectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LayerDisconnectedError';
  }
}

export function useViewModel(): ViewModelContract {
  throw new LayerDisconnectedError(
    'La Capa D1 (UI) está DESCONECTADA a propósito.\n\n' +
    'La Capa A es `Scene` (@shared/types/scene) y el store todavía escribe `EnsembleIntention`.\n' +
    'Pero el motivo no es la migración: la UI nunca consumió D — `HudHeader` lee `intention.items`\n' +
    'crudo, saltándose `project()`. Reconectar antes de cerrar A y B es reescribir ese salto dos veces.\n\n' +
    'Reanudar cuando `ViewModelContract` sea estable, tras mudar la dereferencia de C a B\n' +
    '(OQ-ENGINE-36). El motor se opera mientras tanto por el oráculo (D2): `npm run oracle`.',
  );
}
