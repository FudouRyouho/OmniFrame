---
Estado: "activo"
Rol: "Documentar la capa de integración entre el estado del usuario y el motor de simulación"
Impacto_ID: "D-Integration"
Fidelidad_Fisica: "Project/src/core/"
Fecha_de_creacion: "2026-05-18"
Fecha_de_actualizacion: "2026-07-03"
---

# Dominio: Integration

Capa de traducción entre el estado de la UI y los contratos del motor de simulación. En el modelo de 5 capas, corresponde a la **Capa B (MutatorBridge)** y la conexión entre Capa A (EnsembleStore) y el engine.

Ver `docs/domains/engine/design/simulation-architecture.md` para la definición formal de cada capa.

## Piezas físicas actuales

| Archivo | Rol | Capa |
|---|---|---|
| `core/bridge/MutatorBridge.ts` | Orquesta la simulación completa desde `EnsembleIntention`. Absorbe la lógica que `EnsembleAdapter` (eliminado) tenía como stub. Fuera de `engine/` desde 2026-06-12. | B |
| `core/intention/ensemble-store.ts` | SSoT de estado del usuario (`EnsembleIntention`). Fuente canónica de intención. Movido desde `providers/Ensemble/` (2026-06-12). | A1 |
| `providers/Ensemble/` + `useViewModel` | Binding React de composición: liga `EnsembleStore → consume() → project()` → UI. Cablea la Capa D display-only. | D (v0) |

## Estado de la documentación

OQs STATE-1/2/3/4 cerradas: ver `docs/governance/closed-decisions.md`.

**Estado Capa D:** materializada como `ViewModelContract` v0 (display-only/C1) en `@shared/view-model`, consumida por `useViewModel` (`@providers`, D1) y el oráculo CLI (`view`, D2) — dos lentes de salida del mismo contrato. **Pendiente:** versión reactiva completa (`metrics`/A2, C2). *(Las métricas de combate ya cristalizaron en `CombatMetrics`, `DC-OQ-ENGINE-8`; el rename residual de `ViewModelContract` display queda diferido.)* *(La Capa E intermedia se **descartó** — `DC-OQ-ENGINE-10`; la hidratación de chrome viene del piso "0".)*
