---
Estado: "activo"
Rol: "Documentar la capa de integración entre el estado del usuario y el motor de simulación"
Version: "v0.0.2"
Impacto_ID: "D-Integration"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-05-18"
Fecha_de_actualizacion: "2026-05-19"
---

# Dominio: Integration

Capa de traducción entre el estado de la UI y los contratos del motor de simulación. En el modelo de 5 capas, corresponde a la **Capa B (MutatorBridge)** y la conexión entre Capa A (EnsembleStore) y el engine.

Ver `docs/domains/engine/design/simulation-architecture.md` para la definición formal de cada capa.

## Piezas físicas actuales

| Archivo | Rol | Capa |
|---|---|---|
| `engine/bridge/MutatorBridge.ts` | Orquesta la simulación completa desde `EnsembleIntention`. Absorbe la lógica que `EnsembleAdapter` (eliminado) tenía como stub. | B |
| `engine/hooks/useSimulation.ts` | Hook React que conecta `EnsembleStore` → `MutatorBridge` → UI. Implementación parcial de Capa D. | D (parcial) |
| `providers/Ensemble/EnsembleStore` | SSoT de estado del usuario (`EnsembleIntention`). Fuente canónica de intención. | A |

## Estado de la documentación

OQs STATE-1/2/3/4 cerradas: ver `docs/governance/closed-decisions.md`.

**Pendiente:** Capa D (Proyección) — contrato `ViewModelContract` no definido formalmente. Ver `impact-matrix.md §MAYOR`.
