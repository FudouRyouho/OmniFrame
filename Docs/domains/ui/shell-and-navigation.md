# Shell And Navigation

> Estado: activo
> Rol: definir el rol de la UI shell y sus responsabilidades
> Fuente de verdad de: limites de la capa UI
> No usar para: calculo del builder o SSoT de datos
> Ultima actualizacion: 2026-03-24

## Principios

- la UI renderiza, no calcula
- la UI no redefine semantica de datos
- la UI consume estado resuelto por providers y capas de datos
- el shell global debe poder mostrar el layout activo sin acoplarse al motor

## Piezas actuales

- HUD basico
- menu/dialogo principal
- `EquipmentLayout` con rutas anidadas bajo `/equipment/*` (7 sub-rutas)
- `EquipmentToolbar` con tres filas: hover label / tabs de navegacion + orden + busqueda / filtros dinamicos por vista
- `EquipmentContext` con `hovered`, `search`, `order`
- toolbars dedicadas por vista con `FilterIcon` y `useDataState`
- 7 vistas stub bajo `features/equipment/view/` (datos pendientes de conectar)
- `EquipmentView` — deprecated (NS-DT-13), reemplazada por `view/*`
- `features/arcanes/` y `features/mods/` — deprecated (NS-DT-14)

## Pendientes estructurales

- implementar vistas de datos en `features/equipment/view/`
- conectar `search` y `order` del contexto a los hooks de filtrado
- caja de layout activo en HUD
- rutas y componentes para Options, Profile, Arsenal (contrato en `../../overview/placeholder-minimums.md`)
- wiring definitivo hacia el builder

## Dependencias

- `../integration/runtime-composition.md`
- `../../features/navigation-shell/status.md`
- `../../overview/placeholder-minimums.md`

