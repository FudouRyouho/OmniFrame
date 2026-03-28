# Component Usage Audit

> Estado: referencia
> Rol: snapshot de componentes activos, muertos o pendientes en la implementacion actual
> Fuente de verdad de: inventario historico de uso de componentes
> No usar para: backlog de producto o arquitectura final
> Ultima actualizacion: 2026-03-28

## Activos destacados

- `Hud.tsx`
- `HudHeader.tsx`
- `DialogMenu.tsx`
- `EquipmentView.tsx`
- `ItemsGrid.tsx`
- `FormattedText.tsx`

## Muertos o pendientes destacados

- `Nav.tsx`
- `MenuBar.tsx`
- `ThemeSelector.tsx` sin montar
- `layout-context.tsx` placeholder en ese corte (luego eliminado y reemplazado por la integracion con `LoadoutProvider`)

## Uso de esta auditoria

Tomar este archivo como:
- evidencia de estado real del codigo
- apoyo para limpiar legacy o placeholders

