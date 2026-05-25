# Engine Design — Blueprint y contratos del motor

Documentación de diseño del motor de simulación v2. `engine/` (el dominio funcional)
**es** la implementación de lo que aquí se especifica.

## Documentos

| Archivo | Rol |
|---|---|
| [`simulation-blueprint.md`](simulation-blueprint.md) | Índice maestro del track — leer primero |
| [`simulation-architecture.md`](simulation-architecture.md) | Macro y micro arquitectura del motor |
| [`simulation-contracts.md`](simulation-contracts.md) | Contratos técnicos base |
| [`arch-decisions.md`](arch-decisions.md) | Decisiones arquitectónicas críticas (invariantes vigentes) |
| [`simulation-roadmap.md`](simulation-roadmap.md) | Hoja de ruta de implementación |
| [`integration-status.md`](integration-status.md) | Estado de integración con el Arsenal |

## ⚠️ Nota de auditoría pendiente (2026-05-18)

Los documentos fueron escritos antes de la implementación. La Fase 3 del roadmap incluye
auditar si el código en `Project/src/core/engine/` coincide con lo especificado aquí.
**No asumir que los docs reflejan el código actual** — usar `../engine-audit.md` como referencia
del drift confirmado contra código.
