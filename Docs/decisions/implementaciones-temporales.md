# Implementaciones Temporales

> Estado: activo
> Rol: registrar implementaciones no cerradas y sujetas a cambios estructurales
> Fuente de verdad de: estado de implementaciones temporales y cuestiones abiertas
> No usar para: decisiones cerradas o implementaciones completas
> Depende de: 
> Ultima actualizacion: 2026-03-28

Este documento registra implementaciones que aún no están cerradas y están sujetas a posibles cambios estructurales. Se utiliza para mantener claridad en el estado del proyecto y facilitar referencias cruzadas con la documentación principal.

## Virtualización por Vista (VirtualizedItemsGrid)

- **Estado**: Implementación temporal para mejor DX en desarrollo. No es una implementación completa o planeada como tal de momento; está en fase de pruebas.
- **Detalles**: Refactorización con props configurables (itemSize, overscan, computeColumnCount).
- **Decisión**: Ver [virtualization-per-view.md](virtualization-per-view.md)
- **Referencias**: [Estado actual](../overview/current-state.md), [Navigation Shell status](../features/navigation-shell/status.md)

## Tipado Nuevo (Arcanos, Vehicles, etc.)

- **Estado**: Implementaciones abiertas a cambios de semántica y trazabilidad. La base ya existe, pero la documentación transversal del override/cambio sigue abierta.
- **Detalles**: Nuevos tipos en lib/types/ (Arcane, Companion, ArchwingWeapon, Vehicle). El estado operativo vive en data-foundation; la decisión transversal pendiente sigue en OQ-8.
- **Referencias**: [Data foundation status](../features/data-foundation/status.md), [Open Questions](open-questions.md), [Estado actual](../overview/current-state.md)

Este documento se actualizará conforme se cierren o avancen estas implementaciones.