# Decisión: Virtualización por Vista

> Estado: activo
> Rol: documentar decisión de implementación de virtualización granular
> Fuente de verdad de: estrategia de virtualización en UI
> No usar para: implementación técnica detallada
> Depende de: 
> Ultima actualizacion: 2026-03-25

## Decisión

Se implementa virtualización granular por vista (WarframesView, ModsView, WeaponsView), utilizando VirtualizedItemsGrid con props configurables (itemSize, overscan, computeColumnCount) en lugar de una solución global.

## Razones

- **Flexibilidad**: Permite ajustes específicos por vista según densidad de datos y UX.
- **Rendimiento**: Solo renderiza items visibles, mejorando DX en desarrollo y potencial producción.
- **Temporal**: Implementación en fase de pruebas; no cerrada, sujeta a cambios estructurales.

## Alternativas Consideradas

- Virtualización global en ItemsGrid: Rechazada por falta de granularidad.
- Sin virtualización: Rechazada por rendimiento en listas grandes.

## Consecuencias

- Código más mantenible con props configurables.
- Posible refactor futuro si ItemsGrid se absorbe en vistas particulares.
- Documentar en [implementaciones-temporales.md](implementaciones-temporales.md).

## Referencias

- [Docs/overview/current-state.md](current-state.md)
- [Docs/features/navigation-shell/status.md](navigation-shell/status.md)