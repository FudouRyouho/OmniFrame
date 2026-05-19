# Design — Tracks de diseño activos

Documentación de arquitectura en proceso de implementación o ratificada recientemente.

## Tracks activos

| Track | Estado | Descripción |
|---|---|---|
| [`sim-v2/`](sim-v2/) | En ejecución | Motor de simulación v2 — arquitectura headless, contratos y roadmap |

## Documentos de sim-v2

| Archivo | Rol |
|---|---|
| [`sim-v2/simulation-blueprint.md`](sim-v2/simulation-blueprint.md) | Índice maestro del track — leer primero |
| [`sim-v2/simulation-architecture.md`](sim-v2/simulation-architecture.md) | Macro y micro arquitectura del motor |
| [`sim-v2/simulation-contracts.md`](sim-v2/simulation-contracts.md) | Contratos técnicos base |
| [`sim-v2/simulation-pre-implementation.md`](sim-v2/simulation-pre-implementation.md) | Auditoría de riesgos pre-implementación |
| [`sim-v2/simulation-roadmap.md`](sim-v2/simulation-roadmap.md) | Hoja de ruta de implementación |
| [`sim-v2/integration-status.md`](sim-v2/integration-status.md) | Estado de integración con el Arsenal |

## ⚠️ Nota de auditoría pendiente (2026-05-18)

Los documentos de sim-v2 fueron escritos antes de la implementación. La Fase 3 del roadmap del proyecto incluye auditar si el código en `Project/src/core/engine/sim-v2/` coincide con lo especificado aquí. No asumir que los docs reflejan el código actual.