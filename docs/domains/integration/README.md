---
Estado: "activo"
Rol: "Documentar la capa de integración entre el estado del usuario y el motor de simulación"
Version: "v0.0.2"
Impacto_ID: "D-Integration"
Fidelidad_Fisica: "Project/src/core/engine/sim-v2/logic/"
Fecha_de_creacion: "2026-05-18"
Fecha_de_actualizacion: "2026-05-19"
---

# Dominio: Integration

Capa de traducción entre el estado de la UI y los contratos del motor de simulación. En el modelo de 5 capas, corresponde a la **Capa B (MutatorBridge)** y la conexión entre Capa A (EnsembleStore) y el engine.

Ver `docs/design/sim-v2/simulation-architecture.md` para la definición formal de cada capa.

## Piezas físicas actuales

| Archivo | Rol | Capa |
|---|---|---|
| `sim-v2/logic/MutatorBridge.ts` | Orquesta la simulación completa desde `EnsembleIntention`. Absorbe la lógica que `EnsembleAdapter` (eliminado) tenía como stub. | B |
| `sim-v2/hooks/useSimulation.ts` | Hook React que conecta `EnsembleStore` → `MutatorBridge` → UI. Implementación parcial de Capa D. | D (parcial) |
| `providers/Ensemble/EnsembleStore` | SSoT de estado del usuario (`EnsembleIntention`). Fuente canónica de intención. | A |

## Estado de la documentación

Las preguntas abiertas de arquitectura de estado fueron resueltas:

- **OQ-STATE-1** ✅ — Contrato canónico: `EnsembleIntention` en `EnsembleStore`.
- **OQ-STATE-2** ✅ — Archon Shards migrados a `EnsembleIntention`.
- **OQ-STATE-3** ✅ — `LoadoutContext` eliminado.
- **OQ-STATE-4** ✅ — `EnsembleAdapter` eliminado. `MutatorBridge` absorbe la traducción.

**Pendiente:** Capa D (Proyección) — contrato `ViewModelContract` no definido formalmente. Ver `docs/governance/open-questions.md` y `impact-matrix.md §MAYOR`.

Ver `docs/governance/open-questions.md`.
