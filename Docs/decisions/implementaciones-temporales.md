# Implementaciones Temporales

> Estado: temporal
> Rol: registrar implementaciones no cerradas y sujetas a cambios estructurales
> Fuente de verdad de: estado de implementaciones temporales y cuestiones abiertas
> No usar para: decisiones cerradas o implementaciones completas
> Depende de: 
> Ultima actualizacion: 2026-03-25

Este documento registra implementaciones que aún no están cerradas y están sujetas a posibles cambios estructurales. Se utiliza para mantener claridad en el estado del proyecto y facilitar referencias cruzadas con la documentación principal.

## Virtualización por Vista (VirtualizedItemsGrid)

- **Estado**: Implementación temporal para mejor DX en desarrollo. No es una implementación completa o planeada como tal de momento; está en fase de pruebas.
- **Detalles**: Refactorización con props configurables (itemSize, overscan, computeColumnCount).
- **Decisión**: Ver [virtualization-per-view.md](virtualization-per-view.md)
- **Referencias**: [Estado actual](../overview/current-state.md), [Navigation Shell status](../features/navigation-shell/status.md)

## Tipado Nuevo (Arcanos, Vehicles, etc.)

- **Estado**: Implementaciones abiertas a cambios. Se cambió la semántica de warframe-items para mejor organización y categorización, pero se debe documentar qué se hizo para referenciar correctamente dónde está el override/cambio.
- **Detalles**: Nuevos tipos en lib/types/ (Arcane, Companion, ArchwingWeapon, Vehicle). Posibles ajustes en semántica.
- **Referencias**: [Data foundation status](../features/data-foundation/status.md), [Estado actual](../overview/current-state.md)

Este documento se actualizará conforme se cierren o avancen estas implementaciones.