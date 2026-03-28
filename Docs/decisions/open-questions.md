# Open Questions

> Estado: activo
> Rol: registrar preguntas abiertas cross-cutting del proyecto
> Fuente de verdad de: dudas que atraviesan varios tracks o dominios
> No usar para: preguntas locales de una sola feature
> Ultima actualizacion: 2026-03-28 (OQ-2 cerrada con provider dominante; OQ-3 sigue bloqueada por stage 0)

## OQ-2 - Provider vs hooks como frontera de integracion ✓ CERRADO (2026-03-28)

Dominio:
- integracion

Pregunta:
- el layout activo y el estado del builder deben vivir en un provider central con hooks
  auxiliares, o en hooks compuestos sin un provider dominante

Impacto:
- afecta engine y shell como consumidores
- afecta wiring de runtime en integracion

Opciones:
1. punto -> opcion A: `BuildProvider` dedicado en integracion para layout activo y estado del builder; shell solo consume estado derivado de rutas
2. punto -> opcion B: hooks compuestos sin provider global de builder; cada vista consume su slice de estado
3. punto -> opcion C: hook raiz `useLayoutState()` con `useReducer`, sin exponer context global

Decision:
- opcion A — `LoadoutProvider` dedicado con `useReducer` + hooks pequeños alrededor

Implementacion aplicada:
- provider montado en `main.tsx` con jerarquía `DataState → Loadout → Menu → Shell → Theme → App`
- el provider expone `LoadoutState`, acciones puras (`equipEntity`, `setMod`, `setActiveConfig`, etc.) y outputs derivados (`LoadoutInput`, `ResolvedLayout`, `EngineOutput`)
- HUD consume el resumen del loadout activo; `ArsenalView` actúa como consumer mínimo de verificación
- persistencia de builds de Profile queda como capa aparte; no cambia la frontera del provider activo

Nota historica:
- `ContextualActionsProvider` fue reemplazado por `ShellProvider` como capa transicional para resolver header/footer/zone desde routing
- `ArsenalFooter` y `ArsenalView` quedaron habilitados como placeholders funcionales de shell, pero no resuelven la frontera final de integración
- OQ-2 ya no está abierta: el provider dominante queda cerrado como contrato de integración actual

## OQ-3 - Fuente numerica de mods para el builder

Dominio:
- data

Pregunta:
- cual es la fuente aceptada para valores numericos y condiciones:
  override manual, parseo controlado, o enfoque mixto

Impacto:
- afecta data, engine y mantenimiento del builder

Decision de track (2026-03-26):
- enfoque mixto: parseo automatico como base + override para edge cases
- detalle en `../features/builder-engine/status.md`

> **[STAGE-0 BLOQUEANTE — 2026-03-26]** Esta decisión asumía el schema actual de
> `mod-stats.override.json` como base. Ese schema está en stage 0 (debate PA-2/3/4 activo
> en `temp/pre-v1-architecture-2026-03-26.md`). OQ-3 no puede cerrarse hasta que el nuevo
> schema de mods quede definido. La fuente numérica y la estrategia de override dependen
> de esa definición.

## OQ-4 - Taxonomia de referencia wiki

Dominio:
- reference

Pregunta:
- como se clasifica la referencia profunda de mecanicas del juego:
  `wiki/mechanics/`, `wiki/status/`, `wiki/combat/`, etc.

Impacto:
- afecta escalabilidad de la referencia tecnica para simulaciones futuras

## OQ-5 - Punto de migracion de hidratacion a build time

Dominio:
- integracion

Pregunta:
- cuando deja de vivir la hidratacion de abilities en runtime y pasa al pipeline de build

Impacto:
- afecta data, engine y performance de runtime

## OQ-6 - Diseño y Reutilización de Popover

Dominio:
- ui

Pregunta:
- ¿Reutilizar popover existente o componentizar vía 'ui' compartida (static data vs dynamic data)?

Impacto:
- Afecta diseño de UI, reutilización en vistas y separación de responsabilidades.

## OQ-8 - Overrides en Tipado Nuevo

Dominio:
- integracion

Pregunta:
- ¿Cómo documentar los cambios/overrides en semántica de warframe-items para arcanos, vehicles, etc.?

Impacto:
- Afecta referencia, mantenimiento de tipos e integración con warframe-items.
